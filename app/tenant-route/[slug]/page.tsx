import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'

interface TenantPageProps {
  params: Promise<{ slug: string }>
}

export default async function TenantRecruitmentPage({ params }: TenantPageProps) {
  const { slug } = await params

  // 1. Resolve Tenant dari slug database
  const tenant = await prisma.tenant.findUnique({
    where: { slug },
  })

  // 2. Return 404 jika tenant tidak ditemukan atau tidak aktif
  if (!tenant || tenant.status !== 'active') {
    notFound()
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col justify-between overflow-x-hidden w-full">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-10 w-full">
        <div className="max-w-5xl mx-auto px-3.5 sm:px-6 h-16 flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2 min-w-0">
            <span className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0">
              {tenant.name.charAt(0)}
            </span>
            <span className="font-bold text-sm sm:text-lg text-slate-900 truncate max-w-[130px] sm:max-w-xs">
              {tenant.name}
            </span>
          </div>

          <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0">
            <Link
              href="/login"
              className="text-xs sm:text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors px-1.5 sm:px-2 py-1"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-colors"
            >
              Daftar Agen
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-20 flex flex-col items-center text-center w-full">
        {/* Badge Program */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-6 max-w-full truncate">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
          <span className="truncate">Program Kemitraan — {tenant.name}</span>
        </div>

        {/* Headline */}
        <h1 className="text-2xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-snug sm:leading-tight max-w-3xl">
          Raih Berkah & Penghasilan dengan Menjadi{' '}
          <span className="text-emerald-600">Mitra Agen Syiar Umroh</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-4 sm:mt-6 text-sm sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
          Bantu keluarga, sahabat, dan masyarakat mewujudkan ibadah ke Tanah Suci bersama{' '}
          <span className="font-semibold text-slate-800">{tenant.name}</span>. Nikmati kemudahan syiar dengan sistem digital yang transparan.
        </p>

        {/* CTA Area */}
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto">
          <Link
            href="/register"
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 sm:px-7 py-3 sm:py-3.5 text-sm sm:text-base font-bold rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 shadow-md sm:shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 transition-all"
          >
            Daftar Jadi Agen Sekarang &rarr;
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center px-5 sm:px-6 py-3 sm:py-3.5 text-xs sm:text-sm font-medium rounded-xl text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 shadow-sm transition-colors"
          >
            Sudah jadi agen? Login di sini
          </Link>
        </div>

        {/* Value Proposition Cards */}
        <div className="mt-12 sm:mt-20 grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 text-left w-full">
          {/* Card 1 */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg mb-3 sm:mb-4">
              💰
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-1.5 sm:mb-2">Komisi Menarik Per Jamaah</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Dapatkan bagi hasil dan komisi yang jelas untuk setiap jamaah yang mendaftar dan berangkat melalui kode referral unik Anda.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg mb-3 sm:mb-4">
              📊
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-1.5 sm:mb-2">Dashboard Pantau Real-Time</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Akses dashboard pribadi untuk memantau performa link referral, daftar jamaah, dan akumulasi poin reward secara transparan.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg mb-3 sm:mb-4">
              🤝
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-1.5 sm:mb-2">Dukungan Travel Resmi</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Paket umroh dan bimbingan jamaah ditangani langsung secara profesional oleh biro travel berizin resmi {tenant.name}.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500 w-full">
        <div className="max-w-5xl mx-auto px-4">
          <p>
            &copy; {new Date().getFullYear()}{' '}
            <span className="font-semibold text-slate-700">{tenant.name}</span>. Didukung oleh{' '}
            <span className="font-semibold text-emerald-700">SyiarLink Platform</span>.
          </p>
        </div>
      </footer>
    </div>
  )
}
