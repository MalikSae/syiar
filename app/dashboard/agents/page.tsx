import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getTenantScopedClient } from '@/prisma/extensions/tenant-scope'
import AgentActionButtons from './agent-action-buttons'

export default async function AgentsManagementPage() {
  // 1. Guardrail eksplisit sesi TravelUser
  const session = await getSession()
  if (!session || session.accountType !== 'travel_user' || !session.tenantId) {
    redirect('/login')
  }

  // 2. Query Tenant untuk nama travel di header
  const tenant = await prisma.tenant.findUnique({
    where: { id: session.tenantId },
  })

  if (!tenant) {
    redirect('/login')
  }

  // 3. Query SEMUA Agent milik tenant ini WAJIB via getTenantScopedClient
  const tenantPrisma = getTenantScopedClient(session.tenantId)
  const agents = await tenantPrisma.agent.findMany({
    orderBy: { createdAt: 'desc' },
  })

  // Urutkan: status "pending" muncul paling atas, sisanya di bawah
  const sortedAgents = [...agents].sort((a, b) => {
    if (a.status === 'pending' && b.status !== 'pending') return -1
    if (a.status !== 'pending' && b.status === 'pending') return 1
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  const pendingCount = sortedAgents.filter((a) => a.status === 'pending').length

  return (
    <div className="min-h-screen bg-slate-50 font-sans p-6 sm:p-12">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header Navigation */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Link
                href="/dashboard"
                className="text-xs font-semibold text-brand-600 hover:text-brand-500 transition-colors"
              >
                &larr; Dashboard Travel
              </Link>
              <span className="text-slate-300">/</span>
              <span className="text-xs font-medium text-slate-500">Kelola Agen</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Daftar Mitra Agen Umroh</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Travel: <span className="font-semibold text-slate-800">{tenant.name}</span>
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
              {pendingCount} Menunggu Persetujuan
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
              Total {sortedAgents.length} Agen
            </span>
          </div>
        </div>

        {/* Table of Agents */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {sortedAgents.length === 0 ? (
            <div className="py-12 text-center">
              <svg
                className="mx-auto h-12 w-12 text-slate-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
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
                Pendaftaran agen baru akan muncul di halaman ini untuk diverifikasi.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
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
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100 text-sm">
                  {sortedAgents.map((agent) => {
                    const isPending = agent.status === 'pending'
                    const isApproved = agent.status === 'approved'

                    return (
                      <tr
                        key={agent.id}
                        className={isPending ? 'bg-amber-50/30 hover:bg-amber-50/50 transition-colors' : 'hover:bg-slate-50/60 transition-colors'}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-semibold text-slate-900">{agent.name}</div>
                          {agent.email && (
                            <div className="text-xs text-slate-500">{agent.email}</div>
                          )}
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
                        <td className="px-6 py-4 whitespace-nowrap">
                          {isPending ? (
                            <AgentActionButtons
                              agentId={agent.id}
                              agentName={agent.name}
                            />
                          ) : (
                            <span className="text-xs text-slate-400 font-medium">—</span>
                          )}
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
    </div>
  )
}
