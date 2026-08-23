# AGENTS.md — SyiarLink

> File ini WAJIB dibaca coding agent (Antigravity atau agent lain) sebelum mengerjakan task apa pun di project ini. Isinya konteks yang tidak boleh diasumsikan sendiri oleh agent — terutama aturan bisnis dan guardrail keamanan yang kalau salah interpretasi, dampaknya ke kebocoran data atau konflik komisi nyata antar pengguna.

---

## 1. Tentang Project

**SyiarLink** — SaaS multi-tenant untuk travel umroh mengelola jaringan agen/affiliate: pendaftaran agen, atribusi referral, komisi, poin rekrutmen, sampai billing langganan travel ke platform. Target pengguna: owner/staff travel umroh (tenant), agen (individu/content creator, terikat ke satu travel per akun), dan calon jamaah (tanpa akun).

Dokumen referensi lain di project ini (baca kalau butuh konteks lebih dalam sebelum mengerjakan area terkait):
- `PRD-SaaS-Sistem-Agen-Umroh-MVP.md` — requirement & user story lengkap
- `System-Design-SaaS-Agen-Umroh.md` — arsitektur, data model, keputusan trade-off
- `sprint.md` — roadmap & urutan pengerjaan per sprint

---

## 2. Tech Stack — JANGAN diganti tanpa konfirmasi eksplisit ke user

- **Framework**: Next.js (App Router), TypeScript
- **ORM**: Prisma
- **Database**: MySQL/MariaDB, self-hosted via aaPanel di VPS (BUKAN PostgreSQL — beberapa pola desain sengaja disesuaikan ke batasan MySQL, lihat Bagian 4)
- **Deployment**: VPS + aaPanel, proses Node dijalankan via PM2, Nginx sebagai reverse proxy
- **Payment gateway**: Duitku (untuk billing SaaS travel→platform; pembayaran jamaah→travel tetap manual, BUKAN lewat Duitku)
- **DNS**: Cloudflare (wajib untuk domain `syiar.link` — dipakai untuk wildcard SSL otomatis)
- **SSL**: `acme.sh` — wildcard untuk `*.syiar.link`, per-domain otomatis untuk custom domain travel
- **File upload/storage**: disk lokal project selama development, mengikuti struktur yang niru cara kerja di VPS nanti (folder `/uploads` di luar `/public`, disajikan lewat route handler sendiri — BUKAN Cloudflare R2, itu keputusan awal yang direvisi). Migrasi ke penyimpanan permanen di VPS terjadi natural di Sprint 8 tanpa ubah struktur folder/logic upload, cuma pindah lokasi fisik foldernya.

---

## 3. Struktur Folder (konvensi yang harus diikuti)

> **Catatan koreksi (Sprint 1)**: struktur di bawah ini sudah diperbaiki dari versi awal berdasarkan temuan implementasi nyata — bukan lagi rencana di atas kertas. Next.js 16 me-rename `middleware.ts` → `proxy.ts` (fungsi `middleware()` → `proxy()`), dan file ini **wajib di root project, sejajar dengan `/app`, BUKAN di dalamnya** — itu syarat teknis Next.js, bukan preferensi. Struktur route tenant juga berubah dari rencana awal `(tenant)` route group menjadi `tenant-route/[slug]/` yang eksplisit — route group tidak cocok jadi target rewrite dinamis dari proxy.

```
/proxy.ts                     → (ROOT project, bukan di /app) resolusi domain: root vs subdomain vs custom domain
/app
  /page.tsx                   → ROOT domain (marketing/landing)
  /login/                     → login TravelUser & PlatformAdmin (ROOT domain saja)
  /admin/                     → dashboard superadmin
  /tenant-route/[slug]/       → SEMUA route tenant, target rewrite dari proxy.ts untuk {slug}.syiar.link
    /login/                   → login Agent
    /page.tsx                 → microsite publik (daftar paket)
    /[kode]/                  → resolusi link referral
    /dashboard/                → dashboard Agent (jamaah, komisi, poin)
    /booking-status/          → cek status booking pakai booking_code
/prisma
  /schema.prisma
  /extensions/tenant-scope.ts → guardrail wajib, lihat Bagian 4
/lib
  /duitku.ts                  → wrapper API Duitku, termasuk verifikasi signature webhook
  /domain-resolver.ts         → helper resolusi hostname, dipakai proxy.ts — baca hostname dari
                                 header x-forwarded-host/host, BUKAN request.url (Turbopack dev
                                 server tidak meneruskan hostname asli ke request.url)
/scripts                      → dieksekusi via cron aaPanel, DI LUAR request lifecycle Next.js
  /domain-worker.ts           → cek DNS pending → terbitkan SSL → generate config Nginx → reload
  /billing-cron.ts            → generate invoice bulanan, cek jatuh tempo
```

