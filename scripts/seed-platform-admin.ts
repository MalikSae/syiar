import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../lib/auth'

const prisma = new PrismaClient()

async function main() {
  const args = process.argv.slice(2)
  const email = args[0]?.trim().toLowerCase()
  const password = args[1]

  if (!email || !password) {
    console.error('Error: Email dan password wajib diisi sebagai argumen CLI.')
    console.error('Penggunaan: npx tsx scripts/seed-platform-admin.ts <email> <password>')
    process.exit(1)
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.error('Error: Format email tidak valid.')
    process.exit(1)
  }

  if (password.length < 8) {
    console.error('Error: Password minimal 8 karakter.')
    process.exit(1)
  }

  const hashedPassword = await hashPassword(password)
  const name = email.split('@')[0]

  const admin = await prisma.platformAdmin.upsert({
    where: { email },
    update: {
      password: hashedPassword,
    },
    create: {
      email,
      name,
      password: hashedPassword,
    },
  })

  console.log(`✅ PlatformAdmin berhasil di-seed:`)
  console.log(`   ID    : ${admin.id}`)
  console.log(`   Email : ${admin.email}`)
  console.log(`   Name  : ${admin.name}`)
  console.log(`   Status: Password berhasil di-hash dan disimpan.`)
}

main()
  .catch((err) => {
    console.error('Gagal melakukan seed PlatformAdmin:', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
