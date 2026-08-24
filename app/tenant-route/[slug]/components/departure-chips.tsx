'use client'

import { useState, useRef, useEffect } from 'react'
import { CalendarOff } from 'lucide-react'
import { formatDepartureChipDate } from '@/lib/package-helpers'

interface DepartureItem {
  id: string
  date: Date | string
}

interface DepartureChipsProps {
  departures: DepartureItem[]
}

export function DepartureChips({ departures }: DepartureChipsProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [hasOverflowRight, setHasOverflowRight] = useState(false)
  const [hasOverflowLeft, setHasOverflowLeft] = useState(false)

  const checkOverflow = () => {
    if (!scrollRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
    setHasOverflowLeft(scrollLeft > 2)
    setHasOverflowRight(scrollWidth - scrollLeft > clientWidth + 2)
  }

  useEffect(() => {
    checkOverflow()
    window.addEventListener('resize', checkOverflow)
    return () => window.removeEventListener('resize', checkOverflow)
  }, [departures])

  if (departures.length === 0) {
    return (
      <div className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-50/70 border border-amber-200/60 text-amber-800 text-xs">
        <CalendarOff className="w-4 h-4 text-amber-600 shrink-0" />
        <p className="font-medium leading-snug">
          Jadwal keberangkatan akan segera diumumkan. Hubungi customer service untuk estimasi kuota.
        </p>
      </div>
    )
  }

  return (
    <div className="relative group/chips">
      {/* Left Fade Indicator (hanya jika sudah di-scroll ke kanan) */}
      {hasOverflowLeft && (
        <div className="pointer-events-none absolute left-0 top-0 bottom-1.5 w-6 bg-gradient-to-r from-white to-transparent z-10" />
      )}

      {/* Scrollable Container */}
      <div
        ref={scrollRef}
        onScroll={checkOverflow}
        className="flex overflow-x-auto gap-2 pb-1.5 pt-0.5 scrollbar-thin scrollbar-thumb-stone-200 scrollbar-track-transparent select-none"
      >
        {departures.map((dep) => {
          const { dayMonth, subtext, fullDate } = formatDepartureChipDate(dep.date)
          return (
            <div
              key={dep.id}
              title={fullDate}
              className="flex-none px-3 py-1.5 rounded-lg bg-brand-600/10 border border-brand-600/25 hover:border-brand-600/50 hover:bg-brand-600/15 transition-all text-center min-w-[76px]"
            >
              <div className="font-jakarta text-xs sm:text-sm font-bold text-site-text leading-tight">
                {dayMonth}
              </div>
              <div className="text-[9px] font-medium text-site-text-muted mt-0.5">
                {subtext}
              </div>
            </div>
          )
        })}
      </div>

      {/* Right Fade Indicator (hanya jika ada overflow ke kanan) */}
      {hasOverflowRight && (
        <div className="pointer-events-none absolute right-0 top-0 bottom-1.5 w-8 bg-gradient-to-l from-white to-transparent z-10" />
      )}
    </div>
  )
}
