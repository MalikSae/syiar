'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { loginTravelUser, LoginState } from './actions'

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
        <h2 className="text-center text-xl font-medium text-slate-600">
          Login Travel Umroh
        </h2>
        <p className="mt-1 text-center text-sm text-slate-500">
          Masuk ke portal manajemen travel Anda
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl sm:px-10 border border-slate-200/80">
          {state?.error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md">
              <div className="text-sm text-red-700 font-medium">{state.error}</div>
            </div>
          )}

          <form action={formAction} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700"
              >
                Alamat Email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="owner@travel.com"
                  className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700"
              >
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isPending}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-brand-600 hover:bg-brand-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? 'Sedang Masuk...' : 'Masuk ke Dashboard'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Belum memiliki akun travel?{' '}
              <Link
                href="/register"
                className="font-medium text-brand-600 hover:text-brand-500 underline"
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
