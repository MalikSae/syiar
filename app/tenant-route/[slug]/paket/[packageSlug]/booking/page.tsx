import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import { getTenantScopedClient } from '@/prisma/extensions/tenant-scope'
import { getBookingReferral } from '@/lib/referral-cookie'
import { BookingForm } from './booking-form'
import { ArrowLeft, ShieldCheck, Lock } from 'lucide-react'

interface BookingPageProps {
  params: Promise<{ slug: string; packageSlug: string }>
}

export default async function BookingPage({ params }: BookingPageProps) {
  const { slug, packageSlug } = await params

  // 1. Resolve Tenant dari slug
  const tenant = await prisma.tenant.findUnique({
    where: { slug },
  })

  if (!tenant || tenant.status !== 'active') {
    notFound()
  }

  // 2. Resolve Package dalam scope tenant
  const scopedClient = getTenantScopedClient(tenant.id)
  const pkg = await scopedClient.package.findFirst({
    where: {
      slug: packageSlug,
      status: 'active',
    },
  })

  if (!pkg) {
    notFound()
  }

  // 3. Ambil jadwal keberangkatan aktif
  const departures = await scopedClient.packageDeparture.findMany({
    where: {
      packageId: pkg.id,
      isActive: true,
    },
    orderBy: { date: 'asc' },
    select: {
      id: true,
      date: true,
    },
  })

  // 4. Ambil kode referral contoh dinamis milik tenant ini (jika ada agent approved)
  const sampleAgent = await scopedClient.agent.findFirst({
    where: { status: 'approved' },
    select: { referralCode: true },
  })
  const sampleReferralCode = sampleAgent?.referralCode || 'ABCD1234'

  // 5. Ambil kode referral dari cookie jika ada
  const cookieReferral = await getBookingReferral()
  const currentYear = new Date().getFullYear()

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-site-text font-inter">
      {/* Distraction-Free Minimalist Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo / Tenant Brand */}
          <Link
            href={`/paket/${pkg.slug}`}
            className="flex items-center gap-3 group transition-opacity hover:opacity-80"
          >
            {tenant.logoUrl ? (
              <Image
                src={tenant.logoUrl}
                alt={tenant.name}
                width={120}
                height={36}
                className="h-8 sm:h-9 w-auto object-contain"
                priority
              />
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-black text-sm">
                  {tenant.name.charAt(0)}
                </div>
                <span className="font-jakarta font-black text-base sm:text-lg text-site-text tracking-tight">
                  {tenant.name}
                </span>
              </div>
            )}
          </Link>

          {/* Clean Exit / Back Link */}
          <Link
            href={`/paket/${pkg.slug}`}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-site-text-muted hover:text-brand-600 transition-colors py-1.5 px-3 rounded-lg hover:bg-stone-100/80"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden xs:inline">Kembali ke Detail</span>
            <span className="xs:hidden">Kembali</span>
          </Link>
        </div>
      </header>

      {/* Main Form Content */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
        {/* Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 sm:gap-2 text-xs font-semibold text-site-text-muted text-left min-w-0 overflow-hidden whitespace-nowrap"
        >
          <Link href="/" className="hover:text-brand-600 transition-colors shrink-0">
            Beranda
          </Link>
          <span className="text-stone-300 shrink-0">/</span>
          <Link href="/paket" className="hover:text-brand-600 transition-colors shrink-0">
            Paket Umroh
          </Link>
          <span className="text-stone-300 shrink-0">/</span>
          <Link
            href={`/paket/${pkg.slug}`}
            className="hover:text-brand-600 transition-colors shrink-0 max-w-[120px] sm:max-w-[200px] truncate"
          >
            {pkg.name}
          </Link>
          <span className="text-stone-300 shrink-0">/</span>
          <span className="text-site-text font-bold shrink-0">Form Booking</span>
        </nav>

        {/* Heading */}
        <div className="text-left space-y-1 pb-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-semibold mb-1">
            <Lock className="w-3 h-3 text-emerald-600" />
            <span>Booking Aman & Resmi</span>
          </div>
          <h1 className="font-jakarta text-2xl sm:text-3xl font-bold text-site-text tracking-tight">
            Formulir Booking Umroh
          </h1>
          <p className="text-xs sm:text-sm text-site-text-muted">
            Lengkapi data pemesan dan pilih jumlah jamaah untuk melanjutkan.
          </p>
        </div>

        {/* Form Booking */}
        <BookingForm
          slug={tenant.slug}
          packageSlug={pkg.slug}
          packageName={pkg.name}
          duration={pkg.duration}
          priceQuad={pkg.priceQuad}
          priceTriple={pkg.priceTriple}
          priceDouble={pkg.priceDouble}
          departures={departures}
          initialReferralCode={cookieReferral || ''}
          sampleReferralCode={sampleReferralCode}
        />
      </main>

      {/* Minimalist Distraction-Free Trust Footer */}
      <footer className="mt-auto border-t border-stone-200 bg-white py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left text-xs text-site-text-muted">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-brand-600 shrink-0" />
            <span>Data booking Anda terlindungi & diproses langsung oleh {tenant.name}.</span>
          </div>
          <div>
            <span>© {currentYear} {tenant.name}. Powered by <strong className="font-semibold text-site-text">SyiarLink</strong></span>
          </div>
        </div>
      </footer>
    </div>
  )
}
