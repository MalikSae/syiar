'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Compass, UserPlus, LogIn } from 'lucide-react'

interface TenantNavbarProps {
  tenantName: string
  logoUrl?: string | null
  iconUrl?: string | null
}

export function TenantNavbar({ tenantName, logoUrl, iconUrl }: TenantNavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 bg-site-bg/90 backdrop-blur-md border-b border-stone-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo / Brand Name */}
          <Link href="/" className="flex items-center gap-2.5 group">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={tenantName}
                className="h-8 sm:h-10 w-auto max-w-[200px] object-contain"
              />
            ) : (
              <>
                <div className="w-10 h-10 rounded-lg bg-brand-500 text-white flex items-center justify-center shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform overflow-hidden">
                  {iconUrl ? (
                    <img
                      src={iconUrl}
                      alt={tenantName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="font-jakarta font-bold text-lg">
                      {tenantName.charAt(0)}
                    </span>
                  )}
                </div>
                <div>
                  <span className="font-jakarta text-base sm:text-lg font-bold text-site-text tracking-tight block leading-tight">
                    {tenantName}
                  </span>
                  <span className="text-[10px] font-semibold text-brand-600 tracking-wider uppercase block">
                    Official Travel Partner
                  </span>
                </div>
              </>
            )}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
            <Link
              href="/"
              className="px-3.5 py-2 text-xs font-semibold text-site-text-muted hover:text-site-text rounded-md hover:bg-stone-200/40 transition-colors"
            >
              Beranda
            </Link>
            <Link
              href="/paket"
              className="px-3.5 py-2 text-xs font-semibold text-site-text-muted hover:text-site-text rounded-md hover:bg-stone-200/40 transition-colors flex items-center gap-1.5"
            >
              <Compass className="w-3.5 h-3.5 text-brand-500" />
              Paket Umroh
            </Link>
            <Link
              href="/gabung-agen"
              className="px-3.5 py-2 text-xs font-semibold text-site-text-muted hover:text-site-text rounded-md hover:bg-stone-200/40 transition-colors flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5 text-stone-400" />
              Gabung Jadi Agen
            </Link>
            <div className="h-5 w-px bg-stone-300/80 mx-1" />
            <Link
              href="/login"
              className="px-4 py-2 text-xs font-bold text-brand-600 bg-brand-600/10 hover:bg-brand-600/20 border border-brand-600/30 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5" />
              Login Agen
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-site-text hover:bg-stone-200/50 transition-colors cursor-pointer"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-site-bg px-4 pt-3 pb-5 space-y-2 shadow-lg">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-lg text-sm font-semibold text-site-text hover:bg-stone-200/50"
          >
            Beranda
          </Link>
          <Link
            href="/paket"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold text-site-text hover:bg-stone-200/50"
          >
            <Compass className="w-4 h-4 text-brand-500" />
            Paket Umroh
          </Link>
          <Link
            href="/gabung-agen"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold text-site-text hover:bg-stone-200/50"
          >
            <UserPlus className="w-4 h-4 text-stone-400" />
            Gabung Jadi Agen
          </Link>
          <div className="pt-2 border-t border-stone-200">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-bold text-brand-600 bg-brand-600/10 hover:bg-brand-600/20 border border-brand-600/30 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Login Agen
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
