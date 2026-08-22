import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import AgentRegisterForm from './agent-register-form'

interface AgentRegisterPageProps {
  params: Promise<{ slug: string }>
}

export default async function AgentRegisterPage({ params }: AgentRegisterPageProps) {
  const { slug } = await params

  // 1. Resolve Tenant dari params.slug — 404 jika tidak ketemu atau status bukan "active"
  const tenant = await prisma.tenant.findUnique({
    where: { slug },
  })

  if (!tenant || tenant.status !== 'active') {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/50 via-slate-50 to-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 mb-3">
          Portal Agen Resmi
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          {tenant.name}
        </h1>
        <h2 className="mt-1 text-lg font-medium text-slate-600">
          Pendaftaran Agen & Mitra Umroh
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Daftar dan dapatkan komisi serta poin reward dari setiap jamaah yang Anda referensikan.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <AgentRegisterForm tenantSlug={tenant.slug} tenantName={tenant.name} />
      </div>
    </div>
  )
}
