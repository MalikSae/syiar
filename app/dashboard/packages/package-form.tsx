'use client'

import { useState, useTransition, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  savePackage,
  addPackageDeparture,
  toggleDepartureStatus,
} from './actions'
import { processSquareImage } from '@/lib/image-processing'
import Link from 'next/link'
import {
  Calendar,
  Plus,
  Trash2,
  AlertCircle,
  ImagePlus,
  UploadCloud,
  X,
  CheckCircle2,
  CircleOff,
  FileText,
} from 'lucide-react'

interface DepartureItem {
  id: string
  date: Date | string
  isActive: boolean
}

interface PackageData {
  id?: string
  name?: string
  duration?: string
  airline?: string
  hotelMakkah?: string
  hotelMadinah?: string
  include?: string
  exclude?: string
  itinerary?: string
  priceQuad?: number | null
  priceTriple?: number | null
  priceDouble?: number | null
  commissionAmount?: number
  featuredImageUrl?: string | null
  status?: string
}

interface PackageFormProps {
  initialData?: PackageData
  isEdit?: boolean
  initialDepartures?: DepartureItem[]
}

/**
 * Format angka ribuan dengan pemisah titik (Indonesian locale)
 */
function formatThousand(val: string | number | null | undefined): string {
  if (val === null || val === undefined || val === '') return ''
  const digits = String(val).replace(/\D/g, '')
  if (!digits) return ''
  return Number(digits).toLocaleString('id-ID')
}

