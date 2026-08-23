import { getSession } from '@/lib/auth'
import { getTenantScopedClient } from '@/prisma/extensions/tenant-scope'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, CircleOff } from 'lucide-react'
import PackageForm from '../package-form'

interface PackageDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function PackageDetailPage({ params }: PackageDetailPageProps) {
  // 1. Guardrail Sesi Eksplisit
  const session = await getSession()
  if (!session || session.accountType !== 'travel_user' || !session.tenantId) {
    redirect('/login')
  }

  const { id } = await params

  // 2. Query Paket Scoped ke Tenant (Wajib via getTenantScopedClient)
  const scopedPrisma = getTenantScopedClient(session.tenantId)
  const pkg = await scopedPrisma.package.findFirst({
    where: { id },
  })

  if (!pkg) {
    notFound()
  }

  // 3. Query Tanggal Keberangkatan Paket Ini
  const departures = await scopedPrisma.packageDeparture.findMany({
    where: { packageId: id },
    orderBy: { date: 'asc' },
  })

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header & Navigasi */}
      <div>
        <Link
          href="/dashboard/packages"
          className="text-xs font-semibold text-brand-600 hover:text-brand-500 transition-colors inline-flex items-center space-x-1.5 mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Daftar Paket</span>
        </Link>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{pkg.name}</h1>
            <p className="text-xs text-slate-500 mt-1">
              Edit rincian fasilitas, penetapan harga kamar, dan kelola jadwal keberangkatan.
            </p>
          </div>
          <div>
            {pkg.status === 'active' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Paket Aktif</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                <CircleOff className="w-3.5 h-3.5 text-slate-400" />
                <span>Paket Nonaktif</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Form Edit Paket (Menyatu dengan Section 4 Jadwal Keberangkatan) */}
      <PackageForm initialData={pkg} isEdit={true} initialDepartures={departures} />
    </div>
  )
}
