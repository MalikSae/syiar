'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { loginAgent, AgentLoginState } from './actions'

interface AgentLoginFormProps {
  tenantSlug: string
}

export default function AgentLoginForm({ tenantSlug }: AgentLoginFormProps) {
  const loginWithSlug = loginAgent.bind(null, tenantSlug)
  const [state, formAction, isPending] = useActionState<AgentLoginState | null, FormData>(
    loginWithSlug,
    null
  )

  return (
    <div className="bg-white py-8 px-6 shadow-xl rounded-2xl sm:px-10 border border-slate-200/80">
      {state?.error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md">
          <div className="text-sm text-red-700 font-medium">{state.error}</div>
        </div>
      )}

      <form action={formAction} className="space-y-5">
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-slate-700">
            Nomor WhatsApp / HP
          </label>
          <div className="mt-1">
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              placeholder="081234567890"
              className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm font-mono"
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700">
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

        <div className="pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-brand-600 hover:bg-brand-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'Sedang Masuk...' : 'Masuk ke Dashboard Agen'}
          </button>
        </div>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-slate-600">
          Belum terdaftar sebagai agen?{' '}
          <Link
            href="/gabung-agen"
            className="font-medium text-brand-600 hover:text-brand-500 underline"
          >
            Daftar di sini
          </Link>
        </p>
      </div>
    </div>
  )
}
