# PRD: SaaS Sistem Agen & Affiliate untuk Travel Umroh (MVP)

**Status:** Draft untuk validasi pilot
**Versi:** 1.0
**Disusun dari:** Sesi product brainstorming

---

## 1. Problem Statement

Berdasarkan observasi langsung terhadap puluhan travel umroh yang didampingi (bukan survei masif, tapi data internal konsultan), hampir seluruh travel umroh (±99%) menjalankan sistem kemitraan agen, namun nyaris tidak ada yang memiliki sistem terstruktur untuk mengelolanya. Prosesnya masih manual: pendaftaran agen lewat WhatsApp/Excel, agen tidak bisa memantau status jamaah yang sudah mereka serahkan ke travel, travel tidak bisa memantau performa agennya, dan skema komisi berbeda-beda antar agen tergantung kebijakan owner — rawan berubah sepihak dan menjadi sumber konflik, baik antar agen (rebutan klaim jamaah) maupun antara agen dan travel (dispute pembayaran komisi).

Akar masalahnya bukan sekadar "belum ada software", tapi tidak adanya *shared system of record* yang dipercaya semua pihak. Dampaknya: travel yang sebenarnya punya potensi tumbuh lewat jaringan agen justru menahan diri karena takut kekacauan administratif yang menyertainya — pertumbuhan dan kerapian jadi paradoks.

Kompetitor yang ada di pasar saat ini memposisikan diri sebagai "sistem manajemen travel umroh" secara umum, lahir dari POV membereskan kekacauan operasional (administrative-first). Produk ini masuk dari sudut pandang berlawanan: **growth-first** — memberi travel keberanian menambah jaringan agen secara agresif tanpa takut kacau.

---

## 2. Target Users

| Persona | Deskripsi | Peran dalam sistem |
|---|---|---|
| **Owner/Admin Travel** | Pemilik atau pengelola travel umroh, buyer utama produk | Kelola agen, approve pendaftaran, approve pembayaran & redeem komisi, atur reward |
| **Agen "Warm"** | Individu dengan jaringan personal — kenalan, jamaah pengajian, komunitas | Rekrut jamaah lewat relasi langsung, kirim kode/link referral |
| **Agen "Broadcast"** | Content creator/influencer yang promosi ke audiens luas, mayoritas tidak dikenal personal | Rekrut jamaah lewat konten publik (TikTok, IG, dll), sangat bergantung pada link/kode referral yang reliable |
| **Calon Jamaah** | Pengguna akhir, tidak login ke sistem manajemen | Daftar lewat microsite travel, langsung atau lewat referral agen |

Komposisi agen di lapangan saat ini diperkirakan **50:50** antara tipe warm dan broadcast — keduanya harus dilayani setara sejak v1, tidak boleh ada yang jadi kelas dua.

---

## 3. Goals

1. **Travel bisa mengelola seluruh siklus agen** (rekrut → approve → pantau performa → bayar komisi) tanpa proses manual WA/Excel. *Ukur: % proses agen yang berpindah dari channel manual ke platform selama pilot.*
2. **Agen memiliki visibilitas penuh** atas status jamaah yang mereka bawa dan komisi yang berhak mereka terima, mengurangi kebutaan informasi yang jadi sumber ketidakpercayaan. *Ukur: skor kepuasan/trust agen pra vs pasca pilot (survei kualitatif).*
3. **Komisi transparan dan terkunci** sejak booking dibuat, mengurangi dispute komisi antar agen maupun agen-travel. *Ukur: jumlah kasus dispute komisi yang dilaporkan selama pilot dibanding baseline sebelumnya.*
4. **Travel berani menumbuhkan jaringan agennya** tanpa proporsional menambah beban administratif. *Ukur: pertambahan jumlah agen aktif per travel selama masa pilot.*
5. **Validasi willingness-to-pay** — travel owner bersedia membayar untuk sistem ini dibanding tetap manual. *Ukur: konversi dari pilot gratis/diskon ke pelanggan berbayar.*

---

## 4. Non-Goals (Eksplisit di Luar Scope v1)

