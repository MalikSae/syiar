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

    // Snapshot komisi flat & total komisi
    const commissionAmountSnapshot = pkg.commissionAmount
    const totalCommission = commissionAmountSnapshot * totalPax

    // 4. Validasi Tanggal Keberangkatan
    const activeDepartures = await scopedClient.packageDeparture.findMany({
      where: {
        packageId: pkg.id,
        isActive: true,
      },
    })

    let validatedDepartureId: string | null = null
    if (activeDepartures.length > 0) {
      if (!rawDepartureId) {
        return { success: false, error: 'Silakan pilih jadwal keberangkatan yang tersedia' }
      }
      const matchedDeparture = activeDepartures.find((d) => d.id === rawDepartureId)
      if (!matchedDeparture) {
        return { success: false, error: 'Jadwal keberangkatan tidak valid atau tidak aktif' }
      }
      validatedDepartureId = matchedDeparture.id
    } else {
      // Paket tanpa jadwal aktif: packageDepartureId boleh null
      validatedDepartureId = null
    }

    // 5. Normalisasi nomor HP
    const normalizedPhone = normalizePhoneNumber(rawJamaahPhone)
    if (!normalizedPhone || normalizedPhone.length < 8) {
      return { success: false, error: 'Format nomor WhatsApp / HP tidak valid' }
    }

    // 6. Resolusi Atributor (Urutan Prioritas Ketat)
    let agentId: string | null = null
    let referralCodeUsed: string | null = null

    // a & b. Cek kode referral eksplisit dari form
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
          referralCodeUsed = agent.referralCode
        }
      }
    }

    // c. Kalau kode kosong ATAU kode diisi tapi tidak valid/tidak ketemu di tenant ini:
    // Fallback ke riwayat booking terbaru dengan jamaahPhone sama persis & punya agentId
    if (!agentId) {
      const previousBooking = await scopedClient.booking.findFirst({
        where: {
          jamaahPhone: normalizedPhone,
          agentId: { not: null },
        },
        orderBy: { createdAt: 'desc' },
      })

      if (previousBooking && previousBooking.agentId) {
        agentId = previousBooking.agentId
        referralCodeUsed = null // Hasil fallback riwayat nomor HP, bukan kode eksplisit
      }
    }

    // d. Kalau dua-duanya tidak ketemu apa pun -> agentId = null, referralCodeUsed = null

    // 7. Generate bookingCode unik dengan retry loop
    let uniqueBookingCode = ''
    let attempts = 0
    const maxAttempts = 5

    while (attempts < maxAttempts) {
      const candidateCode = generateBookingCode(8)
      const existing = await scopedClient.booking.findFirst({
        where: { bookingCode: candidateCode },
      })
      if (!existing) {
        uniqueBookingCode = candidateCode
        break
      }
      attempts++
    }

    if (!uniqueBookingCode) {
      return {
        success: false,
        error: 'Gagal membuat kode booking unik. Silakan coba submit kembali.',
      }
    }

    // 8. Create Booking via scopedClient
    await scopedClient.booking.create({
      data: {
        tenantId: tenant.id,
        packageId: pkg.id,
        packageDepartureId: validatedDepartureId,
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
        bookingCode: uniqueBookingCode,
        status: 'pending_payment',
      },
    })

    // 9. Return success & redirect URL
    return {
      success: true,
      bookingCode: uniqueBookingCode,
      redirectUrl: `/cek-booking/${uniqueBookingCode}`,
    }
  } catch (error: any) {
    console.error('Error saat membuat booking:', error)
    return {
      success: false,
      error: error.message || 'Terjadi kesalahan sistem saat memproses pendaftaran booking.',
    }
  }
}
