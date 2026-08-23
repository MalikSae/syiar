import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getTenantScopedClient } from '@/prisma/extensions/tenant-scope'

interface PackageDetailPageProps {
  params: Promise<{ slug: string; packageSlug: string }>
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

  // 2. Resolve Package by slug (harus aktif dan milik tenant ini)
  const scopedPrisma = getTenantScopedClient(tenant.id)
  const pkg = await scopedPrisma.package.findFirst({
    where: {
      slug: packageSlug,
      status: 'active',
    },
  })

  if (!pkg) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 sm:p-12 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <Link
            href="/paket"
            className="text-xs font-semibold text-brand-600 hover:text-brand-500 transition-colors inline-block mb-2"
          >
            &larr; Kembali ke Daftar Paket
          </Link>
          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-600 ml-3">
            {tenant.name}
          </span>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{pkg.name}</h1>
          <p className="text-xs font-mono text-slate-400">URL slug: {pkg.slug}</p>
          <div className="pt-4 border-t border-slate-100">
            <p className="text-sm text-slate-600">
              Durasi: <span className="font-semibold text-slate-900">{pkg.duration}</span> · Maskapai:{' '}
              <span className="font-semibold text-slate-900">{pkg.airline}</span>
            </p>
          </div>
          <div className="pt-4">
            <p className="text-xs text-slate-400 italic">
              Konten lengkap detail paket & form booking jamaah akan diimplementasikan pada task berikutnya.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
