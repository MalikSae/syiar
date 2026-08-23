'use server'

import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getTenantScopedClient } from '@/prisma/extensions/tenant-scope'
import { revalidatePath } from 'next/cache'
import path from 'path'
import fs from 'fs'

export interface PackageFormState {
  error?: string
  success?: boolean
  packageId?: string
}

export interface DepartureFormState {
  error?: string
  success?: boolean
  departure?: {
    id: string
    date: Date
    isActive: boolean
  }
}

/**
 * Helper untuk menyimpan file WebP yang di-upload dari browser
 */
async function saveUploadedImage(packageId: string, imageFile: File | null): Promise<string | null> {
  if (!imageFile || !(imageFile instanceof File) || imageFile.size === 0) {
    return null
  }

  const uploadsDir = path.resolve(process.cwd(), 'uploads', 'packages')
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true })
  }

  const timestamp = Date.now()
  const filename = `${packageId}-${timestamp}.webp`
  const filePath = path.resolve(uploadsDir, filename)

  const arrayBuffer = await imageFile.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  fs.writeFileSync(filePath, buffer)

  return `/api/uploads/packages/${filename}`
}

/**
 * Validasi helper untuk field-field Paket Umroh
 */
function validatePackageInput(formData: FormData) {
  const name = (formData.get('name') as string)?.trim() || ''
  const duration = (formData.get('duration') as string)?.trim() || ''
  const airline = (formData.get('airline') as string)?.trim() || ''
  const hotelMakkah = (formData.get('hotelMakkah') as string)?.trim() || ''
  const hotelMadinah = (formData.get('hotelMadinah') as string)?.trim() || ''
  const include = (formData.get('include') as string)?.trim() || ''
  const exclude = (formData.get('exclude') as string)?.trim() || ''
  const itinerary = (formData.get('itinerary') as string)?.trim() || ''

  // Validasi field teks wajib
  if (
    !name ||
    !duration ||
    !airline ||
    !hotelMakkah ||
    !hotelMadinah ||
    !include ||
    !exclude ||
    !itinerary
  ) {
    return {
      error:
        'Semua field informasi paket (nama paket, durasi, maskapai, hotel Makkah, hotel Madinah, fasilitas include, exclude, dan itinerary) wajib diisi.',
    }
  }

  // Parse Harga Quad, Triple, Double (membersihkan titik pemisah ribuan)
  const rawQuad = (formData.get('priceQuad') as string)?.replace(/\./g, '').trim()
  const rawTriple = (formData.get('priceTriple') as string)?.replace(/\./g, '').trim()
  const rawDouble = (formData.get('priceDouble') as string)?.replace(/\./g, '').trim()

  const priceQuad = rawQuad && Number(rawQuad) > 0 ? Math.round(Number(rawQuad)) : null
  const priceTriple = rawTriple && Number(rawTriple) > 0 ? Math.round(Number(rawTriple)) : null
  const priceDouble = rawDouble && Number(rawDouble) > 0 ? Math.round(Number(rawDouble)) : null

  if (!priceQuad && !priceTriple && !priceDouble) {
    return {
      error: 'Minimal salah satu harga paket (Quad, Triple, atau Double) wajib diisi dengan nominal lebih dari 0.',
    }
  }

  // Parse Komisi Agen (membersihkan titik pemisah ribuan)
  const rawCommission = (formData.get('commissionAmount') as string)?.replace(/\./g, '').trim()
  const commissionAmount = rawCommission ? Math.round(Number(rawCommission)) : 0

  if (commissionAmount <= 0) {
    return {
      error: 'Jumlah komisi agen wajib diisi dengan nominal lebih dari 0.',
    }
  }

  // Soft check / sanity check: Komisi tidak boleh melebihi harga paket terendah
  const filledPrices = [priceQuad, priceTriple, priceDouble].filter(
    (p): p is number => p !== null && p > 0
  )
  const lowestPrice = Math.min(...filledPrices)

  if (commissionAmount > lowestPrice) {
    return {
      error: `Jumlah komisi (Rp ${commissionAmount.toLocaleString(
        'id-ID'
      )}) tidak boleh melebihi harga paket terendah (Rp ${lowestPrice.toLocaleString('id-ID')}).`,
    }
  }

  return {
    data: {
      name,
      duration,
      airline,
      hotelMakkah,
      hotelMadinah,
      include,
      exclude,
      itinerary,
      priceQuad,
      priceTriple,
      priceDouble,
      commissionAmount,
    },
  }
}

