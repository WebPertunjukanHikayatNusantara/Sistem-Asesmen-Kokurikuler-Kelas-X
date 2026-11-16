# Symphony of Nusantara — Pendampingan Formasi Holistik Kelas X

Aplikasi pendampingan formasi holistik siswa Kelas X (X-1 s/d X-6) **SMA Pangudi Luhur Santo Yosef Surakarta** untuk proyek kokurikuler **"Symphony of Nusantara: Merajut Keberagaman Nusantara melalui Pertunjukan Seni"** dengan puncak Gelar Karya Drama Musikal Kolosal **"Hikayat Nusantara"**.

> **Motto Pendampingan:** *"Amor Gignit Amorem — Cinta Melahirkan Cinta"*  
> Manusia dibentuk oleh pengalaman dicintai, bukan oleh tekanan.

---

## 🌟 Prinsip & Fitur Utama

### 1. Lima Prinsip Pendampingan
- Penilaian bersifat formatif (mendampingi proses, bukan menghakimi).
- Umpan balik berbahasa pertumbuhan (*"Mulai berkembang, langkah berikutnya: ..."*), tanpa label kurang atau gagal.
- Tidak ada peringkat atau perbandingan antar siswa maupun antar kelas.
- Siswa menjadi subjek aktif: memantau prosesnya sendiri, mengisi penilaian diri, menuliskan refleksi relasional, serta mengirim dan menerima apresiasi.
- Multi-sudut pandang: Guru Pendamping Divisi, Wali Kelas, Diri Sendiri, dan Teman Sedivisi.

### 2. Empat Peran Pengguna & Isolasi Akses (Supabase RLS — `supabase/schema.sql`)
- **Guru Pendamping Divisi**: Melihat, mendampingi, dan menilai hanya siswa pada divisi yang didampinginya (termasuk siswa lintas kelas dan siswa yang merangkap divisi pendukung).
- **Wali Kelas (X-1 s/d X-6)**: Melihat seluruh siswa di kelas perwaliannya dari semua divisi dalam mode baca untuk capaian tahap/indikator, serta menulis catatan pendampingan pribadi.
- **Siswa / Murid**: Menautkan akun Google ke daftar resmi kelas X (205 siswa X-1 s/d X-6), mengisi catatan proses 6 tahap, penilaian diri 15 indikator, apresiasi teman sedivisi, dan refleksi relasional Tahap 6 (diisi 1 kali lintas divisi).
- **Admin / Koordinator**: Mengatur penugasan staf, kode akses peran, bobot divisi utama/pendukung, impor roster resmi, simulasi tampilan peran (*Tinjau Peran*), cetak dokumen, dan ekspor Excel (`.xlsx`).

### 3. Struktur Kokurikuler & 7 Divisi DPK
- **Blok Pembelajaran**: 16 – 19 November 2026 | **Gelar Karya ("Hikayat Nusantara")**: 20 November 2026.
- **6 Tahap Proses**: `Explore` → `Research` → `Create` → `Organize` → `Perform` → `Reflect`.
- **5 Dimensi & 4 Formasi (Human, Spiritual, Intelektual, Pastoral)** dengan 15 indikator perilaku dan 3 level pertumbuhan (*Mulai Tumbuh*, *Berkembang*, *Menjadi Teladan*).
- **7 Divisi Kerja Kepanitiaan Murid (DPK)**:
  1. Teater
  2. Kesenian Tradisional
  3. Kesenian Modern
  4. Visual dan Dokumentasi
  5. Logistik dan Konsumsi
  6. Ticketing
  7. Produksi dan Manajemen Panggung

---

## 🛠️ Teknologi yang Digunakan

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4
- **Backend & Database**: Supabase (PostgreSQL + Supabase Auth Google OAuth + Row Level Security)
- **Icons & Motion**: Lucide React & Motion
- **Ekspor Data**: SheetJS (`xlsx`)

---

## 🗄️ Setup Database & Login Google (Supabase Gratis)

Aplikasi ini dirancang memakai paket **Supabase Free Tier** (PostgreSQL 500 MB, 50.000 pengguna aktif/bulan, tanpa batas baca harian untuk ~300 siswa & ~20 guru):

1. **Buat Proyek Supabase**: Masuk ke [Supabase Dashboard](https://supabase.com/dashboard) → klik **New Project** (pilih region Singapore agar respons cepat dari Indonesia).
2. **Buat Tabel & Aturan RLS**: Buka **SQL Editor → New query**, salin seluruh isi file `supabase/schema.sql`, lalu klik **Run**.
3. **Aktifkan Google Sign-In**:
   - Buka **Authentication → Providers → Google**, aktifkan dan masukkan *Google OAuth Client ID & Secret* (dari Google Cloud Console dengan Authorized Redirect URI `https://<project-ref>.supabase.co/auth/v1/callback`).
   - Buka **Authentication → URL Configuration**, atur **Site URL** serta tambahkan ke **Redirect URLs** alamat web Anda (mis. `http://localhost:3000/` untuk lokal dan `https://<username>.github.io/<nama-repo>/` untuk GitHub Pages).
4. **Isi Environment Variables**:
   - Untuk lokal: salin `.env.example` menjadi `.env`, lalu isi `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` (dari **Project Settings → API**).
   - Untuk GitHub Pages: buka **Settings → Secrets and variables → Actions** pada repositori GitHub, tambahkan secret `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY`.

---

## 🚀 Cara Menjalankan Proyek Secara Lokal

### Prasyarat
- Node.js versi 18 atau lebih baru (`npm` atau `bun`)

### Langkah Instalasi
```bash
npm install
npm run dev
```
Aplikasi berjalan secara lokal di `http://localhost:3000`.

Build produksi:
```bash
npm run build
```

---

## 📤 Cara Memindahkan / Mengunggah ke GitHub & GitHub Pages

1. **Aktifkan GitHub Pages via GitHub Actions**:  
   Buka **Settings → Pages → Build and deployment → Source**, pilih **GitHub Actions** (jangan memilih *Deploy from a branch*, karena source Vite `.tsx` perlu dibuild menjadi `dist/` oleh `.github/workflows/deploy.yml`).
2. **Tambahkan Repository Secrets**:  
   Tambahkan `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` di **Settings → Secrets and variables → Actions**.
3. **Daftarkan Redirect URL di Supabase Auth**:  
   Tambahkan `https://<username>.github.io/<nama-repo>/` pada **Authentication → URL Configuration → Redirect URLs** di Supabase Dashboard agar Login Google kembali ke aplikasi dengan lancar.
