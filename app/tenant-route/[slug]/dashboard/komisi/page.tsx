import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getTenantScopedClient } from '@/prisma/extensions/tenant-scope'
import { formatRupiah } from '@/lib/package-helpers'
import { CashoutForm, BookingKomisiItem } from './cashout-form'
import {
  ArrowLeft,
  Coins,
  CheckCircle2,
  Clock,
  Check,
  Building2,
  User,
} from 'lucide-react'

interface AgentKomisiPageProps {
  params: Promise<{ slug: string }>
}

export default async function AgentKomisiPage({ params }: AgentKomisiPageProps) {
  const { slug } = await params

  // 1. Resolve Tenant dari slug
  const tenant = await prisma.tenant.findUnique({
    where: { slug },
  })

  if (!tenant || tenant.status !== 'active') {
    notFound()
  }

  // 2. Guardrail EKSPLISIT DOBEL:
  // Kondisi A: session null ATAU accountType !== "agent" -> redirect ke login agent
  const session = await getSession()
  if (!session || session.accountType !== 'agent' || !session.accountId) {
    redirect('/login')
  }

  // Kondisi B: session.tenantId !== tenant.id -> redirect ke login agent
  if (session.tenantId !== tenant.id) {
    redirect('/login')
  }

  // 3. Query Agent by accountId via scoped client
  const tenantPrisma = getTenantScopedClient(tenant.id)
  const agent = await tenantPrisma.agent.findFirst({
    where: { id: session.accountId },
  })

  if (!agent || agent.status !== 'approved') {
    redirect('/login')
  }

  // 4. Query SEMUA Booking milik agent ini WAJIB via getTenantScopedClient
  const [bookings, packages] = await Promise.all([
    tenantPrisma.booking.findMany({
      where: {
        agentId: session.accountId,
      },
      orderBy: { createdAt: 'desc' },
    }),
    tenantPrisma.package.findMany({
      select: { id: true, name: true, duration: true },
    }),
  ])

  const packageMap = new Map(packages.map((p) => [p.id, p]))

  const mappedBookings: BookingKomisiItem[] = bookings.map((b) => {
    const pkg = packageMap.get(b.packageId)
    return {
      id: b.id,
      bookingCode: b.bookingCode,
      jamaahName: b.jamaahName,
      jamaahPhone: b.jamaahPhone,
      packageName: pkg?.name || 'Paket Umroh',
      packageDuration: pkg?.duration,
      totalPax: b.totalPax,
      totalCommission: b.totalCommission,
      commissionStatus: b.commissionStatus,
      paymentStatus: b.paymentStatus,
      createdAt: b.createdAt,
    }
  })

  // Summary Metrics
  const readyToCashoutSum = mappedBookings
    .filter((b) => b.commissionStatus === 'ready_to_cashout')
    .reduce((acc, b) => acc + b.totalCommission, 0)

  const pendingCashoutSum = mappedBookings
    .filter((b) => b.commissionStatus === 'cashout_requested')
    .reduce((acc, b) => acc + b.totalCommission, 0)

  const paidCashoutSum = mappedBookings
    .filter((b) => b.commissionStatus === 'paid')
    .reduce((acc, b) => acc + b.totalCommission, 0)

  return (
    <div className="min-h-screen bg-slate-50 font-sans p-4 sm:p-8 lg:p-12">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navigation & Header */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-500 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Dashboard Agen</span>
            </Link>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Komisi & Pencairan Agen
            </h1>
            <p className="text-xs text-slate-500">
              Mitra: <span className="font-semibold text-slate-700">{agent.name}</span> ({agent.referralCode}) • Travel: <span className="font-semibold text-slate-700">{tenant.name}</span>
            </p>
          </div>
        </div>

        {/* Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {/* Siap Cair */}
          <div className="bg-white p-5 rounded-2xl border border-emerald-200/80 bg-emerald-50/20 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-emerald-600">
              <span className="text-xs font-semibold uppercase tracking-wider">Siap Dicairkan</span>
              <Coins className="w-4 h-4" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-emerald-700">
              {formatRupiah(readyToCashoutSum)}
            </div>
            <p className="text-[11px] text-emerald-600/80">Centang baris untuk mengajukan</p>
          </div>

          {/* Menunggu Review */}
          <div className="bg-white p-5 rounded-2xl border border-amber-200/80 bg-amber-50/20 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-amber-600">
              <span className="text-xs font-semibold uppercase tracking-wider">Menunggu Review</span>
              <Clock className="w-4 h-4" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-amber-700">
              {formatRupiah(pendingCashoutSum)}
            </div>
            <p className="text-[11px] text-amber-600/80">Sedang diproses tim travel</p>
          </div>

          {/* Sudah Dicairkan */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Telah Dicairkan</span>
              <Check className="w-4 h-4 text-teal-600" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-800">
              {formatRupiah(paidCashoutSum)}
            </div>
            <p className="text-[11px] text-slate-400">Total komisi yang telah dibayar</p>
          </div>
        </div>

        {/* Cashout Table & Action Form */}
        <CashoutForm slug={slug} bookings={mappedBookings} />
      </div>
    </div>
  )
}
