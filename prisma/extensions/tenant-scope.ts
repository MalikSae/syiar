import { prisma } from '@/lib/prisma'

/**
 * tenant-scope.ts — Guardrail Isolasi Tenant Wajib (AGENTS.md Bagian 4)
 *
 * Mengembalikan Prisma Client yang di-extend untuk menyuntikkan filter `tenantId`
 * secara otomatis dan tidak bisa di-override ke setiap query tabel tenant-scoped.
 *
 * Model yang terdaftar (Agent, Package, PackageDeparture):
 * - findMany, findFirst, count, update, updateMany, delete, deleteMany:
 *   otomatis inject tenantId ke where (menimpa tenantId caller)
 * - create, createMany: otomatis inject tenantId ke data
 * - findUnique: SENGAJA TIDAK didukung. Gunakan findFirst({ where: { ... } })
 */
function createTenantModelExtension(tenantId: string) {
  return {
    async findMany({ args, query }: any) {
      args.where = { ...args.where, tenantId }
      return query(args)
    },
    async findFirst({ args, query }: any) {
      args.where = { ...args.where, tenantId }
      return query(args)
    },
    async count({ args, query }: any) {
      args.where = { ...args.where, tenantId }
      return query(args)
    },
    async update({ args, query }: any) {
      args.where = { ...args.where, tenantId }
      return query(args)
    },
    async updateMany({ args, query }: any) {
      args.where = { ...args.where, tenantId }
      return query(args)
    },
    async delete({ args, query }: any) {
      args.where = { ...args.where, tenantId }
      return query(args)
    },
    async deleteMany({ args, query }: any) {
      args.where = { ...args.where, tenantId }
      return query(args)
    },
    async create({ args, query }: any) {
      args.data = { ...args.data, tenantId }
      return query(args)
    },
    async createMany({ args, query }: any) {
      if (Array.isArray(args.data)) {
        args.data = args.data.map((item: any) => ({ ...item, tenantId }))
      } else {
        args.data = { ...args.data, tenantId }
      }
      return query(args)
    },
    async findUnique() {
      throw new Error(
        'findUnique is intentionally not supported on tenant-scoped client. Use findFirst({ where: { ... } }) instead to ensure tenant isolation.'
      )
    },
  }
}

export function getTenantScopedClient(tenantId: string) {
  if (!tenantId) {
    throw new Error('Tenant ID is required for tenant-scoped Prisma client')
  }

  const modelScope = createTenantModelExtension(tenantId)

  return prisma.$extends({
    query: {
      agent: modelScope,
      package: modelScope,
      packageDeparture: modelScope,
      booking: modelScope,
    },
  })
}

export type TenantScopedClient = ReturnType<typeof getTenantScopedClient>
