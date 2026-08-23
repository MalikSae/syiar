'use client'

import { useActionState, useEffect } from 'react'
import { updateTenantProfile, ProfileFormState } from './actions'
import {
  Building2,
  Lock,
  Phone,
  Tag,
  FileText,
  ShieldCheck,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
} from 'lucide-react'

interface ProfilFormProps {
  initialData: {
    name: string
    slug: string
    tagline: string
    about: string
    legalitas: string
    alamat: string
    phone: string
  }
}

export function ProfilForm({ initialData }: ProfilFormProps) {
  const [state, formAction, isPending] = useActionState<ProfileFormState | null, FormData>(
    updateTenantProfile,
    null
  )

  useEffect(() => {
    if (state) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [state])

  return (
    <form action={formAction} className="space-y-6">
      {/* Alert Notifikasi Feedback */}
      {state?.success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="font-medium">{state.message}</div>
        </div>
      )}

      {state && !state.success && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">{state.message}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        {/* Header Kartu */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Informasi Profil Travel</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Identitas dan informasi resmi travel yang ditampilkan kepada agen dan publik.
            </p>
          </div>
        </div>

        {/* Input Fields */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Nama Brand Travel */}
            <div className="space-y-1.5">
              <label htmlFor="name" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Nama Brand / Travel <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  defaultValue={initialData.name}
                  placeholder="Contoh: Alhijrah Tour & Travel"
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                    state?.errors?.name
                      ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500'
                      : 'border-slate-200 focus:ring-brand-500/20 focus:border-brand-500'
                  }`}
                />
              </div>
              {state?.errors?.name && (
                <p className="text-xs text-red-600 font-medium pl-1">{state.errors.name}</p>
              )}
            </div>

            {/* 2. Subdomain / Slug (READ-ONLY) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="slug" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Subdomain / Slug (Terkunci)
                </label>
                <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-slate-400" /> Read-Only
                </span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  id="slug"
                  readOnly
                  disabled
                  value={initialData.slug}
                  className="w-full pl-3.5 pr-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-500 cursor-not-allowed select-none font-mono"
                />
              </div>
              <p className="text-[11px] text-slate-400 pl-1 leading-relaxed">
                Domain & URL slug travel Anda. Dibuat saat registrasi dan tidak dapat diubah.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 3. Tagline */}
            <div className="space-y-1.5">
              <label htmlFor="tagline" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Tagline / Slogan
              </label>
              <div className="relative">
                <Tag className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  id="tagline"
                  name="tagline"
                  defaultValue={initialData.tagline}
                  placeholder="Contoh: Melayani Sepenuh Hati Menuju Baitullah"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                />
              </div>
              <p className="text-[11px] text-slate-400 pl-1">
                Slogan singkat yang memperkuat positioning brand Anda.
              </p>
            </div>

            {/* 4. No WhatsApp */}
            <div className="space-y-1.5">
              <label htmlFor="phone" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                No. WhatsApp Resmi
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  defaultValue={initialData.phone}
                  placeholder="Contoh: 081234567890"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-mono"
                />
              </div>
              <p className="text-[11px] text-slate-400 pl-1">
                Nomor WhatsApp untuk konsultasi calon jamaah dan komunikasi agen.
              </p>
            </div>
          </div>

          {/* 5. Legalitas */}
          <div className="space-y-1.5">
            <label htmlFor="legalitas" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Legalitas & Izin Resmi
            </label>
            <div className="relative">
              <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                id="legalitas"
                name="legalitas"
                defaultValue={initialData.legalitas}
                placeholder="Contoh: Izin PPIU Kemenag RI No. U.123 Tahun 2022"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
              />
            </div>
            <p className="text-[11px] text-slate-400 pl-1">
              Nomor izin PPIU / SK Kemenag untuk meningkatkan kepercayaan calon jamaah.
            </p>
          </div>

          {/* 6. Tentang Travel */}
          <div className="space-y-1.5">
            <label htmlFor="about" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Tentang Travel (Profil Singkat)
            </label>
            <div className="relative">
              <textarea
                id="about"
                name="about"
                rows={3}
                defaultValue={initialData.about}
                placeholder="Tuliskan gambaran umum, visi, misi, atau sejarah singkat travel Anda..."
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all resize-y"
              />
            </div>
          </div>

          {/* 7. Alamat Kantor */}
          <div className="space-y-1.5">
            <label htmlFor="alamat" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Alamat Kantor Operasional
            </label>
            <div className="relative">
              <textarea
                id="alamat"
                name="alamat"
                rows={2}
                defaultValue={initialData.alamat}
                placeholder="Contoh: Gedung Graha Syiar Lt. 3, Jl. HR Rasuna Said Kav. 5, Jakarta Selatan"
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all resize-y"
              />
            </div>
          </div>
        </div>

        {/* Footer Aksi */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 disabled:opacity-60 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Simpan Profil</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  )
}
