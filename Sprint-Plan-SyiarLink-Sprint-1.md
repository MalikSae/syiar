# Sprint Plan: SyiarLink — Sprint 1 (Fondasi Infra & Auth)

**Durasi:** 1 minggu (5 hari kerja) | **Builder:** 1 orang (solo, dibantu AI coding agent) | **Kapasitas:** Full-time

> Catatan adaptasi dari template standar: template sprint planning aslinya didesain untuk tim multi-orang dengan poin cerita dan alokasi per anggota. Karena ini solo builder, "kapasitas" di sini dihitung dalam jam fokus yang tersedia, bukan poin per orang, dan tidak ada pembagian owner antar item — semuanya kamu kerjakan sendiri (dibantu AI agent), jadi urutan pengerjaan (dependency) lebih penting daripada siapa mengerjakan apa.

---

## Sprint Goal

**Aplikasi SyiarLink jalan solid di lokal dengan fondasi yang benar: environment Laragon tersetup, kode ter-push ke GitHub, tiga jenis akun (TravelUser, Agent, PlatformAdmin) bisa register & login dengan isolasi tenant yang teruji, dan routing dasar (root domain vs subdomain travel, diuji via `*.localhost` — bukan `.test`, karena `.test` di Laragon tidak wildcard, lihat catatan di bawah) berfungsi — sebelum satu pun fitur bisnis (booking, komisi, billing) mulai dibangun di atasnya. Setup VPS/production sengaja BUKAN bagian dari sprint ini — itu jadi sprint tersendiri nanti setelah sebagian besar fitur selesai dibangun & teruji lokal (lihat `sprint.md`).**

Kenapa goal-nya bukan langsung fitur: fondasi ini (deployment pipeline, auth, guardrail isolasi tenant) adalah keputusan yang paling mahal diubah belakangan kalau salah dari awal — sesuai catatan di dokumen system design. Sprint 1 sengaja tidak menyentuh fitur bisnis sama sekali.

---

## Kapasitas

| | Hari Tersedia | Jam Fokus Direncanakan | Catatan |
|---|---|---|---|
| Kamu (solo, AI-assisted) | 5 hari | ~24 jam dari ~30 jam nominal (80%) | Sisa 20% sengaja disisakan sebagai buffer — debugging setup lokal & AI-generated code biasanya tetap makan waktu lebih dari perkiraan awal, meski sprint ini lebih ringan dari versi awal karena VPS/deployment sudah dikeluarkan dari scope |

---

## Sprint Backlog

| Prioritas | Item | Estimasi | Dependency |
|---|---|---|---|
| P0 | Setup environment lokal via Laragon: pastikan Node.js & MySQL lokal jalan, buat database kosong buat project ini | 1-2 jam | Tidak ada — titik awal |
| P0 | Init git repo lokal, buat repo di GitHub, push commit awal | 1 jam | Setelah project mulai ada isinya (bisa nyusul setelah item berikutnya) |
| P0 | Setup project Next.js + Prisma, koneksi ke MySQL lokal (Laragon), migrasi skema awal (hanya tabel `Tenant`, `TravelUser`, `Agent`, `PlatformAdmin` — bukan skema penuh dulu) | 6-7 jam | Setelah environment lokal siap |
| P0 | Middleware resolusi domain: bedakan root domain vs `{slug}` — diuji lewat `alhijrah.localhost:3000`, dst. **Catatan**: bukan pakai `syiar.test` — domain `.test` Laragon tidak wildcard (perlu hosts file manual per subdomain), sementara `*.localhost` otomatis resolve ke 127.0.0.1 di browser modern tanpa setup apa pun, cocok buat tenant yang dibuat dinamis | 5-6 jam | Setelah project setup jalan |
| P0 | Auth: register & login `TravelUser` di `localhost:3000/login`, register & login `Agent` di `{slug}.localhost:3000/login`, seed akun `PlatformAdmin` | 10-12 jam | Setelah middleware domain jalan |
| P0 | Guardrail isolasi tenant: Prisma Client Extension yang paksa filter `tenant_id`, plus 1 test otomatis yang buktikan akses lintas-tenant gagal | 5-6 jam | Setelah auth jalan, butuh data dari 2+ tenant untuk test |
| P1 (stretch) | Setup GitHub Actions dasar: jalankan lint + build check otomatis tiap push | 1-2 jam | Setelah repo GitHub ada |
| P2 (di luar sprint ini) | Provisioning VPS + aaPanel + deploy pipeline pertama (sekarang jadi sprint tersendiri, lihat `sprint.md`), worker otomasi custom domain, booking/komisi/referral, integrasi Duitku, sistem poin & reward | — | Semua butuh fondasi Sprint 1 selesai dulu |

