import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { TenantNavbar } from './components/tenant-navbar'
import { TenantFooter } from './components/tenant-footer'
import { PackageSearchBar } from './components/package-search-bar'
import { PackageCard } from './components/package-card'
import { TestimonialsSection } from './components/testimonials-section'
import { FAQAccordion } from './components/faq-accordion'
import { getAvailableDepartureMonths, formatIndonesianDate } from '@/lib/package-helpers'
import {
  Compass,
  ShieldCheck,
  Building2,
  HeartHandshake,
  FileCheck2,
  ArrowRight,
  PackageOpen,
  Calendar,
  CalendarOff,
  Clock,
  Plane,
  MessageSquareQuote,
  HelpCircle,
} from 'lucide-react'

interface TenantHomePageProps {
  params: Promise<{ slug: string }>
}

export default async function TenantHomePage({ params }: TenantHomePageProps) {
  const { slug } = await params

  // 1. Resolve Tenant dari subdomain
  const tenant = await prisma.tenant.findUnique({
    where: { slug },
  })

  if (!tenant || tenant.status !== 'active') {
    notFound()
  }

  // 2. Query bulan-bulan keberangkatan unik untuk search dropdown
  const availableMonths = await getAvailableDepartureMonths(tenant.id)

  // 3. Query paket aktif khusus tenant ini (STRICT: JANGAN select commissionAmount)
  const activePackages = await prisma.package.findMany({
    where: {
      tenantId: tenant.id,
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
      priceQuad: true,
      priceTriple: true,
      priceDouble: true,
      featuredImageUrl: true,
      createdAt: true,
    },
  })

  // 4. Query jadwal keberangkatan aktif milik paket aktif tenant ini
  const activePackageMap = new Map<string, (typeof activePackages)[0]>()
  for (const pkg of activePackages) {
    activePackageMap.set(pkg.id, pkg)
  }

  const activePackageIds = Array.from(activePackageMap.keys())
  const today = new Date(new Date().setHours(0, 0, 0, 0))

  const activeDepartures =
    activePackageIds.length > 0
      ? await prisma.packageDeparture.findMany({
          where: {
            tenantId: tenant.id,
            packageId: { in: activePackageIds },
            isActive: true,
            date: { gte: today },
          },
          select: {
            id: true,
            packageId: true,
            date: true,
          },
          orderBy: {
            date: 'asc',
          },
        })
      : []

  // Jadwal terdekat untuk seluruh tenant (hero card kanan)
  const firstDep = activeDepartures[0] || null
  const nearestPkg = firstDep ? activePackageMap.get(firstDep.packageId) || null : null
  const overallNearestDeparture =
    firstDep && nearestPkg
      ? {
          ...firstDep,
          package: nearestPkg,
        }
      : null

  let daysUntilNearest: number | null = null
  if (overallNearestDeparture) {
    const diffTime = new Date(overallNearestDeparture.date).getTime() - today.getTime()
    daysUntilNearest = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  // Mapping jadwal terdekat per paket
  const packageNearestDateMap = new Map<string, Date>()
  for (const dep of activeDepartures) {
    if (!packageNearestDateMap.has(dep.packageId)) {
      packageNearestDateMap.set(dep.packageId, dep.date)
    }
  }

  const sortedPackages = [...activePackages]
    .sort((a, b) => {
      const dateA = packageNearestDateMap.get(a.id)?.getTime()
      const dateB = packageNearestDateMap.get(b.id)?.getTime()
      if (dateA && dateB) return dateA - dateB
      if (dateA && !dateB) return -1
      if (!dateA && dateB) return 1
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
    .slice(0, 6)
    .map((pkg) => ({
      ...pkg,
      nearestDepartureDate: packageNearestDateMap.get(pkg.id) || null,
    }))

  return (
    <div className="min-h-screen bg-site-bg text-site-text flex flex-col font-sans selection:bg-brand-500 selection:text-white">
      {/* Header Navigation */}
      <TenantNavbar tenantName={tenant.name} />

      <main className="flex-1">
        {/* HERO SECTION — 2 Kolom Asimetris */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-12 sm:pt-16 sm:pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Kiri: Headline & CTA (7 Kolom) */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-site-text leading-[1.15]">
                Wujudkan Ibadah Umroh Bersama{' '}
                <span className="text-brand-600 underline decoration-brand-500/30">
                  {tenant.name}
                </span>
              </h1>

              <p className="text-sm sm:text-base lg:text-lg text-site-text-muted max-w-xl font-normal leading-relaxed">
                Menghadirkan perjalanan ibadah ke tanah suci yang nyaman, khusyuk, dan amanah bersama bimbingan tim berpengalaman.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3.5">
                <Link
                  href="/paket"
                  className="px-6 py-3.5 bg-brand-600 hover:bg-brand-500 active:bg-brand-700 text-white text-xs sm:text-sm font-bold rounded-lg sm:rounded-xl transition-all shadow-xs flex items-center gap-2"
                >
                  <Compass className="w-4 h-4" />
                  <span>Lihat Paket Kami</span>
                </Link>
                <Link
                  href="/gabung-agen"
                  className="px-6 py-3.5 bg-white hover:bg-stone-100 text-site-text border border-stone-300 text-xs sm:text-sm font-bold rounded-lg sm:rounded-xl transition-all shadow-xs"
                >
                  Gabung Jadi Agen
                </Link>
              </div>
            </div>

            {/* Kanan: Card "Keberangkatan Terdekat" (5 Kolom) */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl border border-stone-200/90 p-6 sm:p-7 shadow-xs space-y-5">
                <div className="flex items-center justify-between gap-3 pb-3 border-b border-stone-100">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-600">
                    <Calendar className="w-4 h-4 text-brand-500" />
                    <span>Keberangkatan Terdekat</span>
                  </div>
                  {overallNearestDeparture && daysUntilNearest !== null && (
                    <span className="px-2.5 py-1 rounded-full bg-brand-50 border border-brand-200 text-[11px] font-black text-brand-600">
                      {daysUntilNearest === 0 ? 'Hari Ini' : `H-${daysUntilNearest} hari`}
                    </span>
                  )}
                </div>

                {overallNearestDeparture ? (
                  <div className="space-y-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-site-text-muted block mb-1">
                        Paket Pilihan
                      </span>
                      <h3 className="font-serif text-lg sm:text-xl font-bold text-site-text leading-snug">
                        {overallNearestDeparture.package.name}
                      </h3>
                    </div>

                    <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200/80 space-y-2 text-xs text-site-text-muted">
                      <div className="flex items-center gap-2 font-bold text-site-text">
                        <Calendar className="w-4 h-4 text-brand-500 shrink-0" />
                        <span>
                          {formatIndonesianDate(overallNearestDeparture.date, {
                            includeWeekday: true,
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-[11px] pt-1">
                        <div className="flex items-center gap-1.5">
                          <Plane className="w-3.5 h-3.5 text-stone-400" />
                          <span>{overallNearestDeparture.package.airline}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-stone-400" />
                          <span>{overallNearestDeparture.package.duration}</span>
                        </div>
                      </div>
                    </div>

                    <Link
                      href={`/paket/${overallNearestDeparture.package.slug}`}
                      className="w-full py-2.5 px-4 bg-site-dark hover:bg-brand-600 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>Lihat Rincian Paket</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ) : (
                  <div className="py-6 text-center space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-stone-100 text-stone-400 mx-auto flex items-center justify-center">
                      <CalendarOff className="w-6 h-6 text-stone-400" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-site-text">
                        Jadwal Belum Tersedia
                      </h4>
                      <p className="text-xs text-site-text-muted leading-relaxed max-w-xs mx-auto">
                        Jadwal keberangkatan akan segera diumumkan. Silakan cek berkala atau hubungi pihak travel.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* SEARCH BAR (Full-Width Normal Flow) */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <PackageSearchBar months={availableMonths} />
        </section>

        {/* FEATURE STRIP */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            <div className="bg-white p-6 rounded-xl border border-stone-200/80 shadow-xs space-y-3">
              <div className="w-11 h-11 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-site-text">
                Pembimbing Berpengalaman
              </h3>
              <p className="text-xs text-site-text-muted leading-relaxed">
                Muthawif terpercaya yang membimbing tata cara ibadah sesuai sunnah dengan penuh dedikasi.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-stone-200/80 shadow-xs space-y-3">
              <div className="w-11 h-11 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-site-text">
                Hotel Terpilih
              </h3>
              <p className="text-xs text-site-text-muted leading-relaxed">
                Akomodasi berkualitas dengan jarak strategis ke Masjidil Haram dan Masjid Nabawi.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-stone-200/80 shadow-xs space-y-3">
              <div className="w-11 h-11 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-site-text">
                Pendampingan Penuh
              </h3>
              <p className="text-xs text-site-text-muted leading-relaxed">
                Pelayanan jamaah yang responsif dan siap mendampingi sejak keberangkatan hingga kepulangan.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-stone-200/80 shadow-xs space-y-3">
              <div className="w-11 h-11 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-site-text">
                Proses Transparan
              </h3>
              <p className="text-xs text-site-text-muted leading-relaxed">
                Rincian fasilitas, paket, dan jadwal jelas tanpa ada biaya tersembunyi.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION PAKET TERSEDIA (Heading Rata Kiri dengan Fraunces & Real Count) */}
        <section className="py-12 sm:py-16 border-t border-stone-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="text-left space-y-1.5">
              <h2 className="font-serif text-2xl sm:text-4xl font-bold text-site-text tracking-tight">
                {activePackages.length} Paket Umroh Tersedia
              </h2>
              <p className="text-xs sm:text-sm text-site-text-muted leading-relaxed max-w-xl">
                Pilih paket perjalanan ibadah umroh terbaik yang disiapkan dengan fasilitas nyaman dan jadwal terencana.
              </p>
            </div>

            {sortedPackages.length === 0 ? (
              <div className="bg-white max-w-lg mx-auto p-8 sm:p-10 rounded-2xl border border-stone-200 text-center shadow-xs space-y-3">
                <div className="w-12 h-12 rounded-xl bg-stone-100 text-stone-400 mx-auto flex items-center justify-center">
                  <PackageOpen className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-site-text">
                  Belum ada paket tersedia saat ini
                </h3>
                <p className="text-xs text-site-text-muted leading-relaxed">
                  Paket umroh baru sedang disiapkan. Silakan kunjungi kembali halaman ini dalam waktu dekat atau hubungi pihak travel.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                  {sortedPackages.map((pkg) => (
                    <PackageCard key={pkg.id} pkg={pkg} />
                  ))}
                </div>

                <div className="pt-4 text-left">
                  <Link
                    href="/paket"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-stone-50 border border-stone-300 hover:border-brand-400 text-site-text hover:text-brand-600 text-xs sm:text-sm font-bold rounded-lg transition-all shadow-xs"
                  >
                    <span>Lihat Semua Paket</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </>
            )}
          </div>
        </section>

        {/* SECTION TESTIMONI JAMAAH */}
        <section className="py-14 sm:py-20 border-t border-stone-200/80 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="text-left space-y-1.5 max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 flex items-center gap-1.5">
                <MessageSquareQuote className="w-3.5 h-3.5" />
                <span>Pengalaman & Cerita</span>
              </span>
              <h2 className="font-serif text-2xl sm:text-4xl font-bold text-site-text tracking-tight">
                Testimoni Jamaah
              </h2>
              <p className="text-xs sm:text-sm text-site-text-muted leading-relaxed">
                Kesan dan pengalaman jamaah yang telah mempercayakan perjalanan ibadah ke tanah suci bersama {tenant.name}.
              </p>
            </div>

            <TestimonialsSection />
          </div>
        </section>

        {/* SECTION FAQ (TANYA JAWAB) */}
        <section className="py-14 sm:py-20 border-t border-stone-200/80 bg-[#F7F3EC]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="text-center space-y-2 max-w-2xl mx-auto">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 border border-brand-200/60 px-3 py-1 rounded-full inline-flex items-center gap-1.5 mx-auto">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Informasi Penting</span>
              </span>
              <h2 className="font-serif text-2xl sm:text-4xl font-bold text-site-text tracking-tight">
                Pertanyaan yang Sering Diajukan
              </h2>
              <p className="text-xs sm:text-sm text-site-text-muted leading-relaxed">
                Jawaban seputar persyaratan pendaftaran, jadwal manasik, fasilitas hotel, dan skema pembayaran paket umroh.
              </p>
            </div>

            <FAQAccordion />
          </div>
        </section>

        {/* CALL TO ACTION BAND (site-dark #133433) */}
        <section className="bg-site-dark py-14 sm:py-20 text-white border-t border-teal-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <div className="max-w-2xl mx-auto space-y-3">
              <h3 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight text-white">
                Siap Mewujudkan Niat Suci ke Baitullah?
              </h3>
              <p className="text-xs sm:text-sm text-teal-100/80 leading-relaxed">
                Daftarkan diri dan keluarga Anda sekarang untuk mendapatkan kepastian jadwal keberangkatan serta bimbingan ibadah yang khusyuk bersama {tenant.name}.
              </p>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/paket"
                className="px-6 py-3.5 bg-brand-600 hover:bg-brand-500 active:bg-brand-700 text-white text-xs sm:text-sm font-bold rounded-lg sm:rounded-xl transition-all shadow-xs flex items-center gap-2"
              >
                <Compass className="w-4 h-4" />
                <span>Pilih Paket Umroh</span>
              </Link>
              <Link
                href="/gabung-agen"
                className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs sm:text-sm font-bold rounded-lg sm:rounded-xl transition-all backdrop-blur-md"
              >
                Gabung Jadi Agen
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <TenantFooter tenantName={tenant.name} />
    </div>
  )
}
