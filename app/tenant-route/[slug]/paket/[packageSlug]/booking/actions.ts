'use server'

import { prisma } from '@/lib/prisma'
import { getTenantScopedClient } from '@/prisma/extensions/tenant-scope'
import { normalizePhoneNumber } from '@/lib/phone-utils'
import { generateBookingCode } from '@/lib/booking-code'
import { isValidReferralCodeFormat } from '@/lib/referral-cookie'

export interface CreateBookingState {
  success?: boolean
  error?: string
  bookingCode?: string
  redirectUrl?: string
}

export async function createBooking(
  slug: string,
  packageSlug: string,
  prevState: CreateBookingState,
  formData: FormData
): Promise<CreateBookingState> {
  try {
    // 1. Resolve Tenant dari slug
    const tenant = await prisma.tenant.findUnique({
      where: { slug },
    })

    if (!tenant || tenant.status !== 'active') {
      return { success: false, error: 'Travel tidak ditemukan atau sedang tidak aktif' }
    }

    const scopedClient = getTenantScopedClient(tenant.id)

    // Resolve Package dari packageSlug dalam scope tenant ini
    const pkg = await scopedClient.package.findFirst({
      where: {
        slug: packageSlug,
        status: 'active',
      },
    })

    if (!pkg) {
      return { success: false, error: 'Paket umroh tidak ditemukan atau tidak tersedia' }
    }

    // 2. Validasi input dasar
    const jamaahName = formData.get('jamaahName')?.toString().trim()
    const rawJamaahPhone = formData.get('jamaahPhone')?.toString().trim()
    const jamaahEmail = formData.get('jamaahEmail')?.toString().trim() || null
    const rawDepartureId = formData.get('packageDepartureId')?.toString().trim()
    const rawReferralCode = formData.get('referralCode')?.toString().trim().toUpperCase() || ''

    if (!jamaahName) {
      return { success: false, error: 'Nama pemesan wajib diisi' }
    }

    if (!rawJamaahPhone) {
      return { success: false, error: 'Nomor WhatsApp / HP wajib diisi' }
    }

    // 3. Validasi Pax & Stepper Quantity
    const quadCount = Math.max(0, parseInt(formData.get('quadCount')?.toString() || '0', 10) || 0)
    const tripleCount = Math.max(0, parseInt(formData.get('tripleCount')?.toString() || '0', 10) || 0)
    const doubleCount = Math.max(0, parseInt(formData.get('doubleCount')?.toString() || '0', 10) || 0)

    const totalPax = quadCount + tripleCount + doubleCount

    if (totalPax < 1) {
      return { success: false, error: 'Minimal pilih 1 jamaah (pax)' }
    }

    // Validasi ketersediaan tipe kamar pada paket
    if (quadCount > 0) {
      if (pkg.priceQuad === null || pkg.priceQuad === undefined || pkg.priceQuad <= 0) {
        return { success: false, error: 'Tipe kamar Quad tidak tersedia pada paket ini' }
      }
    }

    if (tripleCount > 0) {
      if (pkg.priceTriple === null || pkg.priceTriple === undefined || pkg.priceTriple <= 0) {
        return { success: false, error: 'Tipe kamar Triple tidak tersedia pada paket ini' }
      }
    }

    if (doubleCount > 0) {
      if (pkg.priceDouble === null || pkg.priceDouble === undefined || pkg.priceDouble <= 0) {
        return { success: false, error: 'Tipe kamar Double tidak tersedia pada paket ini' }
      }
    }

    // Snapshot harga per tipe & total harga
    const priceQuadSnapshot = quadCount > 0 ? pkg.priceQuad : null
    const priceTripleSnapshot = tripleCount > 0 ? pkg.priceTriple : null
    const priceDoubleSnapshot = doubleCount > 0 ? pkg.priceDouble : null

    const totalPrice =
      quadCount * (pkg.priceQuad ?? 0) +
      tripleCount * (pkg.priceTriple ?? 0) +
      doubleCount * (pkg.priceDouble ?? 0)

    // Snapshot flat komisi per pax & total komisi
    const commissionAmountSnapshot = pkg.commissionAmount
    const totalCommission = commissionAmountSnapshot * totalPax

    // Validasi & normalisasi nomor HP
    const normalizedPhone = normalizePhoneNumber(rawJamaahPhone)
    if (!normalizedPhone) {
      return { success: false, error: 'Format nomor WhatsApp / HP tidak valid' }
    }

    // Validasi Tanggal Keberangkatan jika paket punya jadwal aktif
    let packageDepartureId: string | null = null
    const activeDeparturesCount = await scopedClient.packageDeparture.count({
      where: { packageId: pkg.id, isActive: true },
    })

    if (activeDeparturesCount > 0) {
      if (!rawDepartureId) {
        return { success: false, error: 'Jadwal keberangkatan wajib dipilih' }
      }

      const departure = await scopedClient.packageDeparture.findFirst({
        where: { id: rawDepartureId, packageId: pkg.id, isActive: true },
      })

      if (!departure) {
        return { success: false, error: 'Jadwal keberangkatan yang dipilih tidak valid' }
      }

      packageDepartureId = departure.id
    }

    // 4. Resolusi Atribusi Komisi (Strict Priority Logic)
    let agentId: string | null = null
    let referralCodeUsed: string | null = null

    // Prioritas 1: Kode Referral Eksplisit dari form
    if (rawReferralCode) {
      if (isValidReferralCodeFormat(rawReferralCode)) {
        const agent = await scopedClient.agent.findFirst({
          where: {
            referralCode: rawReferralCode,
            status: 'approved',
          },
        })

        if (agent) {
          agentId = agent.id
          referralCodeUsed = rawReferralCode
        }
      }
    }

    // Prioritas 2: Fallback Riwayat Booking Berdasarkan Nomor HP
    if (!agentId) {
      const previousBooking = await scopedClient.booking.findFirst({
        where: {
          jamaahPhone: normalizedPhone,
          agentId: { not: null },
        },
        orderBy: { createdAt: 'desc' },
        select: { agentId: true },
      })

      if (previousBooking && previousBooking.agentId) {
        agentId = previousBooking.agentId
        referralCodeUsed = null // Sesuai PRD: null saat diatribusikan lewat riwayat HP
      }
    }

    // Prioritas 3: Tanpa Atribusi (agentId = null, referralCodeUsed = null)

    // 5. Generate Booking Code Unik & Simpan Booking
    let bookingCode = generateBookingCode()
    let isCodeUnique = false
    let attempts = 0

    while (!isCodeUnique && attempts < 10) {
      const existing = await scopedClient.booking.findFirst({
        where: { bookingCode },
      })
      if (!existing) {
        isCodeUnique = true
      } else {
        bookingCode = generateBookingCode()
        attempts++
      }
    }

    if (!isCodeUnique) {
      return { success: false, error: 'Gagal membuat kode booking unik. Silakan coba lagi.' }
    }

    // Simpan Booking via Tenant-Scoped Client
    const newBooking = await scopedClient.booking.create({
      data: {
        tenantId: tenant.id,
        packageId: pkg.id,
        packageDepartureId,
        agentId,
        jamaahName,
        jamaahPhone: normalizedPhone,
        jamaahEmail,
        quadCount,
        tripleCount,
        doubleCount,
        priceQuadSnapshot,
        priceTripleSnapshot,
        priceDoubleSnapshot,
        totalPrice,
        totalPax,
        commissionAmountSnapshot,
        totalCommission,
        referralCodeUsed,
        bookingCode,
        status: 'pending_payment',
      },
    })

    return {
      success: true,
      bookingCode: newBooking.bookingCode,
      redirectUrl: `/cek-booking/${newBooking.bookingCode}`,
    }
  } catch (error) {
    console.error('Error creating booking:', error)
    return {
      success: false,
      error: 'Terjadi kesalahan sistem saat membuat booking. Silakan coba lagi.',
    }
  }
}
