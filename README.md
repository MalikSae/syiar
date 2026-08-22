# SyiarLink — SaaS Manajemen Agen & Affiliate Travel Umroh

**SyiarLink** adalah platform SaaS multi-tenant yang dirancang khusus untuk biro perjalanan (travel) umroh dalam mengelola jaringan mitra agen/affiliate secara terpusat, mulai dari pendaftaran agen, atribusi referral, skema komisi & poin, hingga microsite paket umroh publik.

---

## 🚀 Fitur Utama

- **Multi-Tenant Architecture**:
  - **Root Domain (`syiar.link`)**: Landing page publik, portal login TravelUser (owner/staff travel), dan portal Superadmin Platform (`/admin`).
  - **Subdomain Travel (`{slug}.syiar.link` / `*.localhost:3000`)**: Microsite publik katalog paket umroh, registrasi & login agen independen per travel.
  - **Custom Domain Ready**: Dukungan custom domain untuk travel dengan routing dinamis dan auto-SSL.
- **Strict Tenant Isolation Guardrail**:
  - Isolasi data level aplikasi menggunakan **Prisma Client Extension** (`prisma/extensions/tenant-scope.ts`).
  - Proteksi query otomatis untuk model *tenant-scoped* (`Agent`, `Booking`, `Commission`, `Reward`), mencegah kebocoran data lintas travel.
- **Manajemen Akun Terisolasi (3-Tier Auth)**:
  - `PlatformAdmin`: Superadmin lintas tenant untuk mengelola seluruh ekosistem platform.
  - `TravelUser`: Manajemen travel, verifikasi/approval pendaftaran mitra agen, pengaturan paket & komisi.
  - `Agent`: Mitra agen dengan kode referral unik per travel, pelacakan jamaah, saldo komisi, dan poin reward.
- **Alur Pendaftaran & Verifikasi Agen**:
  - Registrasi agen dengan status awal `pending` (tanpa auto-login).
  - Dashboard verifikasi agen untuk TravelUser (`Approve` / `Reject` dengan pelepasan constraint nomor HP otomatis).
- **Snapshot Komisi & Integritas Data**:
  - Nilai komisi terkunci (*snapshot*) saat booking dibuat untuk menjamin transparansi dan mencegah sengketa komisi.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router), TypeScript
- **Database & ORM**: MySQL / MariaDB via [Prisma ORM](https://www.prisma.io/)
- **Autentikasi**: JWT Session via `jose` & `bcryptjs` (HttpOnly Cookie)
- **Styling**: TailwindCSS
- **Proxy & Routing**: `proxy.ts` (Next.js 16 Domain Resolver)
- **Payment Gateway**: Duitku (Billing SaaS Travel $\rightarrow$ Platform)
- **Object Storage**: Cloudflare R2

---

## 📁 Struktur Direktori

```text
syiar/
├── proxy.ts                     # Resolusi domain: Root vs Subdomain (*.localhost / {slug}.syiar.link)
├── app/
│   ├── page.tsx                 # Root domain landing page
│   ├── login/                   # Login TravelUser & Admin di root domain
│   ├── register/                # Registrasi Travel & Akun TravelUser baru
│   ├── dashboard/               # Dashboard utama TravelUser (owner/staff)
│   │   └── agents/              # Halaman kelola, approve, dan reject pendaftaran agen
│   ├── admin/                   # Portal Superadmin Platform (/admin)
│   └── tenant-route/[slug]/     # Target routing dinamis untuk subdomain/custom domain travel
│       ├── page.tsx             # Microsite publik travel
│       ├── login/               # Portal login agen travel
│       ├── register/            # Form pendaftaran agen travel
│       └── dashboard/           # Dashboard agen travel
├── prisma/
│   ├── schema.prisma            # Skema database Prisma
│   ├── extensions/
│   │   └── tenant-scope.ts      # Guardrail wajib isolasi tenant
│   └── migrations/              # Riwayat migrasi database
├── lib/
│   ├── auth.ts                  # Helper password hashing & JWT session management
│   ├── prisma.ts                # Singleton PrismaClient
│   └── domain-resolver.ts       # Utility hostname parser
└── scripts/
    ├── seed-platform-admin.ts   # Script CLI seeding akun PlatformAdmin
    └── test-tenant-isolation.ts # Automated test suite isolasi data tenant (permanen)
```

---

## ⚙️ Persyaratan Sistem

- **Node.js**: v20.x atau v22.x LTS
- **Database**: MySQL 8.x atau MariaDB 10.x+
- **Package Manager**: `npm`

---

## 🚀 Panduan Memulai (Local Development)

### 1. Clone Repository & Install Dependency
```bash
git clone https://github.com/MalikSae/syiar.git
cd syiar
npm install
```

### 2. Konfigurasi Environment Variable
Salin template konfigurasi dan sesuaikan nilai koneksi database:
```bash
cp .env.example .env # atau buat file .env
```

Contoh konfigurasi `.env` untuk development lokal:
```env
DATABASE_URL="mysql://root:@127.0.0.1:3306/syiar_db"
BASE_DOMAIN="localhost:3000"
SESSION_SECRET="your-super-secret-jwt-key-min-32-chars"
```

> **Catatan Subdomain Lokal**: Testing subdomain di lokal menggunakan format `*.localhost:3000` (misal `alhijrah.localhost:3000`). Browser modern otomatis meresolve `*.localhost` ke `127.0.0.1` tanpa perlu mengubah file hosts.

### 3. Migrasi Database
Jalankan migrasi Prisma untuk membuat tabel-tabel di database:
```bash
npx prisma migrate dev
npx prisma generate
```

### 4. Seed Akun Superadmin Platform
Buat akun Superadmin pertama kali melalui CLI script yang aman:
```bash
npx tsx scripts/seed-platform-admin.ts admin@syiar.link PasswordSuper123!
```

### 5. Jalankan Development Server
```bash
npm run dev
```
Akses aplikasi melalui browser:
- **Root Portal**: [http://localhost:3000](http://localhost:3000)
- **Login TravelUser**: [http://localhost:3000/login](http://localhost:3000/login)
- **Portal Superadmin**: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
- **Subdomain Travel (Contoh)**: [http://alhijrah.localhost:3000](http://alhijrah.localhost:3000)

---

## 🧪 Pengujian & Guardrail Keamanan

Untuk memverifikasi keandalan isolasi tenant dan memastikan tidak ada kebocoran data antar travel, jalankan test suite otomatis:

```bash
npx tsx scripts/test-tenant-isolation.ts
```

Test suite ini menguji:
1. Pembacaan cross-tenant via ID spesifik $\rightarrow$ Menghasilkan `NULL`.
2. Pengambilan list data via `findMany()` $\rightarrow$ Hanya mengembalikan data tenant aktif.
3. Penolakan manipulasi query parameter $\rightarrow$ Filter `tenantId` otomatis ditimpa oleh extension.
4. Penolakan eksplisit metode `findUnique` pada model tenant-scoped.

---

## 📜 Perintah Berguna Lainnya

```bash
# Membuka GUI database Prisma Studio
npx prisma studio

# Typecheck TypeScript
npx tsc --noEmit

# Build production bundle
npm run build && npm start
```

---

## 📄 Lisensi

Hak Cipta &copy; 2026 **SyiarLink**. Seluruh hak cipta dilindungi undang-undang.
