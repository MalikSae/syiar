'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logoutTravelUser } from './actions'

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

  const navItems = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      exact: true,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.75"
            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
          />
        </svg>
      ),
    },
    {
      label: 'Paket Umroh',
      href: '/dashboard/packages',
      exact: false,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.75"
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
      ),
    },
    {
      label: 'Kelola Agen',
      href: '/dashboard/agents',
      exact: false,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.75"
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
    },
    {
      label: 'Pengaturan Travel',
      href: '/dashboard/settings',
      exact: false,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.75"
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.75"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
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
      return (
        <div className="flex items-center space-x-1.5 text-xs sm:text-sm">
          <Link href="/dashboard" className="text-slate-400 hover:text-slate-700 transition-colors">
            Dashboard
          </Link>
          <span className="text-slate-300">/</span>
          <span className="font-semibold text-slate-800">Pengaturan Travel</span>
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
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="p-3 space-y-1 mt-2">
            <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Menu Utama
            </div>
            {navItems.map((item) => {
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
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
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
              className="md:hidden p-2 text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-50"
              onClick={() => setIsMobileOpen(true)}
              aria-label="Open Sidebar"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            {getBreadcrumb()}
          </div>

          {/* Right: Mock Search, Notification Bell, Avatar */}
          <div className="flex items-center space-x-2.5 sm:space-x-4">
            {/* Search Input (Visual Mockup) */}
            <div className="relative hidden sm:block w-48 lg:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
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
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 relative transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.75"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
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
