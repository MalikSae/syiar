import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { TenantNavbar } from '../../components/tenant-navbar'
import { TenantFooter } from '../../components/tenant-footer'
import { BookingButton } from '../../components/booking-button'
import { GeometricPlaceholder } from '../../components/geometric-placeholder'
import { DepartureChips } from '../../components/departure-chips'
import { MobileStickyBooking } from '../../components/mobile-sticky-booking'
import { formatRupiah, getLowestPrice } from '@/lib/package-helpers'
import {
  Clock,
  Plane,
  Building,
  CheckCircle2,
  XCircle,
  Calendar,
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
    <div className="min-h-screen bg-site-bg text-site-text flex flex-col font-inter selection:bg-brand-500 selection:text-white">
      {/* Header Navigation */}
      <TenantNavbar
        tenantName={tenant.name}
        logoUrl={tenant.logoUrl}
        iconUrl={tenant.iconUrl}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Breadcrumb Navigation (Single Line) */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 sm:gap-2 text-xs font-semibold text-site-text-muted text-left min-w-0 overflow-hidden whitespace-nowrap">
          <Link href="/" className="hover:text-brand-600 transition-colors shrink-0">
            Beranda
          </Link>
          <span className="text-stone-300 shrink-0">/</span>
          <Link href="/paket" className="hover:text-brand-600 transition-colors shrink-0">
            Paket Umroh
          </Link>
          <span className="text-stone-300 shrink-0">/</span>
          <span className="text-site-text font-bold truncate min-w-0">
            {pkg.name}
          </span>
        </nav>

        {/* 2-Column Main Content & Pricing Layout (Left column first on mobile, sticky on desktop) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-left">
          {/* Left Column: Details, Facilities, Itinerary (Seamless Cardless Style) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Featured Image — Seamless (16:9 Aspect Ratio) */}
            <div className="w-full select-none">
              <div className="w-full aspect-16/9 rounded-2xl overflow-hidden border border-stone-200/80 bg-stone-100 shadow-2xs relative">
                {pkg.featuredImageUrl ? (
                  <img
                    src={pkg.featuredImageUrl}
                    alt={pkg.name}
                    className="w-full h-full object-cover pointer-events-none"
                  />
                ) : (
                  <GeometricPlaceholder name={pkg.name} />
                )}
              </div>
            </div>

            {/* Header Info (Judul Paket & Fasilitas Utama — Seamless) */}
            <div className="space-y-3.5 text-left">
              <div className="flex flex-wrap items-center justify-between gap-2.5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-600/10 border border-brand-600/30 text-xs font-bold text-brand-600">
                  <Clock className="w-3.5 h-3.5 text-brand-500" />
                  <span>{pkg.duration}</span>
                </div>
                <span className="text-xs font-semibold text-site-text-muted">
                  Diselenggarakan oleh <strong className="text-site-text font-bold">{tenant.name}</strong>
                </span>
              </div>

              <h1 className="font-jakarta text-2xl sm:text-3xl font-bold text-site-text tracking-tight leading-snug">
                {pkg.name}
              </h1>

              {/* Quick Facility Strip — Compact & Clean */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-stone-50/80 border border-stone-200/70 text-xs">
                  <div className="w-7 h-7 rounded-lg bg-white shadow-2xs flex items-center justify-center text-brand-500 shrink-0">
                    <Plane className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-site-text-muted block">
                      Maskapai Penerbangan
                    </span>
                    <span className="font-bold text-site-text truncate block">{pkg.airline}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-stone-50/80 border border-stone-200/70 text-xs">
                  <div className="w-7 h-7 rounded-lg bg-white shadow-2xs flex items-center justify-center text-brand-500 shrink-0">
                    <Building className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-site-text-muted block">
                      Hotel Makkah
                    </span>
                    <span className="font-bold text-site-text truncate block">{pkg.hotelMakkah}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-stone-50/80 border border-stone-200/70 text-xs">
                  <div className="w-7 h-7 rounded-lg bg-white shadow-2xs flex items-center justify-center text-brand-500 shrink-0">
                    <Building className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-site-text-muted block">
                      Hotel Madinah
                    </span>
                    <span className="font-bold text-site-text truncate block">{pkg.hotelMadinah}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Fasilitas Termasuk & Tidak Termasuk — Seamless 2-Column with Thin Divider */}
            <div className="pt-6 border-t border-stone-200/80">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Include */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <h2 className="font-jakarta text-sm sm:text-base font-bold text-site-text">
                      Sudah Termasuk
                    </h2>
                  </div>
                  <ul className="space-y-2 text-xs text-site-text">
                    {includeItems.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Exclude */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
                    <XCircle className="w-4 h-4 text-rose-500" />
                    <h2 className="font-jakarta text-sm sm:text-base font-bold text-site-text">
                      Belum Termasuk
                    </h2>
                  </div>
                  <ul className="space-y-2 text-xs text-site-text">
                    {excludeItems.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Rencana Perjalanan (Itinerary — Seamless with Thin Divider) */}
            <div className="pt-6 border-t border-stone-200/80 space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
                <MapPin className="w-4 h-4 text-brand-500" />
                <h2 className="font-jakarta text-sm sm:text-base font-bold text-site-text">
                  Rencana Perjalanan (Itinerary)
                </h2>
              </div>
              <div className="prose prose-stone max-w-none text-xs sm:text-sm text-site-text leading-relaxed whitespace-pre-line font-inter">
                {pkg.itinerary}
              </div>
            </div>
          </div>

          {/* Right Column: Card Harga + Jadwal Keberangkatan */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
            <div id="pricing-card" className="bg-white rounded-2xl border-2 border-brand-600 p-6 sm:p-7 shadow-xs space-y-5">
              {/* 1. Heading Harga */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-site-text-muted block mb-1">
                  Pilihan Tipe Kamar & Harga
                </span>
                <h3 className="font-jakarta text-xl font-bold text-site-text">
                  {lowestPrice ? `Mulai dari ${formatRupiah(lowestPrice)}` : 'Daftar Harga'}
                </h3>
              </div>

              {/* 2. Room Type Price List (skip nulls) */}
              <div className="space-y-2.5 pt-2 border-t border-stone-100">
                {pkg.priceQuad && pkg.priceQuad > 0 && (
                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-site-text block">Kamar Quad</span>
                      <span className="text-[11px] text-site-text-muted">4 pax per kamar</span>
                    </div>
                    <span className="text-sm font-black text-brand-600">
                      {formatRupiah(pkg.priceQuad)}
                    </span>
                  </div>
                )}

                {pkg.priceTriple && pkg.priceTriple > 0 && (
                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-site-text block">Kamar Triple</span>
                      <span className="text-[11px] text-site-text-muted">3 pax per kamar</span>
                    </div>
                    <span className="text-sm font-black text-brand-600">
                      {formatRupiah(pkg.priceTriple)}
                    </span>
                  </div>
                )}

                {pkg.priceDouble && pkg.priceDouble > 0 && (
                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-site-text block">Kamar Double</span>
                      <span className="text-[11px] text-site-text-muted">2 pax per kamar</span>
                    </div>
                    <span className="text-sm font-black text-brand-600">
                      {formatRupiah(pkg.priceDouble)}
                    </span>
                  </div>
                )}
              </div>

              {/* 3. Sub-section Jadwal Keberangkatan */}
              <div className="pt-4 border-t border-stone-100 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-site-text">
                    <Calendar className="w-3.5 h-3.5 text-brand-500" />
                    <span>Jadwal Keberangkatan</span>
                  </div>
                  {departures.length > 0 && (
                    <span className="text-[11px] font-semibold text-site-text-muted">
                      {departures.length} jadwal
                    </span>
                  )}
                </div>

                <DepartureChips departures={departures} />
              </div>

              {/* 4. Booking CTA Button */}
              <div className="pt-2">
                <BookingButton packageSlug={pkg.slug} packageName={pkg.name} />
              </div>

              {/* 5. Disclaimer */}
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

      {/* Floating Sticky Booking Bar for Mobile (Disappears when #pricing-card is in view) */}
      <MobileStickyBooking
        targetElementId="pricing-card"
        lowestPrice={lowestPrice}
      />

      {/* Footer */}
      <TenantFooter tenantName={tenant.name} />
    </div>
  )
}
