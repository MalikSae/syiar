import { redirect } from 'next/navigation'
import { getSession, destroySession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function AdminDashboardPage() {
  // Guardrail eksplisit: getSession() null ATAU accountType !== "platform_admin" -> redirect /admin/login
  const session = await getSession()
  if (!session || session.accountType !== 'platform_admin') {
    redirect('/admin/login')
  }

  // Cari data PlatformAdmin
  const admin = await prisma.platformAdmin.findUnique({
    where: { id: session.accountId },
  })

  if (!admin) {
    redirect('/admin/login')
  }

  // Query lintas tenant: ambil SEMUA Tenant di platform
  const tenants = await prisma.tenant.findMany({
    orderBy: { createdAt: 'desc' },
  })

  async function handleLogout() {
    'use server'
    await destroySession()
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen bg-slate-900 font-sans p-6 sm:p-12 text-slate-100">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-2">
              Superadmin Control Center
            </span>
            <h1 className="text-2xl font-bold text-white">Dashboard Platform Admin</h1>
            <p className="text-sm text-slate-400 mt-1">
              Platform Admin: <span className="font-mono text-indigo-300 font-semibold">{admin.email}</span>
            </p>
          </div>
          <form action={handleLogout}>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-slate-600 shadow-sm text-sm font-medium rounded-lg text-slate-200 bg-slate-700/80 hover:bg-red-900/60 hover:text-red-200 hover:border-red-500/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
            >
              Logout Admin
            </button>
          </form>
        </div>

        {/* Tenant Overview Card */}
        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-white">
              Daftar Semua Tenant Terdaftar ({tenants.length})
            </h2>
            <span className="text-xs text-slate-400">Lintas Seluruh Platform</span>
          </div>

          {tenants.length === 0 ? (
            <p className="text-sm text-slate-500 py-6 text-center">Belum ada tenant yang terdaftar.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-700">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Nama Travel
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Slug Subdomain
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Tanggal Dibuat
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/60 text-sm">
                  {tenants.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-750/50 transition-colors">
                      <td className="px-4 py-3.5 whitespace-nowrap font-medium text-white">
                        {t.name}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap font-mono text-indigo-300">
                        {t.slug}.syiar.link
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-950 text-emerald-300 border border-emerald-800">
                          {t.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-slate-400 text-xs font-mono">
                        {t.createdAt.toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
