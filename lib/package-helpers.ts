import { prisma } from '@/lib/prisma'

/**
 * Format angka ke mata uang Rupiah
 * Contoh: 28500000 -> "Rp 28.500.000"
 */
export function formatRupiah(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Mendapatkan harga terendah dari tipe kamar yang tersedia (Quad / Triple / Double)
 */
export function getLowestPrice(pkg: {
  priceQuad?: number | null
  priceTriple?: number | null
  priceDouble?: number | null
}): number | null {
  const prices = [pkg.priceQuad, pkg.priceTriple, pkg.priceDouble].filter(
    (p): p is number => p !== null && p !== undefined && p > 0
  )
  if (prices.length === 0) return null
  return Math.min(...prices)
}

/**
 * Format tanggal untuk chip/pill keberangkatan ringkas
 * Contoh: "31 Agu", "Senin, 2026"
 */
export function formatDepartureChipDate(date: Date | string): {
  dayMonth: string
  subtext: string
  fullDate: string
} {
  const d = typeof date === 'string' ? new Date(date) : date
  const dayMonth = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
  }).format(d)
  const year = d.getFullYear()
  const fullDate = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d)

  return {
    dayMonth,
    subtext: String(year),
    fullDate,
  }
}

/**
 * Format tanggal ke format bahasa Indonesia
 * Contoh: "Kamis, 10 Desember 2026" atau "10 Desember 2026"
 */
export function formatIndonesianDate(
  date: Date | string,
  options?: { includeWeekday?: boolean }
): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('id-ID', {
    ...(options?.includeWeekday ? { weekday: 'long' } : {}),
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d)
}

/**
 * Mengambil daftar bulan-bulan keberangkatan aktif yang unik untuk tenant tertentu
 * Format value: "YYYY-MM" (mis. "2026-12"), Label: "Desember 2026"
 */
export async function getAvailableDepartureMonths(
  tenantId: string
): Promise<{ value: string; label: string }[]> {
  // Query departure aktif milik paket yang statusnya 'active' di tenant ini
  const departures = await prisma.packageDeparture.findMany({
    where: {
      tenantId,
      isActive: true,
      // Hubungkan dengan paket aktif
    },
    select: {
      date: true,
      packageId: true,
    },
    orderBy: {
      date: 'asc',
    },
  })

  // Pastikan paketnya berstatus 'active'
  const activePackageIds = await prisma.package.findMany({
    where: {
      tenantId,
      status: 'active',
    },
    select: { id: true },
  })
  const activeSet = new Set(activePackageIds.map((p) => p.id))

  const monthMap = new Map<string, string>()

  for (const dep of departures) {
    if (!activeSet.has(dep.packageId)) continue

    const d = new Date(dep.date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const key = `${year}-${month}`

    if (!monthMap.has(key)) {
      const label = new Intl.DateTimeFormat('id-ID', {
        month: 'long',
        year: 'numeric',
      }).format(d)
      monthMap.set(key, label)
    }
  }

  return Array.from(monthMap.entries()).map(([value, label]) => ({
    value,
    label,
  }))
}
