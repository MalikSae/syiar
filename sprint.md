# Sprint Roadmap: SyiarLink — Dari Nol Sampai Siap Rilis Publik

**Builder:** 1 orang, full-time, dibantu Antigravity (AI coding agent) | **Durasi per sprint:** 1 minggu

> Estimasi 12 sprint (~12 minggu) ini adalah perkiraan kerja, bukan janji pasti. Sprint 1 saja (lihat `Sprint-Plan-SyiarLink-Sprint-1.md`) sudah menunjukkan estimasi P0-nya melebihi kapasitas rencana — jadi anggap roadmap ini sebagai urutan prioritas yang jelas, bukan jadwal kaku. Kalau ada sprint yang carryover, geser sprint berikutnya, jangan paksa kejar tanggal dengan motong test/guardrail.
>
> **Alur kerja: local-first.** Semua development (Sprint 1-7) dikerjakan di lokal (Laragon) dan di-push ke GitHub — belum ada VPS/production sama sekali di fase ini. Domain lokal pakai `*.localhost` (mis. `alhijrah.localhost:3000`) — BUKAN `.test` ala Laragon, karena `.test` tidak wildcard (dikonfirmasi maintainer Laragon sendiri: tiap subdomain perlu ditambah manual ke hosts file). `*.localhost` otomatis resolve ke 127.0.0.1 di browser modern tanpa setup apa pun, cocok buat tenant yang dibuat dinamis lewat aplikasi. VPS baru masuk di Sprint 8, tepat sebelum sprint custom domain otomatis (Sprint 9) — bukan di paling akhir, karena custom domain otomatis itu soal domain publik ASLI milik travel (`alhijrah.com`), yang butuh validasi Let's Encrypt ke server publicly-accessible.

---

## Ringkasan Roadmap

| Sprint | Fokus | Output Utama |
|---|---|---|
| 1 | Fondasi lokal & auth | Laragon + repo GitHub jalan, 3 jenis akun bisa login (lokal), guardrail isolasi tenant |
| 2 | Onboarding travel & agen | Landing rekrutmen, approval agen, microsite shell |
| 3 | Booking & atribusi referral | Paket, form booking, resolusi kode referral, komisi ter-snapshot |
| 4 | Komisi & redeem | Status lunas → komisi cair, dashboard agen, alur redeem |
| 5 | Rekrutmen agen & reward | Poin rekrutmen, katalog reward, redeem poin |
| 6 | Pembayaran jamaah | Instruksi bayar, konfirmasi, approval manual travel |
| 7 | Billing SaaS (Duitku) | Subscription, invoice otomatis, suspend nonaktif — diuji lokal pakai sandbox Duitku |
| 8 | **Provisioning VPS & deploy pertama** | VPS+aaPanel hidup, seluruh aplikasi (bukan cuma hello world) di-deploy pertama kali ke production |
| 9 | Custom domain otomatis | Worker SSL, redirect subdomain→custom domain |
| 10 | Hardening & persiapan pilot | Notifikasi dasar, backup penuh, QA menyeluruh |
| 11 | Pilot tertutup | 1-2 travel existing, dampingi langsung, hotfix cepat |
| 12 | Iterasi & kesiapan publik | Perbaikan dari pilot, self-service signup, milestone rilis |

---

## Sprint 1 — Fondasi Lokal & Auth

**Detail lengkap (per-jam, risiko, capacity) ada di file terpisah: `Sprint-Plan-SyiarLink-Sprint-1.md`.** Ringkasannya di sini:

**Goal**: Environment lokal (Laragon) tersetup, repo GitHub jalan, tiga jenis akun (TravelUser, Agent, PlatformAdmin) bisa register & login dengan tenant scoping benar, guardrail isolasi tenant teruji. **Belum ada VPS/production sama sekali** — itu baru masuk di Sprint 8.

**Deliverable:**
- Laragon: Node.js & MySQL lokal jalan, repo GitHub dibuat dan sudah menerima push pertama
- Next.js + Prisma tersambung ke MySQL lokal, skema awal (Tenant, TravelUser, Agent, PlatformAdmin)
- Middleware resolusi domain dasar (root vs subdomain), diuji via `*.localhost` — custom domain belum
- Auth tiga jenis akun sesuai pemisahan domain login di `AGENTS.md` Bagian 5
- Prisma Client Extension guardrail tenant + test otomatis isolasi

**Belum disentuh sama sekali**: fitur bisnis apa pun (booking, komisi, billing, dst), dan apa pun yang berbau production/VPS.

---

## Sprint 2 — Onboarding Travel & Agen

**Goal**: Travel bisa setup profil & microsite, agen bisa daftar dan di-approve, tanpa masih ada fitur booking/komisi.

