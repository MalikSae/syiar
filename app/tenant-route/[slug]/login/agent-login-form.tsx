'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { loginAgent, AgentLoginState } from './actions'
import {
  SiteInput,
  SiteLabel,
  SiteErrorMessage,
  SiteSubmitButton,
} from '@/components/site/form'
import { Phone, Lock, LogIn } from 'lucide-react'

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
    <div className="bg-white py-8 px-6 shadow-xl rounded-2xl sm:px-10 border border-slate-200/80 space-y-6">
      {state?.error && (
        <SiteErrorMessage
          title="Gagal Masuk Agen"
          message={state.error}
        />
      )}

      <form action={formAction} className="space-y-4">
        <div>
          <SiteLabel htmlFor="phone" required>
            Nomor WhatsApp / HP
          </SiteLabel>
          <SiteInput
            id="phone"
            name="phone"
            type="tel"
            required
            icon={Phone}
            placeholder="081234567890"
            className="font-mono"
            autoComplete="tel"
          />
        </div>

        <div>
          <SiteLabel htmlFor="password" required>
            Password
          </SiteLabel>
          <SiteInput
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
          <SiteSubmitButton
            isPending={isPending}
            loadingText="Sedang Masuk..."
            icon={LogIn}
            fullWidth
          >
            Masuk ke Dashboard Agen
          </SiteSubmitButton>
        </div>
      </form>

      <div className="text-center pt-2 border-t border-slate-100">
        <p className="text-sm text-slate-600">
          Belum terdaftar sebagai agen?{' '}
          <Link
            href="/gabung-agen"
            className="font-semibold text-brand-600 hover:underline"
          >
            Daftar di sini
          </Link>
        </p>
      </div>
    </div>
  )
}
