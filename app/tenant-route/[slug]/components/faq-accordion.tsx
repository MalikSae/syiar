'use client'

import { useState } from 'react'
import { ChevronDown, HelpCircle } from 'lucide-react'

interface FAQItem {
  question: string
  answer: string
}

const FAQ_DATA: FAQItem[] = [
  {
    question: 'Apa saja persyaratan utama untuk mendaftar paket umroh?',
    answer:
      'Persyaratan dokumen meliputi paspor dengan masa berlaku minimal 8 bulan sebelum keberangkatan, KTP & Kartu Keluarga, buku nikah (bagi pasangan suami istri), pas foto terbaru dengan latar belakang putih, serta sertifikat vaksinasi sesuai ketentuan otoritas Arab Saudi.',
  },
  {
    question: 'Bagaimana bimbingan manasik umroh sebelum keberangkatan?',
    answer:
      'Kami menyelenggarakan sesi manasik umroh secara intensif sebelum keberangkatan, mencakup teori tata cara ibadah sesuai sunnah, panduan praktis tawaf dan sai, serta pembekalan fisik dan kesehatan selama di tanah suci.',
  },
  {
    question: 'Berapa jarak hotel penginapan ke Masjidil Haram dan Masjid Nabawi?',
    answer:
      'Hotel yang kami sediakan dipilih secara cermat di area strategis ring utama agar memudahkan jamaah menjangkau masjid dengan berjalan kaki secara nyaman untuk seluruh waktu sholat fardhu.',
  },
  {
    question: 'Apakah ada pendampingan khusus untuk jamaah lansia atau pengguna kursi roda?',
    answer:
      'Ya, tim muthawif dan pembimbing kami siap mendampingi jamaah lansia. Kami juga dapat memfasilitasi layanan kursi roda resmi beserta pendorong di Masjidil Haram dan Masjid Nabawi.',
  },
  {
    question: 'Bagaimana skema pembayaran dan pelunasan paket umroh?',
    answer:
      'Pendaftaran dapat diawali dengan pembayaran uang muka (DP) untuk mengamankan tiket pesawat dan kuota kamar. Pelunasan dapat diselesaikan sesuai jadwal termin yang disepakati sebelum tanggal keberangkatan.',
  },
]

export function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx)
  }

  return (
    <div className="space-y-3 max-w-3xl mx-auto">
      {FAQ_DATA.map((item, idx) => {
        const isOpen = openIndex === idx
        return (
          <div
            key={idx}
            className={`rounded-xl border transition-all duration-200 overflow-hidden ${
              isOpen
                ? 'bg-white border-brand-300 shadow-sm'
                : 'bg-white/80 border-stone-200/90 hover:border-stone-300 hover:bg-white'
            }`}
          >
            <button
              type="button"
              onClick={() => toggle(idx)}
              className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                    isOpen ? 'bg-brand-50 text-brand-600' : 'bg-stone-100 text-stone-500'
                  }`}
                >
                  <HelpCircle className="w-4 h-4" />
                </div>
                <span className="text-xs sm:text-sm font-bold text-site-text leading-snug">
                  {item.question}
                </span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-stone-400 shrink-0 transition-transform duration-200 ${
                  isOpen ? 'rotate-180 text-brand-600' : ''
                }`}
              />
            </button>

            {isOpen && (
              <div className="px-4 pb-5 sm:px-5 sm:pb-6 pt-1 text-xs sm:text-sm text-site-text-muted leading-relaxed border-t border-stone-100">
                <div className="pl-10">{item.answer}</div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
