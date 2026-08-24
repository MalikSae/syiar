'use client'

import { useState, useTransition } from 'react'
import { approveCashoutRequest, rejectCashoutRequest } from './actions'
import { formatRupiah } from '@/lib/package-helpers'
import {
  Coins,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  Loader2,
  User,
  Phone,
  Calendar,
  AlertCircle,
  Package,
} from 'lucide-react'

export interface CashoutBookingDetail {
  id: string
  bookingCode: string
  jamaahName: string
  jamaahPhone: string
  packageName: string
  totalPax: number
  totalCommission: number
  paymentStatus: string
  commissionStatus: string
}

export interface CashoutRequestItem {
  id: string
  status: string
  requestedAt: Date | string
  reviewedAt?: Date | string | null
  reviewedByName?: string | null
  agentName: string
  agentPhone: string
  agentReferralCode: string
  totalAmount: number
  bookingCount: number
  bookings: CashoutBookingDetail[]
}

interface CashoutItemCardProps {
  item: CashoutRequestItem
}

function formatDate(date: Date | string) {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

export function CashoutItemCard({ item }: CashoutItemCardProps) {
  const [isExpanded, setIsExpanded] = useState(item.status === 'pending')
  const [isPending, startTransition] = useTransition()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [confirmAction, setConfirmAction] = useState<'approve' | 'reject' | null>(null)

  const handleApprove = () => {
    setErrorMsg(null)
    startTransition(async () => {
      const res = await approveCashoutRequest(item.id)
      if (!res.success) {
        setErrorMsg(res.error || 'Gagal menyetujui pengajuan')
        setConfirmAction(null)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        setConfirmAction(null)
      }
    })
  }

  const handleReject = () => {
    setErrorMsg(null)
    startTransition(async () => {
      const res = await rejectCashoutRequest(item.id)
      if (!res.success) {
        setErrorMsg(res.error || 'Gagal menolak pengajuan')
        setConfirmAction(null)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        setConfirmAction(null)
      }
    })
  }

  const renderStatusBadge = () => {
    switch (item.status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Disetujui</span>
          </span>
        )
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>Ditolak</span>
          </span>
        )
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Menunggu Review</span>
          </span>
        )
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition-all">
      {/* Top Header Row */}
      <div className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 bg-slate-50/40">
        <div className="flex items-start sm:items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-brand-50 border border-brand-500/20 text-brand-600 flex items-center justify-center shrink-0 shadow-2xs font-bold text-sm">
            <Coins className="w-5 h-5" />
          </div>
          <div className="min-w-0 space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-base font-bold text-slate-900 truncate">
                {item.agentName}
              </span>
              <span className="text-xs font-mono font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md border border-slate-200">
                {item.agentReferralCode}
              </span>
              {renderStatusBadge()}
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-400" />
                <span className="font-mono">{item.agentPhone}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span>Diajukan: {formatDate(item.requestedAt)}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right Info: Total Nominal */}
        <div className="flex items-end sm:items-end flex-col self-start sm:self-center shrink-0">
          <div className="text-xs text-slate-400 font-medium">Total Pengajuan</div>
          <div className="text-lg sm:text-xl font-bold text-slate-900">
            {formatRupiah(item.totalAmount)}
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            {item.bookingCount} Booking Jamaah
          </div>
        </div>
      </div>

      {/* Review Info (if already reviewed) */}
      {item.reviewedAt && (
        <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-100 text-xs text-slate-500 flex items-center justify-between gap-2">
          <span>
            Ditinjau pada: <span className="font-semibold text-slate-700">{formatDate(item.reviewedAt)}</span>
            {item.reviewedByName && (
              <span> oleh <span className="font-semibold text-slate-700">{item.reviewedByName}</span></span>
            )}
          </span>
        </div>
      )}

      {/* Error Message */}
      {errorMsg && (
        <div className="m-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Action Buttons (ONLY for pending) */}
      {item.status === 'pending' && (
        <div className="p-4 sm:px-6 bg-white border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            Periksa rincian booking di bawah sebelum menyetujui atau menolak transfer komisi.
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            {confirmAction === 'approve' ? (
              <div className="flex items-center gap-1.5 animate-in fade-in">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={handleApprove}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>Konfirmasi Setujui</span>
                </button>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => setConfirmAction(null)}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  Batal
                </button>
              </div>
            ) : confirmAction === 'reject' ? (
              <div className="flex items-center gap-1.5 animate-in fade-in">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={handleReject}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <X className="w-3.5 h-3.5" />
                  )}
                  <span>Konfirmasi Tolak</span>
                </button>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => setConfirmAction(null)}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  Batal
                </button>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => setConfirmAction('approve')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>Setujui</span>
                </button>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => setConfirmAction('reject')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-xl border border-rose-200/80 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                  <span>Tolak</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Accordion Toggle Bar */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-5 py-3 bg-slate-50/50 hover:bg-slate-100/70 border-t border-slate-100 text-xs font-semibold text-slate-600 flex items-center justify-between transition-colors cursor-pointer"
      >
        <span>
          {isExpanded ? 'Sembunyikan Rincian Booking' : `Lihat ${item.bookingCount} Booking Terkait`}
        </span>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        )}
      </button>

      {/* Expanded Table of Bookings */}
      {isExpanded && (
        <div className="border-t border-slate-100 overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <th className="py-2.5 px-5">Nama Pemesan</th>
                <th className="py-2.5 px-4">Paket Umroh</th>
                <th className="py-2.5 px-4">Pax</th>
                <th className="py-2.5 px-5 text-right">Komisi Booking</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {item.bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-5">
                    <div className="font-semibold text-slate-900">{booking.jamaahName}</div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      {booking.jamaahPhone} • Kode: {booking.bookingCode}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-slate-800 line-clamp-1">
                      {booking.packageName}
                    </div>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="font-bold text-slate-700">{booking.totalPax} Pax</span>
                  </td>
                  <td className="py-3 px-5 text-right whitespace-nowrap font-bold text-slate-900">
                    {formatRupiah(booking.totalCommission)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
