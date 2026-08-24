import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { WebsiteForm } from './website-form'
import { FeatureItem, FaqItem, TestimonialItem } from './actions'
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
      secondaryColor: true,
      backgroundColor: true,
      darkColor: true,
      iconUrl: true,
      logoUrl: true,
      heroHeadline: true,
      heroSubheadline: true,
      heroBackgroundUrl: true,
      features: true,
      faqs: true,
      testimonials: true,
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
          Website & Identitas Visual
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Atur nama domain kustom, favicon & logo, warna aksen, banner hero, poin keunggulan, FAQ, dan testimoni microsite Anda.
        </p>
      </div>

      {/* Form Pengaturan Website */}
      <WebsiteForm
        initialData={{
          customDomain: tenant.customDomain || '',
          primaryColor: tenant.primaryColor || '',
          secondaryColor: tenant.secondaryColor || '',
          backgroundColor: tenant.backgroundColor || '',
          darkColor: tenant.darkColor || '',
          iconUrl: tenant.iconUrl || '',
          logoUrl: tenant.logoUrl || '',
          heroHeadline: tenant.heroHeadline || '',
          heroSubheadline: tenant.heroSubheadline || '',
          heroBackgroundUrl: tenant.heroBackgroundUrl || '',
          features: Array.isArray(tenant.features) ? (tenant.features as unknown as FeatureItem[]) : [],
          faqs: Array.isArray(tenant.faqs) ? (tenant.faqs as unknown as FaqItem[]) : [],
          testimonials: Array.isArray(tenant.testimonials) ? (tenant.testimonials as unknown as TestimonialItem[]) : [],
        }}
      />
    </div>
  )
}
