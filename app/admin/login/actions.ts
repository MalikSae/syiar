'use server'

import { prisma } from '@/lib/prisma'
import { verifyPassword, createSession } from '@/lib/auth'
import { redirect } from 'next/navigation'

export interface AdminLoginState {
  error?: string
}

export async function loginPlatformAdmin(
  prevState: AdminLoginState | null,
  formData: FormData
): Promise<AdminLoginState> {
  const email = formData.get('email')?.toString().trim().toLowerCase() || ''
  const password = formData.get('password')?.toString() || ''

  const GENERIC_ERROR = 'Email atau password salah'

  if (!email || !password) {
    return { error: GENERIC_ERROR }
  }

  // 1. Cari PlatformAdmin by email
  const admin = await prisma.platformAdmin.findUnique({
    where: { email },
  })

  // 2. Jika tidak ditemukan ATAU password salah -> error seragam
  if (!admin) {
    return { error: GENERIC_ERROR }
  }

  const isValidPassword = await verifyPassword(password, admin.password)
  if (!isValidPassword) {
    return { error: GENERIC_ERROR }
  }

  // 3. Berhasil -> createSession accountType "platform_admin" (tanpa tenantId), redirect /admin
  await createSession({
    accountType: 'platform_admin',
    accountId: admin.id,
  })

  redirect('/admin')
}