import { slugify } from '@/lib/slugify'

/**
 * Helper untuk generate slug unik per tenant (menghindari duplikasi dengan menambahkan angka)
 */
async function generateUniquePackageSlug(
  tenantId: string,
  name: string,
  currentPackageId?: string
): Promise<string> {
  const baseSlug = slugify(name) || 'paket-umroh'
  let slug = baseSlug
  let counter = 1

  const scopedPrisma = getTenantScopedClient(tenantId)

  while (true) {
    const existing = await scopedPrisma.package.findFirst({
      where: {
        slug,
        ...(currentPackageId ? { id: { not: currentPackageId } } : {}),
      },
      select: { id: true },
    })

    if (!existing) {
      return slug
    }

    counter++
    slug = `${baseSlug}-${counter}`
  }
}

/**
 * Server Action: Buat Paket Umroh Baru (Atomic Transaction dengan Tanggal Keberangkatan & Upload Gambar)
 */
export async function createPackage(
  prevState: PackageFormState | null,
  formData: FormData
): Promise<PackageFormState> {
  const session = await getSession()
  if (!session || session.accountType !== 'travel_user' || !session.tenantId) {
    return { error: 'Sesi tidak valid atau telah berakhir. Silakan login kembali.' }
  }

  const validation = validatePackageInput(formData)
  if (validation.error || !validation.data) {
    return { error: validation.error }
  }

  // Status paket dari pilihan user ("draft" | "active")
  const requestedStatus = (formData.get('status') as string)?.trim()
  const status = requestedStatus === 'active' ? 'active' : 'draft'

  // Generate slug unik per tenant
  const slug = await generateUniquePackageSlug(session.tenantId!, validation.data.name)

  // Parse optional departure dates dari form
  const parsedDepartures: Date[] = []
  const rawDepartures = formData.get('departureDates') as string
  if (rawDepartures) {
    try {
      const datesArray = JSON.parse(rawDepartures)
      if (Array.isArray(datesArray)) {
        for (const item of datesArray) {
          const d = new Date(item)
          if (!isNaN(d.getTime())) {
            parsedDepartures.push(d)
          }
        }
      }
    } catch {
      return { error: 'Format data tanggal keberangkatan tidak valid.' }
    }
  }

  try {
    const newPackage = await prisma.$transaction(async (tx) => {
      // 1. Buat Package dengan tenantId sesi, slug unik, dan status pilihan
      const pkg = await tx.package.create({
        data: {
          ...validation.data,
          slug,
          tenantId: session.tenantId!,
          status,
        },
      })

      // 2. Buat PackageDepartures jika ada
      if (parsedDepartures.length > 0) {
        await tx.packageDeparture.createMany({
          data: parsedDepartures.map((date) => ({
            packageId: pkg.id,
            tenantId: session.tenantId!,
            date,
            isActive: true,
          })),
        })
      }

      return pkg
    })

    // 3. Simpan file gambar jika ada yang di-upload
    const imageFile = formData.get('imageFile') as File | null
    if (imageFile && imageFile instanceof File && imageFile.size > 0) {
      const imageUrl = await saveUploadedImage(newPackage.id, imageFile)
      if (imageUrl) {
        await prisma.package.update({
          where: { id: newPackage.id },
          data: { featuredImageUrl: imageUrl },
        })
      }
    }

    revalidatePath('/dashboard/packages')
    revalidatePath('/dashboard')

    return { success: true, packageId: newPackage.id }
  } catch (err: any) {
    console.error('Error createPackage:', err)
    return { error: 'Gagal membuat paket umroh. Silakan coba lagi.' }
  }
}

