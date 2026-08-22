# System Design: SaaS Multi-Tenant Sistem Agen Umroh + Billing

**Status:** Draft v1
**Konteks:** Solo builder, AI-assisted development, stack modern, target langsung multi-tenant dengan sistem billing SaaS

---

## Catatan Penting Sebelum Mulai — Dua Sistem Pembayaran yang Berbeda

Dokumen ini perlu memisahkan dua alur uang yang sama sekali berbeda, karena keduanya mudah tertukar:

1. **Pembayaran Jamaah → Travel** (B2C): jamaah bayar paket umroh ke rekening travel. Ini **tetap manual** sesuai PRD (jamaah transfer, konfirmasi, travel cek mutasi & approve). Tidak berubah dari desain sebelumnya.
2. **Pembayaran Travel → Platform** (B2B, SaaS billing): travel bayar biaya langganan untuk pakai platform ini. **Ini yang baru** dan jadi fokus tambahan di system design ini — travel berlangganan bulanan/tahunan, dan ini yang perlu diotomasi sejak awal karena tanpa ini platform tidak punya model bisnis yang jalan sendiri.

Asumsi kerja: yang dimaksud "sistem SaaS billing" adalah nomor 2. Kalau ternyata maksudnya juga mengotomasi nomor 1, itu perlu didiskusikan ulang karena mengubah keputusan arsitektur secara signifikan (payment gateway untuk end-user jamaah punya kompleksitas kepatuhan yang beda dari billing B2B).

---

## 1. Requirements Gathering

### Functional Requirements (ringkasan dari PRD)
- Multi-tenant: satu instance platform melayani banyak travel (tenant), masing-masing dengan microsite, agen, jamaah, dan data terisolasi
- Travel: kelola agen, paket, komisi, approval pembayaran jamaah, approval redeem komisi/reward
- Agen: dua mode input jamaah (manual + link referral), lihat performa, lihat komisi, ajukan redeem, rekrut agen baru dapat poin
- Jamaah: daftar via microsite, cek status via kode booking, tanpa akun/login
- **Baru — SaaS Billing**: travel berlangganan plan berbayar, invoice otomatis berulang, pembatasan fitur/kuota berdasarkan plan, status suspend jika telat bayar

### Non-Functional Requirements
- **Multi-tenancy dengan isolasi data yang kuat** — ini prioritas tertinggi karena kebocoran data antar travel (misal travel A bisa lihat data agen travel B) adalah kegagalan fatal untuk model SaaS
- **Solo builder + AI-assisted coding** — desain harus meminimalkan kompleksitas operasional (hindari microservices, hindari orkestrasi container manual), dan punya *guardrail* otomatis yang menangkap kesalahan manusia/AI (dijelaskan di bagian data model)
- **Skala awal**: desain untuk puluhan-ratusan tenant di tahun pertama, bukan ribuan — jangan over-engineer untuk skala yang belum tentu tercapai
- **Biaya rendah di awal** — pakai layanan managed dengan free tier/pay-as-you-grow, karena revenue belum ada saat baru mulai

### Constraints
- Tim: 1 orang, dibantu AI coding agent (bukan tim engineering berpengalaman besar)
- Stack: Node.js modern (Next.js), hosting di VPS dengan aaPanel — bukan Laravel/shared hosting, bukan juga platform managed (Vercel/Railway); konsekuensinya otomasi domain/SSL/deployment jadi tanggung jawab sendiri (lihat Bagian 3 & 4)
- Perlu billing SaaS otomatis sejak v1 — bukan dikerjakan manual dulu seperti pembayaran jamaah
- Target pasar: travel umroh Indonesia → payment provider harus support metode lokal (VA bank, e-wallet), bukan cuma kartu kredit internasional

---

## 2. High-Level Design

### Component Diagram

