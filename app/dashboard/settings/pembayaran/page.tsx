import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { PembayaranForm } from './pembayaran-form'
import { CreditCard } from 'lucide-react'

export default async function PembayaranSettingsPage() {
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
      bankName: true,
      bankAccountNumber: true,
      bankAccountHolder: true,
      termsAndConditions: true,
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
            <CreditCard className="w-4 h-4" />
            <span>Pengaturan Pembayaran</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Rekening Bank & Ketentuan Pembayaran
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Kelola rekening bank tujuan transfer jamaah dan syarat ketentuan pembayaran.
          </p>
        </div>
      </div>

      {/* Form Pengaturan Pembayaran */}
      <PembayaranForm
        initialData={{
          bankName: tenant.bankName || '',
          bankAccountNumber: tenant.bankAccountNumber || '',
          bankAccountHolder: tenant.bankAccountHolder || '',
          termsAndConditions: tenant.termsAndConditions || '',
        }}
      />
    </div>
  )
}