**Deliverable:**
- TravelUser: form setup profil travel (nama, kontak, rekening, slug subdomain)
- Landing page rekrutmen agen publik di `{slug}.localhost:3000` (belum ada isi microsite paket, cukup form pendaftaran agen)
- Form pendaftaran Agent (nama, kontak, password) → status `pending`
- TravelUser: dashboard daftar agen pending, tombol approve/reject

**Dependency**: Sprint 1 (auth & domain resolution) harus selesai duluan.

**Definition of Done**: Owner travel bisa login, setup profil, dan approve minimal satu agen dari awal sampai akhir tanpa error, diuji manual end-to-end di lokal.

---

## Sprint 3 — Booking & Atribusi Referral

**Goal**: Jamaah bisa daftar (langsung atau via referral agen), komisi ter-snapshot saat booking dibuat.

**Deliverable:**
- TravelUser: CRUD Package (nama, harga, skema komisi default)
- Microsite publik: tampilkan daftar paket
- Form booking jamaah — dua jalur: Agent input manual, atau jamaah isi sendiri
- Resolusi `{slug}.localhost:3000/{kode}` → lookup Agent → prefill kode referral di form
- Fallback: field kode referral yang terlihat & bisa diedit manual
- localStorage 14 hari sebagai fallback tambahan lintas sesi
- **Snapshot komisi** ke `Booking` saat submit (nilai terkunci, bukan referensi live ke `Package`)
- Generate `booking_code`, halaman publik cek status booking pakai kode itu (belum ada status "lunas" — itu Sprint 4)

**Dependency**: Sprint 2 (Agent harus sudah bisa approved & Travel sudah punya Package).

**Definition of Done**: Satu siklus penuh — agen share link, jamaah klik & daftar, booking tercatat dengan komisi ter-snapshot dan atribusi ke agen yang benar — diuji manual, termasuk skenario tanpa referral sama sekali.

---

## Sprint 4 — Komisi & Redeem

**Goal**: Alur uang dari booking sampai komisi bisa dicairkan agen.

**Deliverable:**
- TravelUser: ubah status Booking → "lunas" → trigger Commission jadi "ready_to_cashout"
- Dashboard Agent: daftar jamaah miliknya beserta status, statistik link (klik→daftar→konversi — butuh logging klik dari resolusi link di Sprint 3, diagregasi di sini)
- Agent: ajukan redeem komisi
- TravelUser: review & approve pengajuan redeem (transfer aktual tetap manual di luar sistem)

**Dependency**: Sprint 3.

**Definition of Done**: Booking berstatus lunas → agen lihat komisi siap cair → ajukan redeem → travel approve — seluruh siklus teruji manual.

---

## Sprint 5 — Rekrutmen Agen Berjenjang & Reward

**Goal**: Agen bisa mengajak agen baru dan dapat insentif non-uang (poin/reward), terpisah dari komisi jamaah.

**Deliverable:**
- Agent: link/kode rekrutmen agen baru (beda dari kode referral jamaah, atau reuse mekanisme sama — putuskan saat implementasi, konsisten dengan pola Sprint 3)
- Poin otomatis masuk saat agen baru yang diajak di-approve TravelUser
- TravelUser: kelola katalog reward (nama, poin dibutuhkan)
- Agent: ajukan redeem reward pakai poin
- TravelUser: approve/reject pengajuan reward

**Dependency**: Sprint 2 (alur approval agen) & Sprint 4 (pola redeem serupa bisa dipakai ulang).

**Definition of Done**: Agen A ajak Agen B daftar → Agen B di-approve → poin masuk ke Agen A → Agen A redeem reward → Travel approve.

---

## Sprint 6 — Pembayaran Jamaah (Manual)

**Goal**: Jamaah tahu cara bayar, travel bisa konfirmasi pembayaran masuk.

**Deliverable:**
- Halaman instruksi pembayaran (rekening travel) setelah booking dibuat
- Form konfirmasi pembayaran sederhana (jamaah upload bukti transfer — ini menjawab open question di PRD, diputuskan diformalkan ringan di sistem, bukan dibiarkan sepenuhnya di luar)
- TravelUser: daftar pembayaran masuk yang perlu direview, approve/reject
- Update status Booking terkait setelah payment approved (menyambung ke Sprint 4 — status "lunas" bisa dipicu dari sini juga, bukan cuma manual oleh travel)

**Dependency**: Sprint 3 (Booking harus ada).

**Definition of Done**: Jamaah booking → lihat instruksi bayar → upload bukti → travel approve → status booking berubah otomatis.

---

## Sprint 7 — Billing SaaS (Integrasi Duitku)

**Goal**: Travel bisa berlangganan platform, tagihan berjalan otomatis. **Masih dikerjakan & diuji di lokal** — pakai kredensial sandbox/testing Duitku, bukan production, karena VPS belum ada sampai Sprint 8.

