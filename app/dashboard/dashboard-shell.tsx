'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logoutTravelUser } from './actions'
import {
  LayoutDashboard,
  Package,
  Users,
  Settings,
  ChevronDown,
  ChevronRight,
  Globe,
  Building2,
  CreditCard,
  LogOut,
  Bell,
  Search,
  Menu,
  X,
} from 'lucide-react'

interface DashboardShellProps {
  tenantName: string
  travelUserName: string
  travelUserEmail: string
  children: React.ReactNode
}

export default function DashboardShell({
  tenantName,
  travelUserName,
  travelUserEmail,
  children,
}: DashboardShellProps) {
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const isSettingsActive = pathname.startsWith('/dashboard/settings')
  const [isSettingsOpen, setIsSettingsOpen] = useState(isSettingsActive)

  // Otomatis expand grup Pengaturan jika berada di salah satu sub-halamannya
  useEffect(() => {
    if (isSettingsActive) {
      setIsSettingsOpen(true)
    }
  }, [isSettingsActive, pathname])

  const mainNavItems = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      exact: true,
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      label: 'Paket Umroh',
      href: '/dashboard/packages',
      exact: false,
      icon: <Package className="w-5 h-5" />,
    },
    {
      label: 'Kelola Agen',
      href: '/dashboard/agents',
      exact: false,
      icon: <Users className="w-5 h-5" />,
    },
  ]

  const settingsSubItems = [
    {
      label: 'Website',
      href: '/dashboard/settings/website',
      icon: <Globe className="w-4 h-4" />,
    },
    {
      label: 'Profil',
      href: '/dashboard/settings/profil',
      icon: <Building2 className="w-4 h-4" />,
    },
    {
      label: 'Pembayaran',
      href: '/dashboard/settings/pembayaran',
      icon: <CreditCard className="w-4 h-4" />,
    },
  ]

  // Breadcrumb Helper
  const getBreadcrumb = () => {
    if (pathname.startsWith('/dashboard/packages')) {
      return (
        <div className="flex items-center space-x-1.5 text-xs sm:text-sm">
          <Link href="/dashboard" className="text-slate-400 hover:text-slate-700 transition-colors">
            Dashboard
          </Link>
          <span className="text-slate-300">/</span>
          {pathname === '/dashboard/packages' ? (
            <span className="font-semibold text-slate-800">Paket Umroh</span>
          ) : (
            <>
              <Link href="/dashboard/packages" className="text-slate-400 hover:text-slate-700 transition-colors">
                Paket Umroh
              </Link>
              <span className="text-slate-300">/</span>
              <span className="font-semibold text-slate-800">
                {pathname === '/dashboard/packages/new' ? 'Tambah Paket' : 'Kelola Paket'}
              </span>
            </>
          )}
        </div>
      )
    }
    if (pathname.startsWith('/dashboard/agents')) {
      return (
        <div className="flex items-center space-x-1.5 text-xs sm:text-sm">
          <Link href="/dashboard" className="text-slate-400 hover:text-slate-700 transition-colors">
            Dashboard
          </Link>
          <span className="text-slate-300">/</span>
          <span className="font-semibold text-slate-800">Kelola Agen</span>
        </div>
      )
    }
    if (pathname.startsWith('/dashboard/settings')) {
      let sublabel = 'Profil'
      if (pathname === '/dashboard/settings/website') sublabel = 'Website'
      if (pathname === '/dashboard/settings/pembayaran') sublabel = 'Pembayaran'

      return (
        <div className="flex items-center space-x-1.5 text-xs sm:text-sm">
          <Link href="/dashboard" className="text-slate-400 hover:text-slate-700 transition-colors">
            Dashboard
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-400">Pengaturan</span>
          <span className="text-slate-300">/</span>
          <span className="font-semibold text-slate-800">{sublabel}</span>
        </div>
      )
    }
    return (
      <div className="flex items-center space-x-1.5 text-xs sm:text-sm">
        <span className="font-semibold text-slate-800">Dashboard</span>
      </div>
    )
  }

  const userInitial = travelUserName ? travelUserName.charAt(0).toUpperCase() : 'T'
  const tenantInitial = tenantName ? tenantName.charAt(0).toUpperCase() : 'S'

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans antialiased">
      {/* Backdrop Overlay for Mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar (Fixed on Desktop, Slide-over on Mobile) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Sidebar Header: Logo + Travel Name */}
          <div className="h-16 px-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0">
                {tenantInitial}
              </div>
              <div className="min-w-0">
                <h2 className="font-bold text-sm text-slate-900 truncate">
                  {tenantName || 'SyiarLink Travel'}
                </h2>
                <p className="text-[11px] text-slate-400 font-medium">Dashboard Travel</p>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              type="button"
              className="md:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50"
              onClick={() => setIsMobileOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="p-3 space-y-1 mt-2">
            <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Menu Utama
            </div>

            {/* Main Nav Links */}
            {mainNavItems.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm transition-colors ${
                    isActive
                      ? 'bg-brand-50 text-brand-600 font-semibold shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-medium'
                  }`}
                >
                  <span className={`${isActive ? 'text-brand-600' : 'text-slate-400'}`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </Link>
              )
            })}

            {/* Expandable Group: Pengaturan */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm transition-colors cursor-pointer ${
                  isSettingsActive
                    ? 'text-brand-600 font-semibold bg-brand-50/50'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-medium'
                }`}
                aria-expanded={isSettingsOpen}
              >
                <div className="flex items-center space-x-3">
                  <span className={`${isSettingsActive ? 'text-brand-600' : 'text-slate-400'}`}>
                    <Settings className="w-5 h-5" />
                  </span>
                  <span>Pengaturan</span>
                </div>
                <span className="text-slate-400">
                  {isSettingsOpen ? (
                    <ChevronDown className="w-4 h-4 transition-transform duration-200" />
                  ) : (
                    <ChevronRight className="w-4 h-4 transition-transform duration-200" />
                  )}
                </span>
              </button>

              {/* Sub-items */}
              {isSettingsOpen && (
                <div className="pl-6 pr-2 py-1 space-y-1 mt-0.5 border-l-2 border-slate-100 ml-4">
                  {settingsSubItems.map((sub) => {
                    const isSubActive = pathname === sub.href
                    return (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        onClick={() => setIsMobileOpen(false)}
                        className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                          isSubActive
                            ? 'bg-brand-50 text-brand-600 font-bold shadow-2xs'
                            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        <span className={`${isSubActive ? 'text-brand-600' : 'text-slate-400'}`}>
                          {sub.icon}
                        </span>
                        <span>{sub.label}</span>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Bottom Profile Card */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
          <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-2">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                {userInitial}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-800 truncate">
                  {travelUserName || 'Pengguna Travel'}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {travelUserEmail || 'Owner Travel'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                logoutTravelUser()
              }}
              title="Logout dari Akun"
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Wrapper Area (Offset by sidebar width on desktop) */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen w-full">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-slate-200/80 sticky top-0 z-20 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Left: Mobile Toggle & Breadcrumbs */}
          <div className="flex items-center space-x-3">
            <button
              type="button"
              className="md:hidden p-2 text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-50 cursor-pointer"
              onClick={() => setIsMobileOpen(true)}
              aria-label="Open Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            {getBreadcrumb()}
          </div>

          {/* Right: Mock Search, Notification Bell, Avatar */}
          <div className="flex items-center space-x-2.5 sm:space-x-4">
            {/* Search Input (Visual Mockup) */}
            <div className="relative hidden sm:block w-48 lg:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                readOnly
                placeholder="Cari agen..."
                className="block w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none cursor-default select-none"
              />
            </div>

            {/* Notification Bell Icon */}
            <button
              type="button"
              aria-label="Notifikasi"
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 relative transition-colors cursor-pointer"
            >
              <Bell className="w-5 h-5" />
              <span className="w-2 h-2 rounded-full bg-brand-600 absolute top-2 right-2 ring-2 ring-white"></span>
            </button>

            {/* User Avatar Badge */}
            <div className="flex items-center space-x-2 pl-1 sm:pl-2 border-l border-slate-100">
              <div className="w-8 h-8 rounded-full bg-brand-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                {userInitial}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
