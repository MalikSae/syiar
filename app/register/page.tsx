'use client'

import { useState, useActionState } from 'react'
import Link from 'next/link'
import { registerTravel, RegisterState } from './actions'

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState<RegisterState | null, FormData>(
    registerTravel,
    null
  )

  const [travelName, setTravelName] = useState('')
  const [slug, setSlug] = useState('')
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false)

  const handleTravelNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    setTravelName(name)
    if (!isSlugManuallyEdited) {
      setSlug(generateSlug(name))
    }
  }

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsSlugManuallyEdited(true)
    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <Link href="/" className="inline-block mb-4">
          <img
            src="/syiarlink-logo.png"
            alt="SyiarLink"
            className="h-11 sm:h-12 w-auto object-contain mx-auto"
          />
        </Link>
        <h2 className="text-center text-xl font-medium text-slate-600">
          Daftarkan Travel Umroh
        </h2>
        <p className="mt-1 text-center text-sm text-slate-500">
          Kelola jaringan agen & afiliasi umroh dalam satu platform terpadu
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl sm:px-10 border border-slate-200/80">
          {state?.error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md">
              <div className="flex">
                <div className="text-sm text-red-700 font-medium">{state.error}</div>
              </div>
            </div>
          )}

          <form action={formAction} className="space-y-6">
            <div className="border-b border-slate-200 pb-5">
              <h3 className="text-base font-semibold leading-6 text-slate-900">
                1. Informasi Travel
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Data profil travel umroh yang akan didaftarkan sebagai tenant.
              </p>

              <div className="mt-4 space-y-4">
                <div>
                  <label
                    htmlFor="travelName"
                    className="block text-sm font-medium text-slate-700"
                  >
                    Nama Travel <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <input
                      id="travelName"
                      name="travelName"
                      type="text"
                      required
                      value={travelName}
                      onChange={handleTravelNameChange}
                      placeholder="Contoh: Alhijrah Tour & Travel"
                      className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                    />
                  </div>
                  {state?.fieldErrors?.travelName && (
                    <p className="mt-1 text-xs text-red-600 font-medium">
                      {state.fieldErrors.travelName}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="slug"
                    className="block text-sm font-medium text-slate-700"
                  >
                    Subdomain / Slug Travel <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1 flex rounded-lg shadow-sm">
                    <input
                      id="slug"
                      name="slug"
                      type="text"
                      required
                      value={slug}
                      onChange={handleSlugChange}
                      placeholder="alhijrah"
                      className="flex-1 min-w-0 block w-full px-3 py-2 border border-slate-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm font-mono"
                    />
                    <span className="inline-flex items-center px-3 rounded-r-lg border border-l-0 border-slate-300 bg-slate-50 text-slate-500 text-xs font-mono">
                      .syiar.link
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Hanya huruf kecil, angka, dan tanda hubung (-). Contoh: <code>alhijrah</code>
                  </p>
                  {state?.fieldErrors?.slug && (
                    <p className="mt-1 text-xs text-red-600 font-medium">
                      {state.fieldErrors.slug}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="pb-2">
              <h3 className="text-base font-semibold leading-6 text-slate-900">
                2. Akun Penanggung Jawab (Owner)
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Akun utama untuk login ke dashboard manajemen travel Anda.
              </p>

              <div className="mt-4 space-y-4">
                <div>
                  <label
                    htmlFor="userName"
                    className="block text-sm font-medium text-slate-700"
                  >
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <input
                      id="userName"
                      name="userName"
                      type="text"
                      required
                      placeholder="Nama pemilik / penanggung jawab"
                      className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                    />
                  </div>
                  {state?.fieldErrors?.userName && (
                    <p className="mt-1 text-xs text-red-600 font-medium">
                      {state.fieldErrors.userName}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-slate-700"
                  >
                    Alamat Email <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder="owner@alhijrah.com"
                      className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                    />
                  </div>
                  {state?.fieldErrors?.email && (
                    <p className="mt-1 text-xs text-red-600 font-medium">
                      {state.fieldErrors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-slate-700"
                  >
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      placeholder="Minimal 8 karakter"
                      className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                    />
                  </div>
                  {state?.fieldErrors?.password && (
                    <p className="mt-1 text-xs text-red-600 font-medium">
                      {state.fieldErrors.password}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isPending}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-brand-600 hover:bg-brand-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? 'Sedang Mendaftarkan...' : 'Daftarkan Travel & Masuk'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Sudah memiliki akun travel?{' '}
              <Link
                href="/login"
                className="font-medium text-brand-600 hover:text-brand-500 underline"
              >
                Login di sini
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
