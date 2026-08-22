'use client'

import { useActionState } from 'react'
import { loginPlatformAdmin, AdminLoginState } from './actions'

export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState<AdminLoginState | null, FormData>(
    loginPlatformAdmin,
    null
  )

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-3">
          Superadmin Portal
        </span>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          SyiarLink Platform
        </h1>
        <h2 className="mt-1 text-base font-medium text-slate-400">
          Login Platform Superadmin
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-800 py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-slate-700">
          {state?.error && (
            <div className="mb-6 bg-red-950/60 border border-red-500/50 p-4 rounded-lg">
              <div className="text-sm text-red-300 font-medium">{state.error}</div>
            </div>
          )}

          <form action={formAction} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300">
                Email Superadmin
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="admin@syiar.link"
                  className="appearance-none block w-full px-3 py-2 border border-slate-600 bg-slate-900/80 text-white rounded-lg shadow-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="appearance-none block w-full px-3 py-2 border border-slate-600 bg-slate-900/80 text-white rounded-lg shadow-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isPending}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? 'Memverifikasi...' : 'Masuk Superadmin'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