```
                            ┌─────────────────────────┐
                            │   Payment Provider       │
                            │   (Duitku — invoice &    │
                            │   recurring billing)      │
                            └───────────┬──────────────┘
                                        │ webhook
                                        ▼
┌──────────────┐   HTTPS    ┌──────────────────────────┐
│  Browser      │◄──────────►│   Aplikasi Web (Next.js) │
│  - Dashboard  │            │   - UI (React)            │
│    Travel     │            │   - API routes/actions    │
│  - Dashboard  │            │   - Middleware auth +      │
│    Agen       │            │     tenant isolation       │
│  - Microsite  │            └───────────┬───────────────┘
│    Publik     │                        │
└──────────────┘                        │
                                        ▼
                        ┌───────────────────────────────┐
                        │  PostgreSQL (managed, mis.      │
                        │  Neon/Supabase/Railway)          │
                        │  - Row Level Security aktif      │
                        │  - tenant_id di semua tabel utama│
                        └───────────────────────────────┘
                                        │
                        ┌───────────────┴───────────────┐
                        ▼                                 ▼
              ┌──────────────────┐             ┌──────────────────────┐
              │  Object Storage    │             │  Background Jobs      │
              │  (Cloudflare R2)   │             │  (cron terjadwal:     │
              │  - bukti transfer  │             │  generate invoice     │
              │  - dokumen agen    │             │  bulanan, reminder,   │
              └──────────────────┘             │  cek langganan lewat  │
                                                 │  jatuh tempo)          │
                                                 └──────────────────────┘
```

### Data Flow — Tiga Alur Kunci

**A. Atribusi referral & booking**
```
Agen share link travelnya sendiri: {slug}.syiar.link/{kode} atau {custom_domain}/{kode}
   → Server resolusi domain dulu (lihat "Resolusi Domain & Redirect Otomatis" di Bagian 3)
     untuk pastikan mendarat di domain kanonik travel tsb
   → Lookup {kode} → ketemu Agent (scoped ke tenant ini) → referral_code-nya valid
   → Jamaah landing di microsite → form prefill kode referral (localStorage 14 hari
     sbg fallback lintas sesi)
   → Jamaah submit form
   → Server: buat record Booking dengan agent_id yang sesuai, snapshot komisi%
     saat itu juga ke kolom Booking (bukan referensi ke tabel skema komisi
     yang bisa berubah)
   → Booking berstatus "pending_payment"
```

**B. Pelunasan & pencairan komisi**
```
Travel ubah status Booking → "lunas"
   → Trigger: update status Commission terkait dari "potential" → "ready_to_cashout"
   → Agen ajukan redeem → RedemptionRequest dibuat
   → Travel approve → status "paid", dicatat siapa & kapan approve
     (transfer aktual tetap manual di luar sistem)
```

**C. SaaS billing (baru)**
```
Cron bulanan (mis. tanggal 1) → baca semua Tenant dengan subscription aktif
   → generate Invoice via Duitku API untuk tiap tenant sesuai plan-nya
   → kirim link invoice (email/WA)
   → Duitku webhook saat dibayar → update status Invoice = paid,
     perpanjang periode Subscription
   → Cron harian cek Invoice yang lewat jatuh tempo (mis. >3 hari)
     → set Subscription status = "past_due"
     → jika >X hari lagi → set status = "suspended" (tenant masuk mode read-only
       atau microsite nonaktif, tergantung kebijakan yang dipilih)
```

### API Contracts (gaya, bukan daftar lengkap — lihat Bagian 3)
REST over JSON. Semua endpoint yang scoped ke tenant menyertakan tenant context dari session/JWT, **bukan dari parameter yang dikirim client** (supaya tidak bisa dipalsukan untuk akses data tenant lain).

