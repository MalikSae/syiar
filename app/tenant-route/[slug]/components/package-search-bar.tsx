'use client'

import { useState, useRef, useEffect } from 'react'
import { Search, Calendar, Compass, ChevronDown, Check } from 'lucide-react'

interface MonthOption {
  value: string
  label: string
}

interface PackageSearchBarProps {
  months: MonthOption[]
  initialQuery?: string
  initialMonth?: string
  className?: string
}

export function PackageSearchBar({
  months,
  initialQuery = '',
  initialMonth = '',
  className = '',
}: PackageSearchBarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(initialMonth)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Label bulan yang sedang dipilih
  const selectedLabel =
    months.find((m) => m.value === selectedMonth)?.label || 'Semua Bulan Keberangkatan'

  // Tutup dropdown jika user klik di luar area komponen
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const handleSelect = (val: string) => {
    setSelectedMonth(val)
    setIsOpen(false)
  }

  return (
    <div
      className={`bg-white rounded-xl sm:rounded-2xl border border-stone-200/90 p-4 sm:p-5 relative ${className ? className : 'shadow-xs'}`}
    >
      <form action="/paket" method="GET" className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 items-center">
        {/* Hidden input untuk menyertakan nilai bulan ke query string GET */}
        <input type="hidden" name="month" value={selectedMonth} />

        {/* Search Keyword Input */}
        <div className={`sm:col-span-12 ${months.length > 0 ? 'lg:col-span-6' : 'lg:col-span-9'}`}>
          <label htmlFor="search-q" className="block text-[11px] font-bold text-site-text-muted uppercase tracking-wider mb-1.5 pl-1">
            Kata Kunci / Nama Paket
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="search-q"
              type="text"
              name="q"
              defaultValue={initialQuery}
              placeholder="Cari paket umroh, hotel, dll..."
              className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-stone-50 border border-stone-200 rounded-lg sm:rounded-xl text-xs sm:text-sm text-site-text placeholder:text-stone-400 focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:bg-white transition-all font-inter"
            />
          </div>
        </div>

        {/* Custom Departure Month Dropdown */}
        {months.length > 0 && (
          <div className="sm:col-span-12 lg:col-span-4" ref={dropdownRef}>
            <label className="block text-[11px] font-bold text-site-text-muted uppercase tracking-wider mb-1.5 pl-1">
              Bulan Keberangkatan
            </label>
            <div className="relative">
              {/* Trigger Button */}
              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full pl-10 pr-3.5 py-2.5 sm:py-3 bg-stone-50 border text-left rounded-lg sm:rounded-xl text-xs sm:text-sm text-site-text flex items-center justify-between transition-all cursor-pointer ${
                  isOpen
                    ? 'border-brand-500 ring-2 ring-brand-500/20 bg-white'
                    : 'border-stone-200 hover:border-stone-300 hover:bg-white'
                }`}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
              >
                <Calendar className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <span className={`truncate ${selectedMonth ? 'font-bold text-site-text' : 'text-site-text-muted'}`}>
                  {selectedLabel}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-stone-400 shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-brand-600' : ''
                  }`}
                />
              </button>

              {/* Floating Custom Dropdown Menu */}
              {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-stone-200 rounded-xl shadow-2xl shadow-stone-900/10 py-1.5 z-50 max-h-64 overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
                  {/* Pilihan: Semua Bulan */}
                  <button
                    type="button"
                    onClick={() => handleSelect('')}
                    className={`w-full px-3.5 py-2.5 text-left text-xs sm:text-sm flex items-center justify-between transition-colors cursor-pointer ${
                      selectedMonth === ''
                        ? 'bg-brand-600/10 text-brand-600 font-bold'
                        : 'text-site-text hover:bg-stone-50 font-medium'
                    }`}
                  >
                    <span>Semua Bulan Keberangkatan</span>
                    {selectedMonth === '' && <Check className="w-4 h-4 text-brand-600 shrink-0" />}
                  </button>

                  <div className="h-px bg-stone-100 my-1 mx-2" />

                  {/* List Bulan dari Data */}
                  {months.map((m) => {
                    const isSelected = selectedMonth === m.value
                    return (
                      <button
                        key={m.value}
                        type="button"
                        onClick={() => handleSelect(m.value)}
                        className={`w-full px-3.5 py-2.5 text-left text-xs sm:text-sm flex items-center justify-between transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-brand-600/10 text-brand-600 font-bold'
                            : 'text-site-text hover:bg-stone-50 font-medium'
                        }`}
                      >
                        <span>{m.label}</span>
                        {isSelected && <Check className="w-4 h-4 text-brand-600 shrink-0" />}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className={`sm:col-span-12 ${months.length > 0 ? 'lg:col-span-2' : 'lg:col-span-3'} pt-1 sm:pt-0`}>
          <div className="hidden lg:block text-[11px] font-bold text-transparent select-none mb-1.5">
            Cari
          </div>
          <button
            type="submit"
            className="w-full py-2.5 sm:py-3 px-5 bg-brand-600 hover:bg-brand-500 active:bg-brand-700 text-white text-xs sm:text-sm font-bold rounded-lg sm:rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <Compass className="w-4 h-4" />
            <span>Cari Paket</span>
          </button>
        </div>
      </form>
    </div>
  )
}
