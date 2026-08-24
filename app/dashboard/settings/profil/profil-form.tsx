'use client'

import { useActionState, useEffect } from 'react'
import { updateTenantProfile, ProfileFormState } from './actions'
import {
  DashboardInput,
  DashboardTextarea,
  DashboardLabel,
  DashboardErrorMessage,
  DashboardSubmitButton,
} from '@/components/dashboard/form'
import { DashboardSection } from '@/components/dashboard/layout'
import {
  Building2,
  Lock,
  Phone,
  Tag,
  ShieldCheck,
  CheckCircle2,
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
    <form action={formAction} className="space-y-8">
      {/* Alert Notifikasi Feedback Sukses */}
      {state?.success && (
        <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="font-medium">{state.message}</div>
        </div>
      )}

      {/* Alert Error Sistem */}
      {state && !state.success && (
        <DashboardErrorMessage
          title="Gagal Menyimpan Profil"
          message={state.message}
        />
      )}

      <DashboardSection
        icon={Building2}
        title="Informasi Profil Travel"
        description="Identitas dan informasi resmi travel yang ditampilkan kepada agen dan publik."
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Nama Brand Travel */}
            <div className="space-y-1.5">
              <DashboardLabel htmlFor="name" required>
                Nama Brand / Travel
              </DashboardLabel>
              <DashboardInput
                id="name"
                name="name"
                required
                icon={Building2}
                defaultValue={initialData.name}
                placeholder="Contoh: Alhijrah Tour & Travel"
                hasError={Boolean(state?.errors?.name)}
                errorMessage={state?.errors?.name}
              />
            </div>

            {/* 2. Subdomain / Slug (READ-ONLY) */}
            <div className="space-y-1.5">
              <DashboardLabel
                htmlFor="slug"
                badge={
                  <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-slate-400" /> Read-Only
                  </span>
                }
              >
                Subdomain / Slug (Terkunci)
              </DashboardLabel>
              <DashboardInput
                id="slug"
                disabled
                value={initialData.slug}
                helperText="Domain & URL slug travel Anda. Dibuat saat registrasi dan tidak dapat diubah."
                className="font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 3. Tagline */}
            <div className="space-y-1.5">
              <DashboardLabel htmlFor="tagline" optional>
                Tagline / Slogan
              </DashboardLabel>
              <DashboardInput
                id="tagline"
                name="tagline"
                icon={Tag}
                defaultValue={initialData.tagline}
                placeholder="Contoh: Melayani Sepenuh Hati Menuju Baitullah"
                helperText="Slogan singkat yang memperkuat positioning brand Anda."
              />
            </div>

            {/* 4. No WhatsApp */}
            <div className="space-y-1.5">
              <DashboardLabel htmlFor="phone">
                No. WhatsApp Resmi
              </DashboardLabel>
              <DashboardInput
                type="tel"
                id="phone"
                name="phone"
                icon={Phone}
                defaultValue={initialData.phone}
                placeholder="Contoh: 081234567890"
                helperText="Nomor WhatsApp untuk konsultasi calon jamaah dan komunikasi agen."
                className="font-mono"
              />
            </div>
          </div>

          {/* 5. Legalitas */}
          <div className="space-y-1.5">
            <DashboardLabel htmlFor="legalitas">
              Legalitas & Izin Resmi
            </DashboardLabel>
            <DashboardInput
              id="legalitas"
              name="legalitas"
              icon={ShieldCheck}
              defaultValue={initialData.legalitas}
              placeholder="Contoh: Izin PPIU Kemenag RI No. U.123 Tahun 2022"
              helperText="Nomor izin PPIU / SK Kemenag untuk meningkatkan kepercayaan calon jamaah."
            />
          </div>

          {/* 6. Tentang Travel */}
          <div className="space-y-1.5">
            <DashboardLabel htmlFor="about">
              Tentang Travel (Profil Singkat)
            </DashboardLabel>
            <DashboardTextarea
              id="about"
              name="about"
              rows={3}
              defaultValue={initialData.about}
              placeholder="Tuliskan gambaran umum, visi, misi, atau sejarah singkat travel Anda..."
              helperText="Teks ini akan ditampilkan pada footer microsite dan portal pendaftaran agen."
            />
          </div>

          {/* 7. Alamat Kantor */}
          <div className="space-y-1.5">
            <DashboardLabel htmlFor="alamat">
              Alamat Kantor Operasional
            </DashboardLabel>
            <DashboardTextarea
              id="alamat"
              name="alamat"
              rows={2}
              defaultValue={initialData.alamat}
              placeholder="Contoh: Gedung Graha Syiar Lt. 3, Jl. HR Rasuna Said Kav. 5, Jakarta Selatan"
            />
          </div>
        </div>
      </DashboardSection>

      {/* Footer Aksi */}
      <div className="pt-6 border-t border-slate-200 flex items-center justify-end">
        <DashboardSubmitButton
          isPending={isPending}
          loadingText="Menyimpan..."
          icon={Save}
        >
          Simpan Profil
        </DashboardSubmitButton>
      </div>
    </form>
  )
}
