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

### 2. Empat Peran Pengguna & Isolasi Akses (`firestore.rules`)
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
- **Backend & Database**: Firebase Authentication (Google Sign-In) & Cloud Firestore (`firestore.rules`)
- **Icons & Motion**: Lucide React & Motion
- **Ekspor Data**: SheetJS (`xlsx`)

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

## 📤 Cara Memindahkan / Mengunggah ke GitHub

### Opsi 1 — Langsung dari AI Studio
Gunakan tombol **GitHub** (atau ikon **Download app**) pada bilah atas antarmuka AI Studio untuk menyimpan repositori langsung ke akun GitHub Anda atau mengunduh paket `.zip`.

### Opsi 2 — Push Manual dari Komputer Lokal
1. Unduh seluruh kode aplikasi dari AI Studio (ekstrak `.zip` ke folder lokal).
2. Buat repositori baru kosong di [GitHub](https://github.com/new) (jangan centang *Add a README*).
3. Jalankan perintah berikut di terminal dalam folder proyek:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Symphony of Nusantara"
   git branch -M main
   git remote add origin https://github.com/<username-github-anda>/<nama-repo>.git
   git push -u origin main
   ```

---

## 🔐 Catatan Penting Setelah Pindah ke GitHub / Hosting Baru

1. **Authorized Domains (Wajib agar Login Google Berfungsi)**:  
   Jika aplikasi di-hosting di domain baru (mis. Vercel, Netlify, Firebase Hosting, atau GitHub Pages), buka **Firebase Console → Authentication → Settings → Authorized domains**, lalu tambahkan domain hosting tersebut.
2. **Aturan Keamanan Firestore**:  
   Pastikan `firestore.rules` ikut dideploy jika Anda berpindah ke proyek Firebase baru (`firebase deploy --only firestore:rules`).
3. **Konfigurasi Firebase**:  
   File `firebase-applet-config.json` sudah memuat konfigurasi koneksi proyek Firebase Anda. Pastikan konfigurasi tersebut sesuai dengan proyek Firebase tujuan Anda.