### Storage Choices
| Kebutuhan | Pilihan | Alasan |
|---|---|---|
| Data relasional utama | MySQL 8.0 atau MariaDB (self-hosted via aaPanel) | Domain ini sangat relasional (booking↔agen↔komisi↔tenant), butuh transaksi ACID terutama untuk snapshot komisi dan status pembayaran. Dipilih self-hosted karena aaPanel punya dukungan native yang matang (instalasi, phpMyAdmin, backup scheduler) — konsekuensinya backup & guardrail isolasi tenant jadi tanggung jawab sendiri, bukan bawaan provider managed (lihat catatan guardrail & backup di Bagian 3-4) |
| File (bukti transfer, dokumen) | Cloudflare R2 (S3-compatible) | Murah, tanpa biaya egress besar, cukup untuk kebutuhan skala awal |
| Session/cache | Opsional Redis di fase awal — bisa ditunda | Beban baca di skala puluhan tenant belum butuh caching agresif |

---

## 3. Deep Dive

### Data Model (entitas utama)

```
Tenant (Travel)
├─ id, name, slug (subdomain: {slug}.syiar.link), phone, bank_account
├─ custom_domain (nullable, mis. "alhijrah.com")
├─ custom_domain_status (none|pending_verification|active)
├─ subscription_id → Subscription
└─ status (active, suspended)

TravelUser (akun owner/staff travel — login ke dashboard admin travel, TERPISAH dari Agent)
├─ id, tenant_id, name, email, password_hash
└─ role (owner|staff)

PlatformAdmin (akun superadmin — operator platform SyiarLink, akses lintas semua tenant)
├─ id, name, email, password_hash

Agent (langsung scoped ke SATU travel, termasuk kredensial login-nya sendiri)
├─ id, tenant_id
├─ name, phone/email, password_hash (login khusus buat travel ini — bukan akun lintas travel)
├─ referral_code (unik PER TENANT — cukup unik dalam satu travel, karena link
│  sudah dibedakan lewat subdomain/custom domain masing-masing travel)
├─ status (pending|approved)
├─ referred_by_agent_id (nullable — rantai rekrutmen, scoped ke tenant yang sama)
└─ points_balance

Package
├─ id, tenant_id, name, price, default_commission_type (percent|flat), default_commission_value

Booking
├─ id, tenant_id, package_id, agent_id (nullable), jamaah_name, jamaah_contact
├─ referral_code_used (snapshot, bukan FK murni — biar tetap valid meski membership dihapus)
├─ commission_value_snapshot, commission_type_snapshot   ← KUNCI: terkunci saat booking dibuat
├─ status (pending_payment|lunas|batal)
└─ booking_code (unik, untuk dicek jamaah tanpa login)

Commission
├─ id, booking_id, agent_id, tenant_id
├─ status (potential|ready_to_cashout|redeem_requested|paid)
└─ amount (dihitung dari snapshot di Booking)

RedemptionRequest (komisi)
├─ id, agent_id, tenant_id, status, reviewed_by, reviewed_at

RedemptionRequestCommission (tabel penghubung — satu redeem bisa mencakup banyak komisi)
├─ redemption_request_id, commission_id

Reward
├─ id, tenant_id, name, points_required, stock (opsional)

RewardRedemption
├─ id, agent_id, reward_id, status (pending|approved|rejected)

PointsLedger
├─ id, agent_id, tenant_id, source (referral_agent|adjustment), points, related_id

Payment (pembayaran jamaah — tetap manual)
├─ id, booking_id, proof_file_url, status (submitted|approved), approved_by

--- Bagian Billing SaaS (baru) ---

Plan
├─ id, name, price, billing_period (monthly|yearly), max_agents, max_bookings_per_month

Subscription
├─ id, tenant_id, plan_id, status (trial|active|past_due|suspended|canceled)
├─ current_period_start, current_period_end

Invoice
├─ id, tenant_id, subscription_id, amount, status (pending|paid|expired)
├─ duitku_merchant_order_id (referensi unik yang kita generate sendiri, dikirim ke Duitku saat create transaction)
├─ duitku_reference (transaction reference yang dikembalikan Duitku)
├─ due_date, paid_at
```

### Login & Akun: Siloed per Travel, Bukan Terpadu Lintas Platform

