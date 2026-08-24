'use client'

import { useState, useEffect } from 'react'
import { formatRupiah } from '@/lib/package-helpers'

interface MobileStickyBookingProps {
  targetElementId: string
  lowestPrice?: number | null
}

export function MobileStickyBooking({
  targetElementId,
  lowestPrice,
}: MobileStickyBookingProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const el = document.getElementById(targetElementId)
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Jika card harga tampil (isIntersecting), sticky button hilang
        // Jika card harga tenggelam / keluar dari viewport, sticky button tampil
        setIsVisible(!entry.isIntersecting)
      },
      {
        root: null,
        threshold: 0.1,
      }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [targetElementId])

  const handleScrollToCard = () => {
    const el = document.getElementById(targetElementId)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 lg:hidden p-3.5 bg-white/95 backdrop-blur-md border-t border-stone-200/90 shadow-2xl transition-all duration-300 transform ${
        isVisible
          ? 'translate-y-0 opacity-100'
          : 'translate-y-full opacity-0 pointer-events-none'
      }`}
    >
      <div className="max-w-md mx-auto flex items-center justify-between gap-3 px-1">
        {lowestPrice ? (
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-site-text-muted block leading-none mb-1">
              Mulai Dari
            </span>
            <span className="text-sm sm:text-base font-black text-brand-600 truncate block leading-none">
              {formatRupiah(lowestPrice)}
            </span>
          </div>
        ) : (
          <span className="text-xs font-bold text-site-text truncate">
            Pilihan Paket
          </span>
        )}

        <button
          type="button"
          onClick={handleScrollToCard}
          className="py-2.5 px-5 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-[0.98] text-white font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-1.5 transition-all shrink-0 cursor-pointer"
        >
          <span>Booking Sekarang</span>
        </button>
      </div>
    </div>
  )
}
