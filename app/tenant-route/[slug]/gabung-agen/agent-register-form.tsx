'use client'

import { useActionState, useEffect } from 'react'
import Link from 'next/link'
import { registerAgent, AgentRegisterState } from './actions'
import {
  SiteInput,
  SiteLabel,
  SiteErrorMessage,
  SiteSubmitButton,
} from '@/components/site/form'
import { User, Phone, Mail, Lock, Ticket, UserPlus, CheckCircle2 } from 'lucide-react'

interface AgentRegisterFormProps {
  tenantSlug: string
  tenantName: string
  initialReferralCode?: string
}

export default function AgentRegisterForm({
  tenantSlug,
  tenantName,
  initialReferralCode = '',
}: AgentRegisterFormProps) {
  const registerWithSlug = registerAgent.bind(null, tenantSlug)
  const [state, formAction, isPending] = useActionState<AgentRegisterState | null, FormData>(
    registerWithSlug,
    null
  )

  useEffect(() => {
    if (state) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [state])

  if (state?.success) {
    return (
      <div className="bg-white py-8 px-6 shadow-xl rounded-2xl sm:px-10 border border-brand-500/30 text-center">
        <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-brand-600/10 border border-brand-600/20 mb-4">
          <CheckCircle2 className="h-8 w-8 text-brand-600" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 font-jakarta">Pendaftaran Berhasil!</h3>
        <p className="mt-3 text-sm text-slate-600 leading-relaxed font-medium">
          Pendaftaran berhasil, akun kamu menunggu persetujuan dari travel{' '}
          <strong className="text-slate-900">{tenantName}</strong>.
        </p>
        <p className="mt-2 text-xs text-slate-500">
          Setelah disetujui oleh pihak travel, kamu dapat login ke dashboard agen menggunakan nomor HP dan password yang telah didaftarkan.
        </p>
        <div className="mt-6 pt-5 border-t border-slate-100">
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-bold rounded-lg text-brand-600 bg-brand-50 hover:bg-brand-500/10 transition-colors w-full font-jakarta"
          >
            Kembali ke Halaman Login Agen
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white py-8 px-6 shadow-xl rounded-2xl sm:px-10 border border-slate-200/80 space-y-6">
      {state?.error && (
        <SiteErrorMessage
          title="Gagal Mendaftar Agen"
          message={state.error}
        />
      )}

      <form action={formAction} className="space-y-4">
        <div>
          <SiteLabel htmlFor="name" required>
            Nama Lengkap
          </SiteLabel>
          <SiteInput
            id="name"
            name="name"
            type="text"
            required
            icon={User}
            placeholder="Contoh: Fulan bin Fulan"
            hasError={Boolean(state?.fieldErrors?.name)}
            errorMessage={state?.fieldErrors?.name}
          />
        </div>

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
            placeholder="Contoh: 081234567890"
            className="font-mono"
            hasError={Boolean(state?.fieldErrors?.phone)}
            errorMessage={state?.fieldErrors?.phone}
          />
        </div>

        <div>
          <SiteLabel htmlFor="email" optional>
            Email
          </SiteLabel>
          <SiteInput
            id="email"
            name="email"
            type="email"
            icon={Mail}
            placeholder="agen@email.com"
            hasError={Boolean(state?.fieldErrors?.email)}
            errorMessage={state?.fieldErrors?.email}
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
            placeholder="Minimal 8 karakter"
            hasError={Boolean(state?.fieldErrors?.password)}
            errorMessage={state?.fieldErrors?.password}
          />
        </div>

        <div>
          <SiteLabel htmlFor="referralCode" optional>
            Kode Referral Pengajak
          </SiteLabel>
          <SiteInput
            id="referralCode"
            name="referralCode"
            type="text"
            icon={Ticket}
            defaultValue={initialReferralCode}
            placeholder="Contoh: AGEN1234"
            className="font-mono uppercase"
          />
        </div>

        <div className="pt-2">
          <SiteSubmitButton
            isPending={isPending}
            loadingText="Mendaftarkan..."
            icon={UserPlus}
            fullWidth
          >
            Daftar Sebagai Agen
          </SiteSubmitButton>
        </div>
      </form>

      <div className="text-center pt-2 border-t border-slate-100">
        <p className="text-sm text-slate-600">
          Sudah terdaftar sebagai agen?{' '}
          <Link
            href="/login"
            className="font-semibold text-brand-600 hover:underline"
          >
            Login di sini
          </Link>
        </p>
      </div>
    </div>
  )
}

