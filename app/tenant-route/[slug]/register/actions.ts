'use server'

import { prisma } from '@/lib/prisma'
import { getTenantScopedClient, TenantScopedClient } from '@/prisma/extensions/tenant-scope'
import { hashPassword } from '@/lib/auth'

export interface AgentRegisterState {
  success?: boolean
  error?: string
  fieldErrors?: {
    name?: string
    phone?: string
    email?: string
    password?: string
  }
}

function generateReferralCandidate(name: string): string {
  const clean = name.toUpperCase().replace(/[^A-Z0-9]/g, '')
  const prefix = (clean.slice(0, 4) || 'AGEN').padEnd(3, 'X')
  const randomNum = Math.floor(1000 + Math.random() * 9000)
  return `${prefix}${randomNum}`
}

async function generateUniqueReferralCode(
  tenantPrisma: TenantScopedClient,
  name: string
): Promise<string> {
  const MAX_ATTEMPTS = 10
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const candidate = generateReferralCandidate(name)
    // Menggunakan scoped client dengan findFirst (bukan findUnique)
    const existing = await tenantPrisma.agent.findFirst({
      where: {
        referralCode: candidate,
      },
    })
    if (!existing) {
      return candidate
    }
  }
  throw new Error('Gagal menghasilkan kode referral unik setelah beberapa percobaan.')
}

export async function registerAgent(
  tenantSlug: string,
  prevState: AgentRegisterState | null,
  formData: FormData
): Promise<AgentRegisterState> {
  // Resolve Tenant di server — tenantId tidak pernah diambil dari input form/client
  const tenant = await prisma.tenant.findUnique({
    where: { slug: tenantSlug },
  })

  if (!tenant || tenant.status !== 'active') {
    return { error: 'Travel tidak ditemukan atau tidak aktif' }
  }

  // Guardrail Isolasi Tenant: semua query ke model Agent WAJIB lewat scoped client
  const tenantPrisma = getTenantScopedClient(tenant.id)

  const name = formData.get('name')?.toString().trim() || ''
  const phone = formData.get('phone')?.toString().trim() || ''
  const email = formData.get('email')?.toString().trim().toLowerCase() || ''
  const password = formData.get('password')?.toString() || ''

  const fieldErrors: AgentRegisterState['fieldErrors'] = {}

  if (!name) {
    fieldErrors.name = 'Nama lengkap wajib diisi'
  }

  if (!phone) {
    fieldErrors.phone = 'Nomor HP wajib diisi'
  } else if (!/^[0-9+-\s]{8,20}$/.test(phone)) {
    fieldErrors.phone = 'Format nomor HP tidak valid'
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
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

  // 1. Validasi nomor HP belum dipakai agen lain DI TENANT YANG SAMA
  // Lewat scoped client (findFirst) — tenantId disuntik otomatis
  const existingAgent = await tenantPrisma.agent.findFirst({
    where: {
      phone,
    },
  })

  if (existingAgent) {
    return {
      fieldErrors: {
        phone: 'Nomor HP ini sudah terdaftar sebagai agen di travel ini',
      },
    }
  }

  // 2. Generate referralCode otomatis & unik dalam scope tenant
  let referralCode: string
  try {
    referralCode = await generateUniqueReferralCode(tenantPrisma, name)
  } catch (err: any) {
    return { error: err.message || 'Gagal menghasilkan kode referral unik' }
  }

  // 3. Hash password
  const hashedPassword = await hashPassword(password)

  // 4. Simpan ke database lewat scoped client dengan status default "pending" (tanpa auto-login)
  try {
    await tenantPrisma.agent.create({
      data: {
        tenantId: tenant.id,
        name,
        phone,
        email: email || null,
        password: hashedPassword,
        referralCode,
        status: 'pending',
      },
    })

    return { success: true }
  } catch (err: any) {
    if (err.code === 'P2002') {
      return {
        fieldErrors: {
          phone: 'Nomor HP ini sudah terdaftar sebagai agen di travel ini',
        },
      }
    }
    return {
      error: 'Terjadi kesalahan saat mendaftarkan akun agen. Silakan coba lagi.',
    }
  }
}