export default function PackageForm({
  initialData,
  isEdit = false,
  initialDepartures = [],
}: PackageFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Status paket ("draft" | "active")
  const [packageStatus, setPackageStatus] = useState<string>(
    initialData?.status || 'draft'
  )

  // State untuk gambar unggulan (In-browser Canvas Crop 1:1)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(
    initialData?.featuredImageUrl || null
  )
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)
  const [isImageRemoved, setIsImageRemoved] = useState<boolean>(false)
  const [isProcessingImage, setIsProcessingImage] = useState<boolean>(false)

  // State untuk format ribuan live pada field harga & komisi
  const [priceQuad, setPriceQuad] = useState(formatThousand(initialData?.priceQuad))
  const [priceTriple, setPriceTriple] = useState(formatThousand(initialData?.priceTriple))
  const [priceDouble, setPriceDouble] = useState(formatThousand(initialData?.priceDouble))
  const [commissionAmount, setCommissionAmount] = useState(
    formatThousand(initialData?.commissionAmount)
  )

  // =========================================================================
  // CLIENT-SIDE CANVAS IMAGE PROCESSING (Center-Crop 1:1 & Convert to WebP)
  // =========================================================================
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    const file = e.target.files?.[0]
    if (!file) return

    setIsProcessingImage(true)
    try {
      const result = await processSquareImage(file, 1200)
      setSelectedImageFile(result.file)
      setImagePreviewUrl(result.previewUrl)
      setIsImageRemoved(false)
    } catch (err: any) {
      console.error('Error processing package image:', err)
      setError(err?.message || 'Gagal memproses gambar.')
    } finally {
      setIsProcessingImage(false)
    }
  }

  const handleRemoveImage = () => {
    setImagePreviewUrl(null)
    setSelectedImageFile(null)
    setIsImageRemoved(true)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // =========================================================================
  // LOGIC SECTION 4 (CREATE MODE): State lokal sebelum submit (batch create)
  // =========================================================================
  const [newDepartures, setNewDepartures] = useState<string[]>([])
  const [currentDateInput, setCurrentDateInput] = useState('')
  const [dateInputError, setDateInputError] = useState<string | null>(null)

  const handleAddDateToList = () => {
    if (!currentDateInput) {
      setDateInputError('Pilih tanggal keberangkatan terlebih dahulu.')
      return
    }
    const dateObj = new Date(currentDateInput)
    if (isNaN(dateObj.getTime())) {
      setDateInputError('Format tanggal tidak valid.')
      return
    }
    if (newDepartures.includes(currentDateInput)) {
      setDateInputError('Tanggal ini sudah ada di dalam daftar.')
      return
    }
    setNewDepartures([...newDepartures, currentDateInput].sort())
    setCurrentDateInput('')
    setDateInputError(null)
  }

  const handleRemoveDateFromList = (dateToRemove: string) => {
    setNewDepartures(newDepartures.filter((d) => d !== dateToRemove))
  }

  // =========================================================================
  // LOGIC SECTION 4 (EDIT MODE): Direct Server Actions & Live Toggle
  // =========================================================================
  const [existingDepartures, setExistingDepartures] = useState<DepartureItem[]>(initialDepartures)
  const [isTogglingId, setIsTogglingId] = useState<string | null>(null)
  const [isAddingDeparture, startAddDepTransition] = useTransition()
  const [, startToggleDepTransition] = useTransition()
  const [editDepError, setEditDepError] = useState<string | null>(null)

  const handleDirectAddDeparture = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setEditDepError(null)
    const formData = new FormData(e.currentTarget)

    startAddDepTransition(async () => {
      try {
        const res = await addPackageDeparture(null, formData)
        if (res?.error) {
          setEditDepError(res.error)
        } else if (res?.success && res.departure) {
          setExistingDepartures((prev) => [...prev, res.departure!])
          const dateInput = document.getElementById('edit-departure-date-input') as HTMLInputElement
          if (dateInput) dateInput.value = ''
        }
      } catch (err) {
        console.error('Error adding departure:', err)
        setEditDepError('Gagal menambahkan jadwal keberangkatan.')
      }
    })
  }

  const handleToggleDeparture = (departureId: string) => {
    setIsTogglingId(departureId)
    startToggleDepTransition(async () => {
      try {
        const res = await toggleDepartureStatus(departureId)
        if (res.success) {
          setExistingDepartures((prev) =>
            prev.map((d) => (d.id === departureId ? { ...d, isActive: res.isActive } : d))
          )
        }
      } catch (err) {
        console.error('Error toggling departure status:', err)
      } finally {
        setIsTogglingId(null)
      }
    })
  }

  // =========================================================================
  // FORM SUBMIT HANDLER (Package Main Data + Image Attachment)
  // =========================================================================
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)

    // Set status
    formData.set('status', packageStatus)

    // Sertakan daftar tanggal keberangkatan lokal jika mode create
    if (!isEdit && newDepartures.length > 0) {
      formData.set('departureDates', JSON.stringify(newDepartures))
    }

    // Sertakan file gambar WebP hasil crop canvas jika ada
    if (selectedImageFile) {
      formData.set('imageFile', selectedImageFile)
    } else if (isImageRemoved) {
      formData.set('removeImage', 'true')
    }

    startTransition(async () => {
      try {
        const res = await savePackage(null, formData)
        if (res?.error) {
          setError(res.error)
        } else if (res?.success) {
          router.push('/dashboard/packages')
          router.refresh()
        }
      } catch (err: any) {
        console.error('Error saving package:', err)
        setError('Terjadi kesalahan pada sistem. Silakan coba lagi.')
      }
    })
  }

  // Label tombol simpan dinamis
  const getSubmitButtonLabel = () => {
    if (isPending) return 'Menyimpan...'
    if (isEdit) return 'Simpan Perubahan'
    return packageStatus === 'draft' ? 'Simpan sebagai Draft' : 'Terbitkan Paket'
  }

  return (
    <div className="space-y-6">
      {/* Alert Error Utama */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start space-x-2.5">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Grid 2 Kolom: Kolom Utama (Kiri ~70%) + Sidebar (Kanan ~30%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ===================================================================
            KOLOM UTAMA (KIRI ~70% / 8 Cols)
           =================================================================== */}
        <div className="lg:col-span-8 space-y-6 sm:space-y-8 order-2 lg:order-1">
          <form onSubmit={handleSubmit} id="package-main-form" className="space-y-6 sm:space-y-8">
            {/* Hidden Package ID for edit detection */}
            <input type="hidden" name="packageId" defaultValue={initialData?.id || ''} />

            {/* Section 1: Informasi Utama */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-5">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                1. Informasi Utama Paket
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Nama Paket Umroh <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    defaultValue={initialData?.name || ''}
                    placeholder="Contoh: Paket Umroh Reguler Awal Musim"
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Durasi Program <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="duration"
                    required
                    defaultValue={initialData?.duration || ''}
                    placeholder="Contoh: 9 Hari / 12 Hari"
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Maskapai Penerbangan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="airline"
                    required
                    defaultValue={initialData?.airline || ''}
                    placeholder="Contoh: Garuda Indonesia / Saudia Airlines"
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Hotel Makkah <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="hotelMakkah"
                    required
                    defaultValue={initialData?.hotelMakkah || ''}
                    placeholder="Contoh: Pullman Zamzam / Swissotel Makkah"
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Hotel Madinah <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="hotelMadinah"
                    required
                    defaultValue={initialData?.hotelMadinah || ''}
                    placeholder="Contoh: Dallah Taibah / Madinah Hilton"
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Skema Harga & Komisi Agen */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-5">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  2. Pilihan Harga & Komisi Agen
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Minimal salah satu pilihan tipe kamar wajib diisi. Format titik ribuan akan muncul otomatis saat mengetik.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Harga Quad (Sekamar 4)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-xs font-semibold text-slate-400">
                      Rp
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      name="priceQuad"
                      value={priceQuad}
                      onChange={(e) => setPriceQuad(formatThousand(e.target.value))}
                      placeholder="28.000.000"
                      className="w-full pl-10 pr-4 py-2.5 text-sm font-mono rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Harga Triple (Sekamar 3)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-xs font-semibold text-slate-400">
                      Rp
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      name="priceTriple"
                      value={priceTriple}
                      onChange={(e) => setPriceTriple(formatThousand(e.target.value))}
                      placeholder="30.000.000"
                      className="w-full pl-10 pr-4 py-2.5 text-sm font-mono rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Harga Double (Sekamar 2)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-xs font-semibold text-slate-400">
                      Rp
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      name="priceDouble"
                      value={priceDouble}
                      onChange={(e) => setPriceDouble(formatThousand(e.target.value))}
                      placeholder="33.000.000"
                      className="w-full pl-10 pr-4 py-2.5 text-sm font-mono rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Komisi Agen (Flat Per Jamaah) <span className="text-red-500">*</span>
                </label>
                <div className="relative max-w-xs">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-xs font-semibold text-slate-400">
                    Rp
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    name="commissionAmount"
                    required
                    value={commissionAmount}
                    onChange={(e) => setCommissionAmount(formatThousand(e.target.value))}
                    placeholder="1.500.000"
                    className="w-full pl-10 pr-4 py-2.5 text-sm font-mono font-bold text-slate-900 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Nominal komisi tetap yang akan diterima agen untuk setiap jamaah yang mendaftar pada paket ini.
                </p>
              </div>
            </div>

            {/* Section 3: Fasilitas & Rencana Perjalanan */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-5">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                3. Fasilitas & Rencana Perjalanan
              </h2>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Fasilitas Sudah Termasuk (Include) <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="include"
                  required
                  rows={3}
                  defaultValue={initialData?.include || ''}
                  placeholder="Contoh: Tiket Pesawat PP, Visa Umroh, Hotel Makkah & Madinah, Makan 3x Sehari, Handling & Muthawwif, Air Zamzam 5L"
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Fasilitas Belum Termasuk (Exclude) <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="exclude"
                  required
                  rows={3}
                  defaultValue={initialData?.exclude || ''}
                  placeholder="Contoh: Pembuatan Paspor, Suntik Meningitis, Pengeluaran Pribadi, Kelebihan Bagasi"
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Rencana Perjalanan (Itinerary) <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="itinerary"
                  required
                  rows={4}
                  defaultValue={initialData?.itinerary || ''}
                  placeholder="Contoh: Hari 1: Jakarta - Jeddah - Madinah; Hari 2-4: Ziarah Madinah & Raudhah; Hari 5: Madinah - Makkah (Umroh 1); Hari 6-8: Ibadah Makkah & City Tour; Hari 9: Jeddah - Jakarta"
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                />
              </div>
            </div>
          </form>

          {/* ===================================================================
              SECTION 4: JADWAL KEBERANGKATAN
             =================================================================== */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-base font-bold text-slate-900">
                  4. Jadwal Tanggal Keberangkatan
                </h2>
                <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                  {isEdit ? `${existingDepartures.length} Jadwal Terdaftar` : 'Opsional'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {isEdit
                  ? 'Kelola tanggal keberangkatan yang tersedia untuk paket ini. Anda dapat menonaktifkan tanggal yang kuotanya sudah penuh.'
                  : 'Tambahkan tanggal keberangkatan yang tersedia untuk paket ini. Anda juga bisa mengelola atau menambahkan tanggal baru nanti di halaman edit.'}
              </p>
            </div>

            {/* --- KONDISI A: MODE CREATE (Daftar Lokal Batch) --- */}
            {!isEdit && (
              <>
                <div className="bg-slate-50/70 p-4 sm:p-5 rounded-xl border border-slate-200/80 space-y-3">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    + Tambah Tanggal ke Daftar
                  </h3>

                  {dateInputError && (
                    <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                      <span>{dateInputError}</span>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="flex-1 max-w-sm">
                      <input
                        type="date"
                        value={currentDateInput}
                        onChange={(e) => {
                          setCurrentDateInput(e.target.value)
                          setDateInputError(null)
                        }}
                        className="w-full px-4 py-2.5 text-sm text-slate-800 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 min-w-[200px]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddDateToList}
                      className="inline-flex items-center justify-center space-x-1.5 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah ke Daftar</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Daftar Tanggal yang Akan Dibuat ({newDepartures.length})
                  </h4>

                  {newDepartures.length === 0 ? (
                    <div className="py-6 text-center bg-slate-50/40 rounded-xl border border-dashed border-slate-200 p-4">
                      <p className="text-xs text-slate-400">
                        Belum ada tanggal keberangkatan di daftar. Paket tetap bisa disimpan tanpa tanggal keberangkatan awal.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {newDepartures.map((dateStr) => {
                        const dateObj = new Date(dateStr)
                        const formatted = !isNaN(dateObj.getTime())
                          ? dateObj.toLocaleDateString('id-ID', {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })
                          : dateStr

                        return (
                          <div
                            key={dateStr}
                            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-800 shadow-xs"
                          >
                            <div className="flex items-center space-x-2.5 min-w-0">
                              <Calendar className="w-4 h-4 text-brand-600 shrink-0" />
                              <span className="font-semibold text-slate-900 truncate">{formatted}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveDateFromList(dateStr)}
                              className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0 ml-2"
                              title="Hapus dari daftar"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* --- KONDISI B: MODE EDIT (Direct Server Action & Live Toggle) --- */}
            {isEdit && initialData?.id && (
              <>
                {/* Form Tambah Tanggal Baru Langsung ke Server */}
                <form
                  onSubmit={handleDirectAddDeparture}
                  className="bg-slate-50/70 p-4 sm:p-5 rounded-xl border border-slate-200/80 space-y-3"
                >
                  <input type="hidden" name="packageId" value={initialData.id} />

                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    + Tambah Tanggal Keberangkatan Baru
                  </h3>

                  {editDepError && (
                    <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                      <span>{editDepError}</span>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="flex-1 max-w-sm">
                      <input
                        id="edit-departure-date-input"
                        type="date"
                        name="date"
                        required
                        className="w-full px-4 py-2.5 text-sm text-slate-800 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 min-w-[200px]"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isAddingDeparture}
                      className="inline-flex items-center justify-center space-x-1.5 px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors disabled:opacity-50 shrink-0 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{isAddingDeparture ? 'Menambahkan...' : 'Tambah Jadwal'}</span>
                    </button>
                  </div>
                </form>

                {/* List Jadwal Keberangkatan Terdaftar dengan Toggle */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Daftar Tanggal Terdaftar ({existingDepartures.length})
                  </h4>

                  {existingDepartures.length === 0 ? (
                    <div className="py-8 text-center bg-slate-50/40 rounded-xl border border-dashed border-slate-200 p-4">
                      <p className="text-xs font-medium text-slate-400">
                        Belum ada tanggal keberangkatan yang didaftarkan. Gunakan form di atas untuk menambahkan jadwal.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                      {existingDepartures.map((dep) => {
                        const dateObj = new Date(dep.date)
                        const formattedDate = !isNaN(dateObj.getTime())
                          ? dateObj.toLocaleDateString('id-ID', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })
                          : String(dep.date)

                        const isToggling = isTogglingId === dep.id

                        return (
                          <div
                            key={dep.id}
                            className="p-4 bg-white hover:bg-slate-50/60 flex items-center justify-between gap-4 transition-colors"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                                <Calendar className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-slate-900">{formattedDate}</p>
                              </div>
                            </div>

                            <div className="flex items-center space-x-3">
                              <span
                                className={`text-xs font-semibold select-none ${
                                  dep.isActive ? 'text-emerald-700' : 'text-slate-400'
                                }`}
                              >
                                {isToggling ? 'Menyimpan...' : dep.isActive ? 'Aktif' : 'Nonaktif'}
                              </span>

                              <button
                                type="button"
                                role="switch"
                                aria-checked={dep.isActive}
                                onClick={() => handleToggleDeparture(dep.id)}
                                disabled={isToggling}
                                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 ${
                                  dep.isActive ? 'bg-emerald-500' : 'bg-slate-200'
                                }`}
                                title={dep.isActive ? 'Klik untuk menonaktifkan' : 'Klik untuk mengaktifkan'}
                              >
                                <span className="sr-only">Toggle status jadwal keberangkatan</span>
                                <span
                                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                    dep.isActive ? 'translate-x-5' : 'translate-x-0'
                                  }`}
                                />
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ===================================================================
            SIDEBAR KOLOM KANAN (~30% / 4 Cols, Sticky di Desktop)
           =================================================================== */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-6 order-1 lg:order-2">
          {/* Card 1: Status & Tombol Publikasi Utama */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
              <span>Status & Publikasi</span>
              <FileText className="w-4 h-4 text-slate-400" />
            </h3>

            {/* Pilihan Status (Draft vs Publish) */}
            {!isEdit || initialData?.status === 'draft' ? (
              <div className="space-y-2.5">
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Pilih Status Publikasi
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPackageStatus('draft')}
                    className={`px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                      packageStatus === 'draft'
                        ? 'bg-amber-50 border-amber-300 text-amber-800 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${packageStatus === 'draft' ? 'bg-amber-500' : 'bg-slate-300'}`} />
                    <span>Draft</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPackageStatus('active')}
                    className={`px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                      packageStatus === 'active'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${packageStatus === 'active' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                    <span>Publish</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {packageStatus === 'draft'
                    ? 'Paket berstatus draft tidak akan tampil di microsite agen.'
                    : 'Paket langsung aktif dan dapat diakses oleh calon jamaah.'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Status Saat Ini
                </label>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center space-x-2">
                    {initialData?.status === 'active' ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-semibold text-emerald-800">Telah Diterbitkan (Aktif)</span>
                      </>
                    ) : (
                      <>
                        <CircleOff className="w-4 h-4 text-slate-400" />
                        <span className="text-xs font-semibold text-slate-600">Nonaktif</span>
                      </>
                    )}
                  </div>
                </div>
                <p className="text-[11px] text-slate-400">
                  Status aktif/nonaktif dapat dikelola langsung lewat tombol switch di tabel daftar paket.
                </p>
              </div>
            )}

            {/* Tombol Simpan Utama & Batal */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100">
              <button
                type="submit"
                form="package-main-form"
                disabled={isPending || isProcessingImage}
                className="w-full py-3 px-4 bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center space-x-2"
              >
                <span>{getSubmitButtonLabel()}</span>
              </button>

              <Link
                href="/dashboard/packages"
                className="w-full py-2.5 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center"
              >
                Batal
              </Link>
            </div>
          </div>

          {/* Card 2: Gambar Unggulan (1:1 Ratio Canvas Crop) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Gambar Unggulan</h3>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                1:1
              </span>
            </div>

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageFileChange}
              className="hidden"
            />

            {/* Preview Box 1:1 */}
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-3 transition-colors">
              {isProcessingImage ? (
                <div className="text-center space-y-2">
                  <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs font-medium text-slate-500">Memproses & mengonversi gambar...</p>
                </div>
              ) : imagePreviewUrl ? (
                <>
                  <img
                    src={imagePreviewUrl}
                    alt="Featured preview"
                    className="w-full h-full object-cover rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 p-1.5 bg-slate-900/70 hover:bg-red-600 text-white rounded-lg backdrop-blur-xs transition-colors cursor-pointer"
                    title="Hapus gambar"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <div className="text-center space-y-2.5 p-4">
                  <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
                    <ImagePlus className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800">Belum ada gambar</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Pilih foto paket umroh. Gambar akan otomatis di-crop persegi (1:1).
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Tombol Upload / Ganti Gambar */}
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessingImage}
                className="flex-1 py-2.5 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
              >
                <UploadCloud className="w-4 h-4 text-slate-500" />
                <span>{imagePreviewUrl ? 'Ganti Foto' : 'Pilih Foto'}</span>
              </button>

              {imagePreviewUrl && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="py-2.5 px-3 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                  title="Hapus foto"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
