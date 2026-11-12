# TikTok Account Monitor 📊

Website monitoring akun TikTok publik menggunakan **React + TypeScript**, **Cloudflare Pages & Worker**, **Supabase PostgreSQL**, dan scraper **Apify (`clockworks/tiktok-profile-scraper`)**.

---

## 🚀 Fitur Utama

1. **Pemantauan 7 Akun Awal (Dapat Diatur):**
   - Intan Suar Kartika (`@intansuarkartika`)
   - The AI X Academy (`@the.ai.x.academy`)
   - Aqara Indonesia (`@aqara.indonesia`)
   - Dinda Kemala (`@dinda.kemala_`)
   - Rania Meutia (`@rania.meutia`)
   - Nara Adelia (`@nara.adelia_`)
   - Bang Ray (`@teuku.rayyan00`) — *akun baru / empty state awal sebelum publikasi perdana*

2. **Ringkasan Profil:**
   - **Followers**: Jumlah pengikut + pertambahan/penurunan dibandingkan pengamatan sebelumnya (dengan label rentang waktu observasi nyata).
   - **Total Likes Profil**: Akumulasi suka seluruh profil TikTok.
   - **Jumlah Postingan Profil**: Total video yang dipublikasikan.

3. **Ringkasan 10 Postingan Terpantau (MVP Scope):**
   - **Jumlah Postingan**: Hingga 10 postingan terbaru.
   - **Total Views**: Agregat khusus untuk 10 postingan terpantau (*bukan akumulasi seluruh akun*).
   - **Engagement Rate (Views)**: Dihitung dengan rumus `(likes + komentar + share) / views * 100%`.
   - **Rata-rata Views**: Per postingan dalam kumpulan sampel.

4. **Visualisasi Grafik (Recharts):**
   - **Pertumbuhan Followers**: Kurva riwayat pengamatan dengan filter 7 Hari / 30 Hari / Semua.
   - **Perbandingan Metrik 10 Postingan**: Bar chart interaktif per postingan (Views / Likes / Engagement Rate).

5. **Tabel Performa Postingan:**
   - Thumbnail cover, jenis konten (Video vs. Foto/Slideshow), badge sematan (Pinned).
   - Tanggal unggah dalam zona waktu **WIB (`Asia/Jakarta`)**.
   - Views dengan delta pertumbuhan per ID postingan (e.g. `+57.5K`).
   - Likes dengan delta pertumbuhan per ID postingan.
   - Komentar, Share, dan Engagement Rate.
   - Tautan langsung ke postingan TikTok.
   - Fitur sorting (Tanggal, Views, Likes, ER) dan filter jenis konten.

6. **Pengendalian Mode Hemat & Biaya Apify:**
   - Konfirmasi proteksi jika pengambilan dilakukan dalam waktu kurang dari 24 jam.
   - Peringatan anggaran pada pemakaian **US$4,00** dan pembatas keras (hard cap) pada **US$4,50** per siklus bulanan (dari jatah Free tier Apify **US$5,00/bulan**).
   - Batas biaya per run: **US$0,05** (`maxTotalChargeUsd`).
   - Buku catatan penggunaan (Usage Ledger) terperinci.
   - Tombol toggle mode demo/simulasi vs. Apify Live.

---

## 🛠️ Menjalankan Proyek Secara Lokal

Proyek ini telah siap dan dapat langsung dijalankan di browser:

```bash
# 1. Masuk ke direktori
cd /Users/zidane/monitorAKUN

# 2. Jalankan development server
npm run dev
```

Buka browser di: `http://localhost:3000`

---

## 🗄️ Menghubungkan Supabase & Apify Live

### 1. Supabase (Database & Auth)
Jalankan file migrasi SQL di Supabase SQL Editor:
`supabase/migrations/20261103_init_tiktok_monitor.sql`

File ini akan membuat tabel-tabel berikut:
- `accounts`: Daftar akun yang dipantau.
- `sync_jobs`: Riwayat status run Apify.
- `account_snapshots`: Riwayat statistik profil per observasi.
- `posts`: Metadata postingan TikTok (ID disimpan string).
- `post_snapshots`: Riwayat metrik per postingan.
- `usage_ledger`: Pencatatan biaya Apify & batas anggaran.

### 2. Kredensial Environment (`.env`)
Salin `.env.example` ke `.env`:
```env
VITE_APIFY_API_TOKEN=apify_api_...
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

Atau masukkan langsung melalui menu **Pengaturan (ikon gerigi)** di pojok kanan atas aplikasi.

---

## ☁️ Deployment ke Cloudflare Pages & Workers

Website dan API functions dapat langsung di-deploy ke Cloudflare Pages:

```bash
# Build aplikasi
npm run build

# Deploy via Wrangler
npx wrangler pages deploy dist --project-name=tiktok-monitor
```

---

## 📂 Struktur File

```
├── functions/api/[[route]].ts        # Cloudflare Pages Functions / Worker router
├── src/
│   ├── components/
│   │   ├── Header.tsx                # Header, WIB clock, indikator kuota Apify
│   │   ├── AccountSelector.tsx       # Kartu pemilihan akun
│   │   ├── SyncControl.tsx           # Tombol ambil data & konfirmasi Mode Hemat
│   │   ├── ProfileSummary.tsx        # Statistik profil (Followers, Likes, Postingan)
│   │   ├── PostsSummary.tsx          # Ringkasan 10 postingan terpantau & ER
│   │   ├── FollowersGrowthChart.tsx  # Grafik kurva pertumbuhan followers
│   │   ├── PostMetricHistoryChart.tsx# Grafik komparasi performa postingan
│   │   ├── PostsTable.tsx            # Tabel 10 postingan & delta metrik
│   │   ├── EmptyState.tsx            # Keadaan kosong sebelum pengambilan pertama
│   │   └── SettingsModal.tsx         # Manajemen akun, API key, & Usage Ledger
│   ├── lib/
│   │   ├── apify.ts                  # Integrasi Actor Apify & payload scraper
│   │   ├── formatters.ts             # Format angka, WIB (Asia/Jakarta), rumus ER
│   │   ├── seedData.ts               # Data 4 akun awal & riwayat observasi
│   │   ├── storage.ts                # State management, local/Supabase adapter
│   │   └── supabase.ts               # Supabase client helper
│   ├── types/
│   │   └── index.ts                  # Definisi tipe TypeScript
│   ├── App.tsx                       # Halaman utama dashboard
│   ├── main.tsx                      # Entrypoint React
│   └── index.css                     # Tailwind CSS v4 styling
├── supabase/migrations/
│   └── 20261103_init_tiktok_monitor.sql # Skema database Supabase
├── package.json
├── vite.config.ts
├── wrangler.toml
└── README.md
```