Setiap travel diperlakukan sebagai "toko" sendiri di atas platform SyiarLink. Kalau satu orang jadi agen di Travel X dan Travel Y, dia **mendaftar akun terpisah di masing-masing travel** — dua baris `Agent` yang independen, dua password berbeda, dua kode referral berbeda. Sistem tidak perlu (dan tidak berusaha) tahu bahwa dua akun itu dimiliki orang yang sama.

**Pemetaan domain per travel:**

| Level | URL | Siapa yang akses |
|---|---|---|
| Platform (root) | `syiar.link/login` | Travel owner/staff (`TravelUser`) dan superadmin — login dashboard admin selalu di sini, TERLEPAS dari domain apa pun yang dipakai travel untuk sisi publiknya |
| Subdomain travel | `{slug}.syiar.link/login`, `{slug}.syiar.link/{kode}` | Agen login, dan link referral publik — sebelum travel aktifkan custom domain |
| Custom domain travel (opsional) | `{custom_domain}/login`, `{custom_domain}/{kode}` | Sama persis, begitu travel aktifkan & verifikasi custom domain-nya |

Kenapa login owner/staff sengaja **selalu** di root domain, nggak ikut pindah ke custom domain: itu batasan keamanan yang disengaja. Custom domain dikontrol DNS-nya oleh travel sendiri (bisa salah konfigurasi, bisa domain-nya kadaluarsa dan direbut orang lain, dll) — kamu nggak mau akses admin yang berisiko tinggi (approve komisi, ubah skema harga) bergantung pada domain pihak ketiga yang di luar kendali platform. Jadi meski sisi publik/agen boleh "pindah rumah" ke custom domain, pintu masuk admin tetap di rumah yang kamu kontrol penuh.

### Resolusi Domain & Redirect Otomatis

Logic ini jalan di level middleware, dieksekusi tiap request masuk, berdasarkan hostname:

```
1. Kalau hostname == syiar.link (root)
   → serve rute platform: TravelUser login, superadmin, halaman marketing

2. Kalau hostname cocok pola {slug}.syiar.link
   → lookup Tenant by slug
   → JIKA custom_domain_status == "active":
        301 redirect ke https://{custom_domain}{path asli + query}
        (ini yang bikin link lama yang sudah disebar agen, mis. alhijrah.syiar.link/BUDI01,
        otomatis mengarah ke alhijrah.com/BUDI01 — link lama tidak pernah 404,
        cuma diarahkan ke rumah barunya)
   → JIKA belum ada custom domain aktif:
        serve konten tenant langsung di subdomain ini (microsite, /login, /{kode})

3. Kalau hostname cocok custom_domain milik salah satu Tenant (dan sudah "active")
   → serve konten tenant langsung di sini (ini domain kanonik-nya)

4. Selain itu → 404 (domain tidak dikenal)
```

Redirect di langkah 2 berlaku untuk **semua path** di bawah subdomain travel — bukan cuma `/{kode}`, tapi juga `/login` dan halaman microsite lain. Alasannya konsistensi: begitu travel resmi pindah ke custom domain, kamu nggak mau ada sebagian fitur yang "ketinggalan" di subdomain lama sementara sebagian lain sudah di domain baru — itu bikin bingung baik agen maupun jamaah soal mana yang "asli".

**Otomasi custom domain & SSL di VPS/aaPanel** — ini yang paling berbeda dari asumsi Vercel sebelumnya, karena sekarang harus dibangun sendiri sebagai bagian dari aplikasi:

*Wildcard SSL untuk `*.syiar.link` (subdomain semua travel):*
- DNS untuk domain `syiar.link` dikelola lewat **Cloudflare** (prasyarat penting)
- Terbitkan sertifikat wildcard sekali via `acme.sh` dengan plugin DNS Cloudflare: `acme.sh --issue --dns dns_cf -d syiar.link -d '*.syiar.link'` — ini otomatis menaruh TXT record verifikasi lewat API Cloudflare, tidak perlu campur tangan manual
- Setup cron perpanjangan otomatis (`acme.sh` sudah built-in fitur ini, tinggal dijadwalkan)

