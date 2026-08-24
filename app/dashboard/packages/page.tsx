import { getSession } from '@/lib/auth'
import { getTenantScopedClient } from '@/prisma/extensions/tenant-scope'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  Plus,
  Package,
  Plane,
  Building2,
  Calendar,
  CheckCircle2,
  CircleOff,
  Clock,
} from 'lucide-react'
import PackageToggleButton from './package-toggle-button'

export default async function PackagesPage() {
  // 1. Guardrail Sesi Eksplisit
  const session = await getSession()
  if (!session || session.accountType !== 'travel_user' || !session.tenantId) {
    redirect('/login')
  }

  // 2. Query Paket Scoped ke Tenant
  const scopedPrisma = getTenantScopedClient(session.tenantId)
  const packages = await scopedPrisma.package.findMany({
    orderBy: { createdAt: 'desc' },
  })

  // 3. Query Jumlah Tanggal Keberangkatan Aktif per Paket
  const departures = await scopedPrisma.packageDeparture.findMany({
    where: {
      packageId: { in: packages.map((p) => p.id) },
      isActive: true,
    },
    select: { packageId: true },
  })

  const activeDepartureCountMap = departures.reduce<Record<string, number>>((acc, d) => {
    acc[d.packageId] = (acc[d.packageId] || 0) + 1
    return acc
  }, {})

  return (
    <div className="space-y-6">
      {/* Header & Tombol Tambah */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Paket Umroh</h1>
          <p className="text-xs text-slate-500 mt-1">
            Kelola katalog paket umroh, skema komisi agen, dan jadwal keberangkatan.
          </p>
        </div>
        <Link
          href="/dashboard/packages/new"
          className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Paket</span>
        </Link>
      </div>

      {/* Tabel Daftar Paket */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {packages.length === 0 ? (
          <div className="py-16 text-center p-6">
            <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Belum ada paket umroh</h3>
            <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
              Mulai buat katalog paket umroh Anda agar agen dapat membagikan link referral ke calon jamaah.
            </p>
            <div className="mt-6">
              <Link
                href="/dashboard/packages/new"
                className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Buat Paket Pertama</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50/80">
                <tr>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-16">
                    Foto
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Nama Paket & Detail
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Durasi
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Pilihan Harga
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Komisi Agen
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Jadwal Aktif
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3.5 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {packages.map((pkg) => {
                  const activeDepCount = activeDepartureCountMap[pkg.id] || 0
                  const isDraft = pkg.status === 'draft'
                  const isActive = pkg.status === 'active'

                  // Format harga (skip yang null)
                  const priceLabels: string[] = []
                  if (pkg.priceQuad) {
                    priceLabels.push(`Quad Rp ${pkg.priceQuad.toLocaleString('id-ID')}`)
                  }
                  if (pkg.priceTriple) {
                    priceLabels.push(`Triple Rp ${pkg.priceTriple.toLocaleString('id-ID')}`)
                  }
                  if (pkg.priceDouble) {
                    priceLabels.push(`Double Rp ${pkg.priceDouble.toLocaleString('id-ID')}`)
                  }

                  return (
                    <tr key={pkg.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Thumbnail Foto */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        {pkg.featuredImageUrl ? (
                          <img
                            src={pkg.featuredImageUrl}
                            alt={pkg.name}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-xs"
                          />
                        ) : (
                          <img
                            src="/syiarlink-placeholder.png"
                            alt={pkg.name}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-xs bg-slate-50"
                          />
                        )}
                      </td>

                      {/* Nama & Detail */}
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{pkg.name}</div>
                        <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1">
                          <span className="inline-flex items-center text-slate-600">
                            <Plane className="w-3.5 h-3.5 mr-1 text-slate-400" />
                            {pkg.airline}
                          </span>
                          <span className="text-slate-300">·</span>
                          <span className="inline-flex items-center text-slate-600">
                            <Building2 className="w-3.5 h-3.5 mr-1 text-slate-400" />
                            Makkah: {pkg.hotelMakkah}
                          </span>
                          <span className="text-slate-300">·</span>
                          <span className="inline-flex items-center text-slate-600">
                            Madinah: {pkg.hotelMadinah}
                          </span>
                        </div>
                      </td>

                      {/* Durasi */}
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-slate-700">
                        {pkg.duration}
                      </td>

                      {/* Pilihan Harga */}
                      <td className="px-6 py-4 text-xs font-mono text-slate-800">
                        <div className="space-y-0.5">
                          {priceLabels.map((label, idx) => (
                            <div key={idx} className="whitespace-nowrap">
                              {label}
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* Komisi */}
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-brand-600 font-mono">
                        Rp {pkg.commissionAmount.toLocaleString('id-ID')}
                        <span className="text-[10px] text-slate-400 font-normal block font-sans">
                          per jamaah
                        </span>
                      </td>

                      {/* Keberangkatan */}
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-700">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                          <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                          <span>{activeDepCount} Tanggal</span>
                        </span>
                      </td>

                      {/* Status (3 kemungkinan nilai: draft, active, inactive) */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isDraft ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>Draft</span>
                          </span>
                        ) : isActive ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Aktif</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                            <CircleOff className="w-3 h-3 text-slate-400" />
                            <span>Nonaktif</span>
                          </span>
                        )}
                      </td>

                      {/* Aksi */}
                      <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                        <Link
                          href={`/dashboard/packages/${pkg.id}`}
                          className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-xs transition-colors"
                        >
                          Edit & Jadwal
                        </Link>
                        <PackageToggleButton packageId={pkg.id} status={pkg.status} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
