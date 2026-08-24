import { Plus_Jakarta_Sans, Inter } from 'next/font/google'
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: '--font-jakarta',
  subsets: ['latin'],
  display: 'swap',
})

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
})

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const tenant = await prisma.tenant.findUnique({
    where: { slug },
    select: { name: true, iconUrl: true },
  })

  return {
    title: tenant?.name ? `${tenant.name} - Travel Umroh Resmi` : 'SyiarLink',
    icons: tenant?.iconUrl
      ? {
          icon: tenant.iconUrl,
          shortcut: tenant.iconUrl,
          apple: tenant.iconUrl,
        }
      : undefined,
  }
}

export default async function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const tenant = await prisma.tenant.findUnique({
    where: { slug },
    select: {
      primaryColor: true,
      secondaryColor: true,
      backgroundColor: true,
      darkColor: true,
    },
  })

  const siteAccent = tenant?.primaryColor ?? '#F38020'
  const siteAccentSoft = tenant?.secondaryColor ?? '#FAAE40'
  const siteBg = tenant?.backgroundColor ?? '#F7F3EC'
  const siteDark = tenant?.darkColor ?? '#133433'

  return (
    <div
      className={`${plusJakartaSans.variable} ${inter.variable} font-inter bg-site-bg text-site-text min-h-screen flex flex-col`}
      style={
        {
          fontFamily: 'var(--font-inter), sans-serif',
          '--site-accent': siteAccent,
          '--site-accent-soft': siteAccentSoft,
          '--site-bg': siteBg,
          '--site-dark': siteDark,
          '--color-brand-600': 'var(--site-accent)',
          '--color-brand-500': 'var(--site-accent-soft)',
          '--color-brand': 'var(--site-accent)',
          '--color-site-bg': 'var(--site-bg)',
          '--color-site-dark': 'var(--site-dark)',
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  )
}