/**
 * Helper untuk menghapus file gambar fisik dari disk secara aman
 */
function deleteLocalImageFile(imageUrl: string | null | undefined) {
  if (!imageUrl || typeof imageUrl !== 'string') return

  try {
    const filename = path.basename(imageUrl)
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return
    }

    const uploadsDir = path.resolve(process.cwd(), 'uploads', 'packages')
    const filePath = path.resolve(uploadsDir, filename)

    if (filePath.startsWith(uploadsDir) && fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      fs.unlinkSync(filePath)
    }
  } catch (err) {
    console.error('Error deleting local image file:', err)
  }
}

/**
 * Server Action: Update Paket Umroh
 */
export async function updatePackage(
  packageId: string,
  prevState: PackageFormState | null,
  formData: FormData
): Promise<PackageFormState> {
  const session = await getSession()
  if (!session || session.accountType !== 'travel_user' || !session.tenantId) {
    return { error: 'Sesi tidak valid atau telah berakhir. Silakan login kembali.' }
  }

  const validation = validatePackageInput(formData)
  if (validation.error || !validation.data) {
    return { error: validation.error }
  }

  try {
    const scopedPrisma = getTenantScopedClient(session.tenantId)

    // Validasi eksplisit paket milik tenant ini
    const existing = await scopedPrisma.package.findFirst({
      where: { id: packageId },
    })

    if (!existing) {
      return { error: 'Paket tidak ditemukan atau di luar wewenang tenant Anda.' }
    }

    // Status update: jika sebelumnya draft, user bisa publish ke active
    let nextStatus = existing.status
    const requestedStatus = (formData.get('status') as string)?.trim()
    if (existing.status === 'draft' && (requestedStatus === 'draft' || requestedStatus === 'active')) {
      nextStatus = requestedStatus
    }

    // Handle upload gambar baru / hapus gambar lama
    let nextFeaturedImageUrl = existing.featuredImageUrl
    const removeImage = formData.get('removeImage') === 'true'
    const imageFile = formData.get('imageFile') as File | null

    if (imageFile && imageFile instanceof File && imageFile.size > 0) {
      const newImageUrl = await saveUploadedImage(packageId, imageFile)
      if (newImageUrl) {
        // Hapus file fisik gambar lama dari disk jika ada
        if (existing.featuredImageUrl && existing.featuredImageUrl !== newImageUrl) {
          deleteLocalImageFile(existing.featuredImageUrl)
        }
        nextFeaturedImageUrl = newImageUrl
      }
    } else if (removeImage) {
      // Hapus file fisik gambar dari disk saat tombol Hapus diklik
      if (existing.featuredImageUrl) {
        deleteLocalImageFile(existing.featuredImageUrl)
      }
      nextFeaturedImageUrl = null
    }

    // Generate/update slug jika nama berubah atau slug belum ada
    let nextSlug = existing.slug
    if (!nextSlug || existing.name !== validation.data.name) {
      nextSlug = await generateUniquePackageSlug(session.tenantId!, validation.data.name, packageId)
    }

    await scopedPrisma.package.update({
      where: { id: packageId },
      data: {
        ...validation.data,
        slug: nextSlug,
        status: nextStatus,
        featuredImageUrl: nextFeaturedImageUrl,
      },
    })

    revalidatePath('/dashboard/packages')
    revalidatePath(`/dashboard/packages/${packageId}`)
    revalidatePath('/dashboard')

    return { success: true, packageId }
  } catch (err: any) {
    console.error('Error updatePackage:', err)
    return { error: 'Gagal memperbarui paket umroh. Silakan coba lagi.' }
  }
}

/**
 * Server Action: Save Paket Umroh (Create / Update otomatis)
 */
export async function savePackage(
  prevState: PackageFormState | null,
  formData: FormData
): Promise<PackageFormState> {
  const packageId = (formData.get('packageId') as string)?.trim()
  if (packageId) {
    return updatePackage(packageId, prevState, formData)
  }
  return createPackage(prevState, formData)
}

/**
 * Server Action: Toggle / Publish Status Paket ("draft" -> "active", "active" <-> "inactive")
 */
