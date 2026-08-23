'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export interface ProfileFormState {
  success: boolean
  message?: string
  errors?: {
    name?: string
    phone?: string
    tagline?: string
    about?: string
    legalitas?: string
    alamat?: string
  }
}

export async function updateTenantProfile(
  prevState: ProfileFormState | null,
  formData: FormData
): Promise<ProfileFormState> {
  // 1. Guardrail Sesi: pastikan user sudah login sebagai TravelUser
  const session = await getSession()
  if (!session || session.accountType !== 'travel_user' || !session.tenantId) {
    return {
      success: false,
      message: 'Sesi Anda tidak valid atau telah berakhir. Silakan login kembali.',
    }
  }

  // 2. Ekstrak data dari FormData
  const name = formData.get('name')?.toString().trim() || ''
  const phone = formData.get('phone')?.toString().trim() || ''
  const tagline = formData.get('tagline')?.toString().trim() || ''
  const about = formData.get('about')?.toString().trim() || ''
  const legalitas = formData.get('legalitas')?.toString().trim() || ''
  const alamat = formData.get('alamat')?.toString().trim() || ''

  // 3. Validasi: name wajib diisi
  const errors: ProfileFormState['errors'] = {}

  if (!name) {
    errors.name = 'Nama travel / brand wajib diisi'
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      errors,
      message: 'Mohon periksa kembali isian form Anda.',
    }
  }

  // 4. Update Tenant: HANYA update name, phone, tagline, about, legalitas, alamat
  // STRICT GUARDRAIL: JANGAN PERNAH update slug!
  try {
    await prisma.tenant.update({
      where: {
        id: session.tenantId,
      },
      data: {
        name,
        phone: phone || null,
        tagline: tagline || null,
        about: about || null,
        legalitas: legalitas || null,
        alamat: alamat || null,
      },
    })

    revalidatePath('/dashboard/settings/profil')
    revalidatePath('/dashboard')

    return {
      success: true,
      message: 'Profil travel berhasil diperbarui.',
    }
  } catch (error) {
    console.error('Gagal memperbarui profil travel:', error)
    return {
      success: false,
      message: 'Terjadi kesalahan sistem saat menyimpan profil. Silakan coba lagi.',
    }
  }
}
