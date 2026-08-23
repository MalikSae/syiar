'use server'

import { revalidatePath } from 'next/cache'
import path from 'path'
import fs from 'fs'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export interface WebsiteFormState {
  success: boolean
  message?: string
  errors?: {
    customDomain?: string
    primaryColor?: string
    iconFile?: string
    logoFile?: string
    heroHeadline?: string
    heroSubheadline?: string
    heroBackgroundFile?: string
  }
}

/**
 * Helper untuk menghapus file fisik upload tenant dari disk secara aman
 */
function deleteLocalTenantImageFile(imageUrl: string | null | undefined) {
  if (!imageUrl || typeof imageUrl !== 'string') return

  try {
    const filename = path.basename(imageUrl)
    if (
      filename.includes('..') ||
      filename.includes('/') ||
      filename.includes('\\') ||
      filename.includes('%2e%2e')
    ) {
      return
    }

    const uploadsDir = path.resolve(process.cwd(), 'uploads', 'tenants')
    const filePath = path.resolve(uploadsDir, filename)

    if (filePath.startsWith(uploadsDir) && fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      fs.unlinkSync(filePath)
    }
  } catch (err) {
    console.error('Error deleting local tenant image file:', err)
  }
}

/**
 * Helper untuk menyimpan file WebP tenant ke disk (folder /uploads/tenants/)
 */
async function saveUploadedTenantImage(
  tenantId: string,
  prefix: 'icon' | 'logo' | 'hero',
  file: File | null
): Promise<string | null> {
  if (!file || !(file instanceof File) || file.size === 0) {
    return null
  }

  const uploadsDir = path.resolve(process.cwd(), 'uploads', 'tenants')
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true })
  }

  const timestamp = Date.now()
  const ext = file.name.endsWith('.png') ? 'png' : file.name.endsWith('.jpg') || file.name.endsWith('.jpeg') ? 'jpg' : 'webp'
  const filename = `${tenantId}-${prefix}-${timestamp}.${ext}`
  const filePath = path.resolve(uploadsDir, filename)

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  fs.writeFileSync(filePath, buffer)

  return `/api/uploads/tenants/${filename}`
}

export async function updateWebsiteSettings(
  prevState: WebsiteFormState | null,
  formData: FormData
): Promise<WebsiteFormState> {
  // 1. Guardrail Sesi
  const session = await getSession()
  if (!session || session.accountType !== 'travel_user' || !session.tenantId) {
    return {
      success: false,
      message: 'Sesi Anda tidak valid atau telah berakhir. Silakan login kembali.',
    }
  }

  // 2. Query Tenant saat ini untuk referensi file lama
  const existingTenant = await prisma.tenant.findUnique({
    where: { id: session.tenantId },
  })

  if (!existingTenant) {
    return {
      success: false,
      message: 'Tenant tidak ditemukan.',
    }
  }

  // 3. Ekstrak Data Section 1: Domain Kustom
  const isCustomDomainEnabled = formData.get('customDomainEnabled') === 'true'
  const rawCustomDomain = (formData.get('customDomain') as string)?.trim() || ''

  let customDomain: string | null = null
  if (isCustomDomainEnabled && rawCustomDomain) {
    customDomain = rawCustomDomain
      .replace(/^https?:\/\//i, '')
      .replace(/\/.*$/, '')
      .toLowerCase()
      .trim()
  }

  // 4. Ekstrak Data Section 3: Warna Aksen
  const rawPrimaryColor = (formData.get('primaryColor') as string)?.trim() || ''
  let primaryColor: string | null = null
  if (rawPrimaryColor && rawPrimaryColor !== 'default') {
    if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(rawPrimaryColor)) {
      primaryColor = rawPrimaryColor.toUpperCase()
    }
  }

  // 5. Ekstrak Data Section 2: Icon & Logo
  const removeIcon = formData.get('removeIcon') === 'true'
  const iconFile = formData.get('iconFile') as File | null

  const removeLogo = formData.get('removeLogo') === 'true'
  const logoFile = formData.get('logoFile') as File | null

  // 6. Ekstrak Data Section Hero
  const rawHeroHeadline = (formData.get('heroHeadline') as string)?.trim() || ''
  const heroHeadline = rawHeroHeadline || null

  const rawHeroSubheadline = (formData.get('heroSubheadline') as string)?.trim() || ''
  const heroSubheadline = rawHeroSubheadline || null

  const removeHeroBackground = formData.get('removeHeroBackground') === 'true'
  const heroBackgroundFile = formData.get('heroBackgroundFile') as File | null

  // 7. Proses Upload & Cleanup Icon
  let nextIconUrl = existingTenant.iconUrl
  if (iconFile && iconFile instanceof File && iconFile.size > 0) {
    const newIconUrl = await saveUploadedTenantImage(session.tenantId, 'icon', iconFile)
    if (newIconUrl) {
      if (existingTenant.iconUrl && existingTenant.iconUrl !== newIconUrl) {
        deleteLocalTenantImageFile(existingTenant.iconUrl)
      }
      nextIconUrl = newIconUrl
    }
  } else if (removeIcon) {
    if (existingTenant.iconUrl) {
      deleteLocalTenantImageFile(existingTenant.iconUrl)
    }
    nextIconUrl = null
  }

  // 8. Proses Upload & Cleanup Logo
  let nextLogoUrl = existingTenant.logoUrl
  if (logoFile && logoFile instanceof File && logoFile.size > 0) {
    const newLogoUrl = await saveUploadedTenantImage(session.tenantId, 'logo', logoFile)
    if (newLogoUrl) {
      if (existingTenant.logoUrl && existingTenant.logoUrl !== newLogoUrl) {
        deleteLocalTenantImageFile(existingTenant.logoUrl)
      }
      nextLogoUrl = newLogoUrl
    }
  } else if (removeLogo) {
    if (existingTenant.logoUrl) {
      deleteLocalTenantImageFile(existingTenant.logoUrl)
    }
    nextLogoUrl = null
  }

  // 9. Proses Upload & Cleanup Background Hero
  let nextHeroBackgroundUrl = existingTenant.heroBackgroundUrl
  if (heroBackgroundFile && heroBackgroundFile instanceof File && heroBackgroundFile.size > 0) {
    const newHeroUrl = await saveUploadedTenantImage(session.tenantId, 'hero', heroBackgroundFile)
    if (newHeroUrl) {
      if (existingTenant.heroBackgroundUrl && existingTenant.heroBackgroundUrl !== newHeroUrl) {
        deleteLocalTenantImageFile(existingTenant.heroBackgroundUrl)
      }
      nextHeroBackgroundUrl = newHeroUrl
    }
  } else if (removeHeroBackground) {
    if (existingTenant.heroBackgroundUrl) {
      deleteLocalTenantImageFile(existingTenant.heroBackgroundUrl)
    }
    nextHeroBackgroundUrl = null
  }

  // 10. Update Database
  try {
    await prisma.tenant.update({
      where: {
        id: session.tenantId,
      },
      data: {
        customDomain,
        primaryColor,
        iconUrl: nextIconUrl,
        logoUrl: nextLogoUrl,
        heroHeadline,
        heroSubheadline,
        heroBackgroundUrl: nextHeroBackgroundUrl,
      },
    })

    revalidatePath('/dashboard/settings/website')

    return {
      success: true,
      message: 'Pengaturan website dan identitas visual berhasil disimpan.',
    }
  } catch (error) {
    console.error('Gagal memperbarui pengaturan website:', error)
    return {
      success: false,
      message: 'Terjadi kesalahan saat menyimpan pengaturan website. Silakan coba lagi.',
    }
  }
}
