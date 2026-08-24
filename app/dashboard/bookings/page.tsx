import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getTenantScopedClient } from '@/prisma/extensions/tenant-scope'
import { formatRupiah } from '@/lib/package-helpers'
import { MarkPaidButton } from './mark-paid-button'
import {
  ClipboardList,
  CheckCircle2,
  Check,
  Clock,
  User,
  Phone,
  Mail,
  Calendar,
  PackageOpen,
  DollarSign,
  AlertCircle,
  Coins,
} from 'lucide-react'

function formatDateTime(date: Date | string) {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

function formatDateOnly(date: Date | string) {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d)
}

export default async function DashboardBookingsPage() {
  // 1. Guardrail Sesi TravelUser
  const session = await getSession()
  if (!session || session.accountType !== 'travel_user' || !session.tenantId) {
    redirect('/login')
  }

  // 2. Query Tenant untuk info header
  const tenant = await prisma.tenant.findUnique({
    where: { id: session.tenantId },
    select: { name: true },
  })

  if (!tenant) {
    redirect('/login')
  }

  // 3. Query Booking Scoped ke Tenant via getTenantScopedClient
  const tenantPrisma = getTenantScopedClient(session.tenantId)

  const [bookings, packages, agents, departures] = await Promise.all([
    tenantPrisma.booking.findMany({
      orderBy: { createdAt: 'desc' },
    }),
    tenantPrisma.package.findMany({
      select: { id: true, name: true, slug: true, duration: true },
    }),
    tenantPrisma.agent.findMany({
      select: { id: true, name: true, referralCode: true, phone: true },
    }),
    tenantPrisma.packageDeparture.findMany({
      select: { id: true, date: true },
    }),
  ])

  const packageMap = new Map(packages.map((p) => [p.id, p]))
  const agentMap = new Map(agents.map((a) => [a.id, a]))
  const departureMap = new Map(departures.map((d) => [d.id, d]))

  // Summary Metrics
  const totalBookings = bookings.length
  const pendingBookings = bookings.filter((b) => b.paymentStatus === 'pending').length
  const paidBookings = bookings.filter((b) => b.paymentStatus === 'lunas').length
  const totalRevenue = bookings
    .filter((b) => b.paymentStatus === 'lunas')
    .reduce((acc, b) => acc + b.totalPrice, 0)

  return (
    <div className="space-y-6">
      {/* Header Halaman Seamless */}
      <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <ClipboardList className="w-6 h-6 text-brand-600 shrink-0" />
            <span>Daftar Booking Jamaah</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Kelola data pendaftaran jamaah, verifikasi pembayaran, dan pantau status komisi agen travel{' '}
            <span className="font-semibold text-slate-700">{tenant.name}</span>.
          </p>
        </div>

        <Link
          href="/dashboard/cashouts"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200 shadow-2xs transition-colors shrink-0 cursor-pointer"
        >
          <Coins className="w-4 h-4 text-brand-600" />
          <span>Pencairan Komisi</span>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Booking</span>
            <ClipboardList className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-800">{totalBookings}</div>
          <p className="text-[11px] text-slate-400">Seluruh pendaftaran</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200/60 bg-amber-50/20 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-amber-600">
            <span className="text-xs font-semibold uppercase tracking-wider">Menunggu Bayar</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-amber-900">{pendingBookings}</div>
          <p className="text-[11px] text-amber-600/80 font-medium">Status pending</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200/60 bg-emerald-50/20 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-xs font-semibold uppercase tracking-wider">Sudah Lunas</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-900">{paidBookings}</div>
          <p className="text-[11px] text-emerald-600/80 font-medium">Pembayaran terverifikasi</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Lunas</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-800">{formatRupiah(totalRevenue)}</div>
          <p className="text-[11px] text-slate-400">Akumulasi pembayaran</p>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {bookings.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <PackageOpen className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-800">Belum ada booking jamaah</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Pendaftaran paket umroh dari jamaah atau mitra agen akan muncul di tabel ini.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">Nama Pemesan</th>
                  <th className="py-3.5 px-4">Paket & Keberangkatan</th>
                  <th className="py-3.5 px-4">Pax</th>
                  <th className="py-3.5 px-4">Total Tagihan</th>
                  <th className="py-3.5 px-4">Status Bayar</th>
                  <th className="py-3.5 px-4">Agen Referral</th>
                  <th className="py-3.5 px-4">Tanggal Daftar</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {bookings.map((booking) => {
                  const pkg = packageMap.get(booking.packageId)
                  const agent = booking.agentId ? agentMap.get(booking.agentId) : null
                  const departure = booking.packageDepartureId
                    ? departureMap.get(booking.packageDepartureId)
                    : null

                  return (
                    <tr key={booking.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* 1. Nama Pemesan & Kontak */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="space-y-0.5">
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{booking.jamaahName}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500">
                            <span className="font-mono">{booking.jamaahPhone}</span>
                            {booking.jamaahEmail && (
                              <>
                                <span>•</span>
                                <span className="truncate max-w-[120px]" title={booking.jamaahEmail}>
                                  {booking.jamaahEmail}
                                </span>
                              </>
                            )}
                          </div>
                          <div className="text-[10px] font-mono text-slate-400 pt-0.5">
                            Kode: <span className="font-semibold text-slate-600">{booking.bookingCode}</span>
                          </div>
                        </div>
                      </td>

                      {/* 2. Paket & Jadwal */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5 max-w-[200px]">
                          <div className="font-semibold text-slate-800 line-clamp-1" title={pkg?.name || 'Paket Umroh'}>
                            {pkg?.name || 'Paket Umroh'}
                          </div>
                          {departure && (
                            <div className="text-[11px] text-slate-500 flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{formatDateOnly(departure.date)}</span>
                            </div>
                          )}
                          {pkg?.duration && (
                            <div className="text-[10px] text-slate-400">
                              Durasi: {pkg.duration}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* 3. Breakdown Pax */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="space-y-0.5">
                          <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-800 font-bold rounded-md text-[11px]">
                            {booking.totalPax} Pax
                          </span>
                          <div className="text-[10px] text-slate-400 flex items-center gap-1">
                            {booking.quadCount > 0 && <span>Q:{booking.quadCount}</span>}
                            {booking.tripleCount > 0 && <span>T:{booking.tripleCount}</span>}
                            {booking.doubleCount > 0 && <span>D:{booking.doubleCount}</span>}
                          </div>
                        </div>
                      </td>

                      {/* 4. Total Tagihan */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900">
                          {formatRupiah(booking.totalPrice)}
                        </div>
                        {booking.totalCommission > 0 && (
                          <div className="text-[10px] text-slate-400">
                            Komisi: {formatRupiah(booking.totalCommission)}
                          </div>
                        )}
                      </td>

                      {/* 5. Payment Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {booking.paymentStatus === 'lunas' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Lunas</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            <span>Pending</span>
                          </span>
                        )}
                      </td>

                      {/* 6. Nama Agen */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {agent ? (
                          <div className="space-y-0.5">
                            <div className="font-semibold text-slate-800 flex items-center gap-1">
                              <User className="w-3 h-3 text-brand-600 shrink-0" />
                              <span>{agent.name}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              Ref: {agent.referralCode}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Tanpa agen</span>
                        )}
                      </td>

                      {/* 7. Tanggal Daftar */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 text-[11px]">
                        {formatDateTime(booking.createdAt)}
                      </td>

                      {/* 8. Aksi */}
                      <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                        {booking.paymentStatus === 'pending' ? (
                          <MarkPaidButton
                            bookingId={booking.id}
                            bookingCode={booking.bookingCode}
                            jamaahName={booking.jamaahName}
                          />
                        ) : (
                          <span className="text-[11px] text-emerald-600 font-medium inline-flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            <span>Terverifikasi</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
