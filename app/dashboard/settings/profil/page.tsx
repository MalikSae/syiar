import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { ProfilForm } from './profil-form'
import { Building2 } from 'lucide-react'

export default async function ProfilSettingsPage() {
  // 1. Guardrail Sesi: pastikan user adalah TravelUser yang valid
  const session = await getSession()
  if (!session || session.accountType !== 'travel_user' || !session.tenantId) {
    redirect('/login')
  }

  // 2. Query data Tenant milik session yang login
  const tenant = await prisma.tenant.findUnique({
    where: {
      id: session.tenantId,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      tagline: true,
      about: true,
      legalitas: true,
      alamat: true,
      phone: true,
    },
  })

  if (!tenant) {
    redirect('/login')
  }

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-600 mb-1">
            <Building2 className="w-4 h-4" />
            <span>Pengaturan Travel</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Profil & Identitas Travel
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Kelola nama brand, kontak resmi, legalitas izin, dan alamat kantor operasional.
          </p>
        </div>
      </div>

      {/* Form Profil */}
      <ProfilForm
        initialData={{
          name: tenant.name || '',
          slug: tenant.slug || '',
          tagline: tenant.tagline || '',
          about: tenant.about || '',
          legalitas: tenant.legalitas || '',
          alamat: tenant.alamat || '',
          phone: tenant.phone || '',
        }}
      />
    </div>
  )
}
