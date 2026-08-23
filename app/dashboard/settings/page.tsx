import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import SettingsForm from './settings-form'

export default async function TravelSettingsPage() {
  // 1. Guardrail sesi TravelUser eksplisit
  const session = await getSession()
  if (!session || session.accountType !== 'travel_user' || !session.tenantId) {
    redirect('/login')
  }

  // 2. Query Tenant langsung ke prisma.tenant (Tenant adalah entitas root travel, bukan model child tenant-scoped)
  const tenant = await prisma.tenant.findUnique({
    where: { id: session.tenantId },
  })

  if (!tenant) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans p-6 sm:p-12">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header Navigation */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-2 mb-2">
            <Link
              href="/dashboard"
              className="text-xs font-semibold text-brand-600 hover:text-brand-500 transition-colors inline-flex items-center space-x-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Dashboard Travel</span>
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-medium text-slate-500">Pengaturan</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Pengaturan Profil Travel</h1>
          <p className="text-sm text-slate-500 mt-1">
            Kelola informasi publik, kontak resmi, dan nomor rekening biro travel Anda.
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
          <SettingsForm
            initialData={{
              name: tenant.name,
              slug: tenant.slug,
              phone: tenant.phone || '',
              bankAccount: tenant.bankAccount || '',
            }}
          />
        </div>
      </div>
    </div>
  )
}
