/**
 * lib/tenant-defaults.ts
 * Shared default seed content for newly registered Tenants / Travel
 */

export const DEFAULT_HERO_SUBHEADLINE =
  'Perjalanan umroh yang terencana rapi dan dibimbing tim berpengalaman, dari persiapan hingga kepulangan.'

export function getDefaultHeroHeadline(tenantName: string): string {
  return `Wujudkan Ibadah Umroh Bersama ${tenantName}`
}

export const DEFAULT_FEATURES = [
  {
    icon: 'Shield',
    title: 'Pembimbing Berpengalaman',
    description: 'Muthawif yang membimbing tata cara ibadah sesuai sunnah.',
  },
  {
    icon: 'Building2',
    title: 'Hotel Terpilih',
    description: 'Akomodasi dengan jarak strategis ke Masjidil Haram dan Masjid Nabawi.',
  },
  {
    icon: 'Heart',
    title: 'Pendampingan Penuh',
    description: 'Pelayanan jamaah yang responsif sejak keberangkatan hingga kepulangan.',
  },
  {
    icon: 'FileText',
    title: 'Proses Transparan',
    description: 'Rincian fasilitas, paket, dan jadwal yang jelas.',
  },
]

export const DEFAULT_FAQS = [
  {
    question: 'Apa saja persyaratan utama untuk mendaftar paket umroh?',
    answer:
      'Persyaratan dokumen umumnya meliputi paspor yang masih berlaku, KTP & Kartu Keluarga, dan pas foto terbaru. Silakan hubungi tim kami untuk informasi detail dan persyaratan terkini.',
  },
  {
    question: 'Bagaimana bimbingan manasik umroh sebelum keberangkatan?',
    answer:
      "Kami menyediakan bimbingan manasik untuk mempersiapkan jamaah secara syar'i maupun teknis sebelum keberangkatan. Hubungi tim kami untuk jadwal terdekat.",
  },
  {
    question: 'Berapa jarak hotel penginapan ke Masjidil Haram dan Masjid Nabawi?',
    answer:
      'Jarak hotel bervariasi tergantung paket yang dipilih. Detail hotel dapat dilihat pada halaman masing-masing paket.',
  },
  {
    question: 'Apakah ada pendampingan khusus untuk jamaah lansia atau pengguna kursi roda?',
    answer:
      'Silakan hubungi tim kami untuk mendiskusikan kebutuhan pendampingan khusus sebelum mendaftar.',
  },
  {
    question: 'Bagaimana skema pembayaran dan pelunasan paket umroh?',
    answer:
      'Skema pembayaran dapat dilihat pada halaman detail masing-masing paket, atau hubungi tim kami untuk informasi lebih lanjut.',
  },
]
