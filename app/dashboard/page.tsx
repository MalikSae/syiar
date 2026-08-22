import { getSession, destroySession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  // Guardrail eksplisit: jika session null atau bukan travel_user -> redirect('/login')
  const session = await getSession()
  if (!session || session.accountType !== 'travel_user') {
    redirect('/login')
  }

  // Query TravelUser dan Tenant sesuai session
  const travelUser = await prisma.travelUser.findUnique({
    where: { id: session.accountId },
  })

  const tenant = session.tenantId
    ? await prisma.tenant.findUnique({
        where: { id: session.tenantId },
      })
    : null

  if (!travelUser || !tenant) {
    redirect('/login')
  }

  // Server Action untuk Logout
  async function logoutAction() {
    'use server'
    await destroySession()
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans p-6 sm:p-12">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-100">
          <div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 mb-2">
              Tenant Dashboard
            </span>
            <h1 className="text-2xl font-bold text-slate-900">Dashboard Travel</h1>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 hover:text-red-600 hover:border-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
            >
              Logout
            </button>
          </form>
        </div>

        <div className="mt-6 bg-slate-50 rounded-xl p-5 border border-slate-200/60">
          <p className="text-lg font-medium text-slate-800">
            Selamat datang, <span className="text-emerald-700 font-semibold">{travelUser.name}</span> — Travel: <span className="text-slate-900 font-semibold">{tenant.name}</span>
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="p-4 bg-slate-50/50 rounded-lg border border-slate-100">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1">
              Email Akun
            </span>
            <span className="font-mono text-slate-900">{travelUser.email}</span>
          </div>
          <div className="p-4 bg-slate-50/50 rounded-lg border border-slate-100">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1">
              Subdomain / Slug
            </span>
            <span className="font-mono text-slate-900">{tenant.slug}</span>
          </div>
          <div className="p-4 bg-slate-50/50 rounded-lg border border-slate-100">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1">
              Role
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-200 text-slate-800 capitalize">
              {travelUser.role}
            </span>
          </div>
          <div className="p-4 bg-slate-50/50 rounded-lg border border-slate-100">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1">
              Status Tenant
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800 capitalize">
              {tenant.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