export async function togglePackageStatus(packageId: string) {
  const session = await getSession()
  if (!session || session.accountType !== 'travel_user' || !session.tenantId) {
    throw new Error('Unauthorized')
  }

  const scopedPrisma = getTenantScopedClient(session.tenantId)
  const existingPackage = await scopedPrisma.package.findFirst({
    where: { id: packageId },
  })

  if (!existingPackage) {
    throw new Error('Paket tidak ditemukan.')
  }

  let newStatus = 'active'
  if (existingPackage.status === 'draft') {
    newStatus = 'active' // Terbitkan
  } else if (existingPackage.status === 'active') {
    newStatus = 'inactive' // Nonaktifkan
  } else {
    newStatus = 'active' // Aktifkan
  }

  await scopedPrisma.package.update({
    where: { id: packageId },
    data: { status: newStatus },
  })

  revalidatePath('/dashboard/packages')
  revalidatePath(`/dashboard/packages/${packageId}`)
  revalidatePath('/dashboard')

  return { success: true, newStatus }
}

/**
 * Server Action: Terbitkan Paket Draft Langsung
 */
export async function publishPackage(packageId: string) {
  return togglePackageStatus(packageId)
}

/**
 * Server Action: Tambah Tanggal Keberangkatan
 */
export async function addPackageDeparture(
  prevState: DepartureFormState | null,
  formData: FormData
): Promise<DepartureFormState> {
  const session = await getSession()
  if (!session || session.accountType !== 'travel_user' || !session.tenantId) {
    return { error: 'Sesi tidak valid. Silakan login kembali.' }
  }

  const packageId = (formData.get('packageId') as string)?.trim()
  if (!packageId) {
    return { error: 'ID Paket tidak valid.' }
  }

  const dateStr = (formData.get('date') as string)?.trim()
  if (!dateStr) {
    return { error: 'Tanggal keberangkatan wajib diisi.' }
  }

  const dateObj = new Date(dateStr)
  if (isNaN(dateObj.getTime())) {
    return { error: 'Format tanggal tidak valid.' }
  }

  try {
    const scopedPrisma = getTenantScopedClient(session.tenantId)

    // Validasi kepemilikan paket
    const pkg = await scopedPrisma.package.findFirst({
      where: { id: packageId },
    })

    if (!pkg) {
      return { error: 'Paket tidak ditemukan atau di luar tenant Anda.' }
    }

    const newDep = await scopedPrisma.packageDeparture.create({
      data: {
        packageId,
        tenantId: session.tenantId,
        date: dateObj,
        isActive: true,
      },
    })

    revalidatePath('/dashboard/packages')
    revalidatePath(`/dashboard/packages/${packageId}`)
    revalidatePath('/dashboard')

    return {
      success: true,
      departure: {
        id: newDep.id,
        date: newDep.date,
        isActive: newDep.isActive,
      },
    }
  } catch (err: any) {
    console.error('Error addPackageDeparture:', err)
    return { error: 'Gagal menambahkan tanggal keberangkatan.' }
  }
}

/**
 * Server Action: Toggle Status Tanggal Keberangkatan (Aktif <-> Nonaktif)
 */
export async function toggleDepartureStatus(departureId: string) {
  const session = await getSession()
  if (!session || session.accountType !== 'travel_user' || !session.tenantId) {
    throw new Error('Unauthorized')
  }

  const scopedPrisma = getTenantScopedClient(session.tenantId)
  const existingDep = await scopedPrisma.packageDeparture.findFirst({
    where: { id: departureId },
  })

  if (!existingDep) {
    throw new Error('Jadwal keberangkatan tidak ditemukan.')
  }

  const updatedDep = await scopedPrisma.packageDeparture.update({
    where: { id: departureId },
    data: { isActive: !existingDep.isActive },
  })

  revalidatePath('/dashboard/packages')
  revalidatePath(`/dashboard/packages/${existingDep.packageId}`)
  revalidatePath('/dashboard')

  return { success: true, isActive: updatedDep.isActive }
}
