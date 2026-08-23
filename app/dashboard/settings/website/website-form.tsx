'use client'

import { useState, useActionState, useRef, useEffect, startTransition } from 'react'
import {
  updateWebsiteSettings,
  WebsiteFormState,
  FeatureItem,
  FaqItem,
  TestimonialItem,
} from './actions'
import { processSquareImage, processLogoImage, processHeroImage } from '@/lib/image-processing'
import { RepeatableListEditor, ListEditorField } from '@/components/repeatable-list-editor'
import { getSitePalette } from '@/lib/color-utils'
import {
  Globe,
  Palette,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
  Trash2,
  Upload,
  Info,
  RotateCcw,
  Sparkles,
  LayoutTemplate,
  Award,
  HelpCircle,
  MessageSquareQuote,
} from 'lucide-react'

interface WebsiteFormProps {
  initialData: {
    customDomain: string
    primaryColor: string
    iconUrl: string
    logoUrl: string
    heroHeadline: string
    heroSubheadline: string
    heroBackgroundUrl: string
    features: FeatureItem[]
    faqs: FaqItem[]
    testimonials: TestimonialItem[]
  }
}

const FEATURE_FIELDS: ListEditorField[] = [
  {
    key: 'icon',
    label: 'Icon Tema Keunggulan',
    type: 'icon-picker',
  },
  {
    key: 'title',
    label: 'Judul Keunggulan',
    type: 'text',
    placeholder: 'Contoh: Hotel Bintang 5 Dekat Masjid',
    maxLength: 40,
  },
  {
    key: 'description',
    label: 'Deskripsi Singkat',
    type: 'textarea',
    placeholder: 'Contoh: Berjarak hanya 50 meter dari pelataran Masjidil Haram untuk kenyamanan ibadah Anda.',
    maxLength: 120,
    rows: 2,
  },
]

const FAQ_FIELDS: ListEditorField[] = [
  {
    key: 'question',
    label: 'Pertanyaan',
    type: 'text',
    placeholder: 'Contoh: Apakah ada bimbingan manasik sebelum keberangkatan?',
    maxLength: 150,
  },
  {
    key: 'answer',
    label: 'Jawaban',
    type: 'textarea',
    placeholder: 'Contoh: Ya, kami menyediakan bimbingan manasik lengkap tatap muka dan materi digital eksklusif.',
    maxLength: 800,
    rows: 3,
  },
]

const TESTIMONIAL_FIELDS: ListEditorField[] = [
  {
    key: 'name',
    label: 'Nama Jamaah',
    type: 'text',
    placeholder: 'Contoh: H. Agus Sulistyo',
    maxLength: 60,
  },
  {
    key: 'roleOrLocation',
    label: 'Peran / Lokasi',
    type: 'text',
    placeholder: 'Contoh: Jamaah Umroh Reguler, Jakarta',
    maxLength: 80,
  },
  {
    key: 'quote',
    label: 'Kutipan Testimoni',
    type: 'textarea',
    placeholder: 'Contoh: Alhamdulillah perjalanan sangat berkesan. Muthawwif ramah, hotel nyaman, dan bimbingan ibadahnya sangat membimbing.',
    maxLength: 600,
    rows: 3,
  },
]

function ensureFourFeatures(initialFeatures: FeatureItem[] | null | undefined): FeatureItem[] {
  const defaults: FeatureItem[] = [
    { icon: 'Building2', title: '', description: '' },
    { icon: 'Compass', title: '', description: '' },
    { icon: 'Clock', title: '', description: '' },
    { icon: 'Shield', title: '', description: '' },
  ]
  if (!initialFeatures || !Array.isArray(initialFeatures) || initialFeatures.length === 0) {
    return defaults
  }
  const result = [...initialFeatures]
  while (result.length < 4) {
    const defaultItem = defaults[result.length] || { icon: 'Shield', title: '', description: '' }
    result.push(defaultItem)
  }
  return result.slice(0, 4)
}

