'use server'

import { prisma } from '@/lib/prisma'
import { hashPassword, createSession } from '@/lib/auth'
import { redirect } from 'next/navigation'

export interface RegisterState {
  error?: string
  fieldErrors?: {
    travelName?: string
    slug?: string
    userName?: string
    email?: string
    password?: string
  }
}

export async function registerTravel(
  prevState: RegisterState | null,
  formData: FormData
): Promise<RegisterState> {
  const travelName = formData.get('travelName')?.toString().trim() || ''
  const slug = formData.get('slug')?.toString().trim().toLowerCase() || ''
  const userName = formData.get('userName')?.toString().trim() || ''
  const email = formData.get('email')?.toString().trim().toLowerCase() || ''
  const password = formData.get('password')?.toString() || ''

  const fieldErrors: RegisterState['fieldErrors'] = {}

  if (!travelName) {
    fieldErrors.travelName = 'Nama travel wajib diisi'
  }

  if (!slug) {
    fieldErrors.slug = 'Slug travel wajib diisi'
  } else if (!/^[a-z0-9-]+$/.test(slug)) {
    fieldErrors.slug = 'Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung (-)'
  }

  if (!userName) {
    fieldErrors.userName = 'Nama penanggung jawab wajib diisi'
  }

  if (!email) {
    fieldErrors.email = 'Email wajib diisi'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    fieldErrors.email = 'Format email tidak valid'
  }

  if (!password) {
    fieldErrors.password = 'Password wajib diisi'
  } else if (password.length < 8) {
    fieldErrors.password = 'Password minimal 8 karakter'
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors }
  }

  // 1. Validasi slug belum dipakai Tenant lain
  const existingTenant = await prisma.tenant.findUnique({
    where: { slug },
  })
  if (existingTenant) {
    return {
      fieldErrors: {
        slug: 'Slug travel sudah digunakan oleh travel lain, silakan gunakan slug yang berbeda',
      },
    }
  }

  // 2. Validasi email belum dipakai TravelUser
  const existingUser = await prisma.travelUser.findUnique({
    where: { email },
  })
  if (existingUser) {
    return {
      fieldErrors: {
        email: 'Email sudah terdaftar. Silakan login atau gunakan email lain',
      },
    }
  }

  // 3. Hash password sebelum simpan
  const hashedPassword = await hashPassword(password)

  // 4. Buat Tenant dan TravelUser dalam SATU database transaction
  let sessionData: { accountId: string; tenantId: string }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name: travelName,
          slug,
          status: 'active',
        },
      })

      const user = await tx.travelUser.create({
        data: {
          tenantId: tenant.id,
          name: userName,
          email,
          password: hashedPassword,
          role: 'owner',
        },
      })

      return { tenant, user }
    })

    sessionData = {
      accountId: result.user.id,
      tenantId: result.tenant.id,
    }
  } catch (err: any) {
    if (err.code === 'P2002') {
      return {
        error: 'Slug travel atau email sudah terdaftar. Silakan periksa kembali formulir Anda.',
      }
    }
    return {
      error: 'Terjadi kesalahan sistem saat mendaftarkan travel. Silakan coba lagi.',
    }
  }

  // 5. Buat session dan redirect ke dashboard
  await createSession({
    accountType: 'travel_user',
    accountId: sessionData.accountId,
    tenantId: sessionData.tenantId,
  })

  redirect('/dashboard')
}