*Custom domain per travel (`alhijrah.com`, dst) — alur otomatis end-to-end:*
```
1. Travel input domainnya di dashboard → status = "pending_verification"
   Sistem tampilkan instruksi: "arahkan A record domain Anda ke IP: xxx.xxx.xxx.xxx"

2. Worker/cron berkala (mis. tiap 5 menit) cek domain yang masih "pending_verification":
   → resolve DNS domain tsb, cek apakah A record sudah mengarah ke IP VPS
   → KALAU BELUM: biarkan pending, cek lagi di siklus berikutnya
   → KALAU SUDAH BENAR:
       a. Jalankan acme.sh mode webroot/standalone untuk terbitkan Let's Encrypt
          cert khusus domain ini (HTTP-01 challenge — ini yang mengharuskan
          DNS harus sudah benar DULU sebelum langkah ini bisa sukses)
       b. Generate file konfigurasi Nginx baru untuk domain ini dari template
          (server block yang proxy ke aplikasi Node.js yang sama, cuma beda
          domain & path sertifikat)
       c. Reload Nginx (`nginx -s reload`, zero-downtime)
       d. Update Tenant.custom_domain_status = "active"
   → KALAU GAGAL (mis. penerbitan sertifikat error): log error, tetap
     "pending_verification", beri notifikasi ke travel & ke kamu sendiri
     supaya bisa dicek manual kalau perlu
```
Ini komponen baru yang perlu dibangun sebagai "worker" terpisah dari aplikasi web utama (bisa dieksekusi via cron yang manggil script Node/bash), karena dia butuh akses shell buat jalanin `acme.sh` dan reload Nginx — bukan sekadar query database biasa.

### Guardrail Kritis untuk Solo Builder: Tenant Scoping di Level ORM

Ini rekomendasi paling penting di dokumen ini, khusus karena kamu build sendiri dibantu AI coding agent. Multi-tenancy dengan pola `tenant_id` di setiap tabel itu standar dan murah dibangun — **tapi rawan bocor kalau ada satu query saja yang lupa filter `WHERE tenant_id = ...`**, dan itu jenis bug yang gampang lolos direview manusia maupun AI, apalagi kalau coding agent men-generate query cepat tanpa sadar konteks lintas-tenant.

**Catatan penting**: rekomendasi awal saya di sini adalah PostgreSQL Row Level Security (RLS) — jaring pengaman di level database yang otomatis nolak akses lintas-tenant apa pun query aplikasinya. **MySQL/MariaDB tidak punya fitur setara RLS.** Karena kamu pilih MySQL via aaPanel, guardrail-nya perlu dipindah satu lapis ke atas — ke level ORM:

- Kalau pakai **Prisma**, bikin *Client Extension* yang otomatis menyuntik `where: { tenant_id }` ke setiap query terhadap model yang tenant-scoped (Booking, Agent, Commission, dst), sehingga developer/AI agent tidak perlu (dan idealnya tidak *bisa lupa*) menulis filter tenant secara manual di tiap query
- Ini lebih lemah dari RLS asli — masih bisa "bocor" kalau ada yang sengaja menulis raw SQL query di luar Prisma — tapi untuk pola pemakaian normal (semua akses lewat ORM), ini menutup celah paling umum
- Tambahan: tulis test otomatis khusus yang spesifik menguji isolasi tenant (mis. login sebagai Agent Travel A, coba akses data Travel B lewat API, harus selalu gagal) — ini murah ditulis sekali dan jadi pengaman tambahan yang tidak bergantung ke database sama sekali

### API Endpoint Design (contoh, REST)

