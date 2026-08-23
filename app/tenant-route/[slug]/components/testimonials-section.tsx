'use client'

import { useState, useEffect, useCallback } from 'react'
import { MessageSquareQuote, ChevronLeft, ChevronRight } from 'lucide-react'

export interface TestimonialItem {
  name: string
  roleOrLocation?: string
  role?: string
  city?: string
  quote?: string
  content?: string
}

interface TestimonialsSectionProps {
  items?: TestimonialItem[]
}

function getInitials(name: string): string {
  if (!name) return 'J'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function TestimonialsSection({ items = [] }: TestimonialsSectionProps) {
  const testimonials = items
  const isCarousel = testimonials.length > 3
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [visibleCount, setVisibleCount] = useState(3)

  // Deteksi jumlah kartu tampak berdasarkan ukuran layar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setVisibleCount(1) // Mobile: 1 kartu
      } else if (window.innerWidth < 1024) {
        setVisibleCount(2) // Tablet: 2 kartu
      } else {
        setVisibleCount(3) // Desktop: 3 kartu
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const maxIndex = Math.max(0, testimonials.length - visibleCount)

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1))
  }, [maxIndex])

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1))
  }, [maxIndex])

  // Auto-slide effect (4.5 detik) jika carousel aktif dan tidak sedang di-hover
  useEffect(() => {
    if (!isCarousel || isPaused) return

    const timer = setInterval(() => {
      nextSlide()
    }, 4500)

    return () => clearInterval(timer)
  }, [isCarousel, isPaused, nextSlide])

  // Reset index jika melebihi maxIndex akibat perubahan ukuran layar
  useEffect(() => {
    if (currentIndex > maxIndex) {
      setCurrentIndex(maxIndex)
    }
  }, [maxIndex, currentIndex])

  if (!testimonials || testimonials.length === 0) {
    return null
  }

  if (!isCarousel) {
    // Tampilan statis jika <= 3 item
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto">
        {testimonials.map((item, idx) => (
          <TestimonialCard key={idx} item={item} />
        ))}
      </div>
    )
  }

  // Tampilan Auto Slide Carousel jika > 3 item
  return (
    <div
      className="relative max-w-7xl mx-auto space-y-8"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Carousel Viewport */}
      <div className="overflow-hidden px-1 py-2">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{
            transform: `translateX(-${currentIndex * (100 / visibleCount)}%)`,
          }}
        >
          {testimonials.map((item, idx) => (
            <div
              key={idx}
              className="px-3 shrink-0"
              style={{ width: `${100 / visibleCount}%` }}
            >
              <TestimonialCard item={item} />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Controls (Arrows & Indicators) */}
      <div className="flex items-center justify-between gap-4 pt-2">
        {/* Dot Indicators */}
        <div className="flex items-center gap-2">
          {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                currentIndex === idx
                  ? 'w-8 bg-brand-600 shadow-xs'
                  : 'w-2.5 bg-stone-300 hover:bg-stone-400'
              }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Arrow Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={prevSlide}
            className="w-10 h-10 rounded-full border border-stone-300 bg-white hover:bg-stone-50 hover:border-brand-500 text-site-text hover:text-brand-600 flex items-center justify-center transition-all shadow-xs active:scale-95 cursor-pointer"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={nextSlide}
            className="w-10 h-10 rounded-full border border-stone-300 bg-white hover:bg-stone-50 hover:border-brand-500 text-site-text hover:text-brand-600 flex items-center justify-center transition-all shadow-xs active:scale-95 cursor-pointer"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

function TestimonialCard({ item }: { item: TestimonialItem }) {
  const quoteText = item.quote || item.content || ''
  const subtitle = item.roleOrLocation || (item.role && item.city ? `${item.role} · ${item.city}` : item.role || item.city || 'Jamaah Umroh')
  const initials = getInitials(item.name)

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-7 border border-stone-200/90 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-6 h-full select-none">
      {/* Quote Content */}
      <div className="space-y-4 text-left">
        <div className="w-10 h-10 rounded-lg bg-brand-600/10 border border-brand-600/20 text-brand-600 flex items-center justify-center">
          <MessageSquareQuote className="w-5 h-5" />
        </div>
        <p className="text-xs sm:text-sm text-site-text-muted leading-relaxed italic line-clamp-4 font-sans">
          &quot;{quoteText}&quot;
        </p>
      </div>

      {/* User Profile */}
      <div className="pt-4 border-t border-stone-100 flex items-center gap-3 text-left">
        <div className="w-10 h-10 rounded-full bg-site-dark text-white font-black text-xs flex items-center justify-center tracking-wider shrink-0 shadow-xs">
          {initials}
        </div>
        <div className="min-w-0">
          <h4 className="font-serif text-xs sm:text-sm font-bold text-site-text truncate">
            {item.name}
          </h4>
          <p className="text-[11px] text-site-text-muted truncate font-medium">
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  )
}
