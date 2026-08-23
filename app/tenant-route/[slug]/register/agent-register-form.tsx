'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { registerAgent, AgentRegisterState } from './actions'

interface AgentRegisterFormProps {
  tenantSlug: string
  tenantName: string
}

export default function AgentRegisterForm({ tenantSlug, tenantName }: AgentRegisterFormProps) {
  const registerWithSlug = registerAgent.bind(null, tenantSlug)
  const [state, formAction, isPending] = useActionState<AgentRegisterState | null, FormData>(
    registerWithSlug,
    null
  )

  if (state?.success) {
    return (
      <div className="bg-white py-8 px-6 shadow-xl rounded-2xl sm:px-10 border border-brand-500/30 text-center">
        <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-brand-50 mb-4">
          <svg
            className="h-8 w-8 text-brand-600"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-slate-900">Pendaftaran Berhasil!</h3>
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
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-semibold rounded-lg text-brand-600 bg-brand-50 hover:bg-brand-500/10 transition-colors w-full"
          >
            Kembali ke Halaman Login Agen
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white py-8 px-6 shadow-xl rounded-2xl sm:px-10 border border-slate-200/80">
      {state?.error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md">
          <div className="text-sm text-red-700 font-medium">{state.error}</div>
        </div>
      )}

      <form action={formAction} className="space-y-5">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-700">
            Nama Lengkap <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <input
              id="name"
              name="name"
              type="text"
              required
              placeholder="Contoh: Fulan bin Fulan"
              className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
            />
          </div>
          {state?.fieldErrors?.name && (
            <p className="mt-1 text-xs text-red-600 font-medium">{state.fieldErrors.name}</p>
          )}
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-slate-700">
            Nomor WhatsApp / HP <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              placeholder="Contoh: 081234567890"
              className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm font-mono"
            />
          </div>
          {state?.fieldErrors?.phone && (
            <p className="mt-1 text-xs text-red-600 font-medium">{state.fieldErrors.phone}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700">
            Email <span className="text-xs text-slate-400 font-normal">(opsional)</span>
          </label>
          <div className="mt-1">
            <input
              id="email"
              name="email"
              type="email"
              placeholder="agen@email.com"
              className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
            />
          </div>
          {state?.fieldErrors?.email && (
            <p className="mt-1 text-xs text-red-600 font-medium">{state.fieldErrors.email}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700">
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
            <p className="mt-1 text-xs text-red-600 font-medium">{state.fieldErrors.password}</p>
          )}
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-brand-600 hover:bg-brand-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'Mendaftarkan...' : 'Daftar Sebagai Agen'}
          </button>
        </div>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-slate-600">
          Sudah terdaftar sebagai agen?{' '}
          <Link
            href="/login"
            className="font-medium text-brand-600 hover:text-brand-500 underline"
          >
            Login di sini
          </Link>
        </p>
      </div>
    </div>
  )
}
