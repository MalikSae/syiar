'use server'

import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getTenantScopedClient } from '@/prisma/extensions/tenant-scope'
import { revalidatePath } from 'next/cache'

export interface CashoutActionResult {
  success: boolean
  error?: string
}

export async function approveCashoutRequest(
  cashoutRequestId: string
): Promise<CashoutActionResult> {
  // 1. Guardrail Sesi TravelUser
  const session = await getSession()
  if (
    !session ||
    session.accountType !== 'travel_user' ||
    !session.tenantId ||
    !session.accountId
  ) {
    return { success: false, error: 'Unauthorized: Sesi tidak valid' }
  }

  if (!cashoutRequestId || typeof cashoutRequestId !== 'string') {
    return { success: false, error: 'ID Pengajuan tidak valid' }
  }

  try {
    const tenantPrisma = getTenantScopedClient(session.tenantId)

    // 2. Validasi CashoutRequest harus milik tenant ini dan berstatus "pending"
    const cashoutReq = await tenantPrisma.cashoutRequest.findFirst({
      where: { id: cashoutRequestId },
    })

    if (!cashoutReq) {
      return {
        success: false,
        error: 'Pengajuan pencairan tidak ditemukan atau bukan milik travel Anda',
      }
    }

    if (cashoutReq.status !== 'pending') {
      return {
        success: false,
        error: `Pengajuan ini sudah diproses sebelumnya (status: ${cashoutReq.status})`,
      }
    }

    // 3. Ambil semua bookingId yang terhubung lewat CashoutRequestBooking
    const relatedLinks = await tenantPrisma.cashoutRequestBooking.findMany({
      where: { cashoutRequestId },
    })

    const bookingIds = relatedLinks.map((link) => link.bookingId)

    if (bookingIds.length === 0) {
      return {
        success: false,
        error: 'Tidak ada data booking yang terhubung dengan pengajuan ini',
      }
    }

    // 4. Eksekusi dalam SATU Transaksi Database
    await prisma.$transaction(async (tx) => {
      // a. Update CashoutRequest -> approved
      await tx.cashoutRequest.updateMany({
        where: {
          id: cashoutRequestId,
          tenantId: session.tenantId!,
          status: 'pending',
        },
        data: {
          status: 'approved',
          reviewedAt: new Date(),
          reviewedBy: session.accountId,
        },
      })

      // b. Update SEMUA booking terkait -> commissionStatus = "paid"
      await tx.booking.updateMany({
        where: {
          id: { in: bookingIds },
          tenantId: session.tenantId!,
        },
        data: {
          commissionStatus: 'paid',
        },
      })
    })

    revalidatePath('/dashboard/cashouts')
    revalidatePath('/dashboard/bookings')
    return { success: true }
  } catch (error: any) {
    console.error('Error approving cashout request:', error)
    return {
      success: false,
      error: error.message || 'Gagal menyetujui pengajuan pencairan komisi',
    }
  }
}

export async function rejectCashoutRequest(
  cashoutRequestId: string
): Promise<CashoutActionResult> {
  // 1. Guardrail Sesi TravelUser
  const session = await getSession()
  if (
    !session ||
    session.accountType !== 'travel_user' ||
    !session.tenantId ||
    !session.accountId
  ) {
    return { success: false, error: 'Unauthorized: Sesi tidak valid' }
  }

  if (!cashoutRequestId || typeof cashoutRequestId !== 'string') {
    return { success: false, error: 'ID Pengajuan tidak valid' }
  }

  try {
    const tenantPrisma = getTenantScopedClient(session.tenantId)

    // 2. Validasi CashoutRequest harus milik tenant ini dan berstatus "pending"
    const cashoutReq = await tenantPrisma.cashoutRequest.findFirst({
      where: { id: cashoutRequestId },
    })

    if (!cashoutReq) {
      return {
        success: false,
        error: 'Pengajuan pencairan tidak ditemukan atau bukan milik travel Anda',
      }
    }

    if (cashoutReq.status !== 'pending') {
      return {
        success: false,
        error: `Pengajuan ini sudah diproses sebelumnya (status: ${cashoutReq.status})`,
      }
    }

    // 3. Ambil semua bookingId yang terhubung
    const relatedLinks = await tenantPrisma.cashoutRequestBooking.findMany({
      where: { cashoutRequestId },
    })

    const bookingIds = relatedLinks.map((link) => link.bookingId)

    // 4. Eksekusi dalam SATU Transaksi Database
    await prisma.$transaction(async (tx) => {
      // a. Update CashoutRequest -> rejected
      await tx.cashoutRequest.updateMany({
        where: {
          id: cashoutRequestId,
          tenantId: session.tenantId!,
          status: 'pending',
        },
        data: {
          status: 'rejected',
          reviewedAt: new Date(),
          reviewedBy: session.accountId,
        },
      })

      // b. Update SEMUA booking terkait -> commissionStatus KEMBALI ke "ready_to_cashout"
      if (bookingIds.length > 0) {
        await tx.booking.updateMany({
          where: {
            id: { in: bookingIds },
            tenantId: session.tenantId!,
          },
          data: {
            commissionStatus: 'ready_to_cashout',
          },
        })
      }
    })

    revalidatePath('/dashboard/cashouts')
    revalidatePath('/dashboard/bookings')
    return { success: true }
  } catch (error: any) {
    console.error('Error rejecting cashout request:', error)
    return {
      success: false,
      error: error.message || 'Gagal menolak pengajuan pencairan komisi',
    }
  }
}
