'use client'

import { useState, useTransition } from 'react'
import { requestCashout } from './actions'
import { formatRupiah } from '@/lib/package-helpers'
import {
  Coins,
  CheckCircle2,
  Clock,
  Ban,
  Check,
  Loader2,
  AlertCircle,
  Sparkles,
} from 'lucide-react'

export interface BookingKomisiItem {
  id: string
  bookingCode: string
  jamaahName: string
  jamaahPhone: string
  packageName: string
  packageDuration?: string
  totalPax: number
  totalCommission: number
  commissionStatus: string
  paymentStatus: string
  createdAt: string | Date
}

interface CashoutFormProps {
  slug: string
  bookings: BookingKomisiItem[]
}

function formatDate(date: Date | string) {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d)
}

export function CashoutForm({ slug, bookings }: CashoutFormProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const eligibleBookings = bookings.filter((b) => b.commissionStatus === 'ready_to_cashout')
  const allEligibleSelected =
    eligibleBookings.length > 0 && eligibleBookings.every((b) => selectedIds.includes(b.id))

  const handleToggleSelect = (id: string) => {
    setMessage(null)
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const handleToggleSelectAll = () => {
    setMessage(null)
    if (allEligibleSelected) {
      setSelectedIds([])
    } else {
      setSelectedIds(eligibleBookings.map((b) => b.id))
    }
  }

  const selectedTotalCommission = bookings
    .filter((b) => selectedIds.includes(b.id))
    .reduce((acc, b) => acc + b.totalCommission, 0)

  const handleSubmitCashout = () => {
    if (selectedIds.length === 0) return
    setMessage(null)

    startTransition(async () => {
      const res = await requestCashout(slug, selectedIds)
      if (res.success) {
        setSelectedIds([])
        setMessage({
          type: 'success',
          text: `Pengajuan pencairan untuk ${selectedIds.length} booking berhasil dikirim! Menunggu verifikasi tim travel.`,
        })
      } else {
        setMessage({
          type: 'error',
          text: res.error || 'Gagal mengajukan pencairan',
        })
      }
      window.scrollTo({ top: 0, behavior: 'smooth' })
    })
  }

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'ready_to_cashout':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Siap Cair</span>
          </span>
        )
      case 'cashout_requested':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Menunggu Review</span>
          </span>
        )
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-teal-50 text-teal-700 border border-teal-200">
            <Check className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span>Sudah Dicairkan</span>
          </span>
        )
      case 'not_eligible':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
            <Ban className="w-3 h-3 text-slate-400 shrink-0" />
            <span>Belum Memenuhi</span>
          </span>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Alert Messages (Auto-scrolled on update) */}
      {message && (
        <div
          className={`p-4 rounded-xl border flex items-start gap-3 animate-in fade-in ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          )}
          <div className="text-xs sm:text-sm font-medium">{message.text}</div>
        </div>
      )}

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {bookings.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <Coins className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-800">Belum ada komisi</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Komisi dari jamaah yang mendaftar menggunakan tautan atau kode referral Anda akan tercatat di sini.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-12 text-center">
                    {eligibleBookings.length > 0 && (
                      <input
                        type="checkbox"
                        checked={allEligibleSelected}
                        onChange={handleToggleSelectAll}
                        aria-label="Pilih Semua Booking Siap Cair"
                        className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                      />
                    )}
                  </th>
                  <th className="py-3.5 px-4">Nama Pemesan</th>
                  <th className="py-3.5 px-4">Paket Umroh</th>
                  <th className="py-3.5 px-4">Pax</th>
                  <th className="py-3.5 px-4">Total Komisi</th>
                  <th className="py-3.5 px-4">Status Komisi</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Tanggal Daftar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {bookings.map((booking) => {
                  const isEligible = booking.commissionStatus === 'ready_to_cashout'
                  const isSelected = selectedIds.includes(booking.id)

                  return (
                    <tr
                      key={booking.id}
                      className={`transition-colors ${
                        isSelected ? 'bg-brand-50/40' : 'hover:bg-slate-50/70'
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 px-4 text-center">
                        {isEligible ? (
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelect(booking.id)}
                            aria-label={`Pilih booking ${booking.jamaahName}`}
                            className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                          />
                        ) : (
                          <span className="inline-block w-4 h-4" />
                        )}
                      </td>

                      {/* Nama Pemesan */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <div className="font-bold text-slate-900">{booking.jamaahName}</div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {booking.jamaahPhone}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            Kode: <span className="font-semibold">{booking.bookingCode}</span>
                          </div>
                        </div>
                      </td>

                      {/* Paket Umroh */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5 max-w-[220px]">
                          <div
                            className="font-semibold text-slate-800 line-clamp-1"
                            title={booking.packageName}
                          >
                            {booking.packageName}
                          </div>
                          {booking.packageDuration && (
                            <div className="text-[10px] text-slate-400">
                              Durasi: {booking.packageDuration}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Pax */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-800 font-bold rounded-md text-[11px]">
                          {booking.totalPax} Pax
                        </span>
                      </td>

                      {/* Total Komisi */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900 text-sm">
                          {formatRupiah(booking.totalCommission)}
                        </div>
                      </td>

                      {/* Status Komisi */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {renderStatusBadge(booking.commissionStatus)}
                      </td>

                      {/* Tanggal Daftar */}
                      <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap text-slate-500 text-[11px]">
                        {formatDate(booking.createdAt)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bottom Action Card / Summary */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-brand-600 shrink-0" />
            <span>Pencairan Komisi Terpilih</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-bold text-slate-900">
              {formatRupiah(selectedTotalCommission)}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              ({selectedIds.length} booking dicentang)
            </span>
          </div>
        </div>

        <button
          type="button"
          disabled={selectedIds.length === 0 || isPending}
          onClick={handleSubmitCashout}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-brand-600 hover:bg-brand-500 active:bg-brand-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Memproses Pengajuan...</span>
            </>
          ) : (
            <>
              <Coins className="w-4 h-4" />
              <span>Ajukan Pencairan</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
