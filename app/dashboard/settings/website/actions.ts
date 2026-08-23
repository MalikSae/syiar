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
    features?: string
    faqs?: string
    testimonials?: string
  }
}

export interface FeatureItem {
  icon: string
  title: string
  description: string
}

export interface FaqItem {
  question: string
  answer: string
}

export interface TestimonialItem {
  name: string
  roleOrLocation: string
  quote: string
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

function parseJsonArray<T>(rawJson: string | null | undefined, maxItems: number, sanitizer: (item: any) => T): T[] {
  if (!rawJson || typeof rawJson !== 'string' || !rawJson.trim()) {
    return []
  }
  try {
    const parsed = JSON.parse(rawJson)
    if (!Array.isArray(parsed)) {
      return []
    }
    return parsed.slice(0, maxItems).map(sanitizer)
  } catch (err) {
    throw new Error('Format JSON tidak valid.')
  }
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

  // 3. Ekstrak & Validasi Data Section Features, FAQs, Testimonials (SEBELUM PROSES WRITE/UPLOAD APA PUN)
  let features: FeatureItem[] = []
  let faqs: FaqItem[] = []
  let testimonials: TestimonialItem[] = []

  try {
    const rawFeatures = formData.get('features') as string | null
    const parsedFeatures = parseJsonArray(rawFeatures, 20, (item) => ({
      icon: typeof item?.icon === 'string' && item.icon.trim() ? item.icon.trim() : '',
      title: typeof item?.title === 'string' ? item.title.trim().slice(0, 50) : '',
      description: typeof item?.description === 'string' ? item.description.trim().slice(0, 150) : '',
    }))

    // Aturan Bisnis Kritis: Keunggulan HARUS Tepat 4 dan Lengkap
    if (parsedFeatures.length !== 4) {
      return {
        success: false,
        message: 'Lengkapi keempat Keunggulan sebelum menyimpan pengaturan Website',
      }
    }

    for (const feat of parsedFeatures) {
      if (!feat.icon || !feat.title || !feat.description) {
        return {
          success: false,
          message: 'Lengkapi keempat Keunggulan sebelum menyimpan pengaturan Website',
        }
      }
    }
    features = parsedFeatures

    // Validasi Server FAQ (Maksimal 15 item)
    const rawFaqs = formData.get('faqs') as string | null
    if (rawFaqs && typeof rawFaqs === 'string' && rawFaqs.trim()) {
      const parsedRawFaqs = JSON.parse(rawFaqs)
      if (Array.isArray(parsedRawFaqs) && parsedRawFaqs.length > 15) {
        return {
          success: false,
          message: 'Jumlah FAQ tidak boleh melebihi 15 item.',
        }
      }
    }

    faqs = parseJsonArray(rawFaqs, 15, (item) => ({
      question: typeof item?.question === 'string' ? item.question.trim().slice(0, 200) : '',
      answer: typeof item?.answer === 'string' ? item.answer.trim().slice(0, 1000) : '',
    }))

    // Validasi Server Testimoni (Maksimal 12 item)
    const rawTestimonials = formData.get('testimonials') as string | null
    if (rawTestimonials && typeof rawTestimonials === 'string' && rawTestimonials.trim()) {
      const parsedRawTesti = JSON.parse(rawTestimonials)
      if (Array.isArray(parsedRawTesti) && parsedRawTesti.length > 12) {
        return {
          success: false,
          message: 'Jumlah Testimoni tidak boleh melebihi 12 item.',
        }
      }
    }

    testimonials = parseJsonArray(rawTestimonials, 12, (item) => ({
      name: typeof item?.name === 'string' ? item.name.trim().slice(0, 100) : '',
      roleOrLocation: typeof item?.roleOrLocation === 'string' ? item.roleOrLocation.trim().slice(0, 100) : '',
      quote: typeof item?.quote === 'string' ? item.quote.trim().slice(0, 1000) : '',
    }))
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Format data Keunggulan, FAQ, atau Testimoni tidak valid.',
    }
  }

  // 4. Ekstrak Data Section 1: Domain Kustom
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

  // 5. Ekstrak Data Section 3: Warna Aksen
  const rawPrimaryColor = (formData.get('primaryColor') as string)?.trim() || ''
  let primaryColor: string | null = null
  if (rawPrimaryColor && rawPrimaryColor !== 'default') {
    if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(rawPrimaryColor)) {
      primaryColor = rawPrimaryColor.toUpperCase()
    }
  }

  // 6. Ekstrak Data Section 2: Icon & Logo
  const removeIcon = formData.get('removeIcon') === 'true'
  const iconFile = formData.get('iconFile') as File | null

  const removeLogo = formData.get('removeLogo') === 'true'
  const logoFile = formData.get('logoFile') as File | null

  // 7. Ekstrak Data Section Hero
  const rawHeroHeadline = (formData.get('heroHeadline') as string)?.trim() || ''
  const heroHeadline = rawHeroHeadline || null

  const rawHeroSubheadline = (formData.get('heroSubheadline') as string)?.trim() || ''
  const heroSubheadline = rawHeroSubheadline || null

  const removeHeroBackground = formData.get('removeHeroBackground') === 'true'
  const heroBackgroundFile = formData.get('heroBackgroundFile') as File | null

  // 8. Proses Upload & Cleanup Icon
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

  // 9. Proses Upload & Cleanup Logo
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

  // 10. Proses Upload & Cleanup Background Hero
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

  // 11. Update Database
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
        features: features as any,
        faqs: faqs as any,
        testimonials: testimonials as any,
      },
    })

    revalidatePath('/dashboard/settings/website')

    return {
      success: true,
      message: 'Pengaturan website, identitas visual, keunggulan, FAQ, dan testimoni berhasil disimpan.',
    }
  } catch (error) {
    console.error('Gagal memperbarui pengaturan website:', error)
    return {
      success: false,
      message: 'Terjadi kesalahan saat menyimpan pengaturan website. Silakan coba lagi.',
    }
  }
}
