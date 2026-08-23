'use client'

import { useState } from 'react'
import { Sparkles, Info, X } from 'lucide-react'

interface BookingButtonProps {
  packageName: string
}

export function BookingButton({ packageName }: BookingButtonProps) {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="w-full py-3.5 sm:py-4 px-6 bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white font-bold text-sm sm:text-base rounded-xl transition-all shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 cursor-pointer"
      >
        <Sparkles className="w-4 h-4" />
        <span>Daftar Sekarang</span>
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 text-center space-y-4 relative">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 mx-auto flex items-center justify-center">
              <Info className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900">
                Pendaftaran {packageName}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Fitur pendaftaran online akan segera tersedia. Silakan hubungi customer service atau perwakilan travel resmi kami untuk booking langsung.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors"
              >
                Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