**Aturan folder penting lainnya**: JANGAN pakai prefix underscore (`_nama`) untuk folder apa pun di dalam `/app` yang perlu diakses lewat URL — Next.js App Router memperlakukan folder ber-prefix underscore sebagai *Private Folder* dan otomatis di-exclude dari routing (ini yang bikin `_tenant` gagal di awal, sebelum diganti `tenant-route`).

Kalau agent menganggap ada struktur lain yang lebih idiomatik Next.js, **usulkan dulu ke user sebelum mengubah** — jangan restrukturisasi folder secara sepihak di tengah task lain.

---

## 4. Guardrail Wajib — Isolasi Tenant

Ini aturan paling kritis di seluruh project. Model multi-tenant di sini pakai kolom `tenant_id` di semua tabel yang scoped ke travel (`Agent`, `Booking`, `Commission`, `Reward`, dll). **Karena MySQL tidak punya Row Level Security seperti Postgres, satu-satunya lapis pertahanan adalah disiplin di kode aplikasi — dan itu berarti WAJIB lewat Prisma Client Extension yang sudah disiapkan di `prisma/extensions/tenant-scope.ts`.**

Aturan keras:
- **JANGAN PERNAH** menulis raw SQL query (`$queryRaw`, `$executeRaw`) ke tabel tenant-scoped kecuali sudah eksplisit include filter `tenant_id` dan direview manual oleh user
- **JANGAN PERNAH** memanggil Prisma Client dasar langsung untuk model tenant-scoped — selalu lewat client yang sudah di-wrap extension
- Kalau menambah tabel/model baru yang scoped ke tenant, **wajib daftarkan ke extension yang sama**, jangan buat query manual di controller/route handler
- Setiap fitur baru yang menyentuh data tenant-scoped **wajib disertai test yang membuktikan akses lintas-tenant gagal** (login sebagai Agent Travel A, coba akses data Travel B, harus selalu ditolak)

---

## 5. Tiga Jenis Akun — Jangan Dicampur

| Akun | Tabel | Login di | Scope |
|---|---|---|---|
| `TravelUser` (owner/staff) | `TravelUser` | **Root domain saja**: `syiar.link/login` | Satu tenant |
| `Agent` | `Agent` | Subdomain/custom domain travel: `{slug}.syiar.link/login` | Satu tenant, login independen — SATU orang bisa punya banyak akun `Agent` terpisah di travel berbeda, sistem TIDAK menyatukan identitas mereka |
| `PlatformAdmin` | `PlatformAdmin` | Root domain | Lintas semua tenant |

**Kenapa TravelUser login SELALU di root domain, tidak ikut custom domain**: keamanan — custom domain dikontrol DNS oleh travel sendiri, akses admin sensitif (approve komisi, ubah harga) tidak boleh bergantung pada infrastruktur pihak ketiga yang di luar kendali platform. Jangan pernah pindahkan rute login TravelUser ke bawah `tenant-route/`.

---

## 6. Aturan Bisnis Kritis (implisit = salah, harus eksplisit)