**Total estimasi P0:** ~28-33 jam — masih **di atas** kapasitas rencana 24 jam.

---

## Risiko

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Kombinasi Laragon + Next.js + Prisma mungkin ada gesekan kecil (versi Node, path Windows) meski secara umum lebih familiar dari setup server baru | Item setup awal molor dari estimasi | Kalau ada error aneh yang nggak jelas dari Next.js/Prisma, cek dulu apakah itu spesifik masalah path Windows sebelum asumsikan itu bug logic |
| **Risiko yang sengaja ditunda, bukan dihindari**: karena semua development lokal di Windows (Laragon) sementara production nanti Linux (VPS), ada potensi gesekan yang baru ketahuan pas deploy — paling umum: perbedaan case-sensitivity nama file/folder (Windows tidak case-sensitive, Linux iya) | Bug yang jalan mulus di lokal tapi error pas pertama kali deploy ke VPS nanti | Bukan sesuatu yang perlu diatasi SEKARANG — cukup dicatat sebagai known risk yang akan dicek eksplisit pas sprint provisioning VPS nanti, jangan kaget kalau muncul |
| Estimasi P0 (34-39 jam) melebihi kapasitas rencana (24 jam) | Carryover ke Sprint 2 hampir pasti terjadi | Definisikan dari sekarang item mana yang paling boleh mundur duluan kalau waktu mepet (kandidat: guardrail isolasi tenant — tetap penting tapi bisa nyusul di awal Sprint 2 sebelum fitur bisnis mulai, asal jangan sampai kelewat sebelum ada data dua tenant yang bisa dites) |
| Nggak ada reviewer lain (solo builder) — bug isolasi tenant atau kesalahan config gampang lolos tanpa disadari | Kebocoran data lintas tenant di kemudian hari, atau downtime yang telat terdeteksi | Test otomatis untuk isolasi tenant BUKAN item opsional meski waktu mepet — ini satu-satunya "reviewer" yang kamu punya untuk area paling berisiko |

---

## Definition of Done (disesuaikan solo builder)

- [ ] Kode ter-push ke GitHub, bukan cuma commit lokal (meski solo, tetap wajib — ini pengganti "code review" sebagai jejak yang bisa ditelusuri/di-rollback)
- [ ] Diuji manual end-to-end di lokal — akses via `localhost:3000` dan minimal satu subdomain dinamis seperti `alhijrah.localhost:3000` (langsung jalan tanpa setup tambahan, bukti wildcard `*.localhost` browser beneran dipakai)
- [ ] Test otomatis isolasi tenant hijau (bukan cuma "kelihatannya jalan pas dicoba manual")
- [ ] Kredensial (`.env`, API key) tidak ter-commit ke git — cek eksplisit, kesalahan umum yang gampang lolos pas kerja solo cepat, dan makin penting sekarang karena repo-nya di GitHub (bisa public/private, tapi tetap jangan sampai ada secret ke-push)

---

## Key Dates

| Hari | Target |
|---|---|
| Hari 1 | Environment lokal siap, repo GitHub ada dan sudah menerima push pertama, project Next.js/Prisma tersambung ke MySQL lokal |
| Hari 2-3 | Middleware resolusi domain jalan (diuji via `*.localhost`, tanpa perlu setup Laragon tambahan) |
| Hari 3-4 | Auth tiga jenis akun selesai (titik paling berisiko molor — mulai di sini paling lambat, jangan digeser ke hari 5) |
| Hari 5 | Guardrail isolasi tenant + test otomatis, sisa waktu untuk item P1 kalau sempat |
| Akhir Hari 5 | Self-review singkat: apa yang beneran selesai vs yang perlu masuk carryover Sprint 2, catat alasannya (bukan cuma "kurang waktu") |

---

*Sprint 2 kemungkinan besar fokus ke: menyelesaikan carryover fondasi (kalau ada), lalu mulai alur booking + referral + komisi (P0 inti dari PRD) di atas fondasi yang sudah teruji sprint ini.*
