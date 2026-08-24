import { PrismaClient } from '@prisma/client'
import { getTenantScopedClient } from '../prisma/extensions/tenant-scope'

const prisma = new PrismaClient()

async function runTenantIsolationTests() {
  console.log('=================================================================')
  console.log('       AUTOMATED TENANT ISOLATION SECURITY TEST SUITE')
  console.log('       (Agent, Package, PackageDeparture, Booking)')
  console.log('=================================================================\n')

  let passedAssertions = 0
  let failedAssertions = 0

  function assert(condition: boolean, testName: string, failureDetail?: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`)
      passedAssertions++
    } else {
      console.error(`  ❌ FAIL: ${testName}`)
      if (failureDetail) {
        console.error(`     Detail: ${failureDetail}`)
      }
      failedAssertions++
    }
  }

  // 1. Persiapan Data Tenant A & Tenant B
  console.log('[1/7] Mempersiapkan 2 tenant uji coba...')

  // Tenant A: Alhijrah
  let tenantA = await prisma.tenant.findUnique({ where: { slug: 'alhijrah' } })
  if (!tenantA) {
    tenantA = await prisma.tenant.create({
      data: { name: 'Alhijrah Tour & Travel', slug: 'alhijrah', status: 'active' },
    })
  }

  // Tenant B: Barokah (dummy test tenant)
  let tenantB = await prisma.tenant.findUnique({ where: { slug: 'barokah-test' } })
  if (!tenantB) {
    tenantB = await prisma.tenant.create({
      data: { name: 'PT Barokah Umroh Mandiri', slug: 'barokah-test', status: 'active' },
    })
  }

  // Scoped clients
  const scopedClientA = getTenantScopedClient(tenantA.id)
  const scopedClientB = getTenantScopedClient(tenantB.id)

  console.log(`  Tenant A: ${tenantA.name} (ID: ${tenantA.id})`)
  console.log(`  Tenant B: ${tenantB.name} (ID: ${tenantB.id})\n`)

  // ---------------------------------------------------------------------------
  // 2. Test Isolasi Model AGENT
  // ---------------------------------------------------------------------------
  console.log('[2/6] Menguji Isolasi Model AGENT...')

  let agentA = await scopedClientA.agent.findFirst({ where: { phone: '081111111111' } })
  if (!agentA) {
    agentA = await scopedClientA.agent.create({
      data: {
        tenantId: tenantA.id,
        name: 'Agen Tenant A',
        phone: '081111111111',
        password: 'hashed_password_a',
        referralCode: 'AGENTA01',
        status: 'approved',
      },
    })
  }

  let agentB = await scopedClientB.agent.findFirst({ where: { phone: '082222222222' } })
  if (!agentB) {
    agentB = await scopedClientB.agent.create({
      data: {
        tenantId: tenantB.id,
        name: 'Agen Tenant B',
        phone: '082222222222',
        password: 'hashed_password_b',
        referralCode: 'AGENTB01',
        status: 'approved',
      },
    })
  }

  const agentLeakA = await scopedClientA.agent.findFirst({ where: { id: agentB.id } })
  assert(agentLeakA === null, 'Agent: Scoped Client A mencari Agent B by ID menghasilkan NULL')

  const agentLeakB = await scopedClientB.agent.findFirst({ where: { id: agentA.id } })
  assert(agentLeakB === null, 'Agent: Scoped Client B mencari Agent A by ID menghasilkan NULL')

  const agentOwnA = await scopedClientA.agent.findFirst({ where: { id: agentA.id } })
  assert(agentOwnA !== null && agentOwnA.id === agentA.id, 'Agent: Scoped Client A mencari Agent A by ID berhasil menemukan data sendiri')

  const agentTampered = await scopedClientA.agent.findFirst({
    where: { id: agentB.id, tenantId: tenantB.id } as any,
  })
  assert(agentTampered === null, 'Agent: Percobaan override tenantId di query Agent berhasil ditimpa dan tetap NULL')

  // ---------------------------------------------------------------------------
  // 3. Test Isolasi Model PACKAGE
  // ---------------------------------------------------------------------------
  console.log('\n[3/6] Menguji Isolasi Model PACKAGE...')

  let pkgA = await scopedClientA.package.findFirst({ where: { name: 'Paket Umroh Reguler A' } })
  if (!pkgA) {
    pkgA = await scopedClientA.package.create({
      data: {
        tenantId: tenantA.id,
        name: 'Paket Umroh Reguler A',
        slug: 'paket-umroh-reguler-a',
        duration: '9 Hari',
        airline: 'Garuda Indonesia',
        hotelMakkah: 'Pullman Zamzam',
        hotelMadinah: 'Dallah Taibah',
        include: 'Tiket, Visa, Hotel',
        exclude: 'Paspor, Vaksin',
        itinerary: 'Hari 1-9 Rangkaian Ibadah',
        priceQuad: 28000000,
        commissionAmount: 1500000,
        status: 'active',
      },
    })
  }

  let pkgB = await scopedClientB.package.findFirst({ where: { name: 'Paket Umroh Reguler B' } })
  if (!pkgB) {
    pkgB = await scopedClientB.package.create({
      data: {
        tenantId: tenantB.id,
        name: 'Paket Umroh Reguler B',
        slug: 'paket-umroh-reguler-b',
        duration: '12 Hari',
        airline: 'Saudia Airlines',
        hotelMakkah: 'Swissotel Makkah',
        hotelMadinah: 'Madinah Hilton',
        include: 'Tiket, Visa, Hotel, Handling',
        exclude: 'Paspor',
        itinerary: 'Hari 1-12 Rangkaian Ibadah',
        priceQuad: 32000000,
        commissionAmount: 2000000,
        status: 'active',
      },
    })
  }

  const pkgLeakA = await scopedClientA.package.findFirst({ where: { id: pkgB.id } })
  assert(pkgLeakA === null, 'Package: Scoped Client A mencari Package B by ID menghasilkan NULL')

  const pkgLeakB = await scopedClientB.package.findFirst({ where: { id: pkgA.id } })
  assert(pkgLeakB === null, 'Package: Scoped Client B mencari Package A by ID menghasilkan NULL')

  const pkgOwnA = await scopedClientA.package.findFirst({ where: { id: pkgA.id } })
  assert(pkgOwnA !== null && pkgOwnA.id === pkgA.id, 'Package: Scoped Client A mencari Package A by ID berhasil menemukan data sendiri')

  const allPkgsInA = await scopedClientA.package.findMany()
  const foreignInA = allPkgsInA.some((p) => p.tenantId !== tenantA.id)
  assert(!foreignInA && allPkgsInA.length > 0, 'Package: Scoped Client A findMany() HANYA mengembalikan paket milik Tenant A')

  const pkgTampered = await scopedClientA.package.findFirst({
    where: { id: pkgB.id, tenantId: tenantB.id } as any,
  })
  assert(pkgTampered === null, 'Package: Percobaan override tenantId di query Package berhasil ditimpa dan tetap NULL')

  // ---------------------------------------------------------------------------
  // 4. Test Isolasi Model PACKAGEDEPARTURE
  // ---------------------------------------------------------------------------
  console.log('\n[4/6] Menguji Isolasi Model PACKAGEDEPARTURE...')

  let depA = await scopedClientA.packageDeparture.findFirst({ where: { packageId: pkgA.id } })
  if (!depA) {
    depA = await scopedClientA.packageDeparture.create({
      data: {
        tenantId: tenantA.id,
        packageId: pkgA.id,
        date: new Date('2026-10-15T00:00:00Z'),
        isActive: true,
      },
    })
  }

  let depB = await scopedClientB.packageDeparture.findFirst({ where: { packageId: pkgB.id } })
  if (!depB) {
    depB = await scopedClientB.packageDeparture.create({
      data: {
        tenantId: tenantB.id,
        packageId: pkgB.id,
        date: new Date('2026-11-20T00:00:00Z'),
        isActive: true,
      },
    })
  }

  const depLeakA = await scopedClientA.packageDeparture.findFirst({ where: { id: depB.id } })
  assert(depLeakA === null, 'PackageDeparture: Scoped Client A mencari Departure B by ID menghasilkan NULL')

  const depLeakB = await scopedClientB.packageDeparture.findFirst({ where: { id: depA.id } })
  assert(depLeakB === null, 'PackageDeparture: Scoped Client B mencari Departure A by ID menghasilkan NULL')

  const depOwnA = await scopedClientA.packageDeparture.findFirst({ where: { id: depA.id } })
  assert(depOwnA !== null && depOwnA.id === depA.id, 'PackageDeparture: Scoped Client A mencari Departure A by ID berhasil menemukan data sendiri')

  const allDepsInA = await scopedClientA.packageDeparture.findMany()
  const foreignDepInA = allDepsInA.some((d) => d.tenantId !== tenantA.id)
  assert(!foreignDepInA && allDepsInA.length > 0, 'PackageDeparture: Scoped Client A findMany() HANYA mengembalikan departure milik Tenant A')

  // ---------------------------------------------------------------------------
  // 5. Test Isolasi Model BOOKING
  // ---------------------------------------------------------------------------
  console.log('\n[5/7] Menguji Isolasi Model BOOKING...')

  let bookingA = await scopedClientA.booking.findFirst({ where: { bookingCode: 'BOOKTESTA01' } })
  if (!bookingA) {
    bookingA = await scopedClientA.booking.create({
      data: {
        tenantId: tenantA.id,
        packageId: pkgA.id,
        jamaahName: 'Ahmad Jamaah A',
        jamaahPhone: '081234567890',
        quadCount: 1,
        tripleCount: 0,
        doubleCount: 0,
        priceQuadSnapshot: 28000000,
        totalPrice: 28000000,
        totalPax: 1,
        commissionAmountSnapshot: 1500000,
        totalCommission: 1500000,
        bookingCode: 'BOOKTESTA01',
        status: 'pending_payment',
      },
    })
  }

  let bookingB = await scopedClientB.booking.findFirst({ where: { bookingCode: 'BOOKTESTB01' } })
  if (!bookingB) {
    bookingB = await scopedClientB.booking.create({
      data: {
        tenantId: tenantB.id,
        packageId: pkgB.id,
        jamaahName: 'Budi Jamaah B',
        jamaahPhone: '081298765432',
        quadCount: 0,
        tripleCount: 0,
        doubleCount: 1,
        priceDoubleSnapshot: 32000000,
        totalPrice: 32000000,
        totalPax: 1,
        commissionAmountSnapshot: 2000000,
        totalCommission: 2000000,
        bookingCode: 'BOOKTESTB01',
        status: 'pending_payment',
      },
    })
  }

  const bookingLeakA = await scopedClientA.booking.findFirst({ where: { id: bookingB.id } })
  assert(bookingLeakA === null, 'Booking: Scoped Client A mencari Booking B by ID menghasilkan NULL')

  const bookingLeakB = await scopedClientB.booking.findFirst({ where: { id: bookingA.id } })
  assert(bookingLeakB === null, 'Booking: Scoped Client B mencari Booking A by ID menghasilkan NULL')

  const bookingOwnA = await scopedClientA.booking.findFirst({ where: { id: bookingA.id } })
  assert(bookingOwnA !== null && bookingOwnA.id === bookingA.id, 'Booking: Scoped Client A mencari Booking A by ID berhasil menemukan data sendiri')

  const allBookingsInA = await scopedClientA.booking.findMany()
  const foreignBookingInA = allBookingsInA.some((b) => b.tenantId !== tenantA.id)
  assert(!foreignBookingInA && allBookingsInA.length > 0, 'Booking: Scoped Client A findMany() HANYA mengembalikan booking milik Tenant A')

  const bookingTampered = await scopedClientA.booking.findFirst({
    where: { id: bookingB.id, tenantId: tenantB.id } as any,
  })
  assert(bookingTampered === null, 'Booking: Percobaan override tenantId di query Booking berhasil ditimpa dan tetap NULL')

  // ---------------------------------------------------------------------------
  // 6. Test Strict findUnique Rejection pada Semua Model Scoped
  // ---------------------------------------------------------------------------
  console.log('\n[6/7] Menguji Penolakan Eksplisit findUnique pada Semua Model...')

  let agentFindUniqueBlocked = false
  try {
    await (scopedClientA.agent as any).findUnique({ where: { id: agentA.id } })
  } catch (err: any) {
    if (err.message.includes('findUnique is intentionally not supported')) {
      agentFindUniqueBlocked = true
    }
  }
  assert(agentFindUniqueBlocked, 'findUnique Agent ditolak keras')

  let pkgFindUniqueBlocked = false
  try {
    await (scopedClientA.package as any).findUnique({ where: { id: pkgA.id } })
  } catch (err: any) {
    if (err.message.includes('findUnique is intentionally not supported')) {
      pkgFindUniqueBlocked = true
    }
  }
  assert(pkgFindUniqueBlocked, 'findUnique Package ditolak keras')

  let depFindUniqueBlocked = false
  try {
    await (scopedClientA.packageDeparture as any).findUnique({ where: { id: depA.id } })
  } catch (err: any) {
    if (err.message.includes('findUnique is intentionally not supported')) {
      depFindUniqueBlocked = true
    }
  }
  assert(depFindUniqueBlocked, 'findUnique PackageDeparture ditolak keras')

  let bookingFindUniqueBlocked = false
  try {
    await (scopedClientA.booking as any).findUnique({ where: { id: bookingA.id } })
  } catch (err: any) {
    if (err.message.includes('findUnique is intentionally not supported')) {
      bookingFindUniqueBlocked = true
    }
  }
  assert(bookingFindUniqueBlocked, 'findUnique Booking ditolak keras')

  // ---------------------------------------------------------------------------
  // 7. Summary Report
  // ---------------------------------------------------------------------------
  console.log('\n=================================================================')
  console.log(`HASIL AKHIR: ${passedAssertions} PASSED, ${failedAssertions} FAILED`)
  console.log('=================================================================')

  if (failedAssertions > 0) {
    console.error('\n🚨 FATAL: Terdeteksi kebocoran isolasi data antar tenant!')
    process.exit(1)
  } else {
    console.log('\n🛡️ SEMUA GUARDRAIL ISOLASI TENANT (AGENT, PACKAGE, DEPARTURE, BOOKING) TERBUKTI AMAN (EXIT CODE 0).\n')
  }
}

runTenantIsolationTests()
  .catch((err) => {
    console.error('Error saat menjalankan test isolasi tenant:', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
