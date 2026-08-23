import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { CreditCard, Construction } from 'lucide-react'

export default async function PembayaranSettingsPage() {
  const session = await getSession()
  if (!session || session.accountType !== 'travel_user' || !session.tenantId) {
    redirect('/login')
  }

  return (
    <div className="space-y-6">
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

      <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center shadow-xs max-w-2xl mx-auto space-y-4 my-8">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center shadow-xs">
          <Construction className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Halaman ini sedang dikembangkan
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            Fitur pengelolaan rekening bank terstruktur dan syarat ketentuan pembayaran akan tersedia segera.
          </p>
        </div>
      </div>
    </div>
  )
}
