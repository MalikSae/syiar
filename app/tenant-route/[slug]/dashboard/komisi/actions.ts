'use server'

import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getTenantScopedClient } from '@/prisma/extensions/tenant-scope'
import { revalidatePath } from 'next/cache'

export interface CashoutResponse {
  success: boolean
  error?: string
}

export async function requestCashout(
  slug: string,
  bookingIds: string[]
): Promise<CashoutResponse> {
  // 1. Guardrail Sesi Eksplisit: Harus akun Agent
  const session = await getSession()
  if (!session || session.accountType !== 'agent' || !session.tenantId || !session.accountId) {
    return { success: false, error: 'Unauthorized: Sesi agen tidak valid' }
  }

  // 2. Guardrail Dobel: Slug harus match dengan tenantId session
  const tenant = await prisma.tenant.findUnique({
    where: { slug },
    select: { id: true, status: true },
  })

  if (!tenant || tenant.status !== 'active' || tenant.id !== session.tenantId) {
    return { success: false, error: 'Unauthorized: Tenant tidak sesuai' }
  }

  // 3. Validasi input
  if (!Array.isArray(bookingIds) || bookingIds.length === 0) {
    return { success: false, error: 'Pilih minimal satu booking untuk diajukan pencairan' }
  }

  const cleanBookingIds = Array.from(
    new Set(bookingIds.filter((id) => typeof id === 'string' && id.trim().length > 0))
  )

  if (cleanBookingIds.length === 0) {
    return { success: false, error: 'Daftar ID booking tidak valid' }
  }

  try {
    const tenantPrisma = getTenantScopedClient(session.tenantId)

    // 4. VALIDASI SERVER KETAT:
    // Setiap bookingId HARUS:
    // (a) milik agent ini (session.accountId)
    // (b) di tenant ini (otomatis lewat tenant-scope)
    // (c) commissionStatus PERSIS "ready_to_cashout"
    const validBookings = await tenantPrisma.booking.findMany({
      where: {
        id: { in: cleanBookingIds },
        agentId: session.accountId,
        commissionStatus: 'ready_to_cashout',
      },
    })

    // Kalau ada SATU SAJA yang tidak memenuhi kriteria -> TOLAK SELURUH request
    if (validBookings.length !== cleanBookingIds.length) {
      return {
        success: false,
        error:
          'Satu atau lebih booking tidak valid, bukan milik Anda, atau statusnya sudah berubah. Seluruh pengajuan dibatalkan.',
      }
    }

    // 5. Eksekusi dalam SATU Transaction
    await prisma.$transaction(async (tx) => {
      // a. Buat CashoutRequest (status "pending")
      const cashoutRequest = await tx.cashoutRequest.create({
        data: {
          tenantId: session.tenantId!,
          agentId: session.accountId,
          status: 'pending',
        },
      })

      // b. Buat CashoutRequestBooking untuk tiap booking
      await tx.cashoutRequestBooking.createMany({
        data: cleanBookingIds.map((bId) => ({
          tenantId: session.tenantId!,
          cashoutRequestId: cashoutRequest.id,
          bookingId: bId,
        })),
      })

      // c. Update commissionStatus SEMUA booking menjadi "cashout_requested"
      await tx.booking.updateMany({
        where: {
          id: { in: cleanBookingIds },
          tenantId: session.tenantId!,
          agentId: session.accountId,
          commissionStatus: 'ready_to_cashout',
        },
        data: {
          commissionStatus: 'cashout_requested',
        },
      })
    })

    revalidatePath(`/dashboard/komisi`)
    revalidatePath(`/dashboard`)
    return { success: true }
  } catch (error: any) {
    console.error('Error in requestCashout:', error)
    return {
      success: false,
      error: error.message || 'Terjadi kesalahan saat mengajukan pencairan komisi',
    }
  }
}
