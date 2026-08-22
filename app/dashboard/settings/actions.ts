'use server'

import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export interface SettingsState {
  success?: boolean
  message?: string
  error?: string
  fieldErrors?: {
    name?: string
    phone?: string
    bankAccount?: string
  }
}

export async function updateTenantProfile(
  prevState: SettingsState | null,
  formData: FormData
): Promise<SettingsState> {
  // 1. Guardrail sesi divalidasi ulang di level Server Action
  const session = await getSession()
  if (!session || session.accountType !== 'travel_user' || !session.tenantId) {
    return { error: 'Akses tidak diizinkan (Unauthorized)' }
  }

  // 2. Ambil tenantId HANYA dari session.tenantId (abaikan apapun dari formData)
  const targetTenantId = session.tenantId

  const name = formData.get('name')?.toString().trim() || ''
  const phone = formData.get('phone')?.toString().trim() || ''
  const bankAccount = formData.get('bankAccount')?.toString().trim() || ''

  // 3. Validasi field
  const fieldErrors: SettingsState['fieldErrors'] = {}

  if (!name) {
    fieldErrors.name = 'Nama travel wajib diisi'
  }

  if (phone && !/^[0-9+-\s]{8,20}$/.test(phone)) {
    fieldErrors.phone = 'Format nomor HP/WhatsApp tidak valid'
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors }
  }

  // 4. Update Tenant: HANYA update name, phone, bankAccount (JANGAN pernah update slug)
  try {
    await prisma.tenant.update({
      where: { id: targetTenantId },
      data: {
        name,
        phone: phone || null,
        bankAccount: bankAccount || null,
      },
    })

    revalidatePath('/dashboard/settings')
    revalidatePath('/dashboard')

    return {
      success: true,
      message: 'Profil travel berhasil diperbarui',
    }
  } catch (err: any) {
    return {
      error: 'Terjadi kesalahan saat memperbarui profil travel. Silakan coba lagi.',
    }
  }
}
