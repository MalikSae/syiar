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
            <span className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0">
              {tenant.name.charAt(0)}
            </span>
            <span className="font-bold text-sm sm:text-lg text-slate-900 truncate max-w-[130px] sm:max-w-xs">
              {tenant.name}
            </span>
          </div>

          <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0">
            <Link
              href="/login"
              className="text-xs sm:text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors px-1.5 sm:px-2 py-1"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold rounded-lg text-white bg-brand-600 hover:bg-brand-500 shadow-sm transition-colors"
            >
              Daftar Agen
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-20 flex flex-col items-center text-center w-full">
        {/* Badge Program */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-600 border border-brand-500/20 mb-6 max-w-full truncate">
          <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse shrink-0"></span>
          <span className="truncate">Program Kemitraan — {tenant.name}</span>
        </div>

        {/* Headline */}
        <h1 className="text-2xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-snug sm:leading-tight max-w-3xl">
          Raih Berkah & Penghasilan dengan Menjadi{' '}
          <span className="text-brand-600">Mitra Agen Syiar Umroh</span>
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
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 sm:px-7 py-3 sm:py-3.5 text-sm sm:text-base font-bold rounded-xl text-white bg-brand-600 hover:bg-brand-500 shadow-md sm:shadow-lg shadow-brand-600/20 hover:shadow-brand-600/30 transition-all"
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
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-3 sm:mb-4">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.75"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-1.5 sm:mb-2">Komisi Menarik Per Jamaah</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Dapatkan bagi hasil dan komisi yang jelas untuk setiap jamaah yang mendaftar dan berangkat melalui kode referral unik Anda.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-3 sm:mb-4">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.75"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-1.5 sm:mb-2">Dashboard Pantau Real-Time</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Akses dashboard pribadi untuk memantau performa link referral, daftar jamaah, dan akumulasi poin reward secara transparan.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-3 sm:mb-4">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.75"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
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
            <span className="font-semibold text-brand-600">SyiarLink Platform</span>.
          </p>
        </div>
      </footer>
    </div>
  )
}
