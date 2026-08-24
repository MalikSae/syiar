import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getTenantScopedClient } from '@/prisma/extensions/tenant-scope'
import { formatRupiah } from '@/lib/package-helpers'
import { TenantNavbar } from '../../components/tenant-navbar'
import { TenantFooter } from '../../components/tenant-footer'
import {
  CheckCircle2,
  Calendar,
  User,
  BedDouble,
  Receipt,
  ArrowLeft,
  Users,
} from 'lucide-react'

interface CekBookingPageProps {
  params: Promise<{ slug: string; bookingCode: string }>
}

export default async function CekBookingPage({ params }: CekBookingPageProps) {
  const { slug, bookingCode } = await params

  // 1. Resolve Tenant
  const tenant = await prisma.tenant.findUnique({
    where: { slug },
  })

  if (!tenant || tenant.status !== 'active') {
    notFound()
  }

  // 2. Resolve Booking dalam scope tenant
  const scopedClient = getTenantScopedClient(tenant.id)
  const booking = await scopedClient.booking.findFirst({
    where: { bookingCode },
  })

  if (!booking) {
    notFound()
  }

  // 3. Resolve Package
  const pkg = await scopedClient.package.findFirst({
    where: { id: booking.packageId },
  })

  // 4. Resolve Departure (jika ada)
  let departureDate: Date | null = null
  if (booking.packageDepartureId) {
    const departure = await scopedClient.packageDeparture.findFirst({
      where: { id: booking.packageDepartureId },
    })
    if (departure) departureDate = departure.date
  }

  return (
    <div className="min-h-screen flex flex-col bg-site-bg text-site-text font-inter">
      {/* Navbar */}
      <TenantNavbar
        tenantName={tenant.name}
        logoUrl={tenant.logoUrl}
        iconUrl={tenant.iconUrl}
      />

      <main className="flex-1 max-w-xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-6">
        {/* Success Card */}
        <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-xs text-center space-y-6">
          {/* Status Icon */}
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 mx-auto flex items-center justify-center shadow-xs">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-1.5">
            <h1 className="font-jakarta text-2xl sm:text-3xl font-bold text-site-text tracking-tight">
              Pendaftaran Berhasil!
            </h1>
            <p className="text-xs sm:text-sm text-site-text-muted">
              Terima kasih telah mendaftar. Simpan kode booking Anda untuk pengecekan status dan instruksi pembayaran.
            </p>
          </div>

          {/* Booking Code Highlight Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-stone-50 border-2 border-dashed border-brand-600/40 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-site-text-muted block">
              Kode Booking Anda
            </span>
            <div className="font-mono text-2xl sm:text-3xl font-black text-brand-600 tracking-wider select-all">
              {booking.bookingCode}
            </div>
          </div>

          {/* Ringkasan Booking */}
          <div className="text-left space-y-3 pt-2 border-t border-stone-100 text-xs sm:text-sm">
            <div className="flex items-center justify-between py-2 border-b border-stone-100">
              <span className="text-site-text-muted flex items-center gap-1.5 font-medium">
                <User className="w-3.5 h-3.5 text-stone-400" />
                <span>Nama Pemesan</span>
              </span>
              <span className="font-bold text-site-text">{booking.jamaahName}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-stone-100">
              <span className="text-site-text-muted flex items-center gap-1.5 font-medium">
                <Receipt className="w-3.5 h-3.5 text-stone-400" />
                <span>Paket Umroh</span>
              </span>
              <span className="font-bold text-site-text truncate max-w-[200px]">
                {pkg?.name ?? '-'}
              </span>
            </div>

            {departureDate && (
              <div className="flex items-center justify-between py-2 border-b border-stone-100">
                <span className="text-site-text-muted flex items-center gap-1.5 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-stone-400" />
                  <span>Keberangkatan</span>
                </span>
                <span className="font-bold text-site-text">
                  {new Date(departureDate).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
            )}

            {/* Rincian Kamar & Pax */}
            <div className="py-2 border-b border-stone-100 space-y-2">
              <span className="text-site-text-muted flex items-center gap-1.5 font-medium">
                <BedDouble className="w-3.5 h-3.5 text-stone-400" />
                <span>Rincian Kamar & Jamaah</span>
              </span>
              <div className="pl-5 space-y-1.5 text-xs">
                {booking.quadCount > 0 && (
                  <div className="flex items-center justify-between text-site-text">
                    <span>Kamar Quad ({booking.quadCount} orang)</span>
                    <span className="font-semibold">
                      {formatRupiah((booking.priceQuadSnapshot ?? 0) * booking.quadCount)}
                    </span>
                  </div>
                )}
                {booking.tripleCount > 0 && (
                  <div className="flex items-center justify-between text-site-text">
                    <span>Kamar Triple ({booking.tripleCount} orang)</span>
                    <span className="font-semibold">
                      {formatRupiah((booking.priceTripleSnapshot ?? 0) * booking.tripleCount)}
                    </span>
                  </div>
                )}
                {booking.doubleCount > 0 && (
                  <div className="flex items-center justify-between text-site-text">
                    <span>Kamar Double ({booking.doubleCount} orang)</span>
                    <span className="font-semibold">
                      {formatRupiah((booking.priceDoubleSnapshot ?? 0) * booking.doubleCount)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-stone-100">
              <span className="text-site-text-muted flex items-center gap-1.5 font-medium">
                <Users className="w-3.5 h-3.5 text-stone-400" />
                <span>Total Jamaah</span>
              </span>
              <span className="font-bold text-site-text">{booking.totalPax} orang</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-stone-100">
              <span className="text-site-text-muted font-medium">Total Biaya</span>
              <span className="font-black text-brand-600 text-sm sm:text-base">
                {formatRupiah(booking.totalPrice)}
              </span>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-site-text-muted font-medium">Status</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs font-bold text-amber-700">
                {booking.status === 'pending_payment'
                  ? 'Menunggu Pembayaran'
                  : booking.status}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 space-y-3">
            <Link
              href="/"
              className="w-full py-3.5 px-6 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-[0.99] text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all"
            >
              <span>Kembali ke Beranda</span>
            </Link>

            <Link
              href="/paket"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-site-text-muted hover:text-brand-600 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Lihat Paket Lainnya</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <TenantFooter tenantName={tenant.name} />
    </div>
  )
}
