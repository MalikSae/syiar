'use server'

import { prisma } from '@/lib/prisma'
import { PackageCardData } from '../components/package-card'

interface FetchMorePackagesParams {
  tenantId: string
  q?: string
  month?: string
  skip: number
  take?: number
}

export async function fetchMorePackages({
  tenantId,
  q = '',
  month = '',
  skip,
  take = 6,
}: FetchMorePackagesParams): Promise<{
  packages: PackageCardData[]
  hasMore: boolean
}> {
  // 1. Filter berdasarkan bulan keberangkatan jika ada
  let matchingPackageIds: string[] | undefined = undefined

  if (month && /^\d{4}-\d{2}$/.test(month)) {
    const [yearStr, monthStr] = month.split('-')
    const year = parseInt(yearStr, 10)
    const monthNum = parseInt(monthStr, 10)

    const startDate = new Date(Date.UTC(year, monthNum - 1, 1, 0, 0, 0, 0))
    const endDate = new Date(Date.UTC(year, monthNum, 0, 23, 59, 59, 999))

    const departuresInMonth = await prisma.packageDeparture.findMany({
      where: {
        tenantId,
        isActive: true,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        packageId: true,
      },
    })

    matchingPackageIds = Array.from(new Set(departuresInMonth.map((d) => d.packageId)))
  }

  // 2. Query paket dengan pagination (skip & take + 1 untuk hasMore)
  const packages = await prisma.package.findMany({
    where: {
      tenantId,
      status: 'active',
      ...(q.trim() ? { name: { contains: q.trim() } } : {}),
      ...(matchingPackageIds !== undefined ? { id: { in: matchingPackageIds } } : {}),
    },
    select: {
      id: true,
      name: true,
      slug: true,
      duration: true,
      airline: true,
      hotelMakkah: true,
      hotelMadinah: true,
      priceQuad: true,
      priceTriple: true,
      priceDouble: true,
      featuredImageUrl: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    skip,
    take: take + 1,
  })

  const hasMore = packages.length > take
  const resultPackages = hasMore ? packages.slice(0, take) : packages

  // 3. Query jadwal keberangkatan aktif terdekat per paket
  const today = new Date(new Date().setHours(0, 0, 0, 0))
  const activeDepartures = await prisma.packageDeparture.findMany({
    where: {
      tenantId,
      packageId: { in: resultPackages.map((p) => p.id) },
      isActive: true,
      date: { gte: today },
    },
    select: {
      packageId: true,
      date: true,
    },
    orderBy: {
      date: 'asc',
    },
  })

  const packageNearestDateMap = new Map<string, Date>()
  for (const dep of activeDepartures) {
    if (!packageNearestDateMap.has(dep.packageId)) {
      packageNearestDateMap.set(dep.packageId, dep.date)
    }
  }

  const packagesWithDates: PackageCardData[] = resultPackages.map((pkg) => ({
    ...pkg,
    nearestDepartureDate: packageNearestDateMap.get(pkg.id) || null,
  }))

  return {
    packages: packagesWithDates,
    hasMore,
  }
}
