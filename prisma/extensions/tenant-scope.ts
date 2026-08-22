import { prisma } from '@/lib/prisma'

/**
 * tenant-scope.ts — Guardrail Isolasi Tenant Wajib (AGENTS.md Bagian 4)
 *
 * Mengembalikan Prisma Client yang di-extend untuk menyuntikkan filter `tenantId`
 * secara otomatis dan tidak bisa di-override ke setiap query tabel tenant-scoped.
 *
 * Aturan model Agent (dan model tenant-scoped masa depan):
 * - findMany, findFirst, count, update, updateMany, delete, deleteMany:
 *   otomatis inject tenantId ke where (menimpa tenantId caller)
 * - create, createMany: otomatis inject tenantId ke data
 * - findUnique: SENGAJA TIDAK didukung. Gunakan findFirst({ where: { ... } })
 */
export function getTenantScopedClient(tenantId: string) {
  if (!tenantId) {
    throw new Error('Tenant ID is required for tenant-scoped Prisma client')
  }

  return prisma.$extends({
    query: {
      agent: {
        async findMany({ args, query }) {
          args.where = { ...args.where, tenantId }
          return query(args)
        },
        async findFirst({ args, query }) {
          args.where = { ...args.where, tenantId }
          return query(args)
        },
        async count({ args, query }) {
          args.where = { ...args.where, tenantId }
          return query(args)
        },
        async update({ args, query }) {
          args.where = { ...args.where, tenantId }
          return query(args)
        },
        async updateMany({ args, query }) {
          args.where = { ...args.where, tenantId }
          return query(args)
        },
        async delete({ args, query }) {
          args.where = { ...args.where, tenantId }
          return query(args)
        },
        async deleteMany({ args, query }) {
          args.where = { ...args.where, tenantId }
          return query(args)
        },
        async create({ args, query }) {
          args.data = { ...args.data, tenantId }
          return query(args)
        },
        async createMany({ args, query }) {
          if (Array.isArray(args.data)) {
            args.data = args.data.map((item) => ({ ...item, tenantId }))
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
      },
    },
  })
}

export type TenantScopedClient = ReturnType<typeof getTenantScopedClient>
