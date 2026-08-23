import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import PackageForm from '../package-form'

export default async function NewPackagePage() {
  const session = await getSession()
  if (!session || session.accountType !== 'travel_user' || !session.tenantId) {
    redirect('/login')
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header & Navigasi */}
      <div>
        <Link
          href="/dashboard/packages"
          className="text-xs font-semibold text-brand-600 hover:text-brand-500 transition-colors inline-flex items-center space-x-1.5 mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Daftar Paket</span>
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Tambah Paket Umroh Baru</h1>
        <p className="text-xs text-slate-500 mt-1">
          Isi rincian fasilitas, penetapan harga kamar, dan komisi agen mitra.
        </p>
      </div>

      {/* Form Tambah Paket */}
      <PackageForm isEdit={false} />
    </div>
  )
}
