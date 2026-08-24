'use client'

import { useState, useTransition } from 'react'
import { markBookingAsPaid } from './actions'
import { Check, Loader2, AlertCircle } from 'lucide-react'

interface MarkPaidButtonProps {
  bookingId: string
  bookingCode: string
  jamaahName: string
}

export function MarkPaidButton({ bookingId, bookingCode, jamaahName }: MarkPaidButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isConfirming, setIsConfirming] = useState(false)

  const handleMarkPaid = () => {
    setErrorMsg(null)
    startTransition(async () => {
      const res = await markBookingAsPaid(bookingId)
      if (!res.success) {
        setErrorMsg(res.error || 'Gagal mengubah status')
        setIsConfirming(false)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        setIsConfirming(false)
      }
    })
  }

  if (isConfirming) {
    return (
      <div className="flex items-center gap-1.5 animate-in fade-in">
        <button
          type="button"
          disabled={isPending}
          onClick={handleMarkPaid}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Check className="w-3.5 h-3.5" />
          )}
          <span>Ya, Lunas</span>
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => setIsConfirming(false)}
          className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors cursor-pointer disabled:opacity-50"
        >
          Batal
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={() => setIsConfirming(true)}
        className="inline-flex items-center gap-1 px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
      >
        <Check className="w-3.5 h-3.5" />
        <span>Tandai Lunas</span>
      </button>
      {errorMsg && (
        <div className="flex items-center gap-1 text-[11px] text-rose-600 font-medium">
          <AlertCircle className="w-3 h-3 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  )
}
