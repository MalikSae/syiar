import { Fraunces } from 'next/font/google'
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { getSitePalette } from '@/lib/color-utils'

const fraunces = Fraunces({
  variable: '--font-fraunces',
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
    select: { primaryColor: true },
  })

  const palette = getSitePalette(tenant?.primaryColor)

  return (
    <div
      className={`${fraunces.variable} font-sans bg-site-bg text-site-text min-h-screen flex flex-col`}
      style={
        {
          '--site-accent': palette.accent,
          '--site-accent-soft': palette.accentSoft,
          '--site-bg': palette.bg,
          '--site-dark': palette.dark,
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
