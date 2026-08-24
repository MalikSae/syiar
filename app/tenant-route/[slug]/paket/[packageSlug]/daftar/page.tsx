import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getTenantScopedClient } from '@/prisma/extensions/tenant-scope'
import { getBookingReferral } from '@/lib/referral-cookie'
import { TenantNavbar } from '../../../components/tenant-navbar'
import { TenantFooter } from '../../../components/tenant-footer'
import { BookingForm } from './booking-form'

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

  // 4. Ambil kode referral dari cookie jika ada
  const cookieReferral = await getBookingReferral()

  return (
    <div className="min-h-screen flex flex-col bg-site-bg text-site-text font-inter">
      {/* Navbar */}
      <TenantNavbar
        tenantName={tenant.name}
        logoUrl={tenant.logoUrl}
        iconUrl={tenant.iconUrl}
      />

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6">
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
          <span className="text-site-text font-bold shrink-0">Form Pendaftaran</span>
        </nav>

        {/* Heading */}
        <div className="text-left space-y-1.5 border-b border-stone-200/80 pb-4">
          <h1 className="font-jakarta text-2xl sm:text-3xl font-bold text-site-text tracking-tight">
            Formulir Pendaftaran Umroh
          </h1>
          <p className="text-xs sm:text-sm text-site-text-muted">
            Lengkapi data diri calon jamaah di bawah ini untuk memesan kuota paket.
          </p>
        </div>

        {/* Form Pendaftaran */}
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
        />
      </main>

      {/* Footer */}
      <TenantFooter tenantName={tenant.name} />
    </div>
  )
}