**Deliverable:**
- Model `Plan`, `Subscription`, `Invoice`
- Tenant baru otomatis dapat trial period
- Cron bulanan: generate invoice via Duitku API untuk tenant subscription aktif
- Webhook Duitku (dengan verifikasi signature, lihat `AGENTS.md` Bagian 6) → update status Invoice & Subscription
- Cron harian: cek invoice jatuh tempo → set status `past_due` → `suspended` kalau lewat batas
- TravelUser: dashboard lihat status langganan & riwayat invoice
- Enforcement: tenant `suspended` → microsite/dashboard masuk mode terbatas

**Catatan teknis testing lokal**: webhook Duitku dikirim dari server Duitku ke endpoint kamu — supaya bisa diterima server lokal (yang nggak publicly-accessible), pakai tool tunneling seperti **ngrok** atau **Cloudflare Tunnel** buat expose server lokal sementara ke URL publik selama sesi testing.

**Dependency**: Sprint 1 (butuh Tenant sudah ada), independen dari Sprint 2-6 secara fungsional (bisa dikerjakan paralel kalau ada kapasitas lebih, tapi disusun di sini karena bukan blocker untuk fitur inti agen/komisi).

**Definition of Done**: Invoice test berhasil dibuat, dibayar (pakai sandbox Duitku + tunneling buat terima webhook), webhook memperbarui status dengan benar, dan siklus suspend teruji manual (buat invoice, biarkan lewat jatuh tempo, cek suspend jalan) — semua di lokal.

---

## Sprint 8 — Provisioning VPS & Deploy Pertama

**Goal**: Seluruh aplikasi yang sudah dibangun & teruji di lokal (Sprint 1-7) hidup pertama kalinya di production. Ini gerbang wajib sebelum Sprint 9 (custom domain otomatis), karena penerbitan SSL asli butuh server yang publicly-accessible — nggak bisa lagi disimulasikan di lokal.

**Deliverable:**
- Provision VPS, install aaPanel, Node.js runtime, MySQL/MariaDB
- Setup DNS domain asli (`syiar.link`) lewat Cloudflare
- Konfigurasi PM2 + Nginx reverse proxy
- Migrasi skema database dari MySQL lokal ke MySQL production (struktur, bukan data dummy)
- Setup `.env` production (kredensial Duitku production — bukan sandbox lagi, `DATABASE_URL`, dst — lihat daftar di `AGENTS.md` Bagian 8)
- Deploy aplikasi penuh (bukan lagi hello world — ini pertama kalinya kode sebanyak 7 sprint jalan di luar mesin kamu)
- Wildcard SSL `*.syiar.link` via `acme.sh` + Cloudflare DNS API
- Jadwalkan backup: `mysqldump` otomatis via aaPanel + upload ke Cloudflare R2, terpisah dari snapshot VPS

**Dependency**: Sprint 1-7 harus sudah selesai dan stabil di lokal — jangan mulai sprint ini kalau masih ada fitur inti yang belum jalan benar, karena tujuannya validasi deployment, bukan sambil debug fitur baru.

**Risiko khusus sprint ini**: deploy pertama untuk aplikasi yang sudah cukup besar (bukan hello world) itu rawan menyingkap masalah yang nggak kelihatan di lokal — paling umum: **perbedaan case-sensitivity nama file/folder** (Windows/Laragon tidak case-sensitive, Linux di VPS iya), perbedaan versi Node/MySQL antara lokal dan production, dan environment variable yang lupa di-set. Alokasikan waktu ekstra untuk debugging jenis ini, jangan asumsikan "kan udah jalan mulus di lokal" berarti otomatis mulus juga di VPS.

**Definition of Done**: Aplikasi lengkap (semua fitur Sprint 1-7) bisa diakses live di `syiar.link` dan minimal satu `{slug}.syiar.link`, database production terisi skema yang benar, backup sudah teruji sekali (coba restore), dan tidak ada kredensial sandbox/testing yang ikut kebawa ke production.

---

## Sprint 9 — Custom Domain Otomatis

**Goal**: Travel bisa pasang domain sendiri, SSL terbit otomatis, link lama tetap jalan.

**Deliverable:**
- TravelUser: form input custom domain, instruksi DNS ditampilkan
- Worker cron: cek DNS pending_verification → verified
- Trigger `acme.sh` terbitkan sertifikat begitu DNS terverifikasi
- Generate config Nginx per-domain dari template, reload otomatis
- Redirect 301 subdomain lama → custom domain begitu status aktif (semua path, bukan cuma satu halaman)
- Error handling: penerbitan sertifikat gagal → tetap pending, notifikasi ke travel & ke diri sendiri