- **`referral_code` unik PER TENANT**, bukan lintas platform — karena link sudah dibedakan lewat subdomain/custom domain masing-masing travel
- **Komisi WAJIB di-snapshot** ke kolom `Booking` (`commission_value_snapshot`, `commission_type_snapshot`) saat booking dibuat — JANGAN pernah hitung komisi dengan join/referensi live ke skema komisi `Package` yang bisa berubah. Ini aturan trust paling penting di seluruh produk: sekali booking dibuat, komisinya terkunci selamanya di angka saat itu
- **Atribusi jamaah**: kode referral manual (field yang terlihat & bisa diedit user) adalah fallback utama. Link `?ref=` dengan localStorage 14 hari itu best-effort tambahan, BUKAN satu-satunya mekanisme
- **Resolusi domain**: begitu `custom_domain_status = "active"`, request ke subdomain lama HARUS 301 redirect ke custom domain (semua path, bukan cuma halaman tertentu) — link yang sudah disebar agen tidak boleh pernah 404
- **Webhook Duitku wajib verifikasi signature** sebelum memproses status pembayaran apa pun — jangan percaya payload webhook tanpa validasi hash

---

## 7. Prinsip Kerja untuk Setiap Task (ikuti pola dari skill Antigravity)

- **Batasi scope eksplisit** tiap prompt — kerjakan HANYA yang diminta, jangan sekalian "improve" bagian lain
- **Gate & validasi ditulis eksplisit** di kode (`abort`/`throw` dengan kondisi jelas), jangan cuma dijelaskan sebagai maksud
- **Verifikasi bertahap** — test satu-satu, stop dan laporkan kalau ada yang gagal, jangan lanjut ke langkah berikutnya sebelum yang sebelumnya beres
- **Bug fix**: investigasi dulu, laporkan root cause, baru fix — jangan langsung tembak solusi
- **Kalau implementasi sebelumnya rusak**: rollback via git dulu (`git checkout HEAD -- {file}`), baru coba pendekatan lain — jangan tumpuk fix di atas fix yang gagal

---

## 8. Environment Variables (placeholder — isi sesuai environment aktual, JANGAN commit nilai asli ke git)

```
DATABASE_URL=
BASE_DOMAIN=              # localhost:3000 di lokal (pakai *.localhost buat subdomain), syiar.link di production — jangan hardcode di kode
DUITKU_MERCHANT_CODE=
DUITKU_API_KEY=
CLOUDFLARE_API_TOKEN=
CLOUDFLARE_ZONE_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
VPS_SERVER_IP=
SESSION_SECRET=
```

## 8b. Domain Lokal vs Production — Jangan Tertukar

Selama development (Sprint 1-7, belum ada VPS), semua domain di atas (`syiar.link`, `{slug}.syiar.link`) itu target **production**. Untuk testing lokal, dipakai **`*.localhost`** (mis. `alhijrah.localhost:3000`) — BUKAN domain `.test` ala Laragon. Domain `.test` Laragon tidak mendukung wildcard subdomain (dikonfirmasi langsung oleh maintainer Laragon — tiap subdomain perlu ditambah manual ke hosts file), sementara `*.localhost` otomatis resolve ke `127.0.0.1` di browser modern tanpa setup apa pun, cocok untuk tenant yang dibuat dinamis lewat aplikasi (bukan didaftar manual satu-satu). Middleware resolusi domain tetap logic yang sama di kedua environment — cuma `.env` yang beda (base domain lokal vs production), jangan hardcode `syiar.link` di kode, selalu baca dari environment variable.

## 8c. Konvensi UI — Tidak Ada Emoji

**JANGAN PERNAH** pakai karakter emoji (✅❌📅🎉💰 dst) di UI aplikasi — baik di teks statis, label, status indicator, maupun elemen dekoratif apa pun. Selalu pakai icon component (lucide-react — install kalau belum ada, konsisten dipakai di seluruh project, jangan campur beberapa icon library berbeda). Ini berlaku permanen ke semua halaman, existing maupun baru — kalau nemu emoji yang kelewat di kode yang sudah ada, perbaiki jadi icon component saat menyentuh area itu, meski tidak diminta eksplisit di task tersebut.

## 9. Command Umum

```bash
npm run dev                    # dev server lokal
npx prisma migrate dev         # migrasi database (dev)
npx prisma studio              # lihat data lewat GUI
npx prisma generate            # regenerate Prisma client setelah ubah schema
npm run build && npm start     # build & jalankan production-mode lokal (simulasi sebelum deploy)
```

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
