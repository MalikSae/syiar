import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getTenantScopedClient } from '@/prisma/extensions/tenant-scope'
import { formatRupiah } from '@/lib/package-helpers'
import { CashoutItemCard, CashoutRequestItem, CashoutBookingDetail } from './cashout-item-card'
import {
  Coins,
  CheckCircle2,
  Clock,
  XCircle,
  Inbox,
  ArrowRight,
  ClipboardList,
} from 'lucide-react'

export default async function DashboardCashoutsPage() {
  // 1. Guardrail Sesi TravelUser
  const session = await getSession()
  if (!session || session.accountType !== 'travel_user' || !session.tenantId) {
    redirect('/login')
  }

  // 2. Query Tenant untuk Header Info
  const tenant = await prisma.tenant.findUnique({
    where: { id: session.tenantId },
    select: { name: true },
  })

  if (!tenant) {
    redirect('/login')
  }

  // 3. Query Scoped Cashout Data
  const tenantPrisma = getTenantScopedClient(session.tenantId)

  const [rawCashoutRequests, agents, travelUsers, packages] = await Promise.all([
    tenantPrisma.cashoutRequest.findMany({
      orderBy: { requestedAt: 'desc' },
    }),
    tenantPrisma.agent.findMany({
      select: { id: true, name: true, phone: true, referralCode: true },
    }),
    prisma.travelUser.findMany({
      where: { tenantId: session.tenantId },
      select: { id: true, name: true },
    }),
    tenantPrisma.package.findMany({
      select: { id: true, name: true },
    }),
  ])

  // Urutkan: status "pending" tampil paling atas, kemudian berdasarkan requestedAt terbaru
  const cashoutRequests = [...rawCashoutRequests].sort((a, b) => {
    if (a.status === 'pending' && b.status !== 'pending') return -1
    if (a.status !== 'pending' && b.status === 'pending') return 1
    return new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
  })

  const requestIds = cashoutRequests.map((r) => r.id)

  // Query Links & Bookings
  const requestLinks = await tenantPrisma.cashoutRequestBooking.findMany({
    where: { cashoutRequestId: { in: requestIds } },
  })

  const bookingIds = requestLinks.map((link) => link.bookingId)
  const bookings = await tenantPrisma.booking.findMany({
    where: { id: { in: bookingIds } },
  })

  // Maps
  const agentMap = new Map(agents.map((a) => [a.id, a]))
  const userMap = new Map(travelUsers.map((u) => [u.id, u.name]))
  const packageMap = new Map(packages.map((p) => [p.id, p.name]))
  const bookingMap = new Map(bookings.map((b) => [b.id, b]))

  // Group booking details per CashoutRequest
  const linksByRequestId = requestLinks.reduce<Record<string, string[]>>((acc, link) => {
    if (!acc[link.cashoutRequestId]) acc[link.cashoutRequestId] = []
    acc[link.cashoutRequestId].push(link.bookingId)
    return acc
  }, {})

  const mappedItems: CashoutRequestItem[] = cashoutRequests.map((req) => {
    const agent = agentMap.get(req.agentId)
    const linkedBookingIds = linksByRequestId[req.id] || []
    const reqBookings: CashoutBookingDetail[] = linkedBookingIds
      .map((bId) => bookingMap.get(bId))
      .filter((b): b is NonNullable<typeof b> => Boolean(b))
      .map((b) => ({
        id: b.id,
        bookingCode: b.bookingCode,
        jamaahName: b.jamaahName,
        jamaahPhone: b.jamaahPhone,
        packageName: packageMap.get(b.packageId) || 'Paket Umroh',
        totalPax: b.totalPax,
        totalCommission: b.totalCommission,
        paymentStatus: b.paymentStatus,
        commissionStatus: b.commissionStatus,
      }))

    const totalAmount = reqBookings.reduce((acc, b) => acc + b.totalCommission, 0)

    return {
      id: req.id,
      status: req.status,
      requestedAt: req.requestedAt,
      reviewedAt: req.reviewedAt,
      reviewedByName: req.reviewedBy ? userMap.get(req.reviewedBy) || 'Owner' : null,
      agentName: agent?.name || 'Agen Tidak Dikenal',
      agentPhone: agent?.phone || '-',
      agentReferralCode: agent?.referralCode || '-',
      totalAmount,
      bookingCount: reqBookings.length,
      bookings: reqBookings,
    }
  })

  // Summary Metrics
  const totalCount = mappedItems.length
  const pendingCount = mappedItems.filter((i) => i.status === 'pending').length
  const approvedCount = mappedItems.filter((i) => i.status === 'approved').length
  const totalPaidAmount = mappedItems
    .filter((i) => i.status === 'approved')
    .reduce((acc, i) => acc + i.totalAmount, 0)

  return (
    <div className="space-y-6">
      {/* Header Halaman Seamless */}
      <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <Coins className="w-6 h-6 text-brand-600 shrink-0" />
            <span>Review Pencairan Komisi Agen</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Verifikasi dan setujui permohonan pencairan komisi dari mitra agen travel{' '}
            <span className="font-semibold text-slate-700">{tenant.name}</span>.
          </p>
        </div>

        <Link
          href="/dashboard/bookings"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200 shadow-2xs transition-colors shrink-0 cursor-pointer"
        >
          <ClipboardList className="w-4 h-4" />
          <span>Lihat Semua Booking</span>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Pengajuan</span>
            <Coins className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-800">{totalCount}</div>
          <p className="text-[11px] text-slate-400">Seluruh permohonan</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200/60 bg-amber-50/20 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-amber-600">
            <span className="text-xs font-semibold uppercase tracking-wider">Menunggu Review</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-amber-700">{pendingCount}</div>
          <p className="text-[11px] text-amber-600/80">Perlu diproses</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200/60 bg-emerald-50/20 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-xs font-semibold uppercase tracking-wider">Disetujui</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-700">{approvedCount}</div>
          <p className="text-[11px] text-emerald-600/80">Komisi cair ke agen</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Cair</span>
            <Coins className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-slate-800 truncate">
            {formatRupiah(totalPaidAmount)}
          </div>
          <p className="text-[11px] text-slate-400">Akumulasi komisi approved</p>
        </div>
      </div>

      {/* List of Cashout Requests */}
      <div className="space-y-4">
        {mappedItems.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <Inbox className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-800">Belum ada pengajuan pencairan</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Permohonan pencairan komisi dari mitra agen akan muncul di halaman ini untuk Anda review.
              </p>
            </div>
          </div>
        ) : (
          mappedItems.map((item) => <CashoutItemCard key={item.id} item={item} />)
        )}
      </div>
    </div>
  )
}
