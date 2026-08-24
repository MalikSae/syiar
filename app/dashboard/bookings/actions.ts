'use server'

import { getSession } from '@/lib/auth'
import { getTenantScopedClient } from '@/prisma/extensions/tenant-scope'
import { revalidatePath } from 'next/cache'

export async function markBookingAsPaid(bookingId: string): Promise<{
  success: boolean
  error?: string
}> {
  // 1. Guardrail Sesi TravelUser
  const session = await getSession()
  if (!session || session.accountType !== 'travel_user' || !session.tenantId) {
    return { success: false, error: 'Unauthorized: Sesi tidak valid' }
  }

  if (!bookingId || typeof bookingId !== 'string') {
    return { success: false, error: 'ID Booking tidak valid' }
  }

  try {
    const tenantPrisma = getTenantScopedClient(session.tenantId)

    // 2. Cari booking dengan tenant scope untuk verifikasi kepemilikan dan cek agentId
    const booking = await tenantPrisma.booking.findFirst({
      where: { id: bookingId },
    })

    if (!booking) {
      return { success: false, error: 'Booking tidak ditemukan atau bukan milik travel Anda' }
    }

    if (booking.paymentStatus === 'lunas') {
      return { success: false, error: 'Booking sudah berstatus lunas' }
    }

    // 3. Update paymentStatus -> "lunas" dan sesuaikan commissionStatus dalam satu operasi write
    // KALAU agentId TIDAK NULL: commissionStatus -> "ready_to_cashout"
    // KALAU agentId NULL: commissionStatus tetap "not_eligible"
    const nextCommissionStatus = booking.agentId ? 'ready_to_cashout' : 'not_eligible'

    await tenantPrisma.booking.update({
      where: { id: bookingId },
      data: {
        paymentStatus: 'lunas',
        commissionStatus: nextCommissionStatus,
      },
    })

    revalidatePath('/dashboard/bookings')
    return { success: true }
  } catch (error: any) {
    console.error('Error marking booking as paid:', error)
    return { success: false, error: error.message || 'Gagal mengubah status booking' }
  }
}
