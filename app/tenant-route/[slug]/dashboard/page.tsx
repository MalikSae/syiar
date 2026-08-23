import { notFound, redirect } from 'next/navigation'
import { getSession, destroySession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getTenantScopedClient } from '@/prisma/extensions/tenant-scope'

interface AgentDashboardPageProps {
  params: Promise<{ slug: string }>
}

export default async function AgentDashboardPage({ params }: AgentDashboardPageProps) {
  const { slug } = await params

  // 1. Resolve Tenant dari slug
  const tenant = await prisma.tenant.findUnique({
    where: { slug },
  })

  if (!tenant || tenant.status !== 'active') {
    notFound()
  }

  // 2. Guardrail EKSPLISIT di awal: dua kondisi harus dicek DUA-DUANYA:
  // Kondisi A: session null ATAU accountType !== "agent" -> redirect ke login agent
  const session = await getSession()
  if (!session || session.accountType !== 'agent') {
    redirect('/login')
  }

  // Kondisi B: session.tenantId !== tenant.id saat ini -> redirect ke login agent
  // (Mencegah session agent Travel A dipakai membuka dashboard Travel B)
  if (session.tenantId !== tenant.id) {
    redirect('/login')
  }

  // 3. Query Agent by accountId via scoped client (findFirst)
  const tenantPrisma = getTenantScopedClient(tenant.id)
  const agent = await tenantPrisma.agent.findFirst({
    where: { id: session.accountId },
  })

  if (!agent || agent.status !== 'approved') {
    redirect('/login')
  }

  // Server Action untuk Logout Agent
  async function logoutAgentAction() {
    'use server'
    await destroySession()
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans p-6 sm:p-12">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-100">
          <div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-600 border border-brand-500/20 mb-2">
              Mitra Agen — {tenant.name}
            </span>
            <h1 className="text-2xl font-bold text-slate-900">Dashboard Agen</h1>
          </div>
          <form action={logoutAgentAction}>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 hover:text-red-600 hover:border-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
            >
              Logout
            </button>
          </form>
        </div>

        <div className="mt-6 bg-brand-50/70 rounded-xl p-5 border border-brand-500/30">
          <p className="text-lg font-medium text-slate-800">
            Selamat datang, <span className="text-brand-600 font-semibold">{agent.name}</span> — kode referral kamu:{' '}
            <span className="font-mono bg-white px-2 py-0.5 rounded border border-brand-500/40 text-brand-600 font-bold">
              {agent.referralCode}
            </span>
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="p-4 bg-slate-50/50 rounded-lg border border-slate-100">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1">
              Nomor WhatsApp / HP
            </span>
            <span className="font-mono text-slate-900">{agent.phone}</span>
          </div>
          <div className="p-4 bg-slate-50/50 rounded-lg border border-slate-100">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1">
              Email
            </span>
            <span className="text-slate-900">{agent.email || '-'}</span>
          </div>
          <div className="p-4 bg-slate-50/50 rounded-lg border border-slate-100">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1">
              Poin Reward
            </span>
            <span className="font-semibold text-brand-600 text-base">{agent.pointsBalance} Poin</span>
          </div>
          <div className="p-4 bg-slate-50/50 rounded-lg border border-slate-100">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1">
              Status Akun
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800 capitalize">
              {agent.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
