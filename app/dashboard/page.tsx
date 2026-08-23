import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getTenantScopedClient } from '@/prisma/extensions/tenant-scope'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardPage() {
  // 1. Guardrail eksplisit: jika session null atau bukan travel_user -> redirect('/login')
  const session = await getSession()
  if (!session || session.accountType !== 'travel_user' || !session.tenantId) {
    redirect('/login')
  }

  // 2. Query TravelUser dan Tenant sesuai session
  const travelUser = await prisma.travelUser.findUnique({
    where: { id: session.accountId },
  })

  const tenant = await prisma.tenant.findUnique({
    where: { id: session.tenantId },
  })

  if (!travelUser || !tenant) {
    redirect('/login')
  }

  // 3. Query Scoped Agent Metrics WAJIB via getTenantScopedClient
  const tenantPrisma = getTenantScopedClient(session.tenantId)

  const [totalAgentsCount, pendingAgentsCount, approvedAgentsCount, recentAgents, allRecentForChart] =
    await Promise.all([
      tenantPrisma.agent.count(),
      tenantPrisma.agent.count({ where: { status: 'pending' } }),
      tenantPrisma.agent.count({ where: { status: 'approved' } }),
      tenantPrisma.agent.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      // Query pendaftaran 7 hari terakhir
      tenantPrisma.agent.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
        select: { createdAt: true },
      }),
    ])

  // 4. Kalkulasi Data Chart 7 Hari Terakhir (JS/TS)
  const now = new Date()
  const daysOfWeek = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
  const chartDays: { dateStr: string; dayLabel: string; dateDisplay: string; count: number }[] = []

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(now.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    const dayLabel = daysOfWeek[d.getDay()]
    const dateDisplay = `${d.getDate()}/${d.getMonth() + 1}`

    const count = allRecentForChart.filter((a) => {
      const aDateStr = new Date(a.createdAt).toISOString().split('T')[0]
      return aDateStr === dateStr
    }).length

    chartDays.push({
      dateStr,
      dayLabel,
      dateDisplay,
      count,
    })
  }

  const maxDailyCount = Math.max(...chartDays.map((d) => d.count), 0)
  const total7DaysCount = chartDays.reduce((acc, d) => acc + d.count, 0)

  return (
    <div className="space-y-6">
      {/* Header & Strip Info */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Dashboard Travel — {tenant.name}
            </h1>
            <div className="flex flex-wrap items-center gap-x-2 text-xs text-slate-500 mt-1">
              <span>{travelUser.email}</span>
              <span>·</span>
              <span className="capitalize">{travelUser.role}</span>
              <span>·</span>
              <span className="font-mono text-slate-700">{tenant.slug}.syiar.link</span>
              <span>·</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 capitalize">
                {tenant.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Agen */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Agen</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-2">{totalAgentsCount}</p>
            <p className="text-xs text-slate-400 mt-1">Semua mitra terdaftar</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.75"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
        </div>

        {/* Menunggu Persetujuan */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Menunggu Persetujuan</p>
            <p className="text-3xl font-extrabold text-amber-600 mt-2">{pendingAgentsCount}</p>
            <p className="text-xs text-slate-400 mt-1">Perlu diverifikasi travel</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.75"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        {/* Agen Aktif */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Agen Aktif</p>
            <p className="text-3xl font-extrabold text-emerald-600 mt-2">{approvedAgentsCount}</p>
            <p className="text-xs text-slate-400 mt-1">Siap syiar & referral</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.75"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Chart Batang 7 Hari Terakhir */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Pendaftaran Agen — 7 Hari Terakhir</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Aktivitas pendaftaran mitra baru dalam 1 minggu terakhir
          </p>
        </div>

        {total7DaysCount === 0 ? (
          <div className="h-44 flex flex-col items-center justify-center text-center p-6 bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
            <svg className="w-9 h-9 text-slate-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-sm font-semibold text-slate-700">Belum ada pendaftaran agen minggu ini</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Pendaftaran agen baru dalam 7 hari terakhir akan divisualisasikan di sini.
            </p>
          </div>
        ) : (
          <div className="bg-slate-50/50 rounded-xl border border-slate-100 p-4 sm:p-6">
            <div className="flex items-end justify-between gap-2 sm:gap-6 h-40 pt-6 pb-2">
              {chartDays.map((day) => {
                const heightPercent =
                  maxDailyCount > 0 && day.count > 0
                    ? Math.max(Math.round((day.count / maxDailyCount) * 100), 15)
                    : 0

                return (
                  <div key={day.dateStr} className="flex-1 flex flex-col items-center h-full justify-end">
                    <span className="text-[11px] font-bold text-slate-700 mb-1">
                      {day.count > 0 ? day.count : ''}
                    </span>
                    <div className="w-full max-w-[40px] flex items-end justify-center h-28 bg-slate-100/80 rounded-t-lg overflow-hidden">
                      {day.count > 0 ? (
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className="w-full bg-brand-600 hover:bg-brand-500 transition-all rounded-t-lg"
                          title={`${day.count} agen terdaftar pada ${day.dateDisplay}`}
                        />
                      ) : (
                        <div className="w-full h-1 bg-slate-200 rounded-t" />
                      )}
                    </div>
                    <div className="text-center mt-2">
                      <p className="text-xs font-semibold text-slate-700">{day.dayLabel}</p>
                      <p className="text-[10px] text-slate-400">{day.dateDisplay}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Tabel Preview Agen Terbaru */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Agen Terbaru</h2>
            <p className="text-xs text-slate-500 mt-0.5">5 pendaftaran agen paling baru</p>
          </div>
          <Link
            href="/dashboard/agents"
            className="text-xs font-semibold text-brand-600 hover:text-brand-500 transition-colors"
          >
            Lihat semua &rarr;
          </Link>
        </div>

        {recentAgents.length === 0 ? (
          <div className="py-12 text-center p-6">
            <svg
              className="mx-auto h-12 w-12 text-slate-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-semibold text-slate-900">Belum ada agen terdaftar</h3>
            <p className="mt-1 text-sm text-slate-500">
              Bagikan link pendaftaran ke calon agen kamu.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50/80">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Nama Agen
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Nomor HP / WA
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Kode Referral
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Tanggal Daftar
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {recentAgents.map((agent) => {
                  const isPending = agent.status === 'pending'
                  const isApproved = agent.status === 'approved'

                  return (
                    <tr key={agent.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-900">{agent.name}</div>
                        {agent.email && <div className="text-xs text-slate-500">{agent.email}</div>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-slate-700 text-xs">
                        {agent.phone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-mono font-bold text-xs text-slate-800">
                        <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {agent.referralCode}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isPending && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                            Pending
                          </span>
                        )}
                        {isApproved && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Approved
                          </span>
                        )}
                        {!isPending && !isApproved && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                            {agent.status}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 font-mono">
                        {new Date(agent.createdAt).toLocaleString('id-ID', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
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
