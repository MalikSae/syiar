'use server'

import { prisma } from '@/lib/prisma'
import { getTenantScopedClient } from '@/prisma/extensions/tenant-scope'
import { verifyPassword, createSession } from '@/lib/auth'
import { redirect } from 'next/navigation'

export interface AgentLoginState {
  error?: string
}

export async function loginAgent(
  tenantSlug: string,
  prevState: AgentLoginState | null,
  formData: FormData
): Promise<AgentLoginState> {
  // 1. Resolve Tenant dari slug
  const tenant = await prisma.tenant.findUnique({
    where: { slug: tenantSlug },
  })

  if (!tenant || tenant.status !== 'active') {
    return { error: 'Travel tidak ditemukan atau tidak aktif' }
  }

  // Guardrail Isolasi Tenant: semua query ke model Agent WAJIB lewat scoped client
  const tenantPrisma = getTenantScopedClient(tenant.id)

  const phone = formData.get('phone')?.toString().trim() || ''
  const password = formData.get('password')?.toString() || ''

  const GENERIC_AUTH_ERROR = 'Nomor HP atau password salah'

  if (!phone || !password) {
    return { error: GENERIC_AUTH_ERROR }
  }

  // 2. Cari Agent by phone DI SCOPE tenantId hasil resolve via scoped client (findFirst)
  const agent = await tenantPrisma.agent.findFirst({
    where: {
      phone,
    },
  })

  // 3. Kalau Agent tidak ketemu ATAU password salah → pesan error SAMA
  if (!agent) {
    return { error: GENERIC_AUTH_ERROR }
  }

  const isValidPassword = await verifyPassword(password, agent.password)
  if (!isValidPassword) {
    return { error: GENERIC_AUTH_ERROR }
  }

  // 4. Kalau ditemukan & password benar TAPI status bukan "approved" → pesan error BEDA & jelas
  if (agent.status !== 'approved') {
    return { error: 'Akun kamu masih menunggu persetujuan dari travel' }
  }

  // 5. Kalau approved & password benar → createSession & redirect ke dashboard agent
  await createSession({
    accountType: 'agent',
    accountId: agent.id,
    tenantId: tenant.id,
  })

  redirect('/dashboard')
}
