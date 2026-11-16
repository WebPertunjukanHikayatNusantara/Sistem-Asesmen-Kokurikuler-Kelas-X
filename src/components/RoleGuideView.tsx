import React, { useEffect, useState } from 'react';
import {
  UserRole,
  SCHOOL_MOTTO,
  FIVE_HOLISTIC_DIMENSIONS,
  GROWTH_LEVELS,
  GROWTH_LEVEL_ORDER,
  STAGE_RECOMMENDED_INDICATORS
} from '../types';
import {
  Users,
  BookOpenCheck,
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  HeartHandshake,
  Clock,
  Award,
  MessageSquareHeart,
  Printer,
  AlertCircle,
  ArrowRight,
  Compass,
  Layers,
  Sparkles
} from 'lucide-react';

interface RoleGuideViewProps {
  portalRole: UserRole;
}

type GuideSectionId = 'workflow' | 'mapping' | 'amor' | 'all_roles';

const STAGE_FOCUS_SUMMARY = [
  { stage: 'Tahap 1: Explore & Tahap 2: Research', codes: STAGE_RECOMMENDED_INDICATORS[1], note: 'Menekankan rasa ingin tahu, riset budaya, dan penghargaan terhadap karya Nusantara.' },
  { stage: 'Tahap 3: Create', codes: STAGE_RECOMMENDED_INDICATORS[3], note: 'Menekankan keberanian mencoba dan gagasan olahan karya kreatif.' },
  { stage: 'Tahap 4: Organize', codes: STAGE_RECOMMENDED_INDICATORS[4], note: 'Menekankan kesetiaan pada tugas divisi, kerja sama lintas kelas, dan tanggung jawab pribadi.' },
  { stage: 'Tahap 5: Perform', codes: STAGE_RECOMMENDED_INDICATORS[5], note: 'Menekankan ketekunan berlatih, pengelolaan diri & emosi, serta melayani/membantu teman.' },
  { stage: 'Tahap 6: Reflect', codes: STAGE_RECOMMENDED_INDICATORS[6], note: 'Menekankan evaluasi diri dan karya, kejujuran proses, serta kerendahan hati menerima masukan.' }
];