| Method | Endpoint | Keterangan |
|---|---|---|
| `POST` | `/api/agents/register` | Agen daftar ke tenant tertentu (dari landing page rekrutmen) |
| `POST` | `/api/agents/:id/approve` | Travel approve agen (auth: owner) |
| `GET` | `/api/agents/me/bookings` | Agen lihat jamaah yang terhubung ke dirinya |
| `GET` | `/api/agents/me/link-stats` | Statistik klik/konversi link referral |
| `POST` | `/api/bookings` | Buat booking baru (dari microsite publik, tanpa auth, rate-limited) |
| `GET` | `/api/bookings/track/:booking_code` | Jamaah cek status tanpa login |
| `PATCH` | `/api/bookings/:id/status` | Travel ubah status jadi lunas (auth: owner) |
| `POST` | `/api/commissions/:id/redeem` | Agen ajukan pencairan |
| `POST` | `/api/redemptions/:id/approve` | Travel approve pencairan |
| `POST` | `/api/rewards/redeem` | Agen tukar poin |
| `POST` | `/webhooks/duitku` | Terima notifikasi pembayaran invoice SaaS billing |
| `GET` | `/api/billing/subscription` | Travel lihat status langganan & invoice |
| `POST` | `/api/tenant/custom-domain` | Travel daftarkan custom domain, sistem kembalikan instruksi CNAME/TXT |
| `GET` | `/api/tenant/custom-domain/status` | Cek status verifikasi domain (pending/active) |

### Caching Strategy
Minimal di v1. Satu-satunya kandidat cache yang masuk akal: daftar paket di microsite publik (jarang berubah, dibaca sangat sering). Bisa pakai cache di level Next.js (ISR/revalidate) tanpa perlu infrastruktur cache terpisah dulu.

### Queue/Event Design
Tidak perlu message queue penuh (Kafka/RabbitMQ/dst) di skala ini — itu over-engineering untuk solo builder. Cukup:
- **Cron job terjadwal** (crontab Linux biasa, atau lewat fitur "Scheduled Tasks" bawaan aaPanel) untuk: generate invoice bulanan, cek invoice jatuh tempo, reminder pembayaran, dan worker pengecekan/penerbitan custom domain di atas
- **Webhook handler** dari Duitku untuk update status pembayaran real-time

### Error Handling & Retry
- **Idempotency**: endpoint pembuatan booking dan webhook Duitku harus idempotent (pakai `duitku_merchant_order_id` sebagai unique constraint) supaya retry dari provider tidak menghasilkan duplikat
- **Verifikasi signature callback Duitku**: Duitku mengirim signature (hash dari merchant code + amount + merchant order id + API key) di tiap callback — endpoint webhook **wajib** verifikasi signature ini sebelum memproses, supaya tidak ada pihak luar yang bisa memalsukan notifikasi "pembayaran berhasil" dengan cara nembak langsung ke endpoint callback kamu
- **Webhook Duitku gagal diproses**: simpan payload mentah dulu ke tabel log sebelum diproses, supaya bisa direplay manual kalau ada bug pemrosesan tanpa kehilangan data
- **Race condition status komisi**: gunakan transaksi database saat mengubah status Booking → Commission, supaya tidak ada kondisi setengah-update

---

## 4. Scale & Reliability

### Load Estimation (asumsi kerja, bukan data pasti)
- Target 12 bulan pertama: puluhan hingga ~100 tenant, masing-masing dengan puluhan agen, ratusan booking/bulan totalnya
- Ini beban yang sangat ringan untuk Postgres modern — satu instance managed database (bahkan tier terkecil) sanggup menangani ini tanpa masalah

### Horizontal vs Vertical Scaling
Di skala ini, **vertical scaling (upgrade spek VPS) sudah lebih dari cukup**, dan di VPS ini juga yang paling gampang dilakukan (upgrade RAM/CPU dari panel provider VPS, biasanya tanpa downtime lama). Jangan desain untuk horizontal scaling/multi-server di awal — itu butuh load balancer dan sinkronisasi sesi/file antar server, kompleksitas yang tidak proporsional untuk skala puluhan-ratusan tenant.

