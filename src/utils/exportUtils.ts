import * as XLSX from 'xlsx';
import {
  Student,
  Assessment,
  Appreciation,
  StudentReflection,
  HomeroomNote,
  AppConfig,
  UserRole,
  ClassGroup,
  getDivisionById,
  GROWTH_LEVELS
} from '../types';
import { computeStudentCombinedSummary, DEFAULT_APP_CONFIG } from './assessmentUtils';

export function exportHolisticDataToExcel(params: {
  requesterRole: UserRole;
  students: Student[];
  assessments: Assessment[];
  appreciations: Appreciation[];
  reflections: StudentReflection[];
  homeroomNotes: HomeroomNote[];
  appConfig?: AppConfig;
  classFilter?: ClassGroup | 'ALL';
}) {
  const {
    requesterRole,
    students,
    assessments,
    appreciations,
    reflections,
    homeroomNotes,
    appConfig = DEFAULT_APP_CONFIG,
    classFilter = 'ALL'
  } = params;

  if (requesterRole === 'murid') {
    throw new Error('Ekspor data kolektif hanya tersedia bagi Admin, Pendamping Divisi, atau Wali Kelas berwenang.');
  }

  const wb = XLSX.utils.book_new();
  const filteredStudents =
    classFilter === 'ALL' ? students : students.filter((s) => s.classGroup === classFilter);

  // 1. Daftar Siswa & Penempatan Divisi (Tanpa Peringkat)
  const studentRows = filteredStudents.map((s, index) => ({
    No: index + 1,
    NISN: s.nisn,
    'Nama Siswa': s.name,
    Kelas: s.classGroup,
    'Divisi Utama': getDivisionById(s.primaryDivisionId)?.shortName || s.primaryDivisionId,
    'Divisi Pendukung': s.secondaryDivisionId
      ? getDivisionById(s.secondaryDivisionId)?.shortName || s.secondaryDivisionId
      : '-',
    'Panitia DPK Kelas X': s.isDpkCommittee ? `Ya (${s.dpkRoleNote || 'Panitia DPK'})` : 'Tidak',
    'Status Pendampingan': s.status,
    Catatan: s.notes || '-'
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(studentRows), 'Daftar Siswa & Divisi');

  // 2. Rekap Gabungan 5 Dimensi Holistik (Menggunakan Bobot Divisi Utama/Pendukung)
  const combinedRows = filteredStudents.map((s, index) => {
    const stdAssessments = assessments.filter((a) => a.studentId === s.id);
    const summary = computeStudentCombinedSummary(s, stdAssessments, appConfig);
    const dimLookup = Object.fromEntries(summary.dimensionSummaries.map((d) => [d.dimensionId, d]));
    const reflection = reflections.find((r) => r.studentId === s.id);
    const hrNote = homeroomNotes.find((h) => h.studentId === s.id);

    return {
      No: index + 1,
      'Nama Siswa': s.name,
      Kelas: s.classGroup,
      'Divisi Utama': summary.primaryDivisionName,
      'Divisi Pendukung': summary.secondaryDivisionName || '-',
      'Pola Pembobotan': summary.weightUsedLabel,
      'Rerata Divisi Utama (1-3)': summary.primaryAvg ?? '-',
      'Rerata Divisi Pendukung (1-3)': summary.secondaryAvg ?? '-',
      'Gabungan Tertimbang (1-3)': summary.weightedInternalScore ?? '-',
      'Level Pertumbuhan Umum': summary.overallGrowthLevel || 'Belum Dinilai',
      'Gotong Royong (Pastoral)': dimLookup['gotong-royong']?.growthLevel || '-',
      'Mandiri (Human)': dimLookup['mandiri']?.growthLevel || '-',
      'Bernalar Kritis (Intelektual)': dimLookup['bernalar-kritis']?.growthLevel || '-',
      'Kreatif (Intelektual & Human)': dimLookup['kreatif']?.growthLevel || '-',
      'Berkebinekaan Global (Pastoral & Spiritual)': dimLookup['kebinekaan']?.growthLevel || '-',
      'Refleksi Tahap 6': reflection?.isSubmitted ? 'Sudah Mengisi' : 'Belum Mengisi',
      'Sapaan Wali Kelas': hrNote?.needsFollowUp ? 'Perlu Tindak Lanjut' : hrNote ? 'Sudah Tercatat' : '-'
    };
  });
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(combinedRows), 'Rekap 5 Dimensi Holistik');

  // 3. Detail Observasi Indikator Perilaku
  const allowedStudentIds = new Set(filteredStudents.map((s) => s.id));
  const filteredAssessments = assessments.filter((a) => allowedStudentIds.has(a.studentId));
  const detailRows = filteredAssessments.map((a, index) => ({
    No: index + 1,
    'Nama Siswa': a.studentName,
    Kelas: a.classGroup,
    Divisi: a.divisionName,
    'Tahap Proyek': a.projectStage,
    'Dimensi Holistik': a.dimensionName,
    Formasi: a.formasiGrandDesain,
    'Kode Indikator': a.indicatorCode,
    'Indikator Perilaku': a.indicatorTitle,
    'Level Pertumbuhan': a.growthLevel,
    'Skor Internal (1-3)': a.internalScore || GROWTH_LEVELS[a.growthLevel]?.internalScore || 2,
    'Langkah Berikutnya': a.nextStepMessage,
    'Catatan Guru': a.feedback || '-',
    Pendamping: a.teacherName,
    Tanggal: a.date
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(detailRows), 'Detail Indikator Perilaku');

  // 4. Apresiasi & Kontribusi Khusus
  const filteredAppreciations = appreciations.filter((ap) => allowedStudentIds.has(ap.toStudentId));
  const appreciationRows = filteredAppreciations.map((ap, index) => ({
    No: index + 1,
    Jenis:
      ap.type === 'teacher_appreciation'
        ? 'Apresiasi Guru'
        : ap.type === 'peer_appreciation'
        ? 'Apresiasi Teman'
        : 'Kontribusi Khusus',
    'Untuk Siswa': ap.toStudentName,
    Kelas: ap.toClassGroup,
    Divisi: ap.divisionName || '-',
    Dari: `${ap.fromName} (${ap.fromRole})`,
    'Gelar/Penyebutan': ap.badgeTitle || '-',
    Pesan: ap.message,
    Tanggal: ap.createdAt ? new Date(ap.createdAt).toLocaleDateString('id-ID') : '-'
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(appreciationRows), 'Apresiasi & Kontribusi');

  // 5. Refleksi Relasional & Catatan Wali Kelas
  const reflectionRows = filteredStudents.map((s, index) => {
    const ref = reflections.find((r) => r.studentId === s.id);
    const hr = homeroomNotes.find((h) => h.studentId === s.id);
    return {
      No: index + 1,
      'Nama Siswa': s.name,
      Kelas: s.classGroup,
      'Yang Membantu Saya Bertumbuh': ref?.whoHelpedMeGrow || '-',
      'Yang Saya Bantu & Rasanya': ref?.whoIHelpedAndHowItFelt || '-',
      'Kapan Merasa Dihargai': ref?.whenIFeltValued || '-',
      'Yang Paling Disyukuri': ref?.whatIAmMostGratefulFor || '-',
      'Ingin Diperbaiki': ref?.whatIWantToImprove || '-',
      'Mengalami Cinta': ref?.mengalamiCintaNote || '-',
      'Menghidupi Cinta': ref?.menghidupiCintaNote || '-',
      'Meneruskan Cinta': ref?.meneruskanCintaNote || '-',
      'Catatan Sikap Wali Kelas': hr?.attitudeNote || '-',
      'Catatan Kemandirian Wali Kelas': hr?.independenceNote || '-',
      'Catatan Keterlibatan Utuh': hr?.holisticInvolvementNote || '-'
    };
  });
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(reflectionRows), 'Refleksi & Wali Kelas');

  const dateStr = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `Pendampingan_Symphony_of_Nusantara_${classFilter}_${dateStr}.xlsx`);
}

export function printAdministrativeReport() {
  window.print();
}
