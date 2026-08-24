'use client'

import { useActionState, useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createBooking, CreateBookingState } from './actions'
import { formatRupiah, formatIndonesianDate } from '@/lib/package-helpers'
import {
  SiteInput,
  SiteLabel,
  SiteErrorMessage,
  SiteSubmitButton,
} from '@/components/site/form'
import {
  User,
  BedDouble,
  Calendar,
  UserCheck,
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
  const [state, formAction, isPending] = useActionState(
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
    quadCount * (priceQuad || 0) +
    tripleCount * (priceTriple || 0) +
    doubleCount * (priceDouble || 0)

  const hasAvailableRooms =
    (priceQuad && priceQuad > 0) ||
    (priceTriple && priceTriple > 0) ||
    (priceDouble && priceDouble > 0)

  const selectedDeparture = departures.find((d) => d.id === selectedDepartureId)

  return (
    <form action={formAction} className="space-y-4 sm:space-y-6">
      {/* Hidden inputs untuk quantity pax & selected departure */}
      <input type="hidden" name="quadCount" value={quadCount} />
      <input type="hidden" name="tripleCount" value={tripleCount} />
      <input type="hidden" name="doubleCount" value={doubleCount} />
      {departures.length > 0 && (
        <input type="hidden" name="packageDepartureId" value={selectedDepartureId} />
      )}

      {/* Alert Error dari Server Action */}
      {state.error && (
        <SiteErrorMessage
          title="Gagal Memproses Booking"
          message={state.error}
        />
      )}

      {/* CARD UTAMA BOOKING FORM */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm divide-y divide-stone-100 overflow-hidden">
        {/* SECTION 1: Identitas Kontak Jamaah (URUTAN PERTAMA) */}
        <div className="p-4 sm:p-5 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-brand-600 shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-jakarta text-sm sm:text-base font-bold text-site-text">
                Kontak Pemesan / Penanggung Jawab
              </h3>
              <p className="text-xs text-site-text-muted mt-0.5">
                Data untuk konfirmasi status booking dan komunikasi pihak travel.
              </p>
            </div>
          </div>

          <div className="space-y-3.5 pt-1">
            <div>
              <SiteLabel htmlFor="jamaahName" required>
                Nama Lengkap
              </SiteLabel>
              <SiteInput
                type="text"
                id="jamaahName"
                name="jamaahName"
                required
                placeholder="Sesuai KTP / Paspor"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <SiteLabel htmlFor="jamaahPhone" required>
                  Nomor WhatsApp / HP
                </SiteLabel>
                <SiteInput
                  type="tel"
                  id="jamaahPhone"
                  name="jamaahPhone"
                  required
                  placeholder="08123456789 atau +628123456789"
                />
              </div>

              <div>
                <SiteLabel htmlFor="jamaahEmail" optional>
                  Email
                </SiteLabel>
                <SiteInput
                  type="email"
                  id="jamaahEmail"
                  name="jamaahEmail"
                  placeholder="nama@email.com"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: Jadwal Keberangkatan (URUTAN KEDUA - Custom Dropdown) */}
        {departures.length > 0 && (
          <div className="p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <Calendar className="w-4 h-4 text-brand-600 shrink-0" />
                <h3 className="font-jakarta text-sm sm:text-base font-bold text-site-text truncate">
                  Jadwal Keberangkatan <span className="text-rose-500">*</span>
                </h3>
              </div>
              <span className="text-[11px] sm:text-xs font-medium text-site-text-muted shrink-0 whitespace-nowrap">
                {departures.length} tanggal
              </span>
            </div>

            {/* Custom Dropdown Container */}
            <div ref={dropdownRef} className="relative">
              <button
                type="button"
                id="departure-dropdown-trigger"
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                className="w-full px-3.5 py-3 sm:py-2.5 rounded-xl border border-stone-200 bg-stone-50/40 hover:bg-stone-50 text-left flex items-center justify-between gap-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all cursor-pointer shadow-2xs min-h-[46px]"
              >
                <span className="font-semibold text-site-text truncate">
                  {selectedDeparture
                    ? formatIndonesianDate(selectedDeparture.date, { includeWeekday: true })
                    : 'Pilih Jadwal Keberangkatan'}
                </span>
                <ChevronDown
                  className={`w-4.5 h-4.5 text-stone-400 shrink-0 transition-transform duration-200 ${
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
                        className={`w-full px-3.5 py-2.5 text-left text-sm flex items-center justify-between gap-2 transition-colors cursor-pointer ${
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
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <BedDouble className="w-4 h-4 text-brand-600 shrink-0" />
              <h3 className="font-jakarta text-sm sm:text-base font-bold text-site-text truncate">
                Tipe Kamar & Pax <span className="text-rose-500">*</span>
              </h3>
            </div>
            <span className="text-[11px] sm:text-xs font-semibold text-site-text-muted shrink-0 whitespace-nowrap">
              {totalPax > 0 ? `${totalPax} pax dipilih` : 'Min 1 pax'}
            </span>
          </div>

          {!hasAvailableRooms ? (
            <p className="text-xs sm:text-sm text-rose-600 font-medium">
              Tidak ada tipe kamar yang tersedia untuk paket ini.
            </p>
          ) : (
            <div className="space-y-2.5">
              {/* Kamar Quad */}
              {priceQuad && priceQuad > 0 ? (
                <div className="flex items-center justify-between p-3 sm:p-3.5 rounded-xl border border-stone-200/90 bg-stone-50/50 hover:bg-stone-50 transition-all gap-2">
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-sm sm:text-base text-site-text block">
                      Kamar Quad
                    </span>
                    <div className="text-xs sm:text-sm font-black text-brand-600 mt-0.5 whitespace-nowrap">
                      {formatRupiah(priceQuad)}{' '}
                      <span className="text-[11px] font-normal text-site-text-muted">/ pax</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    <button
                      type="button"
                      data-testid="stepper-quad-minus"
                      onClick={() => setQuadCount((c) => Math.max(0, c - 1))}
                      disabled={quadCount <= 0}
                      className="w-8 h-8 sm:w-8 sm:h-8 rounded-lg bg-white border border-stone-300 hover:bg-stone-100 active:scale-95 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-site-text shadow-2xs transition-all cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span data-testid="count-quad" className="w-5 sm:w-6 text-center font-bold text-sm text-site-text">
                      {quadCount}
                    </span>
                    <button
                      type="button"
                      data-testid="stepper-quad-plus"
                      onClick={() => setQuadCount((c) => c + 1)}
                      className="w-8 h-8 sm:w-8 sm:h-8 rounded-lg bg-brand-600 hover:bg-brand-700 active:scale-95 text-white flex items-center justify-center shadow-xs transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : null}

              {/* Kamar Triple */}
              {priceTriple && priceTriple > 0 ? (
                <div className="flex items-center justify-between p-3 sm:p-3.5 rounded-xl border border-stone-200/90 bg-stone-50/50 hover:bg-stone-50 transition-all gap-2">
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-sm sm:text-base text-site-text block">
                      Kamar Triple
                    </span>
                    <div className="text-xs sm:text-sm font-black text-brand-600 mt-0.5 whitespace-nowrap">
                      {formatRupiah(priceTriple)}{' '}
                      <span className="text-[11px] font-normal text-site-text-muted">/ pax</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    <button
                      type="button"
                      data-testid="stepper-triple-minus"
                      onClick={() => setTripleCount((c) => Math.max(0, c - 1))}
                      disabled={tripleCount <= 0}
                      className="w-8 h-8 sm:w-8 sm:h-8 rounded-lg bg-white border border-stone-300 hover:bg-stone-100 active:scale-95 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-site-text shadow-2xs transition-all cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span data-testid="count-triple" className="w-5 sm:w-6 text-center font-bold text-sm text-site-text">
                      {tripleCount}
                    </span>
                    <button
                      type="button"
                      data-testid="stepper-triple-plus"
                      onClick={() => setTripleCount((c) => c + 1)}
                      className="w-8 h-8 sm:w-8 sm:h-8 rounded-lg bg-brand-600 hover:bg-brand-700 active:scale-95 text-white flex items-center justify-center shadow-xs transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : null}

              {/* Kamar Double */}
              {priceDouble && priceDouble > 0 ? (
                <div className="flex items-center justify-between p-3 sm:p-3.5 rounded-xl border border-stone-200/90 bg-stone-50/50 hover:bg-stone-50 transition-all gap-2">
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-sm sm:text-base text-site-text block">
                      Kamar Double
                    </span>
                    <div className="text-xs sm:text-sm font-black text-brand-600 mt-0.5 whitespace-nowrap">
                      {formatRupiah(priceDouble)}{' '}
                      <span className="text-[11px] font-normal text-site-text-muted">/ pax</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    <button
                      type="button"
                      data-testid="stepper-double-minus"
                      onClick={() => setDoubleCount((c) => Math.max(0, c - 1))}
                      disabled={doubleCount <= 0}
                      className="w-8 h-8 sm:w-8 sm:h-8 rounded-lg bg-white border border-stone-300 hover:bg-stone-100 active:scale-95 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-site-text shadow-2xs transition-all cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span data-testid="count-double" className="w-5 sm:w-6 text-center font-bold text-sm text-site-text">
                      {doubleCount}
                    </span>
                    <button
                      type="button"
                      data-testid="stepper-double-plus"
                      onClick={() => setDoubleCount((c) => c + 1)}
                      className="w-8 h-8 sm:w-8 sm:h-8 rounded-lg bg-brand-600 hover:bg-brand-700 active:scale-95 text-white flex items-center justify-center shadow-xs transition-all cursor-pointer"
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
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors cursor-pointer py-1"
            >
              <UserCheck className="w-4 h-4" />
              <span>Punya kode referral agen?</span>
            </button>
          ) : (
            <div className="space-y-2.5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-brand-600" />
                  <h3 className="font-jakarta text-sm sm:text-base font-bold text-site-text">
                    Kode Referral Agen <span className="text-stone-400 font-normal text-xs sm:text-sm">(Opsional)</span>
                  </h3>
                </div>
                {!initialReferralCode && (
                  <button
                    type="button"
                    onClick={() => setShowReferralInput(false)}
                    className="text-xs font-medium text-site-text-muted hover:text-rose-600 transition-colors cursor-pointer py-1 px-2"
                  >
                    Tutup
                  </button>
                )}
              </div>

              <div>
                <SiteInput
                  type="text"
                  id="referralCode"
                  name="referralCode"
                  defaultValue={initialReferralCode}
                  placeholder={sampleReferralCode}
                  className="font-mono uppercase tracking-wider"
                  helperText="Isi jika Anda mendapatkan rekomendasi dari agen travel kami."
                />
              </div>
            </div>
          )}
        </div>

        {/* SECTION 5: Ringkasan Total & Tombol Submit */}
        <div className="p-4 sm:p-5 bg-stone-50/60 rounded-b-2xl space-y-4">
          {/* Seamless Running Total Summary */}
          <div className="flex items-center justify-between gap-3 pt-0.5 pb-0.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-stone-200/70 flex items-center justify-center text-site-text-muted shrink-0">
                <Users className="w-4 h-4 text-site-text" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-site-text-muted block leading-tight">
                  Jumlah Pax
                </span>
                <span className="text-xs sm:text-sm font-bold text-site-text">
                  {totalPax > 0 ? `${totalPax} pax` : '0 pax'}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-site-text-muted block leading-tight">
                Total Biaya
              </span>
              <span className="font-jakarta text-base sm:text-xl font-black text-brand-600 leading-tight">
                {formatRupiah(totalPrice)}
              </span>
            </div>
          </div>

          <SiteSubmitButton
            disabled={totalPax === 0}
            isPending={isPending}
            loadingText="Memproses Booking..."
            fullWidth
            className="py-4 sm:py-3.5 text-base shadow-md"
          >
            Booking Sekarang
          </SiteSubmitButton>

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
