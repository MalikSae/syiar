'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { loginTravelUser, LoginState } from './actions'
import {
  DashboardInput,
  DashboardLabel,
  DashboardErrorMessage,
  DashboardSubmitButton,
} from '@/components/dashboard/form'
import { Mail, Lock, LogIn } from 'lucide-react'

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState<LoginState | null, FormData>(
    loginTravelUser,
    null
  )

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
          Login Travel Umroh
        </h2>
        <p className="mt-1 text-center text-xs sm:text-sm text-slate-500">
          Masuk ke portal manajemen travel Anda
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl sm:px-10 border border-slate-200/80 space-y-6">
          {state?.error && (
            <DashboardErrorMessage
              title="Gagal Masuk"
              message={state.error}
            />
          )}

          <form action={formAction} className="space-y-5">
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
                placeholder="owner@travel.com"
                autoComplete="email"
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
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            <div className="pt-2">
              <DashboardSubmitButton
                isPending={isPending}
                loadingText="Sedang Masuk..."
                icon={LogIn}
                fullWidth
              >
                Masuk ke Dashboard
              </DashboardSubmitButton>
            </div>
          </form>

          <div className="pt-2 border-t border-slate-100 text-center">
            <p className="text-xs sm:text-sm text-slate-600">
              Belum memiliki akun travel?{' '}
              <Link
                href="/register"
                className="font-bold text-brand-600 hover:text-brand-500 underline"
              >
                Daftar sekarang
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