export const RoleGuideView: React.FC<RoleGuideViewProps> = ({ portalRole }) => {
  const [activeSection, setActiveSection] = useState<GuideSectionId>('workflow');
  const [adminSelectedRole, setAdminSelectedRole] = useState<'pendamping' | 'walikelas' | 'murid'>('pendamping');

  useEffect(() => {
    setActiveSection('workflow');
  }, [portalRole]);

  const roleHeaderInfo = {
    pendamping: {
      title: 'Panduan Portal Guru Pendamping Divisi',
      subtitle: 'Panduan resmi pendampingan divisi (Divisi 1 s/d 7), pengisian indikator perilaku, umpan balik pertumbuhan, dan apresiasi naratif.',
      badgeBg: 'bg-[#032448] text-amber-300',
      icon: <Users className="w-5 h-5" />
    },
    walikelas: {
      title: 'Panduan Portal Guru Wali Kelas',
      subtitle: 'Panduan resmi peninjauan progres siswa kelas perwalian (X-1 s/d X-6) lintas 7 divisi, pengisian catatan pribadi, dan sapaan hangat.',
      badgeBg: 'bg-indigo-900 text-indigo-100',
      icon: <BookOpenCheck className="w-5 h-5" />
    },
    murid: {
      title: 'Panduan Portal Siswa / Murid',
      subtitle: 'Panduan memahami peta pertumbuhan 5 dimensi tanpa angka, mengisi penilaian diri, apresiasi teman, dan refleksi relasional Tahap 6.',
      badgeBg: 'bg-emerald-800 text-white',
      icon: <GraduationCap className="w-5 h-5" />
    },
    admin: {
      title: 'Panduan Lengkap Semua Portal (Koordinator / Admin)',
      subtitle: 'Tinjauan alur kerja Guru Pendamping Divisi, Guru Wali Kelas, Murid, serta Pemetaan Formasi & 15 Indikator Nilai Santo Yosef.',
      badgeBg: 'bg-amber-700 text-white',
      icon: <ShieldCheck className="w-5 h-5" />
    }
  }[portalRole];

  const renderPendampingWorkflow = () => (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-start gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-[#032448] text-amber-300 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#032448]">
              Alur Kerja & Aturan Pengisian Guru Pendamping Divisi
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Anda mendampingi langsung satu divisi kerja DPK (Divisi 1 s/d 7) selama blok pembelajaran (16–19 Nov 2026) hingga malam gelar karya (20 Nov 2026). Anda hanya melihat dan menilai siswa yang terdaftar di divisi Anda.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#032448] text-white text-xs font-bold flex items-center justify-center">1</span>
              <h4 className="text-xs font-bold text-[#032448] uppercase tracking-wide">
                Cek Anggota Divisi (`Data Siswa & Divisi`)
              </h4>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-700 pl-2">
              <li className="flex items-start gap-2">
                <ArrowRight className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <span>Pastikan seluruh siswa divisi Anda (Utama maupun Pendukung lintas kelas X-1 s/d X-6) sudah terdata.</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <span>Jika ada siswa merangkap dua divisi atau menjadi Panitia DPK, perbarui lewat ikon Edit.</span>
              </li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#032448] text-white text-xs font-bold flex items-center justify-center">2</span>
              <h4 className="text-xs font-bold text-[#032448] uppercase tracking-wide">
                Update Progres 6 Tahap (`Progres 6 Tahap`)
              </h4>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-700 pl-2">
              <li className="flex items-start gap-2">
                <ArrowRight className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <span>Tandai progres tiap tahap (*Explore* s/d *Reflect*): <em>Belum Dimulai</em>, <em>Sedang Berjalan</em>, <em>Tersendat / Perlu Sapaan</em>, atau <em>Selesai</em>.</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <span>Jika ada siswa kelelahan atau tertinggal, pilih <strong>Tersendat / Perlu Sapaan</strong> dan isi <em>Sapaan Pendamping</em> agar Wali Kelas turut menyapa.</span>
              </li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#032448] text-white text-xs font-bold flex items-center justify-center">3</span>
              <h4 className="text-xs font-bold text-[#032448] uppercase tracking-wide">
                Asesmen 5 Dimensi & 3 Level Pertumbuhan
              </h4>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-700 pl-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Buka tab <strong>Asesmen 5 Dimensi & Apresiasi</strong>, pilih siswa & tahap proyek (1–6).</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Tidak semua indikator wajib diisi di setiap tahap.</strong> Utamakan indikator bertanda <em>Disarankan di Tahap Ini</em>.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Pilih <strong>Mulai Tumbuh</strong>, <strong>Berkembang</strong>, atau <strong>Menjadi Teladan</strong> berdasarkan 1 kalimat deskripsi per level. Sistem otomatis mengirim umpan balik <em>“Langkah Berikutnya”</em> ke tampilan siswa.</span>
              </li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-700 text-white text-xs font-bold flex items-center justify-center">4</span>
              <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wide">
                Kolom Apresiasi Terpisah & Pembobotan
              </h4>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-700 pl-2">
              <li className="flex items-start gap-2">
                <MessageSquareHeart className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                <span><strong>Apresiasi Naratif Guru</strong> dan <strong>Kontribusi Khusus</strong> terpisah dari level indikator — tulis minimal 1 kalimat tulus yang meneguhkan kerja nyata siswa (termasuk tugas di balik layar).</span>
              </li>
              <li className="flex items-start gap-2">
                <MessageSquareHeart className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                <span>Level dikonversi ke skor internal 1–3 hanya untuk penggabungan bobot divisi (60% Utama + 40% Pendukung) dan ekspor Excel — <strong>tidak pernah ditampilkan sebagai angka kepada siswa</strong>.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Penekanan Indikator Per Tahap */}
        <div className="pt-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-600" />
            Penekanan Indikator di Setiap Tahap (Tidak Semua Wajib Diisi Sekaligus):
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
            {STAGE_FOCUS_SUMMARY.map((item) => (
              <div key={item.stage} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <p className="text-[11px] font-bold text-[#032448]">{item.stage}</p>
                <div className="flex flex-wrap gap-1">
                  {item.codes.map((code) => (
                    <span
                      key={code}
                      className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 font-mono text-[10px] font-bold"
                    >
                      {code}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">{item.note}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderWaliKelasWorkflow = () => (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-start gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-indigo-900 text-indigo-100 flex items-center justify-center shrink-0">
            <BookOpenCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#032448]">
              Alur Kerja & Aturan Pengisian Guru Wali Kelas (X-1 s/d X-6)
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Anda melihat seluruh siswa kelas perwalian Anda lintas 7 divisi. Anda membaca ringkasan penilaian guru pendamping secara <em>lihat-saja</em> dan menuliskan catatan pendampingan pribadi berdasarkan keseharian siswa.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-900 text-white text-xs font-bold flex items-center justify-center">1</span>
              <h4 className="text-xs font-bold text-[#032448] uppercase tracking-wide">
                Pantau Meja Pendampingan & Progres 6 Tahap
              </h4>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-700 pl-2">
              <li className="flex items-start gap-2">
                <ArrowRight className="w-3.5 h-3.5 text-indigo-700 shrink-0 mt-0.5" />
                <span>Di <strong>Meja Pendampingan</strong>, periksa kotak <em>Siswa yang Perlu Disapa Hangat</em> agar tidak ada siswa kelas Anda yang berjalan sendirian.</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="w-3.5 h-3.5 text-indigo-700 shrink-0 mt-0.5" />
                <span>Buka tab <strong>Progres 6 Tahap</strong> untuk membaca sapaan atau kendala yang dicatat Guru Pendamping Divisi.</span>
              </li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-200 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-900 text-white text-xs font-bold flex items-center justify-center">2</span>
              <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wide">
                Baca Ringkasan & Isi 3 Catatan Wali Kelas
              </h4>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-700 pl-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Buka tab <strong>Tinjauan & Catatan Wali Kelas</strong> dan pilih nama siswa perwalian.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Baca ringkasan 5 Dimensi, <em>Penilaian Diri</em>, dan <em>Refleksi Tahap 6</em> (mode lihat-saja, tanpa mengubah skor pendamping divisi).</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Isi 3 kolom catatan pribadi: <strong>Sikap Sehari-hari</strong>, <strong>Kemandirian</strong>, dan <strong>Keterlibatan Utuh</strong>, centang <em>Perlu Tindak Lanjut / Sapaan</em> bila perlu, lalu klik <strong>Simpan</strong>.</span>
              </li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-2 md:col-span-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-700 text-white text-xs font-bold flex items-center justify-center">3</span>
              <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wide">
                Apresiasi Naratif Wali Kelas, Cetak Rapor & Ekspor Kelas
              </h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-700 pl-2">
              <div className="flex items-start gap-2">
                <HeartHandshake className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                <span>Tuliskan <strong>Apresiasi Naratif</strong> atau <strong>Kontribusi Khusus</strong> (terpisah dari level indikator) untuk menguatkan sisi baik anak wali Anda.</span>
              </div>
              <div className="flex items-start gap-2">
                <Printer className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                <span>Gunakan tab <strong>Cetak Rapor & Sertifikat</strong> untuk mencetak rapor naratif siswa kelas Anda dan tombol <strong>Ekspor (.xlsx)</strong> untuk arsip kelas.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMuridWorkflow = () => (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-start gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-emerald-800 text-white flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#032448]">
              Cara Kerja & Pengisian Portal Siswa / Murid
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Portal ini mendampingi proses bertumbuhmu tanpa angka nilai dan tanpa peringkat antarsiswa maupun antarkelas. Fokus utamanya adalah langkah bertumbuh, kejujuran diri, dan saling menghargai.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-800 text-white text-xs font-bold flex items-center justify-center">1</span>
              <h4 className="text-xs font-bold text-[#032448] uppercase tracking-wide">
                Beranda & Tahap Proses (Explore – Reflect)
              </h4>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-700 pl-2">
              <li className="flex items-start gap-2">
                <ArrowRight className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                <span>Pastikan <strong>Divisi Utama</strong> (dan <strong>Divisi Pendukung</strong> bila merangkap) sudah tepat.</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                <span>Baca sapaan dari guru pendamping dan catat hasil/tautan karyamu di setiap tahap proyek.</span>
              </li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-800 text-white text-xs font-bold flex items-center justify-center">2</span>
              <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wide">
                Capaian & Penilaian Diri
              </h4>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-700 pl-2">
              <li className="flex items-start gap-2">
                <Award className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                <span>Lihat tanda pertumbuhanmu (<em>Mulai Tumbuh</em>, <em>Berkembang</em>, <em>Menjadi Teladan</em>) beserta kalimat <strong>“Langkah Berikutnya”</strong> dari pendamping — contoh: <em>“Langkah berikutnya: tawarkan bantuan kepada teman yang kesulitan.”</em></span>
              </li>
              <li className="flex items-start gap-2">
                <Award className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                <span>Isi <strong>Penilaian Diri</strong> dengan jujur sesuai deskripsi tiap indikator di atas.</span>
              </li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-700 text-white text-xs font-bold flex items-center justify-center">3</span>
              <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wide">
                Apresiasi Teman Sedivisi (Tab Apresiasi)
              </h4>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-700 pl-2">
              <li className="flex items-start gap-2">
                <HeartHandshake className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                <span>Kolom apresiasi terpisah dari penilaian indikator. Baca apresiasi yang kamu terima dari guru dan teman.</span>
              </li>
              <li className="flex items-start gap-2">
                <HeartHandshake className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                <span>Isi kotak <strong>“Satu hal yang saya syukuri dari temanku”</strong> untuk mengucap syukur atas kebaikan rekan satu divisimu.</span>
              </li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#032448] text-white text-xs font-bold flex items-center justify-center">4</span>
              <h4 className="text-xs font-bold text-[#032448] uppercase tracking-wide">
                Refleksi Relasional Tahap 6 (Diisi 1 Kali)
              </h4>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-700 pl-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-700 shrink-0 mt-0.5" />
                <span>Diisi cukup <strong>satu kali</strong> setelah proyek berlangsung untuk merangkum semua divisi yang kamu ikuti.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-700 shrink-0 mt-0.5" />
                <span>Ceritakan pengalaman <em>Mengalami Cinta, Menghidupi Cinta,</em> dan <em>Meneruskan Cinta</em> di bagian refleksi (lihat tab <em>Refleksi “Amor Gignit Amorem”</em>).</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMappingAndRubric = () => (
    <div className="space-y-5">
      {/* 1. Pemetaan & 3 Level Pertumbuhan */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
        <div>
          <h3 className="text-base font-bold text-[#032448] flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-600" />
            Pemetaan Formasi & Indikator Nilai Santo Yosef
          </h3>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            Lima dimensi kokurikuler (<strong>Berkebinekaan Global, Gotong Royong, Kreatif, Bernalar Kritis, Mandiri</strong>) berhubungan dengan keempat formasi (<strong>Human, Spiritual, Intelektual, Pastoral</strong>). Setiap dimensi memuat nilai Santo Yosef sebagai sumber, lalu indikator perilaku yang diamati dalam enam tahap: <em>Explore, Research, Create, Organize, Perform, Reflect</em>.
          </p>
        </div>

        {/* 3 Level Pertumbuhan */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {GROWTH_LEVEL_ORDER.map((lvl) => {
            const cfg = GROWTH_LEVELS[lvl];
            return (
              <div key={lvl} className={`p-4 rounded-xl border ${cfg.bgClass} ${cfg.borderClass} space-y-1`}>
                <span className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-bold border ${cfg.badgeClass}`}>
                  {cfg.level}
                </span>
                <p className={`text-xs font-medium pt-1 ${cfg.textClass}`}>{cfg.generalMeaning}</p>
              </div>
            );
          })}
        </div>

        {/* 2. Tabel Pemetaan Ringkas */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
            Tabel Pemetaan Ringkas 5 Dimensi — 4 Formasi — Nilai Santo Yosef
          </h4>
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="py-2.5 px-4 border-r border-slate-200">Dimensi Kokurikuler</th>
                  <th className="py-2.5 px-4 border-r border-slate-200">Formasi</th>
                  <th className="py-2.5 px-4 border-r border-slate-200">Nilai Santo Yosef</th>
                  <th className="py-2.5 px-4">Rumusan Sikap</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700">
                {FIVE_HOLISTIC_DIMENSIONS.map((dim) => (
                  <tr key={dim.id} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-4 border-r border-slate-200 font-bold text-[#032448]">{dim.name}</td>
                    <td className="py-2.5 px-4 border-r border-slate-200 font-semibold">{dim.formasi}</td>
                    <td className="py-2.5 px-4 border-r border-slate-200 text-amber-900 font-medium">{dim.stYosefValues}</td>
                    <td className="py-2.5 px-4">{dim.rumusan}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 3–7. Rincian Lengkap 15 Indikator Perilaku */}
      <div className="space-y-4">
        {FIVE_HOLISTIC_DIMENSIONS.map((dim, idx) => (
          <div key={dim.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded bg-[#032448] text-white text-xs font-bold">
                    {idx + 1}. {dim.name}
                  </span>
                  <span className="px-2.5 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold">
                    Formasi {dim.formasi}
                  </span>
                  <span className="text-xs font-semibold text-slate-600">
                    Nilai St. Yosef: {dim.stYosefValues}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1.5 italic">{dim.rumusan}</p>
              </div>
            </div>

            <div className="space-y-3">
              {dim.indicators.map((ind) => (
                <div key={ind.code} className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#032448]">
                      Indikator {ind.code}: {ind.title}
                    </span>
                    {ind.stageHint && (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-900 border border-blue-200">
                        {ind.stageHint}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                    {GROWTH_LEVEL_ORDER.map((lvl) => {
                      const cfg = GROWTH_LEVELS[lvl];
                      const detail = ind.levels[lvl];
                      return (
                        <div key={lvl} className={`p-3 rounded-lg border bg-white ${cfg.borderClass} space-y-1`}>
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${cfg.badgeClass}`}>
                            {lvl}
                          </span>
                          <p className="text-xs font-medium text-slate-800">{detail.descriptor}</p>
                          <p className="text-[11px] text-slate-500 border-t border-slate-100 pt-1">
                            <strong>Langkah Berikutnya:</strong> {detail.nextStep}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAmorGignitAmorem = () => (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-start gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 border border-amber-200 flex items-center justify-center shrink-0">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#032448]">
              Indikator Tambahan: Refleksi Relasional “Amor Gignit Amorem”
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Diisi dari jawaban murid pada tahap <strong>Reflect</strong> (Tahap 6). Fungsinya membantu pendidik mengenali apakah siswa sungguh mengalami dan meneruskan kasih — bukan untuk skor maupun pemeringkatan.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
            <span className="inline-block px-2.5 py-0.5 rounded bg-amber-700 text-white text-xs font-bold">
              1. Mengalami Cinta
            </span>
            <p className="text-xs text-slate-800 leading-relaxed font-medium">
              Siswa dapat menyebut siapa yang membantu dan menghargainya selama proyek berlangsung.
            </p>
            <p className="text-[11px] text-amber-900 pt-1 border-t border-amber-200/80">
              Terkait pertanyaan refleksi: <em>“Siapa yang membantu saya bertumbuh?”</em> dan <em>“Kapan saya merasa dihargai dalam kelompok?”</em>
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-teal-50/70 border border-teal-200 space-y-2">
            <span className="inline-block px-2.5 py-0.5 rounded bg-teal-700 text-white text-xs font-bold">
              2. Menghidupi Cinta
            </span>
            <p className="text-xs text-slate-800 leading-relaxed font-medium">
              Siswa dapat menyebut bagaimana ia membantu, menolong, atau melayani temannya dalam kebersamaan divisi.
            </p>
            <p className="text-[11px] text-teal-900 pt-1 border-t border-teal-200/80">
              Terkait pertanyaan refleksi: <em>“Siapa yang saya bantu, dan bagaimana rasanya saat melayani teman tersebut?”</em>
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
            <span className="inline-block px-2.5 py-0.5 rounded bg-emerald-700 text-white text-xs font-bold">
              3. Meneruskan Cinta
            </span>
            <p className="text-xs text-slate-800 leading-relaxed font-medium">
              Siswa dapat menyebut rencana nyata yang ingin ia lakukan untuk membantu orang lain setelah proyek selesai.
            </p>
            <p className="text-[11px] text-emerald-900 pt-1 border-t border-emerald-200/80">
              Terkait pertanyaan refleksi: <em>“Apa yang ingin saya perbaiki dan kebaikan apa yang ingin saya lanjutkan setelah gelar karya?”</em>
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            <strong>Prinsip Pendampingan:</strong> Jawaban murid pada indikator relasional ini hanya dibaca oleh Guru Pendamping divisinya, Wali Kelasnya, dan Tim Pastoral/Koordinator untuk pendampingan pribadi yang penuh kasih.
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${roleHeaderInfo.badgeBg}`}>
              {roleHeaderInfo.icon}
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-200 mb-1">
                <Compass className="w-3 h-3 text-amber-700" />
                <span>Panduan Resmi Portal • {SCHOOL_MOTTO.full}</span>
              </div>
              <h2 className="text-lg font-bold text-[#032448]">{roleHeaderInfo.title}</h2>
              <p className="text-xs text-slate-600 mt-0.5">{roleHeaderInfo.subtitle}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            className="no-print self-start md:self-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-[#032448] bg-slate-100 hover:bg-slate-200 border border-slate-200 cursor-pointer whitespace-nowrap"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Panduan</span>
          </button>
        </div>

        {/* Sub-navigation inside the portal's guide */}
        <div className="flex flex-wrap gap-2 no-print">
          <button
            type="button"
            onClick={() => setActiveSection('workflow')}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
              activeSection === 'workflow'
                ? 'bg-[#032448] text-white border-[#032448]'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {portalRole === 'pendamping'
              ? '1. Alur Kerja Pendamping'
              : portalRole === 'walikelas'
              ? '1. Alur Kerja Wali Kelas'
              : portalRole === 'murid'
              ? '1. Cara Pengisian Portal Siswa'
              : '1. Panduan Semua Peran'}
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('mapping')}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
              activeSection === 'mapping'
                ? 'bg-[#032448] text-white border-[#032448]'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            2. Pemetaan 4 Formasi & 15 Indikator St. Yosef
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('amor')}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
              activeSection === 'amor'
                ? 'bg-[#032448] text-white border-[#032448]'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            3. Refleksi “Amor Gignit Amorem”
          </button>
        </div>
      </div>

      {/* Body based on activeSection and portalRole */}
      {activeSection === 'workflow' && (
        <>
          {portalRole === 'pendamping' && renderPendampingWorkflow()}
          {portalRole === 'walikelas' && renderWaliKelasWorkflow()}
          {portalRole === 'murid' && renderMuridWorkflow()}
          {portalRole === 'admin' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-3 border border-slate-200 flex flex-wrap gap-2 no-print">
                {(
                  [
                    { id: 'pendamping', label: 'Panduan Guru Pendamping Divisi' },
                    { id: 'walikelas', label: 'Panduan Guru Wali Kelas' },
                    { id: 'murid', label: 'Panduan Siswa / Murid' }
                  ] as const
                ).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setAdminSelectedRole(item.id)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                      adminSelectedRole === item.id
                        ? 'bg-amber-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              {adminSelectedRole === 'pendamping' && renderPendampingWorkflow()}
              {adminSelectedRole === 'walikelas' && renderWaliKelasWorkflow()}
              {adminSelectedRole === 'murid' && renderMuridWorkflow()}
            </div>
          )}
        </>
      )}

      {activeSection === 'mapping' && renderMappingAndRubric()}
      {activeSection === 'amor' && renderAmorGignitAmorem()}
    </div>
  );
};
