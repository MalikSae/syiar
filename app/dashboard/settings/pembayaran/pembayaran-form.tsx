'use client'

import { useActionState, useEffect } from 'react'
import { updatePaymentSettings, PaymentFormState } from './actions'
import {
  DashboardInput,
  DashboardTextarea,
  DashboardLabel,
  DashboardErrorMessage,
  DashboardSubmitButton,
} from '@/components/dashboard/form'
import {
  CreditCard,
  Building,
  User,
  Hash,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Save,
  Info,
} from 'lucide-react'

interface PembayaranFormProps {
  initialData: {
    bankName: string
    bankAccountNumber: string
    bankAccountHolder: string
    termsAndConditions: string
  }
}

export function PembayaranForm({ initialData }: PembayaranFormProps) {
  const [state, formAction, isPending] = useActionState<PaymentFormState | null, FormData>(
    updatePaymentSettings,
    null
  )

  useEffect(() => {
    if (state) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [state])

  return (
    <form action={formAction} className="space-y-6">
      {/* Alert Sukses */}
      {state?.success && (
        <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="font-medium">{state.message}</div>
        </div>
      )}

      {/* Alert Warning Lembut (Bukan Error Blocking) */}
      {state?.warning && (
        <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm flex items-start gap-3 animate-in fade-in">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Perhatian</p>
            <p className="text-xs text-amber-700 mt-0.5">{state.warning}</p>
          </div>
        </div>
      )}

      {/* Alert Error Sistem */}
      {state && !state.success && (
        <DashboardErrorMessage
          title="Gagal Menyimpan Pengaturan Pembayaran"
          message={state.message}
        />
      )}

      {/* SECTION 1: Info Rekening Bank */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Rekening Bank Resmi</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Rekening tujuan transfer manual bagi calon jamaah untuk pembayaran uang muka (DP) dan pelunasan.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. Nama Bank */}
            <div className="space-y-1.5">
              <DashboardLabel htmlFor="bankName">
                Nama Bank
              </DashboardLabel>
              <DashboardInput
                id="bankName"
                name="bankName"
                icon={Building}
                defaultValue={initialData.bankName}
                placeholder="Contoh: Bank Syariah Indonesia (BSI)"
              />
            </div>

            {/* 2. Nomor Rekening */}
            <div className="space-y-1.5">
              <DashboardLabel htmlFor="bankAccountNumber">
                Nomor Rekening
              </DashboardLabel>
              <DashboardInput
                id="bankAccountNumber"
                name="bankAccountNumber"
                icon={Hash}
                defaultValue={initialData.bankAccountNumber}
                placeholder="Contoh: 7123456789"
                className="font-mono"
              />
            </div>

            {/* 3. Atas Nama */}
            <div className="space-y-1.5">
              <DashboardLabel htmlFor="bankAccountHolder">
                Atas Nama Pemilik
              </DashboardLabel>
              <DashboardInput
                id="bankAccountHolder"
                name="bankAccountHolder"
                icon={User}
                defaultValue={initialData.bankAccountHolder}
                placeholder="Contoh: PT Alhijrah Tour Mandiri"
              />
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/70 text-xs text-slate-500 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Semua field bersifat opsional. Namun jika Anda mengisi salah satu field, disarankan melengkapi ketiganya (Nama Bank, Nomor Rekening, dan Atas Nama) agar informasi transfer transparan bagi calon jamaah.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 2: Syarat & Ketentuan Pembayaran */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Syarat & Ketentuan Pembayaran</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Aturan pembayaran, jadwal termin, kebijakan pembatalan, dan refund yang akan ditampilkan kepada jamaah.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-3">
          <DashboardLabel htmlFor="termsAndConditions">
            Teks Syarat & Ketentuan Lengkap
          </DashboardLabel>
          <DashboardTextarea
            id="termsAndConditions"
            name="termsAndConditions"
            rows={8}
            defaultValue={initialData.termsAndConditions}
            placeholder={`Contoh:
1. Pembayaran uang muka (DP) minimal sebesar 20% dari total biaya paket, dibayarkan maksimal 3 hari kerja setelah pendaftaran.
2. Pelunasan biaya paket wajib diselesaikan paling lambat 30 hari kalender sebelum tanggal keberangkatan.
3. Pembatalan booking oleh pihak jamaah:
   - Lebih dari 45 hari sebelum berangkat: Pengembalian dana 100% dipotong biaya administrasi Rp500.000.
   - 30-44 hari sebelum berangkat: Dikenakan potongan 25% dari total biaya paket.
   - Kurang dari 14 hari sebelum berangkat: Biaya tidak dapat dikembalikan (non-refundable) mengikuti aturan maskapai dan hotel.
4. Bukti transfer pembayaran wajib dikonfirmasikan ke nomor WhatsApp resmi travel.`}
            helperText="Teks ini akan dibaca oleh calon jamaah pada halaman status booking dan konfirmasi pendaftaran."
          />
        </div>

        {/* Footer Aksi */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <DashboardSubmitButton
            isPending={isPending}
            loadingText="Menyimpan..."
            icon={Save}
          >
            Simpan Pengaturan Pembayaran
          </DashboardSubmitButton>
        </div>
      </div>
    </form>
  )
}
