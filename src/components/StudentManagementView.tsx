import React, { useState } from 'react';
import { useStudent } from '../context/StudentContext';
import { useAuth } from '../context/AuthContext';
import {
  Student,
  ALL_CLASSES,
  CLASS_HOMEROOM_TEACHERS,
  SEVEN_DPK_DIVISIONS,
  getDivisionById
} from '../types';
import { StudentModal } from './StudentModal';
import { exportHolisticDataToExcel, printAdministrativeReport } from '../utils/exportUtils';
import {
  UserPlus,
  Search,
  FileSpreadsheet,
  Printer,
  Edit2,
  Trash2,
  Award,
  Clock,
  AlertTriangle,
  Database,
  Shield,
  Users,
  CheckCircle2
} from 'lucide-react';

interface StudentManagementViewProps {
  onSelectStudentForAssessment?: (student: Student) => void;
  onSelectStudentForTimeline?: (student: Student) => void;
}

export const StudentManagementView: React.FC<StudentManagementViewProps> = ({
  onSelectStudentForAssessment,
  onSelectStudentForTimeline
}) => {
  const { activeRole, profile, realRole, previewDivisionId } = useAuth();
  const {
    students,
    assessments,
    appreciations,
    studentReflections,
    homeroomNotes,
    appConfig,
    selectedClassFilter,
    setSelectedClassFilter,
    selectedDivisionFilter,
    setSelectedDivisionFilter,
    addStudent,
    updateStudent,
    deleteStudent,
    importOfficialRoster2026,
    isImportingRoster
  } = useStudent();

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);
  const [importFeedback, setImportFeedback] = useState<string | null>(null);

  const isReadOnlyList = activeRole === 'walikelas';
  const canDelete = activeRole === 'admin';

  const defaultDivId =
    activeRole === 'pendamping'
      ? realRole === 'admin'
        ? previewDivisionId
        : profile?.assignedDivisionId || SEVEN_DPK_DIVISIONS[0].id
      : SEVEN_DPK_DIVISIONS[0].id;

  const filteredStudents = students.filter((student) => {
    const matchesClass =
      selectedClassFilter === 'ALL' || student.classGroup === selectedClassFilter;
    const matchesDivision =
      selectedDivisionFilter === 'ALL' ||
      student.primaryDivisionId === selectedDivisionFilter ||
      student.secondaryDivisionId === selectedDivisionFilter;
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.nisn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesClass && matchesDivision && matchesSearch;
  });

  const handleSaveStudent = async (data: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingStudent) {
      await updateStudent(editingStudent.id, data);
    } else {
      await addStudent(data);
    }
  };

  const handleConfirmDelete = async () => {
    if (deletingStudent) {
      await deleteStudent(deletingStudent.id);
      setDeletingStudent(null);
    }
  };

  const handleExportExcel = () => {
    exportHolisticDataToExcel({
      requesterRole: activeRole,
      students: filteredStudents,
      assessments,
      appreciations,
      reflections: studentReflections,
      homeroomNotes,
      appConfig,
      classFilter: selectedClassFilter
    });
  };

  const handleImportRoster = async () => {
    try {
      const target = selectedClassFilter === 'ALL' ? undefined : selectedClassFilter;
      const res = await importOfficialRoster2026(target);
      setImportFeedback(
        res.added > 0
          ? `Berhasil mengimpor ${res.added} siswa resmi${target ? ` kelas ${target}` : ' (X-1 s/d X-6)'} ke database (${res.skipped} sudah ada).`
          : `Seluruh daftar siswa resmi${target ? ` kelas ${target}` : ' (205 siswa X-1 s/d X-6)'} sudah tersinkronisasi.`
      );
      setTimeout(() => setImportFeedback(null), 5000);
    } catch (err: unknown) {
      setImportFeedback(err instanceof Error ? err.message : 'Gagal mengimpor data siswa.');
    }
  };

  const activeClassHomeroom =
    activeRole === 'walikelas' && profile?.assignedClassGroup
      ? { classGroup: profile.assignedClassGroup, name: CLASS_HOMEROOM_TEACHERS[profile.assignedClassGroup] }
      : selectedClassFilter !== 'ALL'
      ? { classGroup: selectedClassFilter, name: CLASS_HOMEROOM_TEACHERS[selectedClassFilter] }
      : null;

  return (
    <div className="space-y-6">
      {importFeedback && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{importFeedback}</span>
        </div>
      )}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#032448] flex items-center gap-2">
              <Database className="w-5 h-5 text-amber-600" />
              Daftar Siswa & Penempatan Divisi
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {activeRole === 'pendamping'
                ? `Menampilkan siswa di divisi ${getDivisionById(defaultDivId)?.shortName || 'Anda'} (Utama maupun Pendukung).`
                : activeRole === 'walikelas'
                ? 'Menampilkan seluruh siswa di kelas perwalian Anda lintas semua divisi (mode tinjau).'
                : 'Kelola seluruh siswa kelas X-1 s/d X-6, penempatan 1–2 divisi, dan penanda Panitia DPK.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleExportExcel}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer whitespace-nowrap"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Ekspor Excel (.xlsx)</span>
            </button>

            <button
              type="button"
              onClick={printAdministrativeReport}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-blue-900 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Printer className="w-4 h-4 text-blue-700" />
              <span>Cetak Rapor / Apresiasi</span>
            </button>

            {realRole === 'admin' && activeRole === 'admin' && (
              <button
                type="button"
                disabled={isImportingRoster}
                onClick={handleImportRoster}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-amber-900 bg-amber-50 border border-amber-300 hover:bg-amber-100 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50"
              >
                <Users className="w-4 h-4 text-amber-700" />
                <span>
                  {isImportingRoster
                    ? 'Menyinkronkan...'
                    : selectedClassFilter === 'ALL'
                    ? 'Sinkronkan 205 Siswa Resmi'
                    : `Sinkronkan Siswa ${selectedClassFilter}`}
                </span>
              </button>
            )}

            {!isReadOnlyList && (
              <button
                type="button"
                onClick={() => {
                  setEditingStudent(null);
                  setIsModalOpen(true);
                }}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#032448] hover:bg-[#1F3A5F] transition-colors cursor-pointer whitespace-nowrap"
              >
                <UserPlus className="w-4 h-4 text-amber-300" />
                <span>Tambah Siswa</span>
              </button>
            )}
          </div>
        </div>

        {activeClassHomeroom && (
          <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-center justify-between flex-wrap gap-2">
            <span>
              Wali Kelas <strong className="text-[#032448]">{activeClassHomeroom.classGroup}</strong>:{' '}
              <strong className="text-slate-900">{activeClassHomeroom.name}</strong>
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              Total siswa kelas {activeClassHomeroom.classGroup}: {students.filter((s) => s.classGroup === activeClassHomeroom.classGroup).length}
            </span>
          </div>
        )}

        {/* Filters */}
        <div className="pt-4 border-t border-slate-100 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {activeRole !== 'walikelas' && (
              <select
                value={selectedClassFilter}
                onChange={(e) => setSelectedClassFilter(e.target.value as typeof selectedClassFilter)}
                className="px-3 py-1.5 text-xs font-semibold border border-slate-300 rounded-lg bg-white text-slate-800"
              >
                <option value="ALL">Semua Kelas ({students.length})</option>
                {ALL_CLASSES.map((cls) => (
                  <option key={cls} value={cls}>
                    Kelas {cls} ({students.filter((s) => s.classGroup === cls).length})
                  </option>
                ))}
              </select>
            )}

            {activeRole !== 'pendamping' && (
              <select
                value={selectedDivisionFilter}
                onChange={(e) => setSelectedDivisionFilter(e.target.value)}
                className="px-3 py-1.5 text-xs font-semibold border border-slate-300 rounded-lg bg-white text-slate-800"
              >
                <option value="ALL">Semua 7 Divisi</option>
                {SEVEN_DPK_DIVISIONS.map((div) => (
                  <option key={div.id} value={div.id}>
                    {div.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama, NISN, atau email..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#032448] bg-white"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold tracking-wider">
                <th className="py-3 px-4 w-10 text-center">No</th>
                <th className="py-3 px-4">Nama & Kelas</th>
                <th className="py-3 px-4">Divisi Utama</th>
                <th className="py-3 px-4">Divisi Pendukung</th>
                <th className="py-3 px-4">Peran DPK & Status</th>
                <th className="py-3 px-4 text-center">Observasi</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student, idx) => {
                  const stdAssessments = assessments.filter((a) => a.studentId === student.id);
                  const primaryName = getDivisionById(student.primaryDivisionId)?.shortName || student.primaryDivisionId;
                  const secondaryName = student.secondaryDivisionId
                    ? getDivisionById(student.secondaryDivisionId)?.shortName || student.secondaryDivisionId
                    : null;

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 text-center text-slate-400 font-mono">{idx + 1}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{student.name}</span>
                          <span className="px-1.5 py-0.5 rounded bg-[#032448] text-white font-bold text-[10px]">
                            {student.classGroup}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          NISN {student.nisn}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-2.5 py-1 rounded-md bg-blue-50 text-blue-900 border border-blue-200 font-semibold text-[11px]">
                          {primaryName}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {secondaryName ? (
                          <span className="inline-block px-2.5 py-1 rounded-md bg-amber-50 text-amber-900 border border-amber-200 font-semibold text-[11px]">
                            {secondaryName}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              student.status === 'Perlu Sapaan'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}
                          >
                            {student.status}
                          </span>
                          {student.isDpkCommittee && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 inline-flex items-center gap-1">
                              <Shield className="w-2.5 h-2.5" />
                              Panitia DPK Kelas X
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px] font-mono">
                          <Award className="w-3 h-3 text-amber-600" />
                          {stdAssessments.length}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          {onSelectStudentForAssessment && (
                            <button
                              type="button"
                              onClick={() => onSelectStudentForAssessment(student)}
                              className="p-1.5 text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-md transition-colors cursor-pointer"
                              title="Buka Pendampingan & Asesmen"
                            >
                              <Award className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {onSelectStudentForTimeline && (
                            <button
                              type="button"
                              onClick={() => onSelectStudentForTimeline(student)}
                              className="p-1.5 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors cursor-pointer"
                              title="Lihat Progres 6 Tahap"
                            >
                              <Clock className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {!isReadOnlyList && (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingStudent(student);
                                setIsModalOpen(true);
                              }}
                              className="p-1.5 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
                              title="Edit Data & Divisi Siswa"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              type="button"
                              onClick={() => setDeletingStudent(student)}
                              className="p-1.5 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-md transition-colors cursor-pointer"
                              title="Hapus Data Siswa"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <p className="font-semibold text-sm text-slate-700 mb-1">
                      Belum ada data siswa pada filter saat ini
                    </p>
                    <p className="text-xs text-slate-500 mb-4">
                      Admin dan Guru Pendamping dapat menambahkan siswa secara manual atau menginisialisasi data awal.
                    </p>
                    {!isReadOnlyList && (
                      <div className="flex items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingStudent(null);
                            setIsModalOpen(true);
                          }}
                          className="px-4 py-2 bg-[#032448] text-white text-xs font-bold rounded-lg hover:bg-[#1F3A5F] cursor-pointer"
                        >
                          Tambah Siswa Manual
                        </button>
                        {realRole === 'admin' && activeRole === 'admin' && (
                          <button
                            type="button"
                            disabled={isImportingRoster}
                            onClick={handleImportRoster}
                            className="px-4 py-2 bg-amber-50 text-amber-900 border border-amber-300 text-xs font-bold rounded-lg hover:bg-amber-100 cursor-pointer disabled:opacity-50"
                          >
                            {isImportingRoster
                              ? 'Mengimpor Roster Resmi...'
                              : 'Impor 205 Siswa Resmi (X-1..X-6)'}
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <StudentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveStudent}
        initialData={editingStudent}
        defaultClass={selectedClassFilter === 'ALL' ? 'X-1' : selectedClassFilter}
        defaultDivisionId={defaultDivId}
      />

      {deletingStudent && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Hapus Data Siswa?</h3>
            <p className="text-xs text-slate-600 mb-6 leading-relaxed">
              Anda akan menghapus <strong className="text-slate-900">{deletingStudent.name}</strong> ({deletingStudent.classGroup}) dari database.
            </p>
            <div className="flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setDeletingStudent(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg"
              >
                Ya, Hapus Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
