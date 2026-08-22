'use client'

import { useActionState } from 'react'
import { updateTenantProfile, SettingsState } from './actions'

interface SettingsFormProps {
  initialData: {
    name: string
    slug: string
    phone: string
    bankAccount: string
  }
}

export default function SettingsForm({ initialData }: SettingsFormProps) {
  const [state, formAction, isPending] = useActionState<SettingsState | null, FormData>(
    updateTenantProfile,
    null
  )

  return (
    <form action={formAction} className="space-y-6">
      {/* Alert Sukses */}
      {state?.success && state?.message && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium flex items-center gap-2">
          <svg className="w-5 h-5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          <span>{state.message}</span>
        </div>
      )}

      {/* Alert Error Umum */}
      {state?.error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm font-medium">
          {state.error}
        </div>
      )}

      <div className="space-y-4">
        {/* Field Nama Travel */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-700">
            Nama Travel <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <input
              id="name"
              name="name"
              type="text"
              required
              defaultValue={initialData.name}
              placeholder="Contoh: Alhijrah Tour & Travel"
              className="appearance-none block w-full px-3.5 py-2.5 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm text-slate-900"
            />
          </div>
          {state?.fieldErrors?.name && (
            <p className="mt-1 text-xs text-red-600 font-medium">{state.fieldErrors.name}</p>
          )}
        </div>

        {/* Field Slug (READ-ONLY) */}
        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-slate-700">
            Slug Subdomain Travel
          </label>
          <div className="mt-1 flex rounded-lg shadow-sm">
            <input
              id="slug"
              name="slug"
              type="text"
              disabled
              readOnly
              defaultValue={initialData.slug}
              className="block w-full px-3.5 py-2.5 border border-slate-200 rounded-lg bg-slate-100 text-slate-500 font-mono text-sm cursor-not-allowed select-none"
            />
          </div>
          <p className="mt-1.5 text-xs text-slate-500 flex items-center gap-1">
            <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Slug tidak bisa diubah karena sudah dipakai di link yang mungkin sudah dibagikan.
          </p>
        </div>

        {/* Field Nomor HP / WhatsApp */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-slate-700">
            Nomor Kontak / WhatsApp Travel
          </label>
          <div className="mt-1">
            <input
              id="phone"
              name="phone"
              type="text"
              defaultValue={initialData.phone}
              placeholder="Contoh: 081234567890"
              className="appearance-none block w-full px-3.5 py-2.5 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm text-slate-900 font-mono"
            />
          </div>
          {state?.fieldErrors?.phone && (
            <p className="mt-1 text-xs text-red-600 font-medium">{state.fieldErrors.phone}</p>
          )}
        </div>

        {/* Field Nomor Rekening Bank */}
        <div>
          <label htmlFor="bankAccount" className="block text-sm font-medium text-slate-700">
            Nomor Rekening Bank
          </label>
          <div className="mt-1">
            <input
              id="bankAccount"
              name="bankAccount"
              type="text"
              defaultValue={initialData.bankAccount}
              placeholder="Contoh: Bank Syariah Indonesia (BSI) 7123456789 a.n PT Alhijrah Utama"
              className="appearance-none block w-full px-3.5 py-2.5 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm text-slate-900"
            />
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Digunakan sebagai informasi pembayaran calon jamaah.
          </p>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center px-5 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </div>
    </form>
  )
}
