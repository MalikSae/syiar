import Link from 'next/link'
import { Sparkles, ShieldCheck, Heart } from 'lucide-react'

interface TenantFooterProps {
  tenantName: string
}

export function TenantFooter({ tenantName }: TenantFooterProps) {
  return (
    <footer className="bg-site-dark text-white border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          {/* Brand Col */}
          <div className="md:col-span-6 lg:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-brand-500 text-white flex items-center justify-center shadow-md shadow-brand-500/20">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-serif text-lg font-bold text-white tracking-tight">
                {tenantName}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-white/75 leading-relaxed max-w-sm">
              Penyelenggara perjalanan ibadah umroh resmi dan terpercaya. Memberikan pelayanan terbaik, bimbingan sesuai sunnah, dan kenyamanan jamaah.
            </p>
            <div className="flex items-center gap-2 text-xs text-white/80 pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Sistem Manajemen Resmi & Transparan</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 lg:col-span-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white/90">
              Navigasi Cepat
            </h4>
            <ul className="space-y-2 text-xs text-white/70">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Beranda
                </Link>
              </li>
              <li>
                <Link href="/paket" className="hover:text-white transition-colors">
                  Daftar Paket Umroh
                </Link>
              </li>
              <li>
                <Link href="/gabung-agen" className="hover:text-white transition-colors">
                  Pendaftaran Mitra Agen
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Portal Login Agen
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform Info */}
          <div className="md:col-span-3 lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white/90">
              Keagenan & Kemitraan
            </h4>
            <p className="text-xs text-white/70 leading-relaxed">
              Bergabunglah menjadi mitra syiar baitullah dan raih berkah serta komisi transparan bersama kami.
            </p>
            <div className="pt-2">
              <Link
                href="/gabung-agen"
                className="inline-flex items-center justify-center px-4 py-2 text-xs font-bold text-site-dark bg-white hover:bg-stone-100 rounded-lg transition-colors shadow-xs"
              >
                Gabung Jadi Agen &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/60">
          <p>
            &copy; {new Date().getFullYear()} {tenantName}. Powered by{' '}
            <strong className="text-white font-bold">SyiarLink</strong>.
          </p>
          <div className="flex items-center gap-1">
            <span>Dikelola dengan penuh amanah</span>
            <Heart className="w-3.5 h-3.5 text-brand-500 fill-brand-500" />
          </div>
        </div>
      </div>
    </footer>
  )
}
