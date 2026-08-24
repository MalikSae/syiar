'use client'

import React, { useState, useMemo, useEffect } from 'react'
import {
  SiteInput,
  SiteTextarea,
  SiteSelect,
  SiteLabel,
  SiteHelperText,
  SiteErrorMessage,
  SiteSubmitButton,
} from '@/components/site/form'
import { SiteModal } from '@/components/site/site-modal'
import { getSitePalette } from '@/lib/color-utils'
import {
  Palette,
  Sliders,
  Sparkles,
  Layers,
  User,
  Phone,
  Mail,
  Calendar,
  Lock,
  BedDouble,
  Check,
  CheckCircle2,
  AlertCircle,
  FileText,
  RotateCcw,
  ExternalLink,
  Plane,
  Hotel,
  ShieldCheck,
} from 'lucide-react'

const COLOR_PRESETS = [
  { name: 'Oranye Syiar (Default)', hex: '#F38020' },
  { name: 'Biru Royal', hex: '#2563EB' },
  { name: 'Ungu Elegan', hex: '#7C3AED' },
  { name: 'Hijau Zamzam', hex: '#059669' },
  { name: 'Merah Marun', hex: '#B91C1C' },
  { name: 'Teal Modern', hex: '#0D9488' },
]

export default function DesignTravelShowcasePage() {
  const [accentColor, setAccentColor] = useState('#F38020')
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Generate real-time derived palette
  const palette = useMemo(() => {
    return getSitePalette(accentColor)
  }, [accentColor])

  useEffect(() => {
    document.documentElement.style.setProperty('--site-accent', palette.accent)
    document.documentElement.style.setProperty('--site-accent-soft', palette.accentSoft)
    document.documentElement.style.setProperty('--site-bg', palette.bg)
    document.documentElement.style.setProperty('--site-dark', palette.dark)
    return () => {
      document.documentElement.style.removeProperty('--site-accent')
      document.documentElement.style.removeProperty('--site-accent-soft')
      document.documentElement.style.removeProperty('--site-bg')
      document.documentElement.style.removeProperty('--site-dark')
    }
  }, [palette])

  // State untuk form interaktif
  const [bookingData, setBookingData] = useState({
    jamaahName: 'Ahmad Dahlan',
    jamaahPhone: '081298765432',
    jamaahEmail: 'ahmad.dahlan@email.com',
    referralCode: 'AGENUSTADZ01',
    tipeKamar: 'quad',
    keberangkatan: 'ramadhan_awal',
    catatan: 'Mohon dibantu kursi roda untuk lansia saat thawaf dan sai.',
  })

  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSimulateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setFormSuccess(null)
    setIsSubmitting(true)

    setTimeout(() => {
      setIsSubmitting(false)
      if (!bookingData.jamaahName.trim()) {
        setFormError('Nama lengkap pemesan wajib diisi sesuai KTP/Paspor!')
      } else {
        setFormSuccess('Pemesanan paket umroh berhasil dikirim ke travel!')
      }
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 1200)
  }

  // Dropdown options
  const roomOptions = [
    { value: 'quad', label: 'Kamar Quad (Sekamar Berempat)', description: 'Termasuk paket dasar - Rp 28.500.000 / pax' },
    { value: 'triple', label: 'Kamar Triple (Sekamar Bertiga)', description: 'Tambahan +Rp 2.000.000 / pax' },
    { value: 'double', label: 'Kamar Double (Sekamar Berdua)', description: 'Tambahan +Rp 4.500.000 / pax' },
  ]

  const departureOptions = [
    { value: 'ramadhan_awal', label: '10 Ramadhan 1447H (15 Maret 2026)', description: 'Sisa Kuota: 8 Pax' },
    { value: 'ramadhan_tengah', label: '17 Ramadhan 1447H (22 Maret 2026)', description: 'Sisa Kuota: 14 Pax' },
    { value: 'itikaf_akhir', label: '21 Ramadhan 1447H (26 Maret 2026) - Lailatul Qadr', description: 'Sisa Kuota: 3 Pax' },
  ]

  // Dynamic CSS Variables applied to page container
  const containerStyle = {
    '--site-accent': palette.accent,
    '--site-accent-soft': palette.accentSoft,
    '--site-bg': palette.bg,
    '--site-dark': palette.dark,
    '--site-text': '#1C1917',
    '--site-text-muted': '#78716C',
  } as React.CSSProperties

  const dynamicBadgeStyle = {
    backgroundColor: 'color-mix(in srgb, var(--site-accent, #F38020) 10%, transparent)',
    borderColor: 'color-mix(in srgb, var(--site-accent, #F38020) 25%, transparent)',
    color: 'var(--site-accent, #F38020)',
  }

  return (
    <div
      style={containerStyle}
      className="min-h-screen bg-stone-100/80 text-site-text font-sans py-10 px-4 sm:px-6 lg:px-8 transition-colors"
    >
      <div className="max-w-5xl mx-auto space-y-10">
        {/* ===================================================================
            TOP CONTROL BAR: INTERACTIVE LIVE COLOR PICKER
           =================================================================== */}
        <div className="bg-white rounded-xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-100 pb-5">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-100 border border-stone-200 text-stone-700 text-xs font-bold uppercase tracking-wider font-jakarta">
                <Palette className="w-3.5 h-3.5" style={{ color: 'var(--site-accent)' }} />
                <span>Design System B (Microsite Tenant)</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-site-text tracking-tight font-jakarta">
                Koleksi Komponen Form Microsite
              </h1>
              <p className="text-xs sm:text-sm text-site-text-muted max-w-2xl font-sans">
                Komponen formulir publik tenant (Pendaftaran Jamaah & Agen) dengan palet dinamis <code className="font-bold font-mono" style={{ color: 'var(--site-accent)' }}>--site-accent</code>, nuansa netral <code className="text-stone-700 font-mono">stone-*</code>, dan font modern <code className="text-stone-700 font-mono">font-jakarta</code>.
              </p>
            </div>

            <div className="text-xs text-stone-400 font-mono bg-stone-50 px-3 py-2 rounded-lg border border-stone-200 shrink-0">
              components/site/
            </div>
          </div>

          {/* Color Switcher Controls */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-site-text font-jakarta flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" style={{ color: 'var(--site-accent)' }} />
                <span>Ubah Warna Brand Travel (Live Preview)</span>
              </span>
              <span className="text-xs text-site-text-muted font-mono font-bold">
                Aktif: {accentColor}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Presets */}
              {COLOR_PRESETS.map((preset) => {
                const isActive = preset.hex.toLowerCase() === accentColor.toLowerCase()
                return (
                  <button
                    key={preset.hex}
                    type="button"
                    onClick={() => setAccentColor(preset.hex)}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                      isActive
                        ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                        : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full border border-black/10 shrink-0"
                      style={{ backgroundColor: preset.hex }}
                    />
                    <span>{preset.name}</span>
                  </button>
                )
              })}

              {/* Custom Color Input */}
              <div className="flex items-center gap-2 pl-2 border-l border-stone-200">
                <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-stone-300 shadow-2xs shrink-0 cursor-pointer">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="absolute inset-0 w-[150%] h-[150%] -top-1 -left-1 cursor-pointer border-0 p-0"
                    title="Pilih warna kustom"
                  />
                </div>
                <input
                  type="text"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  maxLength={7}
                  className="w-24 px-2.5 py-1.5 font-mono text-xs font-bold text-site-text bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 uppercase"
                  style={{ '--tw-ring-color': 'var(--site-accent)' } as React.CSSProperties}
                />
              </div>

              {accentColor !== '#F38020' && (
                <button
                  type="button"
                  onClick={() => setAccentColor('#F38020')}
                  className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                  title="Reset ke default"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ===================================================================
            SECTION 1: ATOMIC COMPONENT STATES SHOWCASE
           =================================================================== */}
        <div className="space-y-6">
          <div className="border-b border-stone-200 pb-3">
            <h2 className="text-lg font-bold text-site-text flex items-center gap-2 font-jakarta">
              <Sliders className="w-5 h-5" style={{ color: 'var(--site-accent)' }} />
              <span>1. Showcase Varian & State Atomik</span>
            </h2>
            <p className="text-xs text-site-text-muted">
              Evaluasi visual komponen Sistem B dengan warna aksen aktif yang bereaksi secara real-time.
            </p>
          </div>

          {/* Grid Varian Input */}
          <div className="bg-white rounded-xl p-6 border border-stone-200 shadow-xs space-y-6">
            <h3 className="text-sm font-bold text-site-text border-b border-stone-100 pb-2 font-jakarta">
              A. SiteInput & SiteLabel States
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* 1. Normal Kosong */}
              <div>
                <SiteLabel htmlFor="site-demo-empty">
                  Input Kosong (Default)
                </SiteLabel>
                <SiteInput
                  id="site-demo-empty"
                  placeholder="Contoh: Nama Lengkap"
                  helperText="Keterangan kecil standar pada microsite."
                />
              </div>

              {/* 2. Terisi dengan Icon Kiri */}
              <div>
                <SiteLabel htmlFor="site-demo-icon" required>
                  Dengan Icon Kiri
                </SiteLabel>
                <SiteInput
                  id="site-demo-icon"
                  icon={User}
                  defaultValue="Ahmad Dahlan"
                />
              </div>

              {/* 3. Prefix Nominal */}
              <div>
                <SiteLabel htmlFor="site-demo-prefix" optional>
                  Dengan Prefix Nominal
                </SiteLabel>
                <SiteInput
                  id="site-demo-prefix"
                  prefixText="Rp"
                  defaultValue="28.500.000"
                  className="font-mono font-bold"
                />
              </div>

              {/* 4. State Error */}
              <div>
                <SiteLabel htmlFor="site-demo-error" required>
                  State Error Validasi
                </SiteLabel>
                <SiteInput
                  id="site-demo-error"
                  icon={Mail}
                  defaultValue="email-salah@"
                  hasError
                  errorMessage="Format email tidak valid!"
                />
              </div>

              {/* 5. State Disabled / Readonly */}
              <div>
                <SiteLabel
                  htmlFor="site-demo-disabled"
                  badge={
                    <span className="text-[10px] font-semibold text-stone-400 flex items-center gap-1 font-sans">
                      <Lock className="w-3 h-3 text-stone-400" /> Terkunci
                    </span>
                  }
                >
                  Disabled / Read-Only
                </SiteLabel>
                <SiteInput
                  id="site-demo-disabled"
                  disabled
                  defaultValue="PAKET-RAMADHAN-2026"
                  helperText="Kode paket terkunci dari sistem."
                />
              </div>

              {/* 6. Phone Mono */}
              <div>
                <SiteLabel htmlFor="site-demo-phone">
                  Nomor Telepon WhatsApp
                </SiteLabel>
                <SiteInput
                  id="site-demo-phone"
                  icon={Phone}
                  defaultValue="081234567890"
                  className="font-mono"
                />
              </div>
            </div>
          </div>

          {/* Grid Varian Dropdown / Select (KOMPONEN BARU) */}
          <div className="bg-white rounded-xl p-6 border border-stone-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <h3 className="text-sm font-bold text-site-text font-jakarta">
                B. Custom Field Dropdown (SiteSelect)
              </h3>
              <span
                style={dynamicBadgeStyle}
                className="text-[11px] font-bold px-2 py-0.5 rounded-md border"
              >
                Baru Ditambahkan
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 1. Normal Dropdown */}
              <div>
                <SiteLabel htmlFor="site-demo-select-1" required>
                  Pilihan Tipe Kamar
                </SiteLabel>
                <SiteSelect
                  id="site-demo-select-1"
                  options={roomOptions}
                  defaultValue="quad"
                  helperText="Kapasitas sekamar mempengaruhi total biaya."
                />
              </div>

              {/* 2. Dropdown dengan Icon Jadwal */}
              <div>
                <SiteLabel htmlFor="site-demo-select-2" required>
                  Jadwal Keberangkatan
                </SiteLabel>
                <SiteSelect
                  id="site-demo-select-2"
                  icon={Calendar}
                  options={departureOptions}
                  defaultValue="ramadhan_awal"
                />
              </div>

              {/* 3. Dropdown Error State */}
              <div>
                <SiteLabel htmlFor="site-demo-select-3" required>
                  State Error Validasi
                </SiteLabel>
                <SiteSelect
                  id="site-demo-select-3"
                  options={departureOptions}
                  placeholder="Pilih tanggal berangkat..."
                  hasError
                  errorMessage="Jadwal keberangkatan wajib ditentukan!"
                />
              </div>
            </div>
          </div>

          {/* Grid Varian Textarea */}
          <div className="bg-white rounded-xl p-6 border border-stone-200 shadow-xs space-y-6">
            <h3 className="text-sm font-bold text-site-text border-b border-stone-100 pb-2 font-jakarta">
              C. SiteTextarea States
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <SiteLabel htmlFor="site-demo-ta-1">
                  Textarea Normal
                </SiteLabel>
                <SiteTextarea
                  id="site-demo-ta-1"
                  rows={3}
                  placeholder="Catatan permintaan khusus jamaah..."
                  helperText="Contoh: Permintaan menu khusus, kamar dekat lift."
                />
              </div>

              <div>
                <SiteLabel htmlFor="site-demo-ta-2" required>
                  Textarea Error
                </SiteLabel>
                <SiteTextarea
                  id="site-demo-ta-2"
                  rows={3}
                  defaultValue="Pendek"
                  hasError
                  errorMessage="Penjelasan catatan minimal 15 karakter."
                />
              </div>

              <div>
                <SiteLabel htmlFor="site-demo-ta-3">
                  Textarea Disabled
                </SiteLabel>
                <SiteTextarea
                  id="site-demo-ta-3"
                  rows={3}
                  disabled
                  defaultValue="Syarat & ketentuan pendaftaran telah disetujui."
                />
              </div>
            </div>
          </div>

          {/* Grid Varian Error Message Banner & Buttons & MODAL TRIGGER */}
          <div className="bg-white rounded-xl p-6 border border-stone-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <h3 className="text-sm font-bold text-site-text font-jakarta">
                D. SiteErrorMessage (Standar Merah), Buttons & Custom Modal
              </h3>
              <span
                style={dynamicBadgeStyle}
                className="text-[11px] font-bold px-2 py-0.5 rounded-md border"
              >
                Modal Baru
              </span>
            </div>

            <div className="space-y-4">
              {/* Bukti Koreksi Warna Merah Standar (bukan rose) */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
                  Pesan Error (Warna Merah Tetap Standar - Tidak Mengikuti Brand):
                </span>
                <SiteErrorMessage
                  title="Gagal Memproses Pemesanan"
                  message="Terjadi kendala pada jadwal keberangkatan yang dipilih. Kuota kamar Quad telah habis."
                />
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <SiteSubmitButton icon={Plane}>
                  Booking Sekarang
                </SiteSubmitButton>

                <SiteSubmitButton isPending loadingText="Memproses...">
                  Booking
                </SiteSubmitButton>

                <SiteSubmitButton disabled>
                  Tombol Dinonaktifkan
                </SiteSubmitButton>

                {/* MODAL TRIGGER BUTTON */}
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="px-5 py-3 sm:py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-sm rounded-lg transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer font-jakarta min-h-[46px] sm:min-h-[40px]"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Buka Contoh Modal Microsite</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ===================================================================
            SECTION 2: CONTOH FORMULIR LENGKAP TERINTEGRASI
           =================================================================== */}
        <div className="space-y-4">
          <div className="border-b border-stone-200 pb-3">
            <h2 className="text-lg font-bold text-site-text flex items-center gap-2 font-jakarta">
              <Sparkles className="w-5 h-5" style={{ color: 'var(--site-accent)' }} />
              <span>2. Simulasi Form Pendaftaran Booking Lengkap</span>
            </h2>
            <p className="text-xs text-site-text-muted font-sans">
              Contoh nyata implementasi komponen Sistem B pada alur pendaftaran jamaah paket umroh.
            </p>
          </div>

          <form onSubmit={handleSimulateSubmit} className="space-y-6">
            {/* Feedback Alerts */}
            {formSuccess && (
              <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start gap-3 animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold font-jakarta">Pemesanan Terkirim!</p>
                  <p className="text-xs sm:text-sm text-emerald-700 mt-0.5 font-sans">
                    {formSuccess}
                  </p>
                </div>
              </div>
            )}

            {formError && (
              <SiteErrorMessage
                title="Peringatan Pendaftaran"
                message={formError}
              />
            )}

            <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden divide-y divide-stone-100">
              {/* Header Box */}
              <div className="p-5 sm:p-6 bg-stone-50/70 flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-site-text-muted block">
                    Formulir Pemesanan
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-site-text font-jakarta">
                    Paket Umroh Reguler Ramadhan 1447H
                  </h3>
                </div>
                <span
                  style={dynamicBadgeStyle}
                  className="inline-flex items-center px-2.5 py-1 rounded-lg border text-xs font-bold shrink-0"
                >
                  9 Hari
                </span>
              </div>

              {/* Data Pemesan */}
              <div className="p-5 sm:p-6 space-y-5">
                <div className="flex items-center gap-2 pb-1">
                  <User className="w-4 h-4 shrink-0" style={{ color: 'var(--site-accent)' }} />
                  <h4 className="text-sm font-bold text-site-text font-jakarta">
                    1. Data Calon Jamaah
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <SiteLabel htmlFor="jamaah-name" required>
                      Nama Lengkap Pemesan
                    </SiteLabel>
                    <SiteInput
                      id="jamaah-name"
                      icon={User}
                      value={bookingData.jamaahName}
                      onChange={(e) =>
                        setBookingData({ ...bookingData, jamaahName: e.target.value })
                      }
                      placeholder="Sesuai KTP / Paspor"
                    />
                  </div>

                  <div>
                    <SiteLabel htmlFor="jamaah-phone" required>
                      Nomor WhatsApp / HP
                    </SiteLabel>
                    <SiteInput
                      id="jamaah-phone"
                      icon={Phone}
                      value={bookingData.jamaahPhone}
                      onChange={(e) =>
                        setBookingData({ ...bookingData, jamaahPhone: e.target.value })
                      }
                      placeholder="081234567890"
                      className="font-mono"
                      helperText="Konfirmasi pendaftaran & instruksi pembayaran akan dikirim via WhatsApp."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Dropdown Pilihan Tanggal Keberangkatan */}
                  <div>
                    <SiteLabel htmlFor="jamaah-departure" required>
                      Jadwal Keberangkatan
                    </SiteLabel>
                    <SiteSelect
                      id="jamaah-departure"
                      icon={Calendar}
                      options={departureOptions}
                      value={bookingData.keberangkatan}
                      onChange={(val) => setBookingData({ ...bookingData, keberangkatan: val })}
                    />
                  </div>

                  {/* Dropdown Pilihan Tipe Kamar */}
                  <div>
                    <SiteLabel htmlFor="jamaah-room" required>
                      Tipe Kamar Hotel
                    </SiteLabel>
                    <SiteSelect
                      id="jamaah-room"
                      icon={BedDouble}
                      options={roomOptions}
                      value={bookingData.tipeKamar}
                      onChange={(val) => setBookingData({ ...bookingData, tipeKamar: val })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <SiteLabel htmlFor="jamaah-email" optional>
                      Alamat Email
                    </SiteLabel>
                    <SiteInput
                      id="jamaah-email"
                      icon={Mail}
                      type="email"
                      value={bookingData.jamaahEmail}
                      onChange={(e) =>
                        setBookingData({ ...bookingData, jamaahEmail: e.target.value })
                      }
                      placeholder="jamaah@email.com"
                    />
                  </div>

                  <div>
                    <SiteLabel htmlFor="referral-code" optional>
                      Kode Referral Agen
                    </SiteLabel>
                    <SiteInput
                      id="referral-code"
                      value={bookingData.referralCode}
                      onChange={(e) =>
                        setBookingData({ ...bookingData, referralCode: e.target.value })
                      }
                      placeholder="KODEAGEN"
                      className="font-mono uppercase"
                      helperText="Isi jika Anda mendapatkan rekomendasi dari mitra agen travel."
                    />
                  </div>
                </div>

                {/* Catatan Khusus */}
                <div>
                  <SiteLabel htmlFor="booking-catatan" optional>
                    Catatan / Permintaan Khusus
                  </SiteLabel>
                  <SiteTextarea
                    id="booking-catatan"
                    rows={3}
                    value={bookingData.catatan}
                    onChange={(e) =>
                      setBookingData({ ...bookingData, catatan: e.target.value })
                    }
                    placeholder="Contoh: Permintaan kamar lantai bawah, kursi roda, atau alergi makanan..."
                  />
                </div>
              </div>

              {/* Summary & Submit Action */}
              <div className="p-4 sm:p-6 bg-stone-50/70 space-y-4">
                <div className="flex items-center justify-between gap-3 min-w-0">
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-site-text-muted block truncate">
                      Estimasi Total Biaya
                    </span>
                    <span className="text-xs text-site-text-muted block truncate mt-0.5">
                      1 Pax • {bookingData.tipeKamar === 'double' ? 'Kamar Double' : bookingData.tipeKamar === 'triple' ? 'Kamar Triple' : 'Kamar Quad'}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      style={{ color: 'var(--site-accent)' }}
                      className="font-jakarta text-lg sm:text-2xl font-black whitespace-nowrap block leading-tight"
                    >
                      {bookingData.tipeKamar === 'double' ? 'Rp 33.000.000' : bookingData.tipeKamar === 'triple' ? 'Rp 30.500.000' : 'Rp 28.500.000'}
                    </span>
                  </div>
                </div>

                <SiteSubmitButton
                  fullWidth
                  icon={Plane}
                  isPending={isSubmitting}
                  loadingText="Mengirimkan Pemesanan..."
                >
                  Booking Sekarang
                </SiteSubmitButton>

                <div className="flex items-center justify-center gap-1.5 text-[11px] text-site-text-muted text-center pt-1 font-sans">
                  <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Pemesanan aman & terhubung langsung ke travel resmi</span>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* ===================================================================
          DEMO CUSTOM MICROSITE MODAL DIALOG
         =================================================================== */}
      <SiteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        icon={Hotel}
        title="Fasilitas & Hotel Paket Ramadhan"
        description="Rincian hotel akomodasi dan fasilitas resmi selama di Tanah Suci Makkah & Madinah."
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-stone-600 hover:text-site-text hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
            >
              Tutup
            </button>
            <SiteSubmitButton
              fullWidth={false}
              size="md"
              onClick={() => {
                alert('Pilihan fasilitas dikonfirmasi!')
                setIsModalOpen(false)
              }}
            >
              Pilih Paket Ini
            </SiteSubmitButton>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-3.5 bg-stone-50 rounded-lg border border-stone-200 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-site-text font-jakarta">
              <span>Hotel Makkah (Bintang 5)</span>
              <span style={{ color: 'var(--site-accent)' }}>50m dari Pelataran</span>
            </div>
            <p className="text-xs text-site-text-muted">
              Pullman Zamzam Makkah / Swissotel Makkah (Termasuk sarapan dan makan malam sahur buffet).
            </p>
          </div>

          <div className="p-3.5 bg-stone-50 rounded-lg border border-stone-200 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-site-text font-jakarta">
              <span>Hotel Madinah (Bintang 5)</span>
              <span style={{ color: 'var(--site-accent)' }}>100m dari Masjid Nabawi</span>
            </div>
            <p className="text-xs text-site-text-muted">
              Rove Madinah / Frontel Al Harithia (Termasuk full board menu masakan Indonesia).
            </p>
          </div>

          <div className="space-y-1.5 pt-1">
            <SiteLabel htmlFor="modal-room-choice">
              Konfirmasi Tipe Kamar yang Diinginkan
            </SiteLabel>
            <SiteSelect
              id="modal-room-choice"
              icon={BedDouble}
              options={roomOptions}
              defaultValue="quad"
            />
          </div>
        </div>
      </SiteModal>
    </div>
  )
}
