import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import AgentLoginForm from './agent-login-form'

interface AgentLoginPageProps {
  params: Promise<{ slug: string }>
}

export default async function AgentLoginPage({ params }: AgentLoginPageProps) {
  const { slug } = await params

  // 1. Resolve Tenant dari params.slug — 404 jika tidak ditemukan atau status bukan "active"
  const tenant = await prisma.tenant.findUnique({
    where: { slug },
  })

  if (!tenant || tenant.status !== 'active') {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-600/10 via-slate-50 to-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-inter">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-brand-600/10 text-brand-600 border border-brand-600/30 mb-3">
          Portal Agen Resmi
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          {tenant.name}
        </h1>
        <h2 className="mt-1 text-lg font-medium text-slate-600">
          Login Akun Agen
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Masuk untuk melihat data jamaah, komisi, dan poin reward Anda.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <AgentLoginForm tenantSlug={tenant.slug} />
      </div>
    </div>
  )
}
