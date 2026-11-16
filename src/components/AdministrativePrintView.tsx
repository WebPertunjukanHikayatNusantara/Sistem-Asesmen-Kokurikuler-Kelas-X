import React, { useMemo, useState } from 'react';
import { useStudent } from '../context/StudentContext';
import { SCHOOL_MOTTO, GROWTH_LEVELS, getDivisionById } from '../types';
import { computeStudentCombinedSummary } from '../utils/assessmentUtils';
import { printAdministrativeReport } from '../utils/exportUtils';
import { Printer, ArrowLeft, Award, FileText } from 'lucide-react';

interface AdministrativePrintViewProps {
  onBack: () => void;
}

export const AdministrativePrintView: React.FC<AdministrativePrintViewProps> = ({ onBack }) => {
  const {
    students,
    assessments,
    appreciations,
    homeroomNotes,
    studentReflections,
    appConfig,
    selectedClassFilter
  } = useStudent();

  const filteredStudents = useMemo(
    () =>
      selectedClassFilter === 'ALL'
        ? students
        : students.filter((s) => s.classGroup === selectedClassFilter),
    [students, selectedClassFilter]
  );

  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [docMode, setDocMode] = useState<'rapor' | 'sertifikat'>('rapor');

  const activeStudent =
    filteredStudents.find((s) => s.id === selectedStudentId) || filteredStudents[0] || null;

  const activeAssessments = activeStudent
    ? assessments.filter((a) => a.studentId === activeStudent.id)
    : [];
  const activeSummary = activeStudent
    ? computeStudentCombinedSummary(activeStudent, activeAssessments, appConfig)
    : null;
  const activeAppreciations = activeStudent
    ? appreciations.filter((ap) => ap.toStudentId === activeStudent.id)
    : [];
  const activeHomeroom = activeStudent
    ? homeroomNotes.find((h) => h.studentId === activeStudent.id)
    : undefined;
  const activeReflection = activeStudent
    ? studentReflections.find((r) => r.studentId === activeStudent.id)
    : undefined;

  const currentDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 no-print">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center space-x-2 px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={activeStudent?.id || ''}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl bg-white text-[#032448]"
          >
            {filteredStudents.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.classGroup})
              </option>
            ))}
          </select>

          <div className="flex rounded-xl border border-slate-200 overflow-hidden text-xs font-bold">
            <button
              type="button"
              onClick={() => setDocMode('rapor')}
              className={`px-3.5 py-2 flex items-center gap-1.5 cursor-pointer ${
                docMode === 'rapor' ? 'bg-[#032448] text-white' : 'bg-white text-slate-600'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Rapor Holistik Naratif</span>
            </button>
            <button
              type="button"
              onClick={() => setDocMode('sertifikat')}
              className={`px-3.5 py-2 flex items-center gap-1.5 cursor-pointer ${
                docMode === 'sertifikat' ? 'bg-[#032448] text-white' : 'bg-white text-slate-600'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Sertifikat Apresiasi</span>
            </button>
          </div>

          <button
            type="button"
            onClick={printAdministrativeReport}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-[#032448] hover:bg-[#1F3A5F] text-white text-xs font-bold rounded-xl cursor-pointer"
          >
            <Printer className="w-4 h-4 text-amber-300" />
            <span>Cetak / PDF</span>
          </button>
        </div>
      </div>

      {!activeStudent || !activeSummary ? (
        <div className="bg-white rounded-2xl p-10 border border-slate-200 text-center text-xs text-slate-500">
          Belum ada data siswa yang dapat dicetak.
        </div>
      ) : docMode === 'rapor' ? (
        /* RAPOR HOLISTIK NARATIF */
        <div className="bg-white rounded-2xl p-8 sm:p-12 border border-slate-200 shadow-xs print:p-0 print:border-none print:shadow-none text-black space-y-6">
          {/* Kop */}
          <div className="text-center pb-5 border-b-2 border-black relative px-16 sm:px-24">
            <img
              src="/assets/aistudio/new2-LOGO-YOSEF_c283a7fd.jpg"
              alt="Logo SMA Pangudi Luhur St. Yosef Surakarta"
              className="absolute left-0 top-1 w-16 sm:w-20 h-20 object-contain"
            />
            <p className="text-xs font-bold tracking-widest uppercase">
              {SCHOOL_MOTTO.foundation} • {SCHOOL_MOTTO.schoolName}
            </p>
            <h1 className="text-lg font-extrabold uppercase mt-1">
              RAPOR PENDAMPINGAN HOLISTIK — SYMPHONY OF NUSANTARA
            </h1>
            <p className="text-xs italic font-semibold mt-1">“{SCHOOL_MOTTO.full}”</p>
            <p className="text-[11px] text-slate-700 mt-0.5">{SCHOOL_MOTTO.basis}</p>
          </div>

          {/* Identitas Siswa & Divisi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs border border-black p-4">
            <div className="space-y-1">
              <p><strong>Nama Siswa:</strong> {activeStudent.name}</p>
              <p><strong>NISN / Kelas:</strong> {activeStudent.nisn} / {activeStudent.classGroup}</p>
              <p><strong>Peran Kepanitiaan DPK:</strong> {activeStudent.isDpkCommittee ? activeStudent.dpkRoleNote || 'Panitia DPK Kelas X' : 'Peserta Proyek Kelas X'}</p>
            </div>
            <div className="space-y-1">
              <p><strong>Divisi Utama:</strong> {getDivisionById(activeStudent.primaryDivisionId)?.name}</p>
              <p><strong>Divisi Pendukung:</strong> {activeStudent.secondaryDivisionId ? getDivisionById(activeStudent.secondaryDivisionId)?.name : '-'}</p>
              <p><strong>Tanggal Terbit:</strong> {currentDate}</p>
            </div>
          </div>

          {/* Tabel 5 Dimensi Holistik (Bahasa Pertumbuhan, Tanpa Angka Peringkat) */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider mb-2">
              I. Peta Pertumbuhan 5 Dimensi Holistik & 4 Formasi
            </h2>
            <table className="w-full text-left text-xs border border-black border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-black font-bold">
                  <th className="p-2 border-r border-black">Dimensi Holistik</th>
                  <th className="p-2 border-r border-black">Formasi & Nilai St. Yosef</th>
                  <th className="p-2 border-r border-black text-center">Level Pertumbuhan</th>
                  <th className="p-2">Langkah Berikutnya (Bahasa Pertumbuhan)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black">
                {activeSummary.dimensionSummaries.map((dim) => (
                  <tr key={dim.dimensionId} className="border-b border-black">
                    <td className="p-2 border-r border-black font-bold">{dim.dimensionName}</td>
                    <td className="p-2 border-r border-black text-[11px]">
                      <strong>Formasi {dim.formasi}</strong>
                      <br />
                      <span>{dim.stYosefValues}</span>
                    </td>
                    <td className="p-2 border-r border-black text-center font-bold">
                      {dim.growthLevel || 'Sedang Berproses'}
                    </td>
                    <td className="p-2 text-[11px] leading-relaxed">{dim.latestNextStep}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Catatan Wali Kelas & Apresiasi */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="border border-black p-4 space-y-1.5">
              <h3 className="font-bold uppercase tracking-wider text-[11px]">
                II. Catatan Pendampingan Wali Kelas
              </h3>
              {activeHomeroom ? (
                <>
                  <p><strong>Sikap:</strong> {activeHomeroom.attitudeNote || '-'}</p>
                  <p><strong>Kemandirian:</strong> {activeHomeroom.independenceNote || '-'}</p>
                  <p><strong>Keterlibatan Utuh:</strong> {activeHomeroom.holisticInvolvementNote || '-'}</p>
                </>
              ) : (
                <p className="italic text-slate-600">Siswa mengikuti proses dengan baik di kelasnya.</p>
              )}
            </div>

            <div className="border border-black p-4 space-y-1.5">
              <h3 className="font-bold uppercase tracking-wider text-[11px]">
                III. Apresiasi Naratif & Kontribusi Khusus
              </h3>
              {activeAppreciations.length > 0 ? (
                activeAppreciations.slice(0, 4).map((ap) => (
                  <p key={ap.id} className="text-[11px] leading-snug">
                    <strong>[{ap.fromName}]</strong> “{ap.message}”
                  </p>
                ))
              ) : (
                <p className="italic text-slate-600">Apresiasi diberikan atas kesetiaan berproses.</p>
              )}
            </div>
          </div>

          {activeReflection && activeReflection.isSubmitted && (
            <div className="border border-black p-4 text-xs space-y-1">
              <h3 className="font-bold uppercase tracking-wider text-[11px]">
                IV. Suara Refleksi Siswa (Tahap 6)
              </h3>
              <p><strong>Hal yang paling disyukuri:</strong> {activeReflection.whatIAmMostGratefulFor}</p>
              <p><strong>Langkah perbaikan diri:</strong> {activeReflection.whatIWantToImprove}</p>
            </div>
          )}

          {/* Pengesahan */}
          <div className="pt-8 grid grid-cols-2 gap-8 text-xs text-center">
            <div>
              <p className="mb-16">
                Mengetahui,<br />
                <strong>Koordinator Kokurikuler</strong>
              </p>
              <p className="font-bold underline uppercase">Prasetyo Adhi Tama, M.Sn.</p>
            </div>
            <div>
              <p className="mb-16">
                Surakarta, {currentDate}<br />
                <strong>Kepala Satuan Pendidikan</strong>
              </p>
              <p className="font-bold underline uppercase">Br. Yohanes Sudarman, FIC., M.Pd.</p>
            </div>
          </div>
        </div>
      ) : (
        /* SERTIFIKAT / PENYEBUTAN APRESIASI */
        <div className="bg-white rounded-2xl p-10 sm:p-14 border-4 border-double border-[#032448] shadow-xs print:shadow-none text-center text-black space-y-6">
          <div className="flex justify-center">
            <img
              src="/assets/aistudio/new2-LOGO-YOSEF_c283a7fd.jpg"
              alt="Logo SMA Pangudi Luhur St. Yosef Surakarta"
              className="w-20 h-20 object-contain"
            />
          </div>

          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-widest text-amber-800">
              {SCHOOL_MOTTO.schoolName}
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-wide text-[#032448]">
              SERTIFIKAT APRESIASI & KONTRIBUSI
            </h1>
            <p className="text-xs italic text-slate-600">“{SCHOOL_MOTTO.full}”</p>
          </div>

          <p className="text-sm text-slate-700">Diberikan dengan penuh syukur kepada:</p>

          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#032448] underline decoration-amber-500 underline-offset-8">
              {activeStudent.name}
            </h2>
            <p className="text-xs font-bold text-slate-600 pt-2">
              Kelas {activeStudent.classGroup} • {getDivisionById(activeStudent.primaryDivisionId)?.name}
              {activeStudent.secondaryDivisionId
                ? ` & ${getDivisionById(activeStudent.secondaryDivisionId)?.name}`
                : ''}
            </p>
          </div>

          <p className="text-xs sm:text-sm text-slate-700 max-w-2xl mx-auto leading-relaxed">
            Atas ketulusan, kesetiaan pelayanan, dan semangat kolaborasi dalam mempersiapkan serta menyukseskan Gelar Karya Kokurikuler Kelas X{' '}
            <strong>“Symphony of Nusantara: Merajut Keberagaman Nusantara melalui Pertunjukan Seni”</strong> (20 November 2026).
          </p>

          {activeStudent.isDpkCommittee && (
            <div className="inline-block px-4 py-1.5 rounded-lg border border-amber-500 bg-amber-50 text-xs font-bold text-amber-900">
              Penyebutan Khusus: {activeStudent.dpkRoleNote || 'Panitia Dewan Pagelaran Kokurikuler (DPK) Kelas X'}
            </div>
          )}

          {activeAppreciations.find((a) => a.type === 'special_contribution' || a.type === 'teacher_appreciation') && (
            <div className="max-w-xl mx-auto p-4 rounded-xl bg-slate-50 border border-slate-300 text-xs italic text-slate-800">
              “
              {
                activeAppreciations.find(
                  (a) => a.type === 'special_contribution' || a.type === 'teacher_appreciation'
                )?.message
              }
              ”
            </div>
          )}

          <div className="pt-8 grid grid-cols-2 gap-8 text-xs text-center max-w-2xl mx-auto">
            <div>
              <p className="mb-14">
                Koordinator Kokurikuler
              </p>
              <p className="font-bold underline uppercase">Prasetyo Adhi Tama, M.Sn.</p>
            </div>
            <div>
              <p className="mb-14">
                Kepala SMA PL St. Yosef Surakarta
              </p>
              <p className="font-bold underline uppercase">Br. Yohanes Sudarman, FIC., M.Pd.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
