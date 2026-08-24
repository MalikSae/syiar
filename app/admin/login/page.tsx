'use client'

import { useActionState } from 'react'
import { loginPlatformAdmin, AdminLoginState } from './actions'
import {
  DashboardInput,
  DashboardLabel,
  DashboardErrorMessage,
  DashboardSubmitButton,
} from '@/components/dashboard/form'
import { ShieldCheck, Mail, Lock, LogIn } from 'lucide-react'

export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState<AdminLoginState | null, FormData>(
    loginPlatformAdmin,
    null
  )

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-brand-500/20 text-brand-300 border border-brand-500/30 mb-3">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Superadmin Portal</span>
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          SyiarLink Platform
        </h1>
        <h2 className="mt-1 text-xs sm:text-sm font-medium text-slate-400">
          Login Platform Superadmin
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-slate-200/80 space-y-6">
          {state?.error && (
            <DashboardErrorMessage
              title="Gagal Masuk Superadmin"
              message={state.error}
            />
          )}

          <form action={formAction} className="space-y-5">
            <div className="space-y-1.5">
              <DashboardLabel htmlFor="email" required>
                Email Superadmin
              </DashboardLabel>
              <DashboardInput
                id="email"
                name="email"
                type="email"
                required
                icon={Mail}
                placeholder="admin@syiar.link"
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
                loadingText="Memverifikasi..."
                icon={LogIn}
                fullWidth
              >
                Masuk Superadmin
              </DashboardSubmitButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
