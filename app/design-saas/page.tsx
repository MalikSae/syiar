'use client'

import React, { useState } from 'react'
import {
  DashboardInput,
  DashboardTextarea,
  DashboardSelect,
  DashboardLabel,
  DashboardHelperText,
  DashboardErrorMessage,
  DashboardSubmitButton,
} from '@/components/dashboard/form'
import { DashboardModal } from '@/components/dashboard/dashboard-modal'
import { DashboardSection } from '@/components/dashboard/layout'
import {
  Building2,
  Phone,
  Tag,
  Mail,
  MapPin,
  Lock,
  Save,
  CheckCircle2,
  Sliders,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Globe,
  CreditCard,
  Briefcase,
  HelpCircle,
  AlertCircle,
  AlertTriangle,
  Info,
  ExternalLink,
  Users,
  Wallet,
  TrendingUp,
  Plane,
  FileText,
  Calendar,
  ChevronRight,
  Eye,
} from 'lucide-react'

export default function DesignSaasShowcasePage() {
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalSelectedBank, setModalSelectedBank] = useState('bca')

  // State untuk form interaktif
  const [formData, setFormData] = useState({
    name: 'Alhijrah Tour & Travel',
    slug: 'alhijrah',
    category: 'umroh_plus',
    bank: 'bsi',
    phone: '081234567890',
    email: 'kontak@alhijrah.com',
    nominalDp: '5.000.000',
    about: 'Melayani perjalanan ibadah umroh dan haji plus dengan standar pelayanan terbaik, bimbingan sesuai sunnah, dan fasilitas hotel bintang 5.',
    alamat: 'Gedung Menara Syiar Lt. 4, Jakarta Selatan',
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
      if (!formData.name.trim()) {
        setFormError('Nama Brand / Travel wajib diisi!')
      } else {
        setFormSuccess('Perubahan profil berhasil disimpan ke sistem SaaS!')
      }
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 1200)
  }

  // Options for Dropdowns
  const categoryOptions = [
    { value: 'umroh_reguler', label: 'Umroh Reguler (Ekonomi / Standard)', description: 'Durasi 9-12 hari bintang 3-4' },
    { value: 'umroh_plus', label: 'Umroh Plus Wisata Halal', description: 'Turki, Dubai, Cairo, Jordan' },
    { value: 'umroh_vip', label: 'Umroh VIP & Ramadhan', description: 'Hotel pelataran Masjidil Haram bintang 5' },
    { value: 'haji_furoda', label: 'Haji Khusus / Furoda Mujamalah', description: 'Tanpa antri langsung berangkat' },
  ]

  const bankOptions = [
    { value: 'bsi', label: 'Bank Syariah Indonesia (BSI)', description: 'Akun Utama Syariah' },
    { value: 'bca', label: 'Bank Central Asia (BCA)', description: 'Virtual Account & Transfer' },
    { value: 'mandiri', label: 'Bank Mandiri', description: 'Corporate Account' },
    { value: 'bri', label: 'Bank Rakyat Indonesia (BRI)', description: 'Cabang Seluruh Indonesia' },
  ]

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 font-sans py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Header Banner */}
        <div className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5" />
              <span>Design System A (SaaS Dashboard)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Koleksi Komponen Form Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
              Spesifikasi komponen form portal manajemen travel (TravelUser & Superadmin) dengan palet solid <code className="text-brand-600 font-bold font-mono">brand-600</code>, sudut membulat proporsional <code className="text-slate-700 font-mono">rounded-lg</code>, dan background <code className="text-slate-700 font-mono">bg-slate-50</code>.
            </p>
          </div>

          <div className="text-xs text-slate-400 font-mono bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 shrink-0">
            components/dashboard/
          </div>
        </div>

        {/* ===================================================================
            SECTION 1: ATOMIC COMPONENT STATES SHOWCASE
           =================================================================== */}
        <div className="space-y-6">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-brand-600" />
              <span>1. Showcase Varian & State Atomik</span>
            </h2>
            <p className="text-xs text-slate-500">
              Evaluasi visual setiap elemen dasar form pada semua kondisi input.
            </p>
          </div>

          {/* Grid Varian Input */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-6">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              A. DashboardInput & Label States
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* 1. Normal Kosong */}
              <div className="space-y-1.5">
                <DashboardLabel htmlFor="demo-empty">
                  Input Kosong (Default)
                </DashboardLabel>
                <DashboardInput
                  id="demo-empty"
                  placeholder="Contoh: Nama Travel"
                  helperText="Teks petunjuk standar di bawah field."
                />
              </div>

              {/* 2. Terisi dengan Icon Kiri */}
              <div className="space-y-1.5">
                <DashboardLabel htmlFor="demo-icon" required>
                  Dengan Icon Kiri
                </DashboardLabel>
                <DashboardInput
                  id="demo-icon"
                  icon={Building2}
                  defaultValue="Alhijrah Tour & Travel"
                />
              </div>

              {/* 3. Prefix Uang */}
              <div className="space-y-1.5">
                <DashboardLabel htmlFor="demo-prefix" optional>
                  Dengan Prefix Nominal
                </DashboardLabel>
                <DashboardInput
                  id="demo-prefix"
                  prefixText="Rp"
                  defaultValue="35.000.000"
                  className="font-mono font-bold text-slate-900"
                />
              </div>

              {/* 4. State Error */}
              <div className="space-y-1.5">
                <DashboardLabel htmlFor="demo-error" required>
                  State Error Validasi
                </DashboardLabel>
                <DashboardInput
                  id="demo-error"
                  icon={Mail}
                  defaultValue="email-tidak-valid@"
                  hasError
                  errorMessage="Format alamat email tidak valid!"
                />
              </div>

              {/* 5. State Disabled / Read-only */}
              <div className="space-y-1.5">
                <DashboardLabel
                  htmlFor="demo-disabled"
                  badge={
                    <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-slate-400" /> Terkunci
                    </span>
                  }
                >
                  Disabled / Read-Only
                </DashboardLabel>
                <DashboardInput
                  id="demo-disabled"
                  disabled
                  defaultValue="alhijrah.syiar.link"
                  helperText="Field ini dibuat otomatis dan tidak dapat diubah."
                />
              </div>

              {/* 6. Phone Mono */}
              <div className="space-y-1.5">
                <DashboardLabel htmlFor="demo-phone">
                  Nomor Telepon (Font Mono)
                </DashboardLabel>
                <DashboardInput
                  id="demo-phone"
                  icon={Phone}
                  defaultValue="081211112222"
                  className="font-mono"
                />
              </div>
            </div>
          </div>

          {/* Grid Varian Dropdown / Select (KOMPONEN BARU) */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900">
                B. Custom Field Dropdown (DashboardSelect)
              </h3>
              <span className="text-[11px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md">
                Baru Ditambahkan
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 1. Normal Dropdown */}
              <div className="space-y-1.5">
                <DashboardLabel htmlFor="demo-select-1" required>
                  Dropdown Standar
                </DashboardLabel>
                <DashboardSelect
                  id="demo-select-1"
                  options={categoryOptions}
                  defaultValue="umroh_reguler"
                  helperText="Pilih kategori paket utama travel Anda."
                />
              </div>

              {/* 2. Dropdown dengan Icon & Deskripsi */}
              <div className="space-y-1.5">
                <DashboardLabel htmlFor="demo-select-2" optional>
                  Dengan Icon & Deskripsi
                </DashboardLabel>
                <DashboardSelect
                  id="demo-select-2"
                  icon={CreditCard}
                  options={bankOptions}
                  defaultValue="bsi"
                  placeholder="Pilih rekening bank..."
                />
              </div>

              {/* 3. Dropdown Error State */}
              <div className="space-y-1.5">
                <DashboardLabel htmlFor="demo-select-3" required>
                  State Error Validasi
                </DashboardLabel>
                <DashboardSelect
                  id="demo-select-3"
                  options={bankOptions}
                  placeholder="Pilih rekening tujuan..."
                  hasError
                  errorMessage="Rekening tujuan pencairan wajib dipilih!"
                />
              </div>
            </div>
          </div>

          {/* Grid Varian Textarea */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-6">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              C. DashboardTextarea States
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1.5">
                <DashboardLabel htmlFor="demo-ta-1">
                  Textarea Normal
                </DashboardLabel>
                <DashboardTextarea
                  id="demo-ta-1"
                  rows={3}
                  placeholder="Tuliskan deskripsi ringkas..."
                  helperText="Maksimal 200 karakter."
                />
              </div>

              <div className="space-y-1.5">
                <DashboardLabel htmlFor="demo-ta-2" required>
                  Textarea Error
                </DashboardLabel>
                <DashboardTextarea
                  id="demo-ta-2"
                  rows={3}
                  defaultValue="Teks terlalu pendek"
                  hasError
                  errorMessage="Deskripsi minimal harus terdiri dari 30 karakter."
                />
              </div>

              <div className="space-y-1.5">
                <DashboardLabel htmlFor="demo-ta-3">
                  Textarea Disabled
                </DashboardLabel>
                <DashboardTextarea
                  id="demo-ta-3"
                  rows={3}
                  disabled
                  defaultValue="Konten ini dikunci oleh kebijakan sistem SaaS SyiarLink."
                />
              </div>
            </div>
          </div>

          {/* Grid Varian Error Message Banner, Buttons & MODAL TRIGGER */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900">
                D. Error Message Banner, Buttons & Custom Modal Dialog
              </h3>
              <span className="text-[11px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md">
                Modal Baru
              </span>
            </div>

            <div className="space-y-4">
              <DashboardErrorMessage
                title="Gagal Menyimpan Data"
                message="Terjadi kesalahan pada validasi formulir. Silakan periksa kembali field bertanda merah di bawah."
              />

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <DashboardSubmitButton icon={Save}>
                  Simpan Perubahan
                </DashboardSubmitButton>

                <DashboardSubmitButton isPending loadingText="Menyimpan Data...">
                  Simpan
                </DashboardSubmitButton>

                <DashboardSubmitButton disabled>
                  Tombol Dinonaktifkan
                </DashboardSubmitButton>

                {/* MODAL TRIGGER BUTTON */}
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="px-5 py-3 sm:py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-lg transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer min-h-[46px] sm:min-h-[40px]"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Buka Contoh Modal Dashboard</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ===================================================================
            SECTION 2: CONTOH FORMULIR LENGKAP TERINTEGRASI
           =================================================================== */}
        <div className="space-y-4">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-600" />
              <span>2. Simulasi Form Lengkap Terintegrasi</span>
            </h2>
            <p className="text-xs text-slate-500">
              Contoh nyata penggabungan seluruh komponen Sistem A dalam formulir pengaturan profil travel.
            </p>
          </div>

          <form onSubmit={handleSimulateSubmit} className="space-y-6">
            {/* Feedback Alerts */}
            {formSuccess && (
              <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start gap-3 animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Sukses!</p>
                  <p className="text-xs sm:text-sm text-emerald-700 mt-0.5">{formSuccess}</p>
                </div>
              </div>
            )}

            {formError && (
              <DashboardErrorMessage
                title="Peringatan Formulir"
                message={formError}
              />
            )}

            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">
                  Profil Operasional Travel Umroh
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Lengkapi identitas resmi travel Anda untuk ditampilkan kepada mitra agen dan publik.
                </p>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Nama Travel */}
                  <div className="space-y-1.5">
                    <DashboardLabel htmlFor="form-name" required>
                      Nama Brand / Travel
                    </DashboardLabel>
                    <DashboardInput
                      id="form-name"
                      icon={Building2}
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Contoh: Alhijrah Tour & Travel"
                    />
                  </div>

                  {/* Subdomain Slug (Terkunci) */}
                  <div className="space-y-1.5">
                    <DashboardLabel
                      htmlFor="form-slug"
                      badge={
                        <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                          <Lock className="w-3 h-3 text-slate-400" /> Read-Only
                        </span>
                      }
                    >
                      Subdomain / Slug
                    </DashboardLabel>
                    <DashboardInput
                      id="form-slug"
                      disabled
                      value={formData.slug}
                      helperText="Subdomain tenant terdaftar permanen di jaringan platform SyiarLink."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Dropdown Kategori Layanan */}
                  <div className="space-y-1.5">
                    <DashboardLabel htmlFor="form-category" required>
                      Fokus Paket Layanan Utama
                    </DashboardLabel>
                    <DashboardSelect
                      id="form-category"
                      icon={Briefcase}
                      options={categoryOptions}
                      value={formData.category}
                      onChange={(val) => setFormData({ ...formData, category: val })}
                      helperText="Ditampilkan sebagai badge spesialisasi pada profil travel."
                    />
                  </div>

                  {/* Dropdown Rekening Utama */}
                  <div className="space-y-1.5">
                    <DashboardLabel htmlFor="form-bank" required>
                      Rekening Bank Penampung DP
                    </DashboardLabel>
                    <DashboardSelect
                      id="form-bank"
                      icon={CreditCard}
                      options={bankOptions}
                      value={formData.bank}
                      onChange={(val) => setFormData({ ...formData, bank: val })}
                      helperText="Rekening penerima transaksi DP pemesanan paket."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* No WhatsApp */}
                  <div className="space-y-1.5">
                    <DashboardLabel htmlFor="form-phone" required>
                      No. WhatsApp Resmi
                    </DashboardLabel>
                    <DashboardInput
                      id="form-phone"
                      icon={Phone}
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      placeholder="081234567890"
                      className="font-mono"
                      helperText="Nomor kontak layanan jamaah dan notifikasi komisi agen."
                    />
                  </div>

                  {/* Minimal DP */}
                  <div className="space-y-1.5">
                    <DashboardLabel htmlFor="form-dp" optional>
                      Standar Uang Muka (DP)
                    </DashboardLabel>
                    <DashboardInput
                      id="form-dp"
                      prefixText="Rp"
                      value={formData.nominalDp}
                      onChange={(e) =>
                        setFormData({ ...formData, nominalDp: e.target.value })
                      }
                      placeholder="5.000.000"
                      className="font-mono font-bold"
                      helperText="Nominal DP acuan saat jamaah melakukan pemesanan paket."
                    />
                  </div>
                </div>

                {/* Profil Singkat */}
                <div className="space-y-1.5">
                  <DashboardLabel htmlFor="form-about">
                    Tentang Travel (Profil Singkat)
                  </DashboardLabel>
                  <DashboardTextarea
                    id="form-about"
                    rows={3}
                    value={formData.about}
                    onChange={(e) =>
                      setFormData({ ...formData, about: e.target.value })
                    }
                    placeholder="Tuliskan visi misi atau profil singkat travel..."
                    helperText="Teks ini akan ditampilkan pada footer microsite dan portal pendaftaran agen."
                  />
                </div>

                {/* Alamat Kantor */}
                <div className="space-y-1.5">
                  <DashboardLabel htmlFor="form-alamat">
                    Alamat Kantor Operasional
                  </DashboardLabel>
                  <DashboardTextarea
                    id="form-alamat"
                    rows={2}
                    value={formData.alamat}
                    onChange={(e) =>
                      setFormData({ ...formData, alamat: e.target.value })
                    }
                    placeholder="Gedung, Jalan, Kota..."
                  />
                </div>
              </div>

              {/* Form Footer Action */}
              <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
                <DashboardSubmitButton
                  isPending={isSubmitting}
                  loadingText="Menyimpan Profil..."
                  icon={Save}
                >
                  Simpan Profil Travel
                </DashboardSubmitButton>
              </div>
            </div>
          </form>
        </div>

        {/* ===================================================================
            SECTION 3: SEAMLESS PATTERN SHOWCASE & CARD COMPARISON
           =================================================================== */}
        <div className="space-y-10 pt-4 border-t border-slate-200">
          <div className="border-b border-slate-200 pb-3">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Pola Baru: Seamless Layouts & Section System</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Layers className="w-6 h-6 text-brand-600" />
              <span>3. Showcase Seamless DashboardSection vs Card Pattern</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Panduan visual pemilihan pola: <strong>Card Penuh</strong> untuk metrik KPI ringkas, dan <strong>DashboardSection Seamless</strong> untuk form berurutan, halaman pengaturan, dan tabel data luas tanpa penumpukan shadow.
            </p>
          </div>

          {/* A. CONTOH STAT CARDS (TETAP PAKAI CARD PENUH) */}
          <div>
            <div className="mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-brand-600" />
                <span>A. Stat Cards (Kapan Tetap Menggunakan Card)</span>
              </h3>
              <p className="text-xs text-slate-500">
                Pola card berbayangan sangat efektif untuk kartu ringkasan metrik terisolasi yang membutuhkan pemisahan visual jelas.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1 */}
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">Total Jamaah Terdaftar</span>
                  <div className="w-8 h-8 rounded-lg bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-extrabold text-slate-900">1.248</span>
                  <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5">
                    <TrendingUp className="w-3 h-3" /> +14% bln ini
                  </span>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">Komisi Menunggu Cair</span>
                  <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                    <Wallet className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-extrabold text-slate-900 font-mono">Rp 48,5 Jt</span>
                  <span className="text-xs font-semibold text-amber-600">6 pengajuan</span>
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">Agen Aktif Bulan Ini</span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                    <Briefcase className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-extrabold text-slate-900">84</span>
                  <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5">
                    <TrendingUp className="w-3 h-3" /> +8 agen baru
                  </span>
                </div>
              </div>

              {/* Card 4 */}
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">Keberangkatan Terdekat</span>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                    <Plane className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-xl font-extrabold text-slate-900 font-mono">18 Sep 2026</span>
                  <span className="text-xs font-semibold text-blue-600">45 Pax Full</span>
                </div>
              </div>
            </div>
          </div>

          {/* B. CONTOH FORM MULTI-SECTION SEAMLESS (DASHBOARDSECTION BERURUTAN) */}
          <div>
            <div className="mb-8">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-brand-600" />
                <span>B. Contoh Form Multi-Section Seamless (3 DashboardSection Berurutan)</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Form mengalir alami dengan pemisah garis tipis dan jarak lega antar section, tanpa kotak card pembungkus.
              </p>
            </div>

            {/* Section 1: Legalitas */}
            <DashboardSection
              icon={Building2}
              title="1. Identitas Legalitas Travel"
              description="Informasi izin resmi Kementerian Agama RI dan legalitas badan usaha penyelenggara."
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <DashboardLabel htmlFor="demo-pt-name" required>
                    Nama Badan Hukum (PT / Yayasan)
                  </DashboardLabel>
                  <DashboardInput
                    id="demo-pt-name"
                    defaultValue="PT Alhijrah Tour & Travel Internasional"
                    placeholder="Contoh: PT Berkah Syiar Wisata"
                  />
                </div>

                <div className="space-y-1.5">
                  <DashboardLabel htmlFor="demo-sk-kemenag" required>
                    Nomor SK Izin PPIU Kemenag
                  </DashboardLabel>
                  <DashboardInput
                    id="demo-sk-kemenag"
                    defaultValue="PPIU Kemenag RI No. 892/2021"
                    placeholder="Contoh: No. 123/2023"
                    className="font-mono"
                  />
                </div>
              </div>
            </DashboardSection>

            {/* Section 2: Pembayaran & Rekening */}
            <DashboardSection
              icon={CreditCard}
              title="2. Pengaturan Rekening & Termin Pembayaran"
              description="Rekening penampung transaksi uang muka (DP) dan termin pelunasan paket jamaah."
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-1.5">
                  <DashboardLabel htmlFor="demo-bank-name" required>
                    Bank Penampung
                  </DashboardLabel>
                  <DashboardSelect
                    id="demo-bank-name"
                    options={bankOptions}
                    defaultValue="bsi"
                  />
                </div>

                <div className="space-y-1.5">
                  <DashboardLabel htmlFor="demo-acc-no" required>
                    Nomor Rekening
                  </DashboardLabel>
                  <DashboardInput
                    id="demo-acc-no"
                    defaultValue="7128899001"
                    className="font-mono font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <DashboardLabel htmlFor="demo-acc-holder" required>
                    Atas Nama Rekening
                  </DashboardLabel>
                  <DashboardInput
                    id="demo-acc-holder"
                    defaultValue="PT Alhijrah Tour & Travel"
                  />
                </div>
              </div>
            </DashboardSection>

            {/* Section 3: Domain & Notifikasi */}
            <DashboardSection
              icon={Globe}
              title="3. Konfigurasi Domain & WhatsApp Notifikasi"
              description="Alamat akses portal travel dan integrasi nomor pengirim pesan komisi otomatis."
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <DashboardLabel htmlFor="demo-subdomain">
                    Subdomain Resmi SyiarLink
                  </DashboardLabel>
                  <DashboardInput
                    id="demo-subdomain"
                    disabled
                    defaultValue="alhijrah.syiar.link"
                    helperText="Subdomain utama aktif untuk microsite dan pendaftaran mitra agen."
                  />
                </div>

                <div className="space-y-1.5">
                  <DashboardLabel htmlFor="demo-wa-sender" required>
                    Nomor WhatsApp Sender Notifikasi
                  </DashboardLabel>
                  <DashboardInput
                    id="demo-wa-sender"
                    icon={Phone}
                    defaultValue="081288776655"
                    className="font-mono"
                    helperText="Pesan notifikasi persetujuan komisi & booking dikirimkan lewat nomor ini."
                  />
                </div>
              </div>
            </DashboardSection>

            {/* Action Buttons Row Seamless */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-4">
              <p className="text-xs text-slate-500">
                Perubahan pada 3 section di atas akan disimpan sekaligus ke database travel.
              </p>
              <DashboardSubmitButton icon={Save}>
                Simpan Seluruh Pengaturan
              </DashboardSubmitButton>
            </div>
          </div>

          {/* C. CONTOH TABEL DATA DENGAN BORDER TIPIS (SEAMLESS PATTERN) */}
          <div className="space-y-4">
            <DashboardSection
              icon={Users}
              title="C. Contoh Tabel Data dengan Border Tipis (Pola Seamless)"
              description="Pola tabel data tanpa card shadow tebal, menggunakan pembatas border-b halus dan hover row yang nyaman."
            >
              <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white">
                <table className="min-w-full divide-y divide-slate-200 text-left text-xs sm:text-sm">
                  <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Kode Booking</th>
                      <th className="py-3 px-4">Nama Jamaah</th>
                      <th className="py-3 px-4">Paket Pilihan</th>
                      <th className="py-3 px-4">Agen Pengajak</th>
                      <th className="py-3 px-4">Total Biaya</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {/* Row 1 */}
                    <tr className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">#BK-9021</td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-900">H. Ahmad Dahlan</div>
                        <div className="text-xs text-slate-500 font-mono">081234567890</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-slate-800 font-medium">Umroh Reguler Awal Ramadhan</div>
                        <div className="text-xs text-slate-500">Quad (4 Orang)</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                          Ustadz Abdullah (AG01)
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">
                        Rp 136.000.000
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 border border-emerald-200 text-emerald-700">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Lunas
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button className="px-2.5 py-1 text-xs font-semibold text-brand-600 hover:text-brand-800 hover:bg-brand-50 rounded-md transition-colors cursor-pointer inline-flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" /> Detail
                        </button>
                      </td>
                    </tr>

                    {/* Row 2 */}
                    <tr className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">#BK-8842</td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-900">Hj. Maryam Sulaiman</div>
                        <div className="text-xs text-slate-500 font-mono">081399887766</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-slate-800 font-medium">Umroh Plus Turki 12 Hari</div>
                        <div className="text-xs text-slate-500">Double (2 Orang)</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                          Langsung (Organik)
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">
                        Rp 78.000.000
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 border border-amber-200 text-amber-700">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          Menunggu DP
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button className="px-2.5 py-1 text-xs font-semibold text-brand-600 hover:text-brand-800 hover:bg-brand-50 rounded-md transition-colors cursor-pointer inline-flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" /> Detail
                        </button>
                      </td>
                    </tr>

                    {/* Row 3 */}
                    <tr className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">#BK-8710</td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-900">Bambang Irawan</div>
                        <div className="text-xs text-slate-500 font-mono">085711223344</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-slate-800 font-medium">Umroh Akhir Ramadhan VIP</div>
                        <div className="text-xs text-slate-500">Triple (3 Orang)</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                          H. Sukardi (AG04)
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">
                        Rp 129.000.000
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 border border-blue-200 text-blue-700">
                          <Calendar className="w-3 h-3 text-blue-600" />
                          Terverifikasi
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button className="px-2.5 py-1 text-xs font-semibold text-brand-600 hover:text-brand-800 hover:bg-brand-50 rounded-md transition-colors cursor-pointer inline-flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" /> Detail
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </DashboardSection>
          </div>

          {/* D. CONTOH ALERT & BANNER NOTIFIKASI */}
          <div className="space-y-4">
            <DashboardSection
              icon={AlertCircle}
              title="D. Contoh Alert & Banner Notifikasi"
              description="Pola penyampaian status sistem untuk error blocking, warning tersimpan, konfirmasi berhasil, dan informasi."
            >
              <div className="space-y-3">
                {/* 1. Error Blocking (DashboardErrorMessage merah standar) */}
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-700">1. Error Banner (DashboardErrorMessage Standar):</span>
                  <DashboardErrorMessage message="Terjadi kesalahan validasi: Nomor WhatsApp sudah terdaftar pada tenant ini. Silakan periksa kembali." />
                </div>

                {/* 2. Success Banner */}
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-700">2. Success Banner:</span>
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs sm:text-sm flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Pengaturan Berhasil Disimpan</p>
                      <p className="text-xs text-emerald-700 mt-0.5">
                        Seluruh konfigurasi legalitas travel dan rekening pembayaran telah diperbarui di sistem.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 3. Warning Banner (Non-blocking) */}
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-700">3. Warning Banner (Data Tersimpan Parsial / Non-Blocking):</span>
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs sm:text-sm flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Perhatian: Rekening Bank Belum Lengkap</p>
                      <p className="text-xs text-amber-800 mt-0.5">
                        Nama bank telah tersimpan, namun Nomor Rekening atau Atas Nama masih kosong. Jamaah tidak akan melihat instruksi transfer manual sebelum field ini dilengkapi.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 4. Info Banner */}
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-700">4. Information Banner:</span>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 text-xs sm:text-sm flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Informasi Siklus Penagihan Bulanan</p>
                      <p className="text-xs text-blue-800 mt-0.5">
                        Invoice langganan SaaS SyiarLink diterbitkan setiap tanggal 1 setiap bulannya melalui payment gateway Duitku.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </DashboardSection>
          </div>
        </div>
      </div>

      {/* ===================================================================
          DEMO CUSTOM DASHBOARD MODAL DIALOG
         =================================================================== */}
      <DashboardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        icon={CreditCard}
        title="Konfirmasi Penarikan Komisi Agen"
        description="Verifikasi rincian pembayaran sebelum menyetujui transfer pencairan saldo komisi."
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Batalkan
            </button>
            <DashboardSubmitButton
              onClick={() => {
                alert('Pencairan komisi berhasil disetujui!')
                setIsModalOpen(false)
              }}
            >
              Setujui & Transfer
            </DashboardSubmitButton>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between gap-3 min-w-0">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-slate-500">Nama Agen Penerima</p>
              <p className="font-bold text-slate-900 text-sm truncate">Ustadz Abdullah Said</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs text-slate-500">Total Nominal</p>
              <p className="font-mono font-bold text-brand-600 text-sm sm:text-base whitespace-nowrap">Rp 7.500.000</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <DashboardLabel htmlFor="modal-bank-select" required>
              Rekening Asal Sumber Dana Travel
            </DashboardLabel>
            <DashboardSelect
              id="modal-bank-select"
              icon={CreditCard}
              options={bankOptions}
              value={modalSelectedBank}
              onChange={setModalSelectedBank}
              helperText="Pastikan saldo rekening operasional mencukupi sebelum transfer."
            />
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              Tindakan ini akan mengunci status booking terkait menjadi <strong>Lunas/Paid</strong> dan mengirimkan notifikasi WhatsApp ke mitra agen.
            </span>
          </div>
        </div>
      </DashboardModal>
    </div>
  )
}