### Failover & Redundancy
Ini yang paling perlu digarisbawahi karena beda karakter dari hosting managed: **VPS itu satu server fisik — kalau dia down, semuanya down bersamaan** (aplikasi, Nginx, dan sekarang juga database MySQL yang di-self-host di server yang sama). Tidak seperti Vercel/managed DB yang otomatis redundant, di VPS keandalan itu tanggung jawab kamu sendiri untuk disiapkan:
- **Backup database terjadwal via aaPanel** — jadwalkan `mysqldump` otomatis (aaPanel punya fitur ini bawaan) dengan interval lebih rapat dari snapshot VPS biasa (mis. tiap beberapa jam, bukan cuma harian), dan upload hasilnya ke storage terpisah dari VPS itu sendiri (bisa ke Cloudflare R2 yang sudah dipakai untuk file lain, biar nggak nambah vendor baru) — supaya kalau VPS-nya hilang total, backup database tidak ikut hilang bersamanya
- **Snapshot/backup VPS terjadwal** secara terpisah dari backup database — pakai fitur backup bawaan aaPanel atau snapshot dari provider VPS — untuk memulihkan seluruh server (bukan cuma data) kalau terjadi masalah di level OS/konfigurasi
- **Sertifikat SSL (wildcard & per-domain) itu file yang perlu ikut ter-backup** — kalau VPS hilang tanpa backup, semua custom domain travel perlu diterbitkan ulang sertifikatnya, yang berarti downtime tambahan buat semua travel yang pakai custom domain

Ini bukan alasan untuk mundur dari VPS — cukup proporsional untuk tahap pilot — tapi backup database dan VPS terjadwal itu **bukan opsional**, mengingat sekarang database dan custom domain (dengan sertifikat SSL live per travel) semuanya hidup di satu server yang sama.

### Monitoring & Alerting
Setup minimal tapi wajib ada sejak hari pertama:
- **Error tracking**: Sentry (free tier cukup) — solo builder butuh ini supaya tidak bergantung laporan manual dari user saat ada bug
- **Uptime monitoring**: layanan gratis seperti UptimeRobot untuk cek microsite & API tetap hidup
- **Alert khusus billing**: notifikasi (email/WA ke diri sendiri) kalau webhook Duitku gagal diproses atau ada anomali (invoice tidak terbuat sesuai jadwal)

---

## 5. Trade-off Analysis

| Keputusan | Pilihan yang direkomendasikan | Alternatif | Kenapa pilihan ini |
|---|---|---|---|
| Arsitektur aplikasi | Monolith (Next.js full-stack) | Microservices | Solo builder + AI-assisted coding jauh lebih produktif dengan satu codebase yang koheren. Microservices menambah beban operasional (deployment, komunikasi antar service) tanpa manfaat nyata di skala ini |
| Model multi-tenancy | Shared database, kolom `tenant_id` + RLS | Database/schema terpisah per tenant | Jauh lebih murah dioperasikan dan bermigrasi untuk satu orang. Schema-per-tenant baru masuk akal kalau ada tenant enterprise yang secara kontraktual butuh isolasi fisik penuh |
| Hosting & deployment | VPS + aaPanel (Node app via PM2, Nginx reverse proxy) | Platform managed (Vercel/Railway) | Keputusan kamu — lebih murah untuk operasional jangka panjang dan kontrol penuh atas server, tapi konsekuensinya otomasi yang tadinya "gratis" di platform managed (wildcard SSL, SSL custom domain, deploy otomatis) sekarang perlu dibangun sendiri lewat acme.sh + scripting Nginx. Trade-off yang disadari, bukan kebetulan |
| Routing microsite & link agen | Subdomain per travel (`{slug}.syiar.link`) sebagai default, dengan dukungan custom domain (`travel.com`) sejak v1, redirect otomatis dari subdomain lama ke custom domain begitu diaktifkan | Path-based di root domain (`syiar.link/nama-travel`), atau custom domain ditunda ke v2 | Subdomain per travel via wildcard SSL (acme.sh + Cloudflare DNS) cukup terjangkau dibangun sekali di awal. Custom domain otomatis di v1 dipilih sadar dengan konsekuensi perlu membangun worker otomasi SSL sendiri (lihat Bagian 3) — bukan lagi "gratis" seperti asumsi awal saat masih mempertimbangkan Vercel, tapi tetap layak karena redirect otomatis penting supaya link yang sudah disebar agen tidak pernah putus |
| Payment provider billing | Duitku | Midtrans, Xendit, Stripe | Pilihan kamu — Duitku mendukung metode pembayaran lokal Indonesia (VA berbagai bank, e-wallet, QRIS, retail outlet) yang relevan untuk penerima B2B Indonesia. Catatan implementasi: penjadwalan tagihan bulanan tetap diorkestrasi oleh cron di sisi aplikasi kita sendiri (bukan fitur "recurring" otomatis dari provider) — tiap siklus, aplikasi yang membuat transaksi baru ke Duitku, bukan Duitku yang menagih otomatis. Stripe tidak dipertimbangkan karena tidak native mendukung penerimaan dana ke rekening Indonesia |
| Queue system | Cron sederhana, tanpa message broker | Kafka/RabbitMQ/BullMQ dengan Redis | Volume event di skala ini (invoice bulanan, webhook) jauh di bawah threshold yang butuh queue penuh. Menambahnya sekarang cuma menambah permukaan kegagalan yang harus di-maintain sendirian |
| Enforcement isolasi data | RLS di database + filter di aplikasi (dua lapis) | Filter di aplikasi saja | Lapis kedua ini murah untuk disiapkan tapi krusial sebagai pengaman dari human/AI error — risiko kebocoran data lintas tenant terlalu mahal untuk diserahkan ke satu lapis pertahanan saja |

