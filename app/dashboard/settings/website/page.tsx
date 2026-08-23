import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { WebsiteForm } from './website-form'
import { Globe } from 'lucide-react'

export default async function WebsiteSettingsPage() {
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
      customDomain: true,
      primaryColor: true,
      iconUrl: true,
      logoUrl: true,
      heroHeadline: true,
      heroSubheadline: true,
      heroBackgroundUrl: true,
    },
  })

  if (!tenant) {
    redirect('/login')
  }

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-600 mb-1">
          <Globe className="w-4 h-4" />
          <span>Pengaturan Website</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Domain Kustom, Identitas Visual & Hero Banner
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Atur nama domain kustom, favicon & logo, warna aksen, serta headline dan gambar banner pembuka microsite Anda.
        </p>
      </div>

      {/* Form Pengaturan Website */}
      <WebsiteForm
        initialData={{
          customDomain: tenant.customDomain || '',
          primaryColor: tenant.primaryColor || '',
          iconUrl: tenant.iconUrl || '',
          logoUrl: tenant.logoUrl || '',
          heroHeadline: tenant.heroHeadline || '',
          heroSubheadline: tenant.heroSubheadline || '',
          heroBackgroundUrl: tenant.heroBackgroundUrl || '',
        }}
      />
    </div>
  )
}
