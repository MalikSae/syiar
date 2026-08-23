import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'

interface TenantHomePageProps {
  params: Promise<{ slug: string }>
}

export default async function TenantHomePage({ params }: TenantHomePageProps) {
  const { slug } = await params

  // Resolve Tenant dari subdomain
  const tenant = await prisma.tenant.findUnique({
    where: { slug },
  })

  if (!tenant || tenant.status !== 'active') {
    notFound()
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">{tenant.name}</h1>
        <p className="text-sm text-slate-600">
          Microsite {tenant.name} — konten lengkap menyusul
        </p>
        <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/paket"
            className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl transition-colors"
          >
            Lihat Paket Umroh
          </Link>
          <Link
            href="/gabung-agen"
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
          >
            Gabung Jadi Agen
          </Link>
        </div>
      </div>
    </div>
  )
}