| Non-goal | Alasan |
|---|---|
| **Payment gateway otomatis** | Regulasi pembayaran online cukup rumit untuk tahap awal; konfirmasi manual via transfer + WA sudah cukup untuk validasi MVP. |
| **Leaderboard publik / gamifikasi kompetitif antar agen** | Risiko sensitivitas budaya (riya' dalam konteks ibadah umroh) belum divalidasi ke lapangan. Ditunda, bukan dibuang — perlu riset kualitatif dulu ke owner/agen. |
| **Role koordinator wilayah otomatis dari skor performa** | Terlalu sensitif secara politis — keputusan siapa "naik pangkat" berisiko memicu konflik baru jika diotomasi oleh sistem. |
| **Microsite personal per-agen dengan branding individual** | Microsite di level travel (satu per travel, referral lewat parameter) jauh lebih murah dibangun dan cukup untuk validasi tracking; personal branding per-agen adalah pertimbangan masa depan. |
| **Sistem manajemen travel penuh (dokumen, visa, keberangkatan, dll)** | Bukan value proposition utama produk ini. Produk fokus pada lapisan kemitraan agen, bukan menggantikan seluruh operasional back-office travel. |

---

## 5. User Stories

### Travel Owner
- Sebagai owner travel, saya ingin membuat akun dan microsite travel saya, agar calon jamaah punya tempat resmi untuk mendaftar.
- Sebagai owner travel, saya ingin meninjau dan menyetujui pendaftaran agen baru, agar saya tetap punya kontrol siapa yang boleh mewakili travel saya.
- Sebagai owner travel, saya ingin melihat daftar jamaah yang masuk beserta agen yang membawa mereka, agar saya punya visibilitas penuh atas jaringan agen saya.
- Sebagai owner travel, saya ingin menetapkan skema komisi per paket/per agen, agar komisi konsisten dan tidak jadi keputusan ad-hoc.
- Sebagai owner travel, saya ingin mengubah status booking jamaah menjadi lunas, agar komisi agen otomatis berubah menjadi siap cair.
- Sebagai owner travel, saya ingin meninjau dan menyetujui pengajuan pencairan komisi agen, agar saya tetap memegang kontrol arus kas.
- Sebagai owner travel, saya ingin membuat katalog reward yang bisa ditukar dengan poin rekrutmen agen, agar saya bisa memotivasi pertumbuhan jaringan agen dengan cara yang saya kendalikan sendiri.
- Sebagai owner travel, saya ingin memeriksa mutasi rekening dan menyetujui pembayaran jamaah secara manual, agar saya tidak bergantung pada payment gateway di tahap awal.

### Agen (Warm & Broadcast)
- Sebagai agen, saya ingin mendaftar lewat form yang disediakan travel, agar saya bisa mulai membawa jamaah secara resmi.
- Sebagai agen, saya ingin mendapatkan kode referral unik dan link pribadi, agar saya bisa membagikannya lewat kanal apa pun (WA, IG, TikTok).
- Sebagai agen, saya ingin mendaftarkan jamaah secara manual, agar saya bisa membantu jamaah yang tidak familiar mengisi form sendiri.
- Sebagai agen, saya ingin melihat performa link referral saya (klik → daftar → konversi), agar saya tahu efektivitas promosi saya.
- Sebagai agen, saya ingin melihat status jamaah yang saya bawa (submitted → diproses → lunas), agar saya tidak lagi buta terhadap nasib jamaah saya.
- Sebagai agen, saya ingin melihat estimasi komisi saya segera setelah jamaah booking, agar saya punya kepastian meski belum bisa dicairkan.
- Sebagai agen, saya ingin mengajukan pencairan komisi yang sudah berstatus siap cair, agar saya bisa menerima hak saya tanpa menunggu inisiatif travel.
- Sebagai agen, saya ingin mengajak orang lain menjadi agen dan mendapat poin, agar saya punya insentif tambahan selain komisi jamaah.
- Sebagai agen, saya ingin menukar poin dengan reward yang tersedia, agar upaya rekrutmen saya punya nilai konkret.

### Calon Jamaah
- Sebagai calon jamaah, saya ingin mendaftar lewat microsite travel, baik langsung maupun lewat link agen, agar prosesnya sederhana dan jelas.
- Sebagai calon jamaah, saya ingin memasukkan kode referral secara manual jika link otomatis gagal terdeteksi, agar agen yang membantu saya tetap mendapat haknya.
- Sebagai calon jamaah, saya ingin melihat instruksi pembayaran yang jelas setelah mendaftar, agar saya tahu langkah selanjutnya.
- Sebagai calon jamaah, saya ingin mengecek status booking dan pembayaran saya menggunakan kode booking, agar saya tidak perlu terus-menerus bertanya ke travel atau agen.

---

## 6. Requirements

### P0 — Must-Have (MVP tidak layak diuji tanpa ini)

**Onboarding Travel & Agen**
- [ ] Travel dapat membuat akun dan mengisi profil dasar (nama, kontak, rekening tujuan pembayaran)
- [ ] Travel memiliki microsite publik dengan URL unik (mis. `namatravel.com/daftar`)
- [ ] Travel memiliki landing page rekrutmen agen dengan form pendaftaran
- [ ] Agen mengisi form pendaftaran, status masuk "pending" sampai travel approve
- [ ] Agen yang di-approve otomatis mendapat kode referral unik dan link pribadi

**Alur Jamaah & Atribusi**
- [ ] Agen dapat menginput data jamaah secara manual atas nama dirinya
- [ ] Jamaah dapat mendaftar mandiri lewat microsite, dengan atau tanpa referral
- [ ] Form pendaftaran memiliki kolom kode referral yang **terlihat dan bisa diedit** oleh jamaah, bukan logic tersembunyi
- [ ] Jika jamaah mengakses lewat link referral (`?ref=KODE`) dan langsung mengisi form dalam sesi yang sama, kode referral otomatis ter-*prefill*
- [ ] Sistem menyimpan jejak kunjungan link referral di perangkat (localStorage) dengan window 14 hari, sebagai upaya tambahan best-effort untuk kunjungan yang tidak langsung mendaftar
- [ ] Jamaah tanpa referral (baik link maupun kode manual) otomatis tercatat sebagai milik travel langsung
- [ ] Aturan atribusi: last-click-wins berdasarkan kode referral (manual atau terdeteksi otomatis), bukan berdasarkan waktu kunjungan pertama

**Visibilitas Agen**
- [ ] Agen dapat melihat daftar jamaah yang terhubung dengan dirinya beserta statusnya
- [ ] Agen dapat melihat statistik link referral: jumlah klik, jumlah pendaftaran, tingkat konversi

**Komisi**
- [ ] Travel dapat menetapkan skema komisi per paket
- [ ] Saat jamaah melakukan booking, nilai komisi **ter-snapshot dan terkunci** pada persentase/nominal saat itu — tidak berubah meski travel mengubah skema komisi untuk booking berikutnya
- [ ] Komisi tampil di dashboard agen sebagai "potensi komisi" saat booking dibuat (belum bisa dicairkan)
- [ ] Saat travel mengubah status booking menjadi lunas, status komisi berubah menjadi "siap cair"
- [ ] Agen dapat mengajukan pencairan komisi yang berstatus siap cair
- [ ] Travel dapat meninjau pengajuan pencairan dan menandainya sebagai selesai (transfer dilakukan manual di luar sistem)

**Referral Agen & Reward**
- [ ] Agen dapat mengajak orang lain mendaftar sebagai agen baru menggunakan kode/link referral yang sama
- [ ] Agen mendapat poin setiap agen baru yang diajaknya berhasil di-approve travel
- [ ] Travel dapat membuat dan mengelola katalog reward beserta nilai poin yang dibutuhkan
- [ ] Agen dapat mengajukan penukaran poin dengan reward yang tersedia
- [ ] Travel dapat meninjau dan menyetujui/menolak pengajuan penukaran reward

**Pembayaran Jamaah**
- [ ] Jamaah menerima instruksi pembayaran (nomor rekening travel) setelah mendaftar
- [ ] Jamaah melakukan konfirmasi pembayaran manual (mis. via WA, di luar sistem atau lewat form konfirmasi sederhana)
- [ ] Travel memeriksa mutasi secara manual dan menyetujui pembayaran di sistem
- [ ] Jamaah dapat mengecek status booking dan pembayaran menggunakan kode booking unik, tanpa perlu login

### P1 — Nice-to-Have (Fast follow, tidak menghalangi peluncuran pilot)

- [ ] Notifikasi otomatis ke agen saat status jamaah berubah (mis. lunas)
- [ ] Notifikasi ke travel saat ada pengajuan redeem komisi atau reward yang menunggu approval
- [ ] Riwayat perubahan skema komisi (audit trail) yang bisa dilihat travel
- [ ] Ekspor data jamaah/komisi ke spreadsheet untuk kebutuhan pembukuan travel

### P2 — Future Considerations (Di luar scope v1, tapi memengaruhi keputusan arsitektur sekarang)

- [ ] Leaderboard/gamifikasi (versi private badge atau opt-in, setelah riset sensitivitas budaya)
- [ ] Role koordinator wilayah
- [ ] Microsite personal per-agen dengan branding individual
- [ ] Integrasi payment gateway otomatis
- [ ] Sistem approval komisi bertingkat (mis. untuk travel dengan struktur agen berjenjang)

---

## 7. Acceptance Criteria (contoh untuk alur inti)

**Atribusi jamaah via link referral**
- Given calon jamaah mengklik link referral agen (`?ref=KODE`)
- When jamaah langsung mengisi dan submit form pendaftaran dalam sesi yang sama
- Then kolom kode referral otomatis terisi dan tersimpan sebagai atribusi booking

**Komisi terkunci**
- Given travel menetapkan komisi 5% untuk paket tertentu, dan agen membawa jamaah yang booking pada persentase itu
- When travel kemudian mengubah skema komisi paket tersebut menjadi 3% untuk booking berikutnya
- Then komisi jamaah yang sudah booking sebelumnya tetap tercatat pada 5%, tidak berubah

**Kode referral manual sebagai fallback**
- Given jamaah mengunjungi microsite tanpa melalui link referral (misalnya mengetik domain langsung)
- When jamaah mengisi kode referral secara manual di form pendaftaran
- Then booking tetap teratribusi ke agen pemilik kode tersebut

**Redeem komisi**
- Given status komisi agen adalah "siap cair"
- When agen mengajukan pencairan
- Then travel menerima notifikasi pengajuan dan dapat menandainya selesai setelah transfer manual dilakukan

---

## 8. Success Metrics

### Leading Indicators (diukur selama masa pilot, mingguan)
- **Tingkat aktivasi agen**: % agen yang di-approve dan benar-benar membagikan link/kode dalam 2 minggu pertama
- **Tingkat keberhasilan atribusi otomatis**: % booking dengan referral yang berhasil terdeteksi otomatis vs harus diisi manual vs tidak teratribusi sama sekali (khususnya dipecah per tipe agen — warm vs broadcast)
- **Waktu proses approval**: rata-rata waktu travel menyetujui pendaftaran agen, pembayaran jamaah, dan pengajuan redeem
- **Adopsi channel manual → platform**: % interaksi travel-agen yang berpindah dari WA/Excel ke sistem

### Lagging Indicators (diukur di akhir masa pilot, 1-2 bulan)
- **Jumlah dispute komisi yang dilaporkan** dibanding baseline sebelum pilot (target: menurun signifikan)
- **Pertumbuhan jaringan agen**: jumlah agen aktif per travel di awal vs akhir pilot
- **Konversi ke pelanggan berbayar**: % travel pilot yang bersedia lanjut berbayar setelah masa uji coba
- **Skor kepuasan/trust agen**: survei kualitatif pra vs pasca pilot terhadap agen soal transparansi komisi dan visibilitas jamaah

---

## 9. Open Questions

| Pertanyaan | Perlu dijawab oleh | Blocking? |
|---|---|---|
| Berapa besar sebenarnya tingkat kebocoran atribusi dari agen tipe broadcast (content creator) di kondisi nyata — apakah cukup kecil untuk diabaikan atau butuh investasi teknis lebih lanjut? | Data (diukur selama pilot) | Tidak — bisa diukur sambil jalan |
| Seberapa sensitif isu riya'/pamer pencapaian terkait fitur gamifikasi di komunitas travel umroh yang sebenarnya? | Stakeholder (tanya langsung ke owner & agen pilot) | Tidak — P2, tidak menghalangi v1 |
| Bagaimana model harga produk ini ke travel — biaya langganan tetap per bulan, persentase dari transaksi, atau berbasis jumlah agen aktif? | Stakeholder/bisnis | **Ya** — perlu diputuskan sebelum pilot berbayar dimulai, meski pilot awal bisa gratis/diskon |
| Apakah ada kewajiban regulasi terkait penyimpanan data pribadi jamaah (KTP, kontak) mengingat UU PDP? | Legal | **Ya** — perlu ditinjau sebelum data jamaah riil masuk ke sistem |
| Apakah proses konfirmasi pembayaran manual (jamaah kirim bukti transfer via WA di luar sistem) perlu diformalkan sebagai fitur di dalam produk (upload bukti transfer), atau cukup dibiarkan di luar sistem untuk v1? | Desain produk | Tidak — bisa diputuskan saat desain alur pembayaran |
| Threshold berapa lama waktu tunggu wajar sebelum sistem mengingatkan travel bahwa ada pembayaran/redeem yang belum diproses? | Stakeholder | Tidak — masuk kandidat P1 |

---

## 10. Timeline & Phasing

Tidak ada hard deadline eksternal (bukan komitmen kontraktual). Rekomendasi fasenya:

**Fase 1 — Build MVP** (semua item P0 di atas)

**Fase 2 — Pilot tertutup**
Uji ke 1-2 klien travel existing yang sudah punya hubungan trust dengan konsultan/founder. Alasan: hubungan trust yang sudah ada memungkinkan versi yang lebih kasar (rough edges) diterima demi mendapatkan feedback jujur, dibanding menjual cold ke market baru sejak awal.

**Fase 3 — Evaluasi & iterasi**
Tinjau seluruh metrik di Bagian 8, terutama tingkat kebocoran atribusi dan dispute komisi. Putuskan berdasarkan data apakah fitur P1/P2 (notifikasi, leaderboard versi aman, microsite personal) layak dibangun berikutnya.

**Fase 4 — Perluasan**
Onboarding travel baru di luar jaringan existing, mulai validasi model harga.

---

*Dokumen ini disusun dari sesi brainstorming produk. Requirement dan prioritas di atas adalah hipotesis kerja untuk divalidasi lewat pilot, bukan keputusan final.*
