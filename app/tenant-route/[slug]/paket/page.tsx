import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { TenantNavbar } from '../components/tenant-navbar'
import { TenantFooter } from '../components/tenant-footer'
import { PackageSearchBar } from '../components/package-search-bar'
import { PackageCard } from '../components/package-card'
import { getAvailableDepartureMonths } from '@/lib/package-helpers'
import { SearchX, RotateCcw, PackageOpen } from 'lucide-react'

interface PackageListPageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ q?: string; month?: string }>
}

export default async function PackageListPage({ params, searchParams }: PackageListPageProps) {
  const { slug } = await params
  const { q = '', month = '' } = await searchParams

  // 1. Resolve Tenant dari subdomain
  const tenant = await prisma.tenant.findUnique({
    where: { slug },
  })

  if (!tenant || tenant.status !== 'active') {
    notFound()
  }

  // 2. Query bulan keberangkatan unik untuk dropdown filter
  const availableMonths = await getAvailableDepartureMonths(tenant.id)

  // 3. Filter berdasarkan bulan keberangkatan jika ada
  let matchingPackageIds: string[] | undefined = undefined

  if (month && /^\d{4}-\d{2}$/.test(month)) {
    const [yearStr, monthStr] = month.split('-')
    const year = parseInt(yearStr, 10)
    const monthNum = parseInt(monthStr, 10)

    const startDate = new Date(Date.UTC(year, monthNum - 1, 1, 0, 0, 0, 0))
    const endDate = new Date(Date.UTC(year, monthNum, 0, 23, 59, 59, 999))

    const departuresInMonth = await prisma.packageDeparture.findMany({
      where: {
        tenantId: tenant.id,
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

  // 4. Query semua paket aktif yang match filter (STRICT: JANGAN select commissionAmount)
  const packages = await prisma.package.findMany({
    where: {
      tenantId: tenant.id,
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
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  // 5. Query jadwal keberangkatan aktif terdekat per paket
  const today = new Date(new Date().setHours(0, 0, 0, 0))
  const activeDepartures = await prisma.packageDeparture.findMany({
    where: {
      tenantId: tenant.id,
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

  const packagesWithDates = packages.map((pkg) => ({
    ...pkg,
    nearestDepartureDate: packageNearestDateMap.get(pkg.id) || null,
  }))

  const isFiltered = Boolean(q.trim() || month)

  return (
    <div className="min-h-screen bg-site-bg text-site-text flex flex-col font-sans selection:bg-brand-500 selection:text-white">
      {/* Header Navigation */}
      <TenantNavbar
        tenantName={tenant.name}
        logoUrl={tenant.logoUrl}
        iconUrl={tenant.iconUrl}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Page Title & Breadcrumb */}
        <div className="space-y-2 text-left">
          <div className="flex items-center gap-2 text-xs font-semibold text-site-text-muted">
            <Link href="/" className="hover:text-brand-600 transition-colors">
              Beranda
            </Link>
            <span>/</span>
            <span className="text-site-text font-bold">Paket Umroh</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-4xl font-bold text-site-text tracking-tight">
            Pilihan Paket Umroh — {tenant.name}
          </h1>
          <p className="text-xs sm:text-sm text-site-text-muted max-w-2xl leading-relaxed">
            Temukan berbagai pilihan paket ibadah umroh terbaik dengan jadwal keberangkatan terencana dan fasilitas unggulan.
          </p>
        </div>

        {/* Search & Filter Bar (Full Width) */}
        <PackageSearchBar
          months={availableMonths}
          initialQuery={q}
          initialMonth={month}
        />

        {/* Filter Indicator / Active Tags */}
        {isFiltered && (
          <div className="flex items-center justify-between gap-4 bg-brand-600/10 border border-brand-600/30 px-4 py-3 rounded-xl text-xs">
            <div className="flex flex-wrap items-center gap-2 text-site-text">
              <span className="font-bold text-brand-600">Hasil Pencarian:</span>
              {q && (
                <span className="bg-white px-2.5 py-1 rounded-md border border-brand-600/20 font-medium">
                  Kata kunci: &quot;{q}&quot;
                </span>
              )}
              {month && (
                <span className="bg-white px-2.5 py-1 rounded-md border border-brand-600/20 font-medium">
                  Bulan: {availableMonths.find((m) => m.value === month)?.label || month}
                </span>
              )}
              <span className="text-site-text-muted">({packages.length} paket ditemukan)</span>
            </div>
            <Link
              href="/paket"
              className="inline-flex items-center gap-1.5 font-bold text-brand-600 hover:opacity-80 hover:underline shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filter</span>
            </Link>
          </div>
        )}

        {/* Packages Grid / Empty State */}
        {packagesWithDates.length === 0 ? (
          <div className="bg-white p-10 sm:p-16 rounded-2xl border border-stone-200 text-center shadow-xs space-y-4 max-w-lg mx-auto my-12">
            <div className="w-14 h-14 rounded-xl bg-stone-100 text-stone-400 mx-auto flex items-center justify-center">
              {isFiltered ? <SearchX className="w-7 h-7" /> : <PackageOpen className="w-7 h-7" />}
            </div>
            <div className="space-y-2">
              <h3 className="font-serif text-base sm:text-lg font-bold text-site-text">
                {isFiltered ? 'Tidak ada paket yang cocok' : 'Belum ada paket tersedia'}
              </h3>
              <p className="text-xs sm:text-sm text-site-text-muted leading-relaxed">
                {isFiltered
                  ? 'Tidak ada paket yang cocok dengan pencarian. Coba kata kunci atau bulan lain.'
                  : 'Belum ada paket umroh yang tersedia saat ini. Silakan kunjungi kembali nanti.'}
              </p>
            </div>
            {isFiltered && (
              <div className="pt-2">
                <Link
                  href="/paket"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-lg transition-all shadow-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Tampilkan Semua Paket</span>
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {packagesWithDates.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <TenantFooter tenantName={tenant.name} />
    </div>
  )
}
