'use client'

import { useState, useActionState } from 'react'
import Link from 'next/link'
import { registerTravel, RegisterState } from './actions'
import {
  DashboardInput,
  DashboardLabel,
  DashboardErrorMessage,
  DashboardSubmitButton,
} from '@/components/dashboard/form'
import { Building2, Globe, User, Mail, Lock, UserPlus } from 'lucide-react'

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
        <h2 className="text-center text-xl font-bold text-slate-900">
          Daftarkan Travel Umroh
        </h2>
        <p className="mt-1 text-center text-xs sm:text-sm text-slate-500">
          Kelola jaringan agen & afiliasi umroh dalam satu platform terpadu
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl sm:px-10 border border-slate-200/80 space-y-6">
          {state?.error && (
            <DashboardErrorMessage
              title="Gagal Mendaftarkan Travel"
              message={state.error}
            />
          )}

          <form action={formAction} className="space-y-6">
            <div className="border-b border-slate-100 pb-5 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  1. Informasi Travel
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  Data profil travel umroh yang akan didaftarkan sebagai tenant.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <DashboardLabel htmlFor="travelName" required>
                    Nama Travel
                  </DashboardLabel>
                  <DashboardInput
                    id="travelName"
                    name="travelName"
                    type="text"
                    required
                    icon={Building2}
                    value={travelName}
                    onChange={handleTravelNameChange}
                    placeholder="Contoh: Alhijrah Tour & Travel"
                    hasError={Boolean(state?.fieldErrors?.travelName)}
                    errorMessage={state?.fieldErrors?.travelName}
                  />
                </div>

                <div className="space-y-1.5">
                  <DashboardLabel htmlFor="slug" required>
                    Subdomain / Slug Travel
                  </DashboardLabel>
                  <DashboardInput
                    id="slug"
                    name="slug"
                    type="text"
                    required
                    icon={Globe}
                    value={slug}
                    onChange={handleSlugChange}
                    placeholder="alhijrah"
                    suffixText=".syiar.link"
                    className="font-mono pr-24"
                    helperText="Hanya huruf kecil, angka, dan tanda hubung (-). Contoh: alhijrah"
                    hasError={Boolean(state?.fieldErrors?.slug)}
                    errorMessage={state?.fieldErrors?.slug}
                  />
                </div>
              </div>
            </div>

            <div className="pb-2 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  2. Akun Penanggung Jawab (Owner)
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  Akun utama untuk login ke dashboard manajemen travel Anda.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <DashboardLabel htmlFor="userName" required>
                    Nama Lengkap
                  </DashboardLabel>
                  <DashboardInput
                    id="userName"
                    name="userName"
                    type="text"
                    required
                    icon={User}
                    placeholder="Nama pemilik / penanggung jawab"
                    hasError={Boolean(state?.fieldErrors?.userName)}
                    errorMessage={state?.fieldErrors?.userName}
                  />
                </div>

                <div className="space-y-1.5">
                  <DashboardLabel htmlFor="email" required>
                    Alamat Email
                  </DashboardLabel>
                  <DashboardInput
                    id="email"
                    name="email"
                    type="email"
                    required
                    icon={Mail}
                    placeholder="owner@alhijrah.com"
                    autoComplete="email"
                    hasError={Boolean(state?.fieldErrors?.email)}
                    errorMessage={state?.fieldErrors?.email}
                  />
                </div>

                <div className="space-y-1.5">
                  <DashboardLabel htmlFor="password" required>
                    Password
                  </DashboardLabel>
                  <DashboardInput
                    id="password"
                    name="password"
                    type="password"
                    required
                    icon={Lock}
                    placeholder="Minimal 8 karakter"
                    autoComplete="new-password"
                    hasError={Boolean(state?.fieldErrors?.password)}
                    errorMessage={state?.fieldErrors?.password}
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <DashboardSubmitButton
                isPending={isPending}
                loadingText="Sedang Mendaftarkan..."
                icon={UserPlus}
                fullWidth
              >
                Daftarkan Travel & Masuk
              </DashboardSubmitButton>
            </div>
          </form>

          <div className="pt-2 border-t border-slate-100 text-center">
            <p className="text-xs sm:text-sm text-slate-600">
              Sudah memiliki akun travel?{' '}
              <Link
                href="/login"
                className="font-bold text-brand-600 hover:text-brand-500 underline"
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
