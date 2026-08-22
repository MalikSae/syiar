import { PrismaClient } from '@prisma/client'
import { getTenantScopedClient } from '../prisma/extensions/tenant-scope'

const prisma = new PrismaClient()

async function runTenantIsolationTests() {
  console.log('=================================================================')
  console.log('       AUTOMATED TENANT ISOLATION SECURITY TEST SUITE')
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

  // 1. Persiapan Data: Pastikan ada 2 Tenant berbeda dengan minimal 1 Agent masing-masing
  console.log('[1/4] Mempersiapkan 2 tenant uji coba dan agen masing-masing...')

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

  // Agen Tenant A
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

  // Agen Tenant B
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

  console.log(`  Tenant A: ${tenantA.name} (ID: ${tenantA.id}) - Agen: ${agentA.name} (ID: ${agentA.id})`)
  console.log(`  Tenant B: ${tenantB.name} (ID: ${tenantB.id}) - Agen: ${agentB.name} (ID: ${agentB.id})\n`)

  // 2. Test Cross-Tenant Read via findFirst dengan ID spesifik
  console.log('[2/4] Menguji Cross-Tenant Read (findFirst by ID)...')

  // Scoped Client A mencari Agent B by ID -> HARUS null
  const leakCheck1 = await scopedClientA.agent.findFirst({
    where: { id: agentB.id },
  })
  assert(
    leakCheck1 === null,
    'Scoped Client A mencari Agent B by ID menghasilkan NULL',
    `Ditemukan data Agent B (${leakCheck1?.name}) melalui Scoped Client A!`
  )

  // Scoped Client B mencari Agent A by ID -> HARUS null
  const leakCheck2 = await scopedClientB.agent.findFirst({
    where: { id: agentA.id },
  })
  assert(
    leakCheck2 === null,
    'Scoped Client B mencari Agent A by ID menghasilkan NULL',
    `Ditemukan data Agent A (${leakCheck2?.name}) melalui Scoped Client B!`
  )

  // Scoped Client A mencari Agent A by ID -> HARUS ketemu
  const validCheckA = await scopedClientA.agent.findFirst({
    where: { id: agentA.id },
  })
  assert(
    validCheckA !== null && validCheckA.id === agentA.id,
    'Scoped Client A mencari Agent A by ID berhasil menemukan data miliknya sendiri'
  )

  // 3. Test Cross-Tenant List / Count / findMany
  console.log('\n[3/4] Menguji Cross-Tenant List (findMany & count)...')

  // Scoped Client A findMany -> HANYA berisi agen Tenant A
  const agentsInScopeA = await scopedClientA.agent.findMany()
  const hasForeignInA = agentsInScopeA.some((ag) => ag.tenantId !== tenantA.id)
  assert(
    !hasForeignInA && agentsInScopeA.length > 0,
    'Scoped Client A findMany() HANYA mengembalikan data milik Tenant A'
  )

  // Scoped Client B findMany -> HANYA berisi agen Tenant B
  const agentsInScopeB = await scopedClientB.agent.findMany()
  const hasForeignInB = agentsInScopeB.some((ag) => ag.tenantId !== tenantB.id)
  assert(
    !hasForeignInB && agentsInScopeB.length > 0,
    'Scoped Client B findMany() HANYA mengembalikan data milik Tenant B'
  )

  // Caller nakal mencoba override tenantId di where clause -> scoped client HARUS menimpa dan tetap aman
  const tamperedQuery = await scopedClientA.agent.findFirst({
    where: {
      id: agentB.id,
      tenantId: tenantB.id, // Percobaan override tenantId
    } as any,
  })
  assert(
    tamperedQuery === null,
    'Percobaan override tenantId di parameter query berhasil ditimpa dan menghasilkan NULL'
  )

  // 4. Test Strict findUnique Rejection
  console.log('\n[4/4] Menguji Penolakan Eksplisit findUnique...')
  let findUniqueBlocked = false
  try {
    await (scopedClientA.agent as any).findUnique({
      where: { id: agentA.id },
    })
  } catch (err: any) {
    if (err.message.includes('findUnique is intentionally not supported')) {
      findUniqueBlocked = true
    }
  }
  assert(
    findUniqueBlocked,
    'Pemanggilan findUnique ditolak dengan error instruksi penggunaan findFirst'
  )

  // Summary Report
  console.log('\n=================================================================')
  console.log(`HASIL AKHIR: ${passedAssertions} PASSED, ${failedAssertions} FAILED`)
  console.log('=================================================================')

  if (failedAssertions > 0) {
    console.error('\n🚨 FATAL: Terdeteksi kebocoran isolasi data antar tenant!')
    process.exit(1)
  } else {
    console.log('\n🛡️ SEMUA GUARDRAIL ISOLASI TENANT TERBUKTI AMAN (EXIT CODE 0).\n')
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