export function WebsiteForm({ initialData }: WebsiteFormProps) {
  const [state, formAction, isPending] = useActionState<WebsiteFormState | null, FormData>(
    updateWebsiteSettings,
    null
  )

  // 1. Custom Domain State
  const [customDomainEnabled, setCustomDomainEnabled] = useState(
    Boolean(initialData.customDomain)
  )
  const [customDomain, setCustomDomain] = useState(initialData.customDomain || '')

  // 2. Visual Identity State (Icon 1:1 & Logo Horizontal)
  const [iconPreviewUrl, setIconPreviewUrl] = useState<string | null>(
    initialData.iconUrl || null
  )
  const [selectedIconFile, setSelectedIconFile] = useState<File | null>(null)
  const [isIconRemoved, setIsIconRemoved] = useState<boolean>(false)
  const [isProcessingIcon, setIsProcessingIcon] = useState<boolean>(false)
  const iconInputRef = useRef<HTMLInputElement>(null)

  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(
    initialData.logoUrl || null
  )
  const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null)
  const [isLogoRemoved, setIsLogoRemoved] = useState<boolean>(false)
  const [isProcessingLogo, setIsProcessingLogo] = useState<boolean>(false)
  const logoInputRef = useRef<HTMLInputElement>(null)

  // 3. Primary Color State (null = default #F38020)
  const [primaryColor, setPrimaryColor] = useState<string | null>(
    initialData.primaryColor || null
  )
  const activeColorHex = primaryColor || '#F38020'

  // 4. Hero Section State
  const [heroHeadline, setHeroHeadline] = useState(initialData.heroHeadline || '')
  const [heroSubheadline, setHeroSubheadline] = useState(initialData.heroSubheadline || '')
  const [heroBackgroundPreviewUrl, setHeroBackgroundPreviewUrl] = useState<string | null>(
    initialData.heroBackgroundUrl || null
  )
  const [selectedHeroFile, setSelectedHeroFile] = useState<File | null>(null)
  const [isHeroRemoved, setIsHeroRemoved] = useState<boolean>(false)
  const [isProcessingHero, setIsProcessingHero] = useState<boolean>(false)
  const heroInputRef = useRef<HTMLInputElement>(null)

  // 5. Repeatable Sections State (Features WAJIB 4, FAQs, Testimonials)
  const [features, setFeatures] = useState<FeatureItem[]>(() =>
    ensureFourFeatures(initialData.features)
  )
  const [faqs, setFaqs] = useState<FaqItem[]>(initialData.faqs || [])
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>(initialData.testimonials || [])

  const [fileError, setFileError] = useState<string | null>(null)

  // Reset file selection state after successful server action submit
  useEffect(() => {
    if (state?.success) {
      setSelectedIconFile(null)
      setSelectedLogoFile(null)
      setSelectedHeroFile(null)
      setIsIconRemoved(false)
      setIsLogoRemoved(false)
      setIsHeroRemoved(false)
      if (iconInputRef.current) iconInputRef.current.value = ''
      if (logoInputRef.current) logoInputRef.current.value = ''
      if (heroInputRef.current) heroInputRef.current.value = ''
    }
  }, [state])

  // Auto-scroll ke atas begitu ada feedback state (sukses atau gagal)
  useEffect(() => {
    if (state || fileError) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [state, fileError])

  // Handler Icon Upload (1:1 Square Crop)
  const handleIconChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null)
    const file = e.target.files?.[0]
    if (!file) return

    setIsProcessingIcon(true)
    try {
      const result = await processSquareImage(file, 800)
      setSelectedIconFile(result.file)
      setIconPreviewUrl(result.previewUrl)
      setIsIconRemoved(false)
    } catch (err: any) {
      console.error('Error processing icon:', err)
      setFileError(err?.message || 'Gagal memproses icon.')
    } finally {
      setIsProcessingIcon(false)
    }
  }

  const handleRemoveIcon = () => {
    setIconPreviewUrl(null)
    setSelectedIconFile(null)
    setIsIconRemoved(true)
    if (iconInputRef.current) {
      iconInputRef.current.value = ''
    }
  }

  // Handler Logo Upload (Proportional, Natural Aspect Ratio)
  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null)
    const file = e.target.files?.[0]
    if (!file) return

    setIsProcessingLogo(true)
    try {
      const result = await processLogoImage(file, 1200, 400)
      setSelectedLogoFile(result.file)
      setLogoPreviewUrl(result.previewUrl)
      setIsLogoRemoved(false)
    } catch (err: any) {
      console.error('Error processing logo:', err)
      setFileError(err?.message || 'Gagal memproses logo.')
    } finally {
      setIsProcessingLogo(false)
    }
  }

  const handleRemoveLogo = () => {
    setLogoPreviewUrl(null)
    setSelectedLogoFile(null)
    setIsLogoRemoved(true)
    if (logoInputRef.current) {
      logoInputRef.current.value = ''
    }
  }

  // Handler Hero Background Upload (21:9 Wide Aspect Ratio Crop)
  const handleHeroBackgroundChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null)
    const file = e.target.files?.[0]
    if (!file) return

    setIsProcessingHero(true)
    try {
      const result = await processHeroImage(file, 1920)
      setSelectedHeroFile(result.file)
      setHeroBackgroundPreviewUrl(result.previewUrl)
      setIsHeroRemoved(false)
    } catch (err: any) {
      console.error('Error processing hero background:', err)
      setFileError(err?.message || 'Gagal memproses background hero.')
    } finally {
      setIsProcessingHero(false)
    }
  }

  const handleRemoveHeroBackground = () => {
    setHeroBackgroundPreviewUrl(null)
    setSelectedHeroFile(null)
    setIsHeroRemoved(true)
    if (heroInputRef.current) {
      heroInputRef.current.value = ''
    }
  }

  // Custom Submit Handler to Append All Fields
  const handleFormAction = (formData: FormData) => {
    formData.set('customDomainEnabled', customDomainEnabled ? 'true' : 'false')
    formData.set('customDomain', customDomainEnabled ? customDomain : '')
    formData.set('primaryColor', primaryColor || 'default')

    // Icon
    if (selectedIconFile) {
      formData.set('iconFile', selectedIconFile)
    }
    if (isIconRemoved) {
      formData.set('removeIcon', 'true')
    }

    // Logo
    if (selectedLogoFile) {
      formData.set('logoFile', selectedLogoFile)
    }
    if (isLogoRemoved) {
      formData.set('removeLogo', 'true')
    }

    // Hero Section
    formData.set('heroHeadline', heroHeadline)
    formData.set('heroSubheadline', heroSubheadline)
    if (selectedHeroFile) {
      formData.set('heroBackgroundFile', selectedHeroFile)
    }
    if (isHeroRemoved) {
      formData.set('removeHeroBackground', 'true')
    }

    // Repeatable Sections (Features, FAQs, Testimonials)
    formData.set('features', JSON.stringify(features))
    formData.set('faqs', JSON.stringify(faqs))
    formData.set('testimonials', JSON.stringify(testimonials))

    startTransition(() => {
      formAction(formData)
    })
  }

  // Character counter helpers
  const headlineLength = heroHeadline.length
  const isHeadlineIdeal = headlineLength >= 20 && headlineLength <= 60

  const subheadlineLength = heroSubheadline.length
  const isSubheadlineIdeal = subheadlineLength >= 80 && subheadlineLength <= 160

  return (
    <form action={handleFormAction} className="space-y-8">
      {/* Alert Sukses */}
      {state?.success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="font-medium">{state.message}</div>
        </div>
      )}

      {/* Alert Error */}
      {(fileError || (state && !state.success)) && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="font-semibold">{fileError || state?.message}</div>
        </div>
      )}

      {/* SECTION 1: Domain Kustom */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Domain Kustom</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Gunakan domain web milik travel Anda sendiri untuk microsite publik.
              </p>
            </div>
          </div>

          {/* Toggle Switch UI */}
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-semibold text-slate-600">
              {customDomainEnabled ? 'Aktif' : 'Nonaktif'}
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={customDomainEnabled}
              onClick={() => setCustomDomainEnabled(!customDomainEnabled)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                customDomainEnabled ? 'bg-brand-600' : 'bg-slate-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  customDomainEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {customDomainEnabled ? (
            <div className="space-y-3 animate-in fade-in duration-200">
              <label htmlFor="customDomain" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Nama Domain Anda
              </label>
              <div className="relative max-w-md">
                <input
                  type="text"
                  id="customDomain"
                  name="customDomain"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  placeholder="Contoh: alhijrah.com atau umroh.alhijrah.id"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-mono"
                />
              </div>
              <div className="p-3.5 bg-brand-50/70 rounded-xl border border-brand-200/60 text-xs text-slate-600 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Fitur custom domain otomatis (verifikasi DNS & SSL) akan aktif di rilis mendatang. Domain yang kamu simpan di sini akan diproses otomatis begitu fitur ini tersedia — kamu tidak perlu mengisi ulang.
                </p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">
              Microsite publik Anda saat ini menggunakan subdomain bawaan SyiarLink. Aktifkan toggle di atas jika Anda ingin menggunakan domain Anda sendiri.
            </p>
          )}
        </div>
      </div>

      {/* SECTION 2: Identitas Visual (Icon & Logo) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Identitas Visual & Branding</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Upload icon persegi (favicon / avatar) dan logo horizontal untuk header microsite.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* A. Upload Icon Persegi (1:1) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Icon Travel (Persegi 1:1)
              </label>
              <span className="text-[11px] text-slate-400">Favicon / Avatar</span>
            </div>

            <div className="flex items-center gap-4">
              {/* Preview Box 1:1 */}
              <div className="w-20 h-20 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden shrink-0 relative group">
                {iconPreviewUrl ? (
                  <img
                    src={iconPreviewUrl}
                    alt="Icon Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Sparkles className="w-6 h-6 text-slate-300" />
                )}
                {isProcessingIcon && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 text-brand-600 animate-spin" />
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <input
                  ref={iconInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleIconChange}
                  className="hidden"
                  id="icon-upload-input"
                />
                <button
                  type="button"
                  onClick={() => iconInputRef.current?.click()}
                  className="px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Upload className="w-3.5 h-3.5 text-slate-500" />
                  <span>{iconPreviewUrl ? 'Ganti Icon' : 'Pilih Icon'}</span>
                </button>
                {iconPreviewUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveIcon}
                    className="px-3 py-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Hapus</span>
                  </button>
                )}
              </div>
            </div>
            <p className="text-[11px] text-slate-400">
              Otomatis di-crop 1:1 dan dikonversi ke WebP berkualitas tinggi.
            </p>
          </div>

          {/* B. Upload Logo Horizontal */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Logo Horizontal
              </label>
              <span className="text-[11px] text-slate-400">Header Navigasi</span>
            </div>

            <div className="space-y-3">
              {/* Preview Box Horizontal */}
              <div className="w-full h-20 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden relative p-2">
                {logoPreviewUrl ? (
                  <img
                    src={logoPreviewUrl}
                    alt="Logo Preview"
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-slate-300 text-xs">
                    <ImageIcon className="w-5 h-5" />
                    <span>Belum ada logo horizontal</span>
                  </div>
                )}
                {isProcessingLogo && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 text-brand-600 animate-spin" />
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleLogoChange}
                  className="hidden"
                  id="logo-upload-input"
                />
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Upload className="w-3.5 h-3.5 text-slate-500" />
                  <span>{logoPreviewUrl ? 'Ganti Logo' : 'Pilih Logo'}</span>
                </button>
                {logoPreviewUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="px-3 py-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Hapus</span>
                  </button>
                )}
              </div>
            </div>
            <p className="text-[11px] text-slate-400">
              Rasio aspek alami dipertahankan, hanya diskalakan proporsional jika melebihi lebar maksimum.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 3: Warna Aksen */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Warna Aksen Brand</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Tentukan warna aksen utama yang digunakan untuk tombol CTA dan highlight di microsite Anda.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex flex-wrap items-center gap-6">
            {/* Native Color Picker & Hex Text */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Pilih Warna (Hex)
              </label>
              <div className="flex items-center gap-3">
                <div className="relative w-11 h-11 rounded-xl overflow-hidden border border-slate-300 shadow-2xs shrink-0 cursor-pointer">
                  <input
                    type="color"
                    id="color-picker-input"
                    value={activeColorHex}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="absolute inset-0 w-[150%] h-[150%] -top-1 -left-1 cursor-pointer border-0 p-0"
                  />
                </div>
                <div className="space-y-0.5">
                  <span className="font-mono text-sm font-bold text-slate-800 block">
                    {activeColorHex}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {primaryColor ? 'Warna Kustom' : 'Warna Default (Cloudflare Orange)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Reset to Default Button */}
            {primaryColor && (
              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => setPrimaryColor(null)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Gunakan Warna Default</span>
                </button>
              </div>
            )}
          </div>

          {/* Live Preview Box & Full Palette Derivation */}
          {(() => {
            const livePalette = getSitePalette(primaryColor)
            return (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                    Pratinjau Palet Harmonik Microsite
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Otomatis diderivasi secara harmonis
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* 1. Accent Utama */}
                  <div className="p-3.5 rounded-xl border border-slate-200/80 bg-white shadow-2xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-600">Aksen Utama</span>
                      <span className="font-mono text-[10px] text-slate-400">{livePalette.accent}</span>
                    </div>
                    <button
                      type="button"
                      style={{ backgroundColor: livePalette.accent }}
                      className="w-full py-2 px-3 rounded-lg text-white font-bold text-xs shadow-xs transition-transform active:scale-95 cursor-default select-none flex items-center justify-center gap-1.5"
                    >
                      <span>Tombol CTA</span>
                    </button>
                    <span className="text-[10px] text-slate-400 block text-center">Tombol aksi & highlight</span>
                  </div>

                  {/* 2. Accent Soft */}
                  <div className="p-3.5 rounded-xl border border-slate-200/80 bg-white shadow-2xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-600">Aksen Sekunder</span>
                      <span className="font-mono text-[10px] text-slate-400">{livePalette.accentSoft}</span>
                    </div>
                    <div
                      style={{ backgroundColor: livePalette.accentSoft }}
                      className="w-full py-2 px-3 rounded-lg text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 select-none"
                    >
                      <span>Badge / Tag</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block text-center">Hover & elemen aksen soft</span>
                  </div>

                  {/* 3. Site Background */}
                  <div
                    style={{ backgroundColor: livePalette.bg }}
                    className="p-3.5 rounded-xl border border-stone-300/80 shadow-2xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-800">Latar Belakang</span>
                      <span className="font-mono text-[10px] text-slate-600">{livePalette.bg}</span>
                    </div>
                    <div className="bg-white/90 p-2 rounded-lg border border-stone-200 shadow-2xs text-center">
                      <span className="text-[11px] font-semibold text-slate-800 block">Kartu Konten</span>
                    </div>
                    <span className="text-[10px] text-slate-600 block text-center">Background utama halaman</span>
                  </div>

                  {/* 4. Site Dark */}
                  <div
                    style={{ backgroundColor: livePalette.dark }}
                    className="p-3.5 rounded-xl border border-slate-800 shadow-2xs space-y-2 text-white"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-200">Area Gelap</span>
                      <span className="font-mono text-[10px] text-slate-400">{livePalette.dark}</span>
                    </div>
                    <div className="bg-white/10 p-2 rounded-lg border border-white/15 text-center">
                      <span className="text-[11px] font-semibold text-white block">Footer / Banner Gelap</span>
                    </div>
                    <span className="text-[10px] text-slate-300 block text-center">Section gelap & footer</span>
                  </div>
                </div>
              </div>
            )
          })()}

          <p className="text-[11px] text-slate-400">
            Nilai <code className="text-slate-600 bg-slate-100 px-1 py-0.5 rounded">null</code> pada database akan otomatis fallback ke warna oranye default (<code className="text-slate-600 bg-slate-100 px-1 py-0.5 rounded">#F38020</code>) di microsite.
          </p>
        </div>
      </div>

      {/* SECTION 4: Hero Section (Banner & Teks Pembuka) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
              <LayoutTemplate className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Hero Section (Banner Pembuka)</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Atur judul headline, subheadline pembuka, dan background banner yang tampil paling atas di microsite.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* A. Headline */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="heroHeadline" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Judul Headline Utama
              </label>
              <span
                id="headline-char-counter"
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border transition-colors ${
                  isHeadlineIdeal
                    ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                    : 'text-amber-700 bg-amber-50 border-amber-200'
                }`}
              >
                {headlineLength}/60 karakter
              </span>
            </div>
            <input
              type="text"
              id="heroHeadline"
              name="heroHeadline"
              value={heroHeadline}
              onChange={(e) => setHeroHeadline(e.target.value)}
              placeholder="Contoh: Wujudkan Ibadah Umroh Nyaman & Khusyuk Bersama Alhijrah"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-sans"
            />
            <p className="text-[11px] text-slate-400">
              Ideal: 20–60 karakter. Teks headline berukuran besar yang menarik perhatian calon jamaah.
            </p>
          </div>

          {/* B. Subheadline */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="heroSubheadline" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Teks Subheadline
              </label>
              <span
                id="subheadline-char-counter"
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border transition-colors ${
                  isSubheadlineIdeal
                    ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                    : 'text-amber-700 bg-amber-50 border-amber-200'
                }`}
              >
                {subheadlineLength}/160 karakter
              </span>
            </div>
            <textarea
              id="heroSubheadline"
              name="heroSubheadline"
              rows={3}
              value={heroSubheadline}
              onChange={(e) => setHeroSubheadline(e.target.value)}
              placeholder="Contoh: Layanan perjalanan ibadah umroh terbaik dengan bimbingan sesuai sunnah, hotel bintang 5 dekat masjid, dan kepastian jadwal keberangkatan."
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all resize-y leading-relaxed font-sans"
            />
            <p className="text-[11px] text-slate-400">
              Ideal: 80–160 karakter. Penjelasan ringkas keunggulan travel Anda.
            </p>
          </div>

          {/* C. Background Banner Image (21:9) */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Gambar Background Hero (Rasio Lebar 21:9)
              </label>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                21:9 Banner
              </span>
            </div>

            {/* Preview Box 21:9 */}
            <div className="relative aspect-[21/9] w-full rounded-2xl overflow-hidden bg-slate-100 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-3 transition-colors">
              {heroBackgroundPreviewUrl ? (
                <>
                  <img
                    src={heroBackgroundPreviewUrl}
                    alt="Hero Background Preview"
                    className="w-full h-full object-cover rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveHeroBackground}
                    className="absolute top-3 right-3 p-2 bg-slate-900/70 hover:bg-red-600 text-white rounded-xl backdrop-blur-xs transition-colors cursor-pointer shadow-sm"
                    title="Hapus gambar background"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <div className="text-center space-y-2 p-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-200/80 text-slate-400 flex items-center justify-center mx-auto">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-medium text-slate-500">
                    Belum ada background kustom (menggunakan pattern geometris bawaan).
                  </p>
                </div>
              )}
              {isProcessingHero && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-brand-600 animate-spin" />
                </div>
              )}
            </div>

            {/* Action Button */}
            <div className="flex items-center gap-3">
              <input
                ref={heroInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleHeroBackgroundChange}
                className="hidden"
                id="hero-bg-upload-input"
              />
              <button
                type="button"
                onClick={() => heroInputRef.current?.click()}
                className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Upload className="w-3.5 h-3.5 text-slate-500" />
                <span>{heroBackgroundPreviewUrl ? 'Ganti Background Hero' : 'Pilih Background Hero'}</span>
              </button>
              {heroBackgroundPreviewUrl && (
                <button
                  type="button"
                  onClick={handleRemoveHeroBackground}
                  className="px-3 py-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Background</span>
                </button>
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              Format 21:9 otomatis di-crop dan dikonversi ke WebP untuk performa loading maksimal di semua ukuran layar.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 5: Keunggulan Travel (features, WAJIB TEPAT 4) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Keunggulan & Nilai Lebih Travel</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Wajib 4 poin keunggulan utama travel Anda (mis. hotel dekat masjid, pembimbing sunnah, kepastian jadwal). Keempat slot wajib diisi lengkap.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <RepeatableListEditor<FeatureItem>
            items={features}
            fields={FEATURE_FIELDS}
            onChange={setFeatures}
            maxItems={4}
            minItems={4}
            addButtonLabel="Tambah Keunggulan"
            emptyMessage="Keunggulan wajib memiliki tepat 4 slot."
            itemTitlePrefix="Keunggulan"
            idPrefix="features"
          />
        </div>
      </div>

      {/* SECTION 6: FAQ (Pertanyaan yang Sering Diajukan, MIN 0, MAX 15) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Pertanyaan yang Sering Diajukan (FAQ)</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Daftar tanya jawab umum untuk membantu calon jamaah memahami syarat pendaftaran, dokumen, dan fasilitas perjalanan.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <RepeatableListEditor<FaqItem>
            items={faqs}
            fields={FAQ_FIELDS}
            onChange={setFaqs}
            maxItems={15}
            minItems={0}
            addButtonLabel="Tambah FAQ"
            emptyMessage="Belum ada daftar FAQ yang ditambahkan. Tambahkan FAQ untuk memudahkan calon jamaah menemukan jawaban cepat."
            itemTitlePrefix="FAQ"
            idPrefix="faqs"
          />
        </div>
      </div>

      {/* SECTION 7: Testimoni Jamaah (MIN 0, MAX 12) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
              <MessageSquareQuote className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Testimoni Jamaah</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Kutipan pengalaman langsung dari jamaah yang telah berangkat bersama travel Anda.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Informational Nudge Text */}
          <div className="p-3.5 bg-blue-50/80 rounded-xl border border-blue-200/70 text-xs text-blue-900 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Sebaiknya gunakan testimoni asli dari jamaah yang pernah berangkat bersama travel kamu — ini yang akan dilihat calon jamaah lain sebagai bahan pertimbangan.
            </p>
          </div>

          <RepeatableListEditor<TestimonialItem>
            items={testimonials}
            fields={TESTIMONIAL_FIELDS}
            onChange={setTestimonials}
            maxItems={12}
            minItems={0}
            addButtonLabel="Tambah Testimoni"
            emptyMessage="Belum ada testimoni jamaah. Tambahkan testimoni untuk membangun kepercayaan calon jamaah."
            itemTitlePrefix="Testimoni"
            idPrefix="testimonials"
          />
        </div>
      </div>

      {/* Sticky Save Action Card / Footer */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Simpan Seluruh Pengaturan Website</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Menyimpan domain, identitas visual, warna, hero banner, keunggulan, FAQ, dan testimoni sekaligus.
          </p>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-3 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 disabled:opacity-60 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Menyimpan Semua Data...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Simpan Pengaturan Website</span>
            </>
          )}
        </button>
      </div>
    </form>
  )
}