**Dependency**: Sprint 8 (VPS harus sudah live dan wildcard SSL sudah jalan) — ini yang paling berisiko molor sesuai catatan risiko system design, alokasikan waktu ekstra kalau perlu, jangan dipaksa 1 minggu kalau nyatanya butuh lebih.

**Definition of Done**: Uji end-to-end dengan domain nyata milik kamu sendiri dulu (bukan punya travel pilot) — daftarkan, tunggu DNS propagasi, verifikasi, cek SSL terbit, cek redirect subdomain lama jalan.

---

## Sprint 10 — Hardening & Persiapan Pilot

**Goal**: Produk siap dipegang orang lain, bukan cuma jalan di tangan sendiri.

**Deliverable:**
- Notifikasi dasar (P1 dari PRD): reminder approval pending, perubahan status penting — minimal lewat email, WA kalau sempat
- Backup database penuh: `mysqldump` terjadwal + upload otomatis ke Cloudflare R2 (Sprint 1 baru backup lokal)
- Security pass: rate-limit endpoint publik (booking form, resolusi referral) supaya tidak gampang di-spam/disalahgunakan
- Test isolasi tenant diperluas — bukan cuma satu skenario dasar dari Sprint 1, cover semua modul yang sudah dibangun (komisi, reward, billing)
- Bug bash: jalani sendiri seluruh alur dari sudut pandang Travel, Agent, dan Jamaah, catat semua yang janggal
- Setup monitoring: Sentry (error tracking) & uptime monitor kalau belum aktif sejak awal

**Dependency**: Sprint 2-9 (semua modul inti, termasuk custom domain otomatis, sudah ada untuk diuji).

**Definition of Done**: Checklist bug bash bersih (atau semua temuan sudah masuk backlog dengan prioritas jelas), backup & monitoring aktif dan sudah diuji sekali (coba restore dari backup, coba trigger alert).

---

## Sprint 11 — Pilot Tertutup

**Goal**: Validasi dengan travel sungguhan, bukan lagi cuma pengujian sendiri.

**Deliverable:**
- Onboard 1-2 travel pilot dari jaringan existing (sesuai strategi go-to-market di PRD — trust yang sudah ada memungkinkan versi lebih kasar diterima demi feedback jujur)
- Dampingi langsung pemakaian pertama (bukan dilepas begitu saja)
- Kumpulkan metrik dari PRD Bagian 8: tingkat aktivasi agen, akurasi atribusi, dispute komisi, dst
- Hotfix cepat untuk masalah blocking yang ditemukan pilot — ini sprint yang paling mungkin isinya reaktif, bukan terjadwal penuh dari awal

**Dependency**: Sprint 10 selesai (produk sudah cukup kokoh untuk dipegang orang lain).

**Definition of Done**: Minimal satu travel pilot menyelesaikan satu siklus penuh (agen daftar, jamaah booking, komisi cair) tanpa bantuan manual dari kamu di luar sistem.

---

## Sprint 12 — Iterasi & Kesiapan Rilis Publik

**Goal**: Ini milestone "siap rilis publik" yang diminta — bukan berarti langsung buka pendaftaran masif, tapi produk sudah di titik yang layak untuk itu.

**Deliverable:**
- Perbaikan berdasarkan temuan pilot Sprint 10 (prioritas: apa pun yang menyangkut trust — akurasi atribusi & komisi, sesuai tema utama dari seluruh sesi brainstorming produk)
- Alur pendaftaran self-service untuk travel baru (selama ini asumsinya onboarding masih dibantu manual)
- Model harga final ditetapkan dan aktif di alur billing (masih open question di PRD — harus diputuskan sebelum publik buka pendaftaran berbayar)
- Kebijakan privasi & syarat layanan minimal — **ini butuh input orang yang paham hukum/regulasi (UU PDP), bukan sesuatu yang bisa diputuskan lewat coding agent**
- Final QA menyeluruh atas seluruh alur, termasuk billing & custom domain otomatis di bawah beban lebih dari satu tenant aktif bersamaan

**Dependency**: Sprint 11 (feedback pilot jadi input utama sprint ini).

**Definition of Done — Milestone Rilis Publik:**
- [ ] Semua feedback blocking dari pilot sudah diperbaiki
- [ ] Travel baru bisa daftar & mulai pakai tanpa bantuan manual dari kamu
- [ ] Model harga aktif dan tervalidasi lewat billing sungguhan
- [ ] Kebijakan privasi & syarat layanan sudah ditinjau (bukan sekadar template generik)
- [ ] Backup, monitoring, dan guardrail isolasi tenant sudah terbukti jalan di kondisi nyata (bukan cuma di test)

---

*Dokumen ini hidup — update tiap akhir sprint dengan status aktual (selesai/carryover/dibatalkan) supaya sprint berikutnya selalu berangkat dari kondisi nyata, bukan rencana yang sudah basi.*
