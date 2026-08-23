import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getTenantScopedClient } from '@/prisma/extensions/tenant-scope'

interface PackageListPageProps {
  params: Promise<{ slug: string }>
}

export default async function PackageListPage({ params }: PackageListPageProps) {
  const { slug } = await params

  // 1. Resolve Tenant dari subdomain
  const tenant = await prisma.tenant.findUnique({
    where: { slug },
  })

  if (!tenant || tenant.status !== 'active') {
    notFound()
  }

  // 2. Query paket aktif khusus tenant ini lewat scoped client
  const scopedPrisma = getTenantScopedClient(tenant.id)
  const packages = await scopedPrisma.package.findMany({
    where: {
      status: 'active',
    },
    select: {
      id: true,
      name: true,
      slug: true,
      duration: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="min-h-screen bg-slate-50 p-6 sm:p-12 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <Link
            href="/"
            className="text-xs font-semibold text-brand-600 hover:text-brand-500 transition-colors inline-block mb-2"
          >
            &larr; Kembali ke Beranda
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Daftar Paket Umroh — {tenant.name}</h1>
          <p className="text-xs text-slate-500 mt-1">
            Pilihan paket umroh aktif yang tersedia untuk pendaftaran.
          </p>
        </div>

        {packages.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-sm text-slate-500">
            Belum ada paket umroh aktif saat ini.
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className="p-4 sm:p-5 hover:bg-slate-50/60 transition-colors flex items-center justify-between gap-4"
              >
                <div>
                  <h2 className="text-base font-bold text-slate-900">{pkg.name}</h2>
                  <p className="text-xs font-mono text-slate-400 mt-0.5">slug: {pkg.slug}</p>
                </div>
                <Link
                  href={`/paket/${pkg.slug}`}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl transition-colors shrink-0"
                >
                  Detail Paket &rarr;
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
