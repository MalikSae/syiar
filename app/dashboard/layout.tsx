import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import DashboardShell from './dashboard-shell'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  // 1. Ambil session untuk profil UI (TIDAK redirect di layout, biarkan page guardrail yang redirect)
  const session = await getSession()

  let tenantName = ''
  let travelUserName = ''
  let travelUserEmail = ''

  if (session && session.accountType === 'travel_user') {
    if (session.tenantId) {
      const tenant = await prisma.tenant.findUnique({
        where: { id: session.tenantId },
        select: { name: true },
      })
      if (tenant) {
        tenantName = tenant.name
      }
    }

    if (session.accountId) {
      const travelUser = await prisma.travelUser.findUnique({
        where: { id: session.accountId },
        select: { name: true, email: true },
      })
      if (travelUser) {
        travelUserName = travelUser.name
        travelUserEmail = travelUser.email
      }
    }
  }

  return (
    <DashboardShell
      tenantName={tenantName}
      travelUserName={travelUserName}
      travelUserEmail={travelUserEmail}
    >
      {children}
    </DashboardShell>
  )
}
