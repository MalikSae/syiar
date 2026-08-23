import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { TenantNavbar } from '../../components/tenant-navbar'
import { TenantFooter } from '../../components/tenant-footer'
import { BookingButton } from '../../components/booking-button'
import { GeometricPlaceholder } from '../../components/geometric-placeholder'
import { formatRupiah, formatIndonesianDate, getLowestPrice } from '@/lib/package-helpers'
import {
  Clock,
  Plane,
  Building,
  CheckCircle2,
  XCircle,
  Calendar,
  CalendarOff,
  ArrowLeft,
  MapPin,
} from 'lucide-react'

interface PackageDetailPageProps {
  params: Promise<{ slug: string; packageSlug: string }>
}

function parseList(text: string): string[] {
  if (!text) return []
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
  if (lines.length > 1) {
    return lines.map((l) => l.replace(/^[-•*]\s*/, ''))
  }
  return text
    .split(/[,;\n]/)
    .map((l) => l.trim().replace(/^[-•*]\s*/, ''))
    .filter(Boolean)
}

export default async function PackageDetailPage({ params }: PackageDetailPageProps) {
  const { slug, packageSlug } = await params

  // 1. Resolve Tenant dari subdomain
  const tenant = await prisma.tenant.findUnique({
    where: { slug },
  })

  if (!tenant || tenant.status !== 'active') {
    notFound()
  }

  // 2. Resolve Package by slug (STRICT: JANGAN select commissionAmount)
  const pkg = await prisma.package.findFirst({
    where: {
      tenantId: tenant.id,
      slug: packageSlug,
      status: 'active',
    },
    select: {
      id: true,
      name: true,
      slug: true,
      duration: true,
      airline: true,
      hotelMakkah: true,
      hotelMadinah: true,
      include: true,
      exclude: true,
      itinerary: true,
      priceQuad: true,
      priceTriple: true,
      priceDouble: true,
      featuredImageUrl: true,
    },
  })

  if (!pkg) {
    notFound()
  }

  // 3. Query jadwal keberangkatan aktif milik paket ini
  const departures = await prisma.packageDeparture.findMany({
    where: {
      tenantId: tenant.id,
      packageId: pkg.id,
      isActive: true,
    },
    select: {
      id: true,
      date: true,
    },
    orderBy: {
      date: 'asc',
    },
  })

  const lowestPrice = getLowestPrice(pkg)
  const includeItems = parseList(pkg.include)
  const excludeItems = parseList(pkg.exclude)

  return (
    <div className="min-h-screen bg-site-bg text-site-text flex flex-col font-sans selection:bg-brand-500 selection:text-white">
      {/* Header Navigation */}
      <TenantNavbar
        tenantName={tenant.name}
        logoUrl={tenant.logoUrl}
        iconUrl={tenant.iconUrl}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs font-semibold text-site-text-muted text-left">
          <Link href="/" className="hover:text-brand-600 transition-colors">
            Beranda
          </Link>
          <span>/</span>
          <Link href="/paket" className="hover:text-brand-600 transition-colors">
            Paket Umroh
          </Link>
          <span>/</span>
          <span className="text-site-text font-bold truncate max-w-xs">{pkg.name}</span>
        </div>

        {/* Top Header Card */}
        <div className="bg-white rounded-2xl border border-stone-200/90 p-6 sm:p-8 shadow-xs space-y-4 text-left">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-600/10 border border-brand-600/30 text-xs font-bold text-brand-600">
              <Clock className="w-3.5 h-3.5 text-brand-500" />
              <span>{pkg.duration}</span>
            </div>
            <span className="text-xs font-semibold text-site-text-muted">
              Diselenggarakan oleh <strong className="text-site-text font-bold">{tenant.name}</strong>
            </span>
          </div>

          <h1 className="font-serif text-2xl sm:text-4xl font-bold text-site-text tracking-tight leading-tight">
            {pkg.name}
          </h1>

          {/* Quick Facility Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-stone-100">
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-stone-50 border border-stone-200/70 text-xs">
              <div className="w-8 h-8 rounded-lg bg-white shadow-2xs flex items-center justify-center text-brand-500 shrink-0">
                <Plane className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-site-text-muted block">
                  Maskapai Penerbangan
                </span>
                <span className="font-bold text-site-text truncate block">{pkg.airline}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-stone-50 border border-stone-200/70 text-xs">
              <div className="w-8 h-8 rounded-lg bg-white shadow-2xs flex items-center justify-center text-brand-500 shrink-0">
                <Building className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-site-text-muted block">
                  Hotel Makkah
                </span>
                <span className="font-bold text-site-text truncate block">{pkg.hotelMakkah}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-stone-50 border border-stone-200/70 text-xs">
              <div className="w-8 h-8 rounded-lg bg-white shadow-2xs flex items-center justify-center text-brand-500 shrink-0">
                <Building className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-site-text-muted block">
                  Hotel Madinah
                </span>
                <span className="font-bold text-site-text truncate block">{pkg.hotelMadinah}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Main Content & Pricing Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-left">
          {/* Left Column (Details, Facilities, Itinerary) */}
          <div className="lg:col-span-8 space-y-8">
            {/* Featured Image */}
            {pkg.featuredImageUrl ? (
              <div className="rounded-2xl overflow-hidden border border-stone-200/80 shadow-xs bg-stone-100 aspect-16/9">
                <img
                  src={pkg.featuredImageUrl}
                  alt={pkg.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="rounded-2xl overflow-hidden border border-stone-200/80 shadow-xs aspect-16/8 relative">
                <GeometricPlaceholder name={pkg.name} />
              </div>
            )}

            {/* Jadwal Keberangkatan */}
            <div className="bg-white rounded-2xl border border-stone-200/90 p-6 sm:p-8 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-stone-100">
                <Calendar className="w-5 h-5 text-brand-500" />
                <h2 className="font-serif text-lg sm:text-xl font-bold text-site-text">
                  Jadwal Keberangkatan
                </h2>
              </div>

              {departures.length === 0 ? (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50/70 border border-amber-200/60 text-amber-800 text-xs sm:text-sm">
                  <CalendarOff className="w-5 h-5 text-amber-600 shrink-0" />
                  <p className="font-medium">
                    Jadwal keberangkatan akan segera diumumkan. Hubungi customer service untuk informasi estimasi kuota.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {departures.map((dep) => (
                    <div
                      key={dep.id}
                      className="p-4 rounded-xl bg-stone-50 border border-stone-200 flex items-center gap-3 hover:bg-brand-600/10 hover:border-brand-600/30 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg bg-white text-brand-600 shadow-2xs flex items-center justify-center font-bold text-xs shrink-0">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-site-text-muted block">
                          Tanggal Berangkat
                        </span>
                        <span className="text-xs sm:text-sm font-bold text-site-text block">
                          {formatIndonesianDate(dep.date, { includeWeekday: true })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Fasilitas Termasuk & Tidak Termasuk */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Include */}
              <div className="bg-white rounded-2xl border border-stone-200/90 p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-serif text-base font-bold text-site-text">Sudah Termasuk</h3>
                </div>
                <ul className="space-y-2.5 text-xs text-site-text">
                  {includeItems.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Exclude */}
              <div className="bg-white rounded-2xl border border-stone-200/90 p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
                  <XCircle className="w-5 h-5 text-rose-500" />
                  <h3 className="font-serif text-base font-bold text-site-text">Belum Termasuk</h3>
                </div>
                <ul className="space-y-2.5 text-xs text-site-text">
                  {excludeItems.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Rencana Perjalanan (Itinerary) */}
            <div className="bg-white rounded-2xl border border-stone-200/90 p-6 sm:p-8 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-stone-100">
                <MapPin className="w-5 h-5 text-brand-500" />
                <h2 className="font-serif text-lg sm:text-xl font-bold text-site-text">
                  Rencana Perjalanan (Itinerary)
                </h2>
              </div>
              <div className="prose prose-stone max-w-none text-xs sm:text-sm text-site-text leading-relaxed whitespace-pre-line font-sans">
                {pkg.itinerary}
              </div>
            </div>
          </div>

          {/* Right Column (Sticky Pricing Card & Booking CTA) */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
            <div className="bg-white rounded-2xl border border-stone-200/90 p-6 sm:p-8 shadow-xs space-y-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-site-text-muted block mb-1">
                  Pilihan Tipe Kamar & Harga
                </span>
                <h3 className="font-serif text-xl font-bold text-site-text">
                  {lowestPrice ? `Mulai ${formatRupiah(lowestPrice)}` : 'Daftar Harga'}
                </h3>
              </div>

              {/* Room Type Price List (skip nulls) */}
              <div className="space-y-3 pt-2 border-t border-stone-100">
                {pkg.priceQuad && pkg.priceQuad > 0 && (
                  <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-site-text block">Kamar Quad</span>
                      <span className="text-[11px] text-site-text-muted">4 orang per kamar</span>
                    </div>
                    <span className="text-sm font-black text-brand-600">
                      {formatRupiah(pkg.priceQuad)}
                    </span>
                  </div>
                )}

                {pkg.priceTriple && pkg.priceTriple > 0 && (
                  <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-site-text block">Kamar Triple</span>
                      <span className="text-[11px] text-site-text-muted">3 orang per kamar</span>
                    </div>
                    <span className="text-sm font-black text-brand-600">
                      {formatRupiah(pkg.priceTriple)}
                    </span>
                  </div>
                )}

                {pkg.priceDouble && pkg.priceDouble > 0 && (
                  <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-site-text block">Kamar Double</span>
                      <span className="text-[11px] text-site-text-muted">2 orang per kamar</span>
                    </div>
                    <span className="text-sm font-black text-brand-600">
                      {formatRupiah(pkg.priceDouble)}
                    </span>
                  </div>
                )}
              </div>

              {/* Booking CTA Button */}
              <div className="pt-2">
                <BookingButton packageName={pkg.name} />
              </div>

              <div className="pt-2 border-t border-stone-100 text-center">
                <p className="text-[11px] text-site-text-muted">
                  Harga dapat berubah sewaktu-waktu sesuai ketersediaan kuota maskapai & hotel.
                </p>
              </div>
            </div>

            {/* Back link */}
            <div className="text-center">
              <Link
                href="/paket"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-site-text-muted hover:text-brand-600 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali ke Daftar Paket</span>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <TenantFooter tenantName={tenant.name} />
    </div>
  )
}
