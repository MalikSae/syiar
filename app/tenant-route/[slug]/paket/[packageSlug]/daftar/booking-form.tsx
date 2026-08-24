'use client'

import { useActionState, useEffect, useTransition, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createBooking, CreateBookingState } from './actions'
import { formatRupiah, formatDepartureChipDate } from '@/lib/package-helpers'
import {
  User,
  Phone,
  Mail,
  BedDouble,
  Calendar,
  Ticket,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Plus,
  Minus,
  Users,
} from 'lucide-react'

interface DepartureOption {
  id: string
  date: Date | string
}

interface BookingFormProps {
  slug: string
  packageSlug: string
  packageName: string
  duration: string
  priceQuad: number | null
  priceTriple: number | null
  priceDouble: number | null
  departures: DepartureOption[]
  initialReferralCode?: string
}

export function BookingForm({
  slug,
  packageSlug,
  packageName,
  duration,
  priceQuad,
  priceTriple,
  priceDouble,
  departures,
  initialReferralCode = '',
}: BookingFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // Stepper quantity per tipe kamar
  const [quadCount, setQuadCount] = useState(0)
  const [tripleCount, setTripleCount] = useState(0)
  const [doubleCount, setDoubleCount] = useState(0)

  const initialState: CreateBookingState = {}
  const [state, formAction] = useActionState(
    createBooking.bind(null, slug, packageSlug),
    initialState
  )

  // Auto-scroll ke atas setelah submit (AGENTS.md Bagian 8e)
  useEffect(() => {
    if (state.error || state.success) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    if (state.success && state.redirectUrl) {
      router.push(state.redirectUrl)
    }
  }, [state, router])

  // Hitung running total pax & harga
  const totalPax = quadCount + tripleCount + doubleCount
  const totalPrice =
    quadCount * (priceQuad ?? 0) +
    tripleCount * (priceTriple ?? 0) +
    doubleCount * (priceDouble ?? 0)

  const hasAvailableRooms =
    (priceQuad && priceQuad > 0) ||
    (priceTriple && priceTriple > 0) ||
    (priceDouble && priceDouble > 0)

  return (
    <form action={formAction} className="space-y-6 text-left">
      {/* Hidden inputs untuk quantity pax */}
      <input type="hidden" name="quadCount" value={quadCount} />
      <input type="hidden" name="tripleCount" value={tripleCount} />
      <input type="hidden" name="doubleCount" value={doubleCount} />

      {/* Alert Error */}
      {state.error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-xs sm:text-sm animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Gagal Mendaftar</p>
            <p className="mt-0.5 text-rose-700 leading-relaxed">{state.error}</p>
          </div>
        </div>
      )}

      {/* Ringkasan Singkat Paket */}
      <div className="p-4 sm:p-5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-site-text-muted block">
          Paket yang Dipilih
        </span>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-jakarta text-lg sm:text-xl font-bold text-site-text">
            {packageName}
          </h2>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand-600/10 border border-brand-600/30 text-xs font-bold text-brand-600">
            {duration}
          </span>
        </div>
      </div>

      {/* Bagian 1: Data Pemesan */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-5 sm:p-6 shadow-xs space-y-5">
        <h3 className="font-jakarta text-base font-bold text-site-text border-b border-stone-100 pb-3 flex items-center gap-2">
          <User className="w-4 h-4 text-brand-500" />
          <span>Data Pemesan</span>
        </h3>

        <div className="space-y-4 text-xs sm:text-sm">
          <div>
            <label
              htmlFor="jamaahName"
              className="block font-bold text-site-text mb-1.5"
            >
              Nama Pemesan <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                id="jamaahName"
                name="jamaahName"
                required
                placeholder="Sesuai KTP / Paspor"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-site-text focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="jamaahPhone"
              className="block font-bold text-site-text mb-1.5"
            >
              Nomor WhatsApp / HP <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="tel"
                id="jamaahPhone"
                name="jamaahPhone"
                required
                placeholder="Contoh: 08123456789 atau +628123456789"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-site-text focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
              />
            </div>
            <p className="text-[11px] text-site-text-muted mt-1">
              Digunakan untuk konfirmasi pendaftaran & instruksi pembayaran.
            </p>
          </div>

          <div>
            <label
              htmlFor="jamaahEmail"
              className="block font-bold text-site-text mb-1.5"
            >
              Email <span className="text-stone-400 font-normal">(Opsional)</span>
            </label>
            <div className="relative">
              <input
                type="email"
                id="jamaahEmail"
                name="jamaahEmail"
                placeholder="nama@email.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-site-text focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bagian 2: Pilihan Tipe Kamar & Jumlah Jamaah (Quantity Steppers) */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <h3 className="font-jakarta text-base font-bold text-site-text flex items-center gap-2">
            <BedDouble className="w-4 h-4 text-brand-500" />
            <span>Pilih Tipe Kamar & Jumlah Jamaah <span className="text-rose-500">*</span></span>
          </h3>
          <span className="text-xs font-semibold text-site-text-muted">
            {totalPax > 0 ? `${totalPax} pax dipilih` : 'Pilih kuota'}
          </span>
        </div>

        {!hasAvailableRooms ? (
          <p className="text-xs text-rose-600 font-medium">
            Tidak ada tipe kamar yang tersedia untuk paket ini.
          </p>
        ) : (
          <div className="space-y-3">
            {/* Kamar Quad */}
            {priceQuad && priceQuad > 0 ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-stone-200/90 bg-stone-50/60 hover:bg-stone-50 transition-all gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-site-text">Kamar Quad</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stone-200/70 text-stone-700">
                      4 orang / kamar
                    </span>
                  </div>
                  <div className="text-sm font-black text-brand-600 mt-1">
                    {formatRupiah(priceQuad)}{' '}
                    <span className="text-xs font-normal text-site-text-muted">/ orang</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <button
                    type="button"
                    data-testid="stepper-quad-minus"
                    onClick={() => setQuadCount((c) => Math.max(0, c - 1))}
                    disabled={quadCount <= 0}
                    className="w-9 h-9 rounded-lg bg-white border border-stone-300 hover:bg-stone-100 active:scale-95 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-site-text shadow-2xs transition-all cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span data-testid="count-quad" className="w-8 text-center font-bold text-base text-site-text">
                    {quadCount}
                  </span>
                  <button
                    type="button"
                    data-testid="stepper-quad-plus"
                    onClick={() => setQuadCount((c) => c + 1)}
                    className="w-9 h-9 rounded-lg bg-brand-600 hover:bg-brand-700 active:scale-95 text-white flex items-center justify-center shadow-xs transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : null}

            {/* Kamar Triple */}
            {priceTriple && priceTriple > 0 ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-stone-200/90 bg-stone-50/60 hover:bg-stone-50 transition-all gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-site-text">Kamar Triple</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stone-200/70 text-stone-700">
                      3 orang / kamar
                    </span>
                  </div>
                  <div className="text-sm font-black text-brand-600 mt-1">
                    {formatRupiah(priceTriple)}{' '}
                    <span className="text-xs font-normal text-site-text-muted">/ orang</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <button
                    type="button"
                    data-testid="stepper-triple-minus"
                    onClick={() => setTripleCount((c) => Math.max(0, c - 1))}
                    disabled={tripleCount <= 0}
                    className="w-9 h-9 rounded-lg bg-white border border-stone-300 hover:bg-stone-100 active:scale-95 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-site-text shadow-2xs transition-all cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span data-testid="count-triple" className="w-8 text-center font-bold text-base text-site-text">
                    {tripleCount}
                  </span>
                  <button
                    type="button"
                    data-testid="stepper-triple-plus"
                    onClick={() => setTripleCount((c) => c + 1)}
                    className="w-9 h-9 rounded-lg bg-brand-600 hover:bg-brand-700 active:scale-95 text-white flex items-center justify-center shadow-xs transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : null}

            {/* Kamar Double */}
            {priceDouble && priceDouble > 0 ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-stone-200/90 bg-stone-50/60 hover:bg-stone-50 transition-all gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-site-text">Kamar Double</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stone-200/70 text-stone-700">
                      2 orang / kamar
                    </span>
                  </div>
                  <div className="text-sm font-black text-brand-600 mt-1">
                    {formatRupiah(priceDouble)}{' '}
                    <span className="text-xs font-normal text-site-text-muted">/ orang</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <button
                    type="button"
                    data-testid="stepper-double-minus"
                    onClick={() => setDoubleCount((c) => Math.max(0, c - 1))}
                    disabled={doubleCount <= 0}
                    className="w-9 h-9 rounded-lg bg-white border border-stone-300 hover:bg-stone-100 active:scale-95 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-site-text shadow-2xs transition-all cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span data-testid="count-double" className="w-8 text-center font-bold text-base text-site-text">
                    {doubleCount}
                  </span>
                  <button
                    type="button"
                    data-testid="stepper-double-plus"
                    onClick={() => setDoubleCount((c) => c + 1)}
                    className="w-9 h-9 rounded-lg bg-brand-600 hover:bg-brand-700 active:scale-95 text-white flex items-center justify-center shadow-xs transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* Live Running Total Summary Box */}
        <div className="p-4 rounded-xl bg-brand-50/70 border border-brand-200/80 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-site-text">
            <Users className="w-4 h-4 text-brand-600 shrink-0" />
            <span>Total Jamaah:</span>
            <span className="font-bold text-brand-700">{totalPax} pax</span>
          </div>
          <div className="text-right">
            <span className="text-xs text-site-text-muted block">Estimasi Total Biaya</span>
            <span className="font-jakarta text-base sm:text-lg font-black text-brand-700">
              {formatRupiah(totalPrice)}
            </span>
          </div>
        </div>
      </div>

      {/* Bagian 3: Tanggal Keberangkatan (HANYA jika ada jadwal aktif) */}
      {departures.length > 0 && (
        <div className="bg-white rounded-2xl border border-stone-200/80 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h3 className="font-jakarta text-base font-bold text-site-text flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-500" />
              <span>Jadwal Keberangkatan <span className="text-rose-500">*</span></span>
            </h3>
            <span className="text-xs font-semibold text-site-text-muted">
              {departures.length} pilihan
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {departures.map((dep, idx) => {
              const formatted = formatDepartureChipDate(dep.date)
              return (
                <label
                  key={dep.id}
                  className="relative flex flex-col p-3 rounded-xl border border-stone-200 bg-stone-50/60 hover:bg-stone-50 cursor-pointer transition-all has-checked:border-brand-600 has-checked:bg-brand-600/5 has-checked:ring-2 has-checked:ring-brand-500/30 text-center"
                >
                  <input
                    type="radio"
                    name="packageDepartureId"
                    value={dep.id}
                    defaultChecked={idx === 0}
                    required
                    className="sr-only"
                  />
                  <span className="text-xs sm:text-sm font-bold text-site-text">
                    {formatted.dayMonth}
                  </span>
                  <span className="text-[10px] text-site-text-muted font-medium mt-0.5">
                    {formatted.subtext}
                  </span>
                </label>
              )
            })}
          </div>
        </div>
      )}

      {/* Bagian 4: Kode Referral */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-5 sm:p-6 shadow-xs space-y-4">
        <h3 className="font-jakarta text-base font-bold text-site-text border-b border-stone-100 pb-3 flex items-center gap-2">
          <Ticket className="w-4 h-4 text-brand-500" />
          <span>Kode Referral Agen</span>
        </h3>

        <div>
          <label
            htmlFor="referralCode"
            className="block text-xs font-bold text-site-text mb-1.5"
          >
            Kode Referral <span className="text-stone-400 font-normal">(Opsional)</span>
          </label>
          <input
            type="text"
            id="referralCode"
            name="referralCode"
            defaultValue={initialReferralCode}
            placeholder="CONTOH: AHMA1344"
            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-site-text font-mono uppercase tracking-wider focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all text-xs sm:text-sm"
          />
          <p className="text-[11px] text-site-text-muted mt-1">
            Isi jika Anda direkomendasikan oleh perwakilan/agen travel kami.
          </p>
        </div>
      </div>

      {/* Tombol Submit */}
      <div className="pt-2 space-y-3">
        <button
          type="submit"
          disabled={isPending || totalPax === 0}
          className="w-full py-4 px-6 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm sm:text-base shadow-lg shadow-brand-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          {isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Memproses Booking...</span>
            </>
          ) : (
            <span>Konfirmasi & Buat Booking</span>
          )}
        </button>

        <div className="text-center">
          <Link
            href={`/paket/${packageSlug}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-site-text-muted hover:text-brand-600 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Detail Paket</span>
          </Link>
        </div>
      </div>
    </form>
  )
}
