'use server'

import { getSession } from '@/lib/auth'
import { getTenantScopedClient } from '@/prisma/extensions/tenant-scope'
import { revalidatePath } from 'next/cache'

export interface AgentActionResult {
  success?: boolean
  error?: string
}

/**
 * Menyetujui pendaftaran agen (mengubah status dari pending ke approved)
 */
export async function approveAgent(agentId: string): Promise<AgentActionResult> {
  // 1. Guardrail sesi: validasi ulang di level Server Action
  const session = await getSession()
  if (!session || session.accountType !== 'travel_user' || !session.tenantId) {
    return { error: 'Akses tidak diizinkan (Unauthorized)' }
  }

  // 2. Gunakan tenant-scoped client untuk isolasi data
  const tenantPrisma = getTenantScopedClient(session.tenantId)

  // 3. Cari agen dalam scope tenant (otomatis aman dari cross-tenant injection)
  const agent = await tenantPrisma.agent.findFirst({
    where: { id: agentId },
  })

  if (!agent) {
    return { error: 'Agen tidak ditemukan di travel ini' }
  }

  if (agent.status !== 'pending') {
    return { error: 'Hanya agen dengan status pending yang dapat disetujui' }
  }

  // 4. Update status ke approved
  try {
    await tenantPrisma.agent.update({
      where: { id: agent.id },
      data: { status: 'approved' },
    })

    revalidatePath('/dashboard/agents')
    return { success: true }
  } catch (err: any) {
    return { error: err.message || 'Gagal menyetujui agen' }
  }
}

/**
 * Menolak & menghapus pendaftaran agen yang masih berstatus pending
 */
export async function rejectAgent(agentId: string): Promise<AgentActionResult> {
  // 1. Guardrail sesi
  const session = await getSession()
  if (!session || session.accountType !== 'travel_user' || !session.tenantId) {
    return { error: 'Akses tidak diizinkan (Unauthorized)' }
  }

  // 2. Gunakan tenant-scoped client
  const tenantPrisma = getTenantScopedClient(session.tenantId)

  // 3. Cari agen dalam scope tenant
  const agent = await tenantPrisma.agent.findFirst({
    where: { id: agentId },
  })

  if (!agent) {
    return { error: 'Agen tidak ditemukan di travel ini' }
  }

  // 4. Syarat tegas: HANYA boleh hapus jika status masih "pending"
  if (agent.status !== 'pending') {
    return { error: 'Hanya pendaftaran agen berstatus pending yang dapat ditolak/dihapus' }
  }

  // 5. Delete agen dari database
  try {
    await tenantPrisma.agent.delete({
      where: { id: agent.id },
    })

    revalidatePath('/dashboard/agents')
    return { success: true }
  } catch (err: any) {
    return { error: err.message || 'Gagal menolak pendaftaran agen' }
  }
}