---

## 6. Yang Perlu Ditinjau Ulang Seiring Pertumbuhan

Daftar ini bukan untuk dikerjakan sekarang — ini pengingat supaya keputusan v1 di atas tidak diam-diam jadi keputusan permanen tanpa disadari:

- **Kalau ada tenant besar yang minta isolasi data fisik penuh** (kontrak enterprise, kepatuhan khusus) → pertimbangkan migrasi tenant tersebut ke schema/database terpisah
- **Kalau volume booking per bulan naik drastis** (ratusan tenant aktif bersamaan) → pertimbangkan queue sungguhan (BullMQ + Redis) untuk proses async yang lebih berat, dan caching lebih agresif di microsite
- **Kalau volume travel dengan custom domain aktif membesar** (ratusan domain terverifikasi) → pantau beban worker otomasi SSL (tiap domain baru = satu proses penerbitan sertifikat + reload Nginx; di skala besar pertimbangkan antrian supaya reload Nginx tidak terlalu sering beruntun), dan siapkan UX self-service yang lebih baik untuk travel yang kesulitan setting DNS sendiri (banyak owner travel gaptek soal ini, kemungkinan besar tetap butuh bantuan manual di awal meski secara teknis sudah self-service)
- **Kalau traffic melebihi kapasitas satu VPS** → pertimbangkan pindah ke platform managed (Vercel/Railway) atau setup load balancer + beberapa VPS, tergantung mana yang lebih murah di titik itu — keputusan ini sengaja ditunda karena terlalu dini diputuskan sebelum ada data traffic riil
- **Kalau tim bertambah lebih dari 2-3 orang** → mulai pertimbangkan pemisahan modul (bukan langsung microservices, tapi modularisasi codebase yang lebih tegas dulu)
- **Kalau leakage rate atribusi referral (dari diskusi PRD) ternyata tinggi** → mungkin perlu investasi tracking yang lebih canggih (server-side tracking, app khusus, dsb) di luar localStorage biasa

---

*Dokumen ini adalah hipotesis desain untuk divalidasi seiring development berjalan, bukan blueprint yang kaku. Prioritaskan menyelesaikan bagian 3 (data model) dan guardrail RLS di awal — itu keputusan paling mahal untuk diubah belakangan.*
