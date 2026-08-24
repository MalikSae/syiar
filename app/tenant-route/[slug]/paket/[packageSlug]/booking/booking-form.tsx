'use client'

import { useActionState, useEffect, useTransition, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createBooking, CreateBookingState } from './actions'
import { formatRupiah, formatIndonesianDate } from '@/lib/package-helpers'
import {
  User,
  BedDouble,
  Calendar,
  UserCheck,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Plus,
  Minus,
  Users,
  ChevronDown,
  Check,
  Lock,
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
  sampleReferralCode?: string
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
  sampleReferralCode = 'ABCD1234',
}: BookingFormProps) {
  const router = useRouter()
  const [isPending] = useTransition()

  // Stepper quantity per tipe kamar
  const [quadCount, setQuadCount] = useState(0)
  const [tripleCount, setTripleCount] = useState(0)
  const [doubleCount, setDoubleCount] = useState(0)

  // Toggle Progressive Disclosure untuk Kode Referral
  const [showReferralInput, setShowReferralInput] = useState(Boolean(initialReferralCode))

  // Custom Dropdown Jadwal Keberangkatan
  const [selectedDepartureId, setSelectedDepartureId] = useState<string>(
    departures[0]?.id || ''
  )
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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

  const selectedDeparture = departures.find((d) => d.id === selectedDepartureId)

  return (
    <form action={formAction} className="space-y-4 text-left">
      {/* Hidden inputs untuk quantity pax & selected departure */}
      <input type="hidden" name="quadCount" value={quadCount} />
      <input type="hidden" name="tripleCount" value={tripleCount} />
      <input type="hidden" name="doubleCount" value={doubleCount} />
      {departures.length > 0 && (
        <input type="hidden" name="packageDepartureId" value={selectedDepartureId} />
      )}

      {/* Alert Error */}
      {state.error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-800 text-xs sm:text-sm animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Gagal Booking</p>
            <p className="mt-0.5 text-rose-700 leading-relaxed">{state.error}</p>
          </div>
        </div>
      )}

      {/* Unified Seamless Container */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs divide-y divide-stone-100">
        {/* Header Paket Compact */}
        <div className="p-4 sm:p-5 bg-stone-50/70 rounded-t-2xl flex flex-wrap items-center justify-between gap-2">
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-site-text-muted block">
              Paket yang Dipilih
            </span>
            <h2 className="font-jakarta text-base sm:text-lg font-bold text-site-text truncate mt-0.5">
              {packageName}
            </h2>
          </div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-brand-600/10 border border-brand-600/25 text-xs font-bold text-brand-600 shrink-0">
            {duration}
          </span>
        </div>

        {/* SECTION 1: Data Pemesan */}
        <div className="p-4 sm:p-5 space-y-3.5">
          <div className="flex items-center gap-2 pb-1">
            <User className="w-4 h-4 text-brand-600" />
            <h3 className="font-jakarta text-sm font-bold text-site-text">
              Data Pemesan
            </h3>
          </div>

          <div className="space-y-3 text-xs sm:text-sm">
            <div>
              <label
                htmlFor="jamaahName"
                className="block font-bold text-site-text mb-1 text-xs"
              >
                Nama Pemesan <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                id="jamaahName"
                name="jamaahName"
                required
                placeholder="Sesuai KTP / Paspor"
                className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-stone-50/40 text-site-text text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="jamaahPhone"
                  className="block font-bold text-site-text mb-1 text-xs"
                >
                  Nomor WhatsApp / HP <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  id="jamaahPhone"
                  name="jamaahPhone"
                  required
                  placeholder="08123456789 atau +628123456789"
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-stone-50/40 text-site-text text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label
                  htmlFor="jamaahEmail"
                  className="block font-bold text-site-text mb-1 text-xs"
                >
                  Email <span className="text-stone-400 font-normal">(Opsional)</span>
                </label>
                <input
                  type="email"
                  id="jamaahEmail"
                  name="jamaahEmail"
                  placeholder="nama@email.com"
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-stone-50/40 text-site-text text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: Jadwal Keberangkatan (URUTAN KEDUA - Custom Dropdown) */}
        {departures.length > 0 && (
          <div className="p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-brand-600" />
                <h3 className="font-jakarta text-sm font-bold text-site-text">
                  Jadwal Keberangkatan <span className="text-rose-500">*</span>
                </h3>
              </div>
              <span className="text-[11px] font-medium text-site-text-muted">
                {departures.length} tanggal tersedia
              </span>
            </div>

            {/* Custom Dropdown Container */}
            <div ref={dropdownRef} className="relative">
              <button
                type="button"
                id="departure-dropdown-trigger"
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/40 hover:bg-stone-50 text-left flex items-center justify-between gap-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all cursor-pointer shadow-2xs"
              >
                <span className="font-semibold text-site-text truncate">
                  {selectedDeparture
                    ? formatIndonesianDate(selectedDeparture.date, { includeWeekday: true })
                    : 'Pilih Jadwal Keberangkatan'}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-stone-400 shrink-0 transition-transform duration-200 ${
                    isDropdownOpen ? 'rotate-180 text-brand-600' : ''
                  }`}
                />
              </button>

              {/* Dropdown Options List */}
              {isDropdownOpen && (
                <div className="absolute z-30 mt-1.5 w-full bg-white rounded-xl border border-stone-200 shadow-xl overflow-hidden py-1 max-h-60 overflow-y-auto animate-in fade-in-50 zoom-in-95 duration-150">
                  {departures.map((dep) => {
                    const isSelected = dep.id === selectedDepartureId
                    const dateFormatted = formatIndonesianDate(dep.date, { includeWeekday: true })

                    return (
                      <button
                        key={dep.id}
                        type="button"
                        onClick={() => {
                          setSelectedDepartureId(dep.id)
                          setIsDropdownOpen(false)
                        }}
                        className={`w-full px-3.5 py-2.5 text-left text-xs sm:text-sm flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-brand-50/80 text-brand-700 font-bold'
                            : 'text-site-text hover:bg-stone-50 font-medium'
                        }`}
                      >
                        <span>{dateFormatted}</span>
                        {isSelected && <Check className="w-4 h-4 text-brand-600 shrink-0" />}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* SECTION 3: Pilihan Tipe Kamar & Jumlah Pax (URUTAN KETIGA) */}
        <div className="p-4 sm:p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-1.5">
            <div className="flex items-center gap-2 min-w-0">
              <BedDouble className="w-4 h-4 text-brand-600 shrink-0" />
              <h3 className="font-jakarta text-sm font-bold text-site-text">
                Pilih Tipe Kamar & Jumlah Pax <span className="text-rose-500">*</span>
              </h3>
            </div>
            <span className="text-[11px] font-semibold text-site-text-muted shrink-0">
              {totalPax > 0 ? `${totalPax} pax dipilih` : 'Min 1 pax'}
            </span>
          </div>

          {!hasAvailableRooms ? (
            <p className="text-xs text-rose-600 font-medium">
              Tidak ada tipe kamar yang tersedia untuk paket ini.
            </p>
          ) : (
            <div className="space-y-2">
              {/* Kamar Quad */}
              {priceQuad && priceQuad > 0 ? (
                <div className="flex items-center justify-between p-3 rounded-xl border border-stone-200/90 bg-stone-50/50 hover:bg-stone-50 transition-all gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-xs sm:text-sm text-site-text">Kamar Quad</span>
                      <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded-md bg-stone-200/70 text-stone-600">
                        4 pax/kamar
                      </span>
                    </div>
                    <div className="text-xs sm:text-sm font-black text-brand-600 mt-0.5">
                      {formatRupiah(priceQuad)}{' '}
                      <span className="text-[10px] font-normal text-site-text-muted">/ pax</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      data-testid="stepper-quad-minus"
                      onClick={() => setQuadCount((c) => Math.max(0, c - 1))}
                      disabled={quadCount <= 0}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white border border-stone-300 hover:bg-stone-100 active:scale-95 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-site-text shadow-2xs transition-all cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span data-testid="count-quad" className="w-6 text-center font-bold text-xs sm:text-sm text-site-text">
                      {quadCount}
                    </span>
                    <button
                      type="button"
                      data-testid="stepper-quad-plus"
                      onClick={() => setQuadCount((c) => c + 1)}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-brand-600 hover:bg-brand-700 active:scale-95 text-white flex items-center justify-center shadow-xs transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : null}

              {/* Kamar Triple */}
              {priceTriple && priceTriple > 0 ? (
                <div className="flex items-center justify-between p-3 rounded-xl border border-stone-200/90 bg-stone-50/50 hover:bg-stone-50 transition-all gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-xs sm:text-sm text-site-text">Kamar Triple</span>
                      <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded-md bg-stone-200/70 text-stone-600">
                        3 pax/kamar
                      </span>
                    </div>
                    <div className="text-xs sm:text-sm font-black text-brand-600 mt-0.5">
                      {formatRupiah(priceTriple)}{' '}
                      <span className="text-[10px] font-normal text-site-text-muted">/ pax</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      data-testid="stepper-triple-minus"
                      onClick={() => setTripleCount((c) => Math.max(0, c - 1))}
                      disabled={tripleCount <= 0}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white border border-stone-300 hover:bg-stone-100 active:scale-95 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-site-text shadow-2xs transition-all cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span data-testid="count-triple" className="w-6 text-center font-bold text-xs sm:text-sm text-site-text">
                      {tripleCount}
                    </span>
                    <button
                      type="button"
                      data-testid="stepper-triple-plus"
                      onClick={() => setTripleCount((c) => c + 1)}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-brand-600 hover:bg-brand-700 active:scale-95 text-white flex items-center justify-center shadow-xs transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : null}

              {/* Kamar Double */}
              {priceDouble && priceDouble > 0 ? (
                <div className="flex items-center justify-between p-3 rounded-xl border border-stone-200/90 bg-stone-50/50 hover:bg-stone-50 transition-all gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-xs sm:text-sm text-site-text">Kamar Double</span>
                      <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded-md bg-stone-200/70 text-stone-600">
                        2 pax/kamar
                      </span>
                    </div>
                    <div className="text-xs sm:text-sm font-black text-brand-600 mt-0.5">
                      {formatRupiah(priceDouble)}{' '}
                      <span className="text-[10px] font-normal text-site-text-muted">/ pax</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      data-testid="stepper-double-minus"
                      onClick={() => setDoubleCount((c) => Math.max(0, c - 1))}
                      disabled={doubleCount <= 0}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white border border-stone-300 hover:bg-stone-100 active:scale-95 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-site-text shadow-2xs transition-all cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span data-testid="count-double" className="w-6 text-center font-bold text-xs sm:text-sm text-site-text">
                      {doubleCount}
                    </span>
                    <button
                      type="button"
                      data-testid="stepper-double-plus"
                      onClick={() => setDoubleCount((c) => c + 1)}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-brand-600 hover:bg-brand-700 active:scale-95 text-white flex items-center justify-center shadow-xs transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* SECTION 4: Kode Referral Agen (Progressive Disclosure) */}
        <div className="p-4 sm:p-5">
          {!showReferralInput ? (
            <button
              type="button"
              onClick={() => setShowReferralInput(true)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Punya kode referral agen?</span>
            </button>
          ) : (
            <div className="space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-brand-600" />
                  <h3 className="font-jakarta text-sm font-bold text-site-text">
                    Kode Referral Agen <span className="text-stone-400 font-normal">(Opsional)</span>
                  </h3>
                </div>
                {!initialReferralCode && (
                  <button
                    type="button"
                    onClick={() => setShowReferralInput(false)}
                    className="text-[11px] font-medium text-site-text-muted hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    Tutup
                  </button>
                )}
              </div>

              <div>
                <input
                  type="text"
                  id="referralCode"
                  name="referralCode"
                  defaultValue={initialReferralCode}
                  placeholder={sampleReferralCode}
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-stone-50/40 text-site-text font-mono uppercase tracking-wider text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                />
                <p className="text-[11px] text-site-text-muted mt-1">
                  Isi jika Anda mendapatkan rekomendasi dari agen travel kami.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 5: Ringkasan Total & Tombol Submit */}
        <div className="p-4 sm:p-5 bg-stone-50/60 rounded-b-2xl space-y-3.5">
          {/* Live Running Total Bar */}
          <div className="p-3 rounded-xl bg-brand-50/80 border border-brand-200/70 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-site-text">
              <Users className="w-4 h-4 text-brand-600 shrink-0" />
              <span>Total:</span>
              <span className="font-bold text-brand-700">{totalPax} pax</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-site-text-muted block leading-none mb-0.5">
                Total Biaya
              </span>
              <span className="font-jakarta text-sm sm:text-base font-black text-brand-700 leading-tight">
                {formatRupiah(totalPrice)}
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending || totalPax === 0}
            className="w-full py-3.5 px-6 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm sm:text-base shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memproses Booking...</span>
              </>
            ) : (
              <span>Booking Sekarang</span>
            )}
          </button>

          {/* Micro-copy Penenang */}
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-site-text-muted text-center pt-0.5">
            <Lock className="w-3 h-3 text-emerald-600 shrink-0" />
            <span>Booking aman & terhubung langsung ke travel resmi</span>
          </div>

          <div className="text-center pt-1">
            <Link
              href={`/paket/${packageSlug}`}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-site-text-muted hover:text-brand-600 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Detail Paket</span>
            </Link>
          </div>
        </div>
      </div>
    </form>
  )
}
