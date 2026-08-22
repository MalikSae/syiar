'use server'

import { prisma } from '@/lib/prisma'
import { verifyPassword, createSession } from '@/lib/auth'
import { redirect } from 'next/navigation'

export interface LoginState {
  error?: string
}

export async function loginTravelUser(
  prevState: LoginState | null,
  formData: FormData
): Promise<LoginState> {
  const email = formData.get('email')?.toString().trim().toLowerCase() || ''
  const password = formData.get('password')?.toString() || ''

  // Pesan error umum seragam untuk mencegah enumerasi email / kebocoran akun
  const GENERIC_AUTH_ERROR = 'Email atau password salah'

  if (!email || !password) {
    return { error: GENERIC_AUTH_ERROR }
  }

  // 1. Cari TravelUser by email
  const user = await prisma.travelUser.findUnique({
    where: { email },
  })

  // 2. Kalau tidak ketemu ATAU password salah → tampilkan pesan error yang SAMA
  if (!user) {
    return { error: GENERIC_AUTH_ERROR }
  }

  const isValidPassword = await verifyPassword(password, user.password)
  if (!isValidPassword) {
    return { error: GENERIC_AUTH_ERROR }
  }

  // 3. Kalau benar → createSession dengan accountType "travel_user", accountId, tenantId
  await createSession({
    accountType: 'travel_user',
    accountId: user.id,
    tenantId: user.tenantId,
  })

  redirect('/dashboard')
}
