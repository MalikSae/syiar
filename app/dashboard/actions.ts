'use server'

import { destroySession } from '@/lib/auth'
import { redirect } from 'next/navigation'

/**
 * Logout TravelUser dan bersihkan cookie sesi
 */
export async function logoutTravelUser() {
  await destroySession()
  redirect('/login')
}
