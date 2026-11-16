import React, { useEffect, useMemo, useState } from 'react';
import { useStudent } from '../context/StudentContext';
import { useAuth } from '../context/AuthContext';
import {
  Student,
  DEFAULT_PROJECT_STAGES,
  FIVE_HOLISTIC_DIMENSIONS,
  GROWTH_LEVELS,
  GROWTH_LEVEL_ORDER,
  GrowthLevel,
  STAGE_RECOMMENDED_INDICATORS,
  IndicatorCode,
  getDivisionById,
  SEVEN_DPK_DIVISIONS
} from '../types';
import { computeStudentCombinedSummary } from '../utils/assessmentUtils';
import {
  Award,
  CheckCircle2,
  HeartHandshake,
  Sparkles,
  UserCheck,
  BookOpen,
  Shield,
  MessageSquarePlus,
  Trash2,
  Eye,
  AlertCircle
} from 'lucide-react';

interface AssessmentMatrixViewProps {
  initialStudent?: Student | null;
}

export const AssessmentMatrixView: React.FC<AssessmentMatrixViewProps> = ({ initialStudent }) => {
  const { activeRole, profile, realRole, previewDivisionId } = useAuth();
  const {
    students,
    assessments,
    selfAssessments,
    studentReflections,
    appreciations,
    homeroomNotes,
    appConfig,
    saveIndicatorAssessment,
    deleteAssessment,
    addAppreciation,
    deleteAppreciation,
    saveHomeroomNote
  } = useStudent();

  const [selectedStudentId, setSelectedStudentId] = useState<string>(initialStudent?.id || '');
  const [selectedStageNumber, setSelectedStageNumber] = useState<number>(3);
  const [activeDivisionId, setActiveDivisionId] = useState<string>('');
  const [teacherNoteInput, setTeacherNoteInput] = useState<string>('');
  const [savingCode, setSavingCode] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Appreciation inputs
  const [appreciationMessage, setAppreciationMessage] = useState<string>('');
  const [specialMessage, setSpecialMessage] = useState<string>('');
  const [specialBadge, setSpecialBadge] = useState<string>('Kontribusi Khusus Lintas Divisi / DPK');
  const [appreciationError, setAppreciationError] = useState<string | null>(null);
  const [savingAppreciation, setSavingAppreciation] = useState<boolean>(false);

  // Homeroom Note state (Wali Kelas / Admin)
  const [attitudeNote, setAttitudeNote] = useState<string>('');
  const [independenceNote, setIndependenceNote] = useState<string>('');
  const [holisticNote, setHolisticNote] = useState<string>('');
  const [needsFollowUp, setNeedsFollowUp] = useState<boolean>(false);
  const [savingHomeroom, setSavingHomeroom] = useState<boolean>(false);

  useEffect(() => {
    if (initialStudent) {
      setSelectedStudentId(initialStudent.id);
    } else if (!selectedStudentId && students.length > 0) {
      setSelectedStudentId(students[0].id);
    }
  }, [initialStudent, students, selectedStudentId]);

  const selectedStudent = useMemo(
    () => students.find((s) => s.id === selectedStudentId) || students[0] || null,
    [students, selectedStudentId]
  );

  // Determine active division scope for scoring
  useEffect(() => {
    if (!selectedStudent) return;
    if (activeRole === 'pendamping') {
      const myDiv =
        realRole === 'admin'
          ? previewDivisionId
          : profile?.assignedDivisionId || SEVEN_DPK_DIVISIONS[0].id;
      setActiveDivisionId(myDiv);
    } else {
      setActiveDivisionId(selectedStudent.primaryDivisionId);
    }
  }, [selectedStudent, activeRole, realRole, previewDivisionId, profile?.assignedDivisionId]);

  // Load Homeroom Note when student changes
  useEffect(() => {
    if (!selectedStudent) return;
    const existing = homeroomNotes.find((h) => h.studentId === selectedStudent.id);
    setAttitudeNote(existing?.attitudeNote || '');
    setIndependenceNote(existing?.independenceNote || '');
    setHolisticNote(existing?.holisticInvolvementNote || '');
    setNeedsFollowUp(Boolean(existing?.needsFollowUp));
  }, [selectedStudent, homeroomNotes]);

  const isWaliKelasView = activeRole === 'walikelas';
  const canScoreIndicators = activeRole === 'pendamping' || activeRole === 'admin';

  const currentStageObj =
    DEFAULT_PROJECT_STAGES.find((s) => s.stageNumber === selectedStageNumber) ||
    DEFAULT_PROJECT_STAGES[0];
  const recommendedCodes = STAGE_RECOMMENDED_INDICATORS[selectedStageNumber] || [];

  const studentAllAssessments = useMemo(
    () => (selectedStudent ? assessments.filter((a) => a.studentId === selectedStudent.id) : []),
    [assessments, selectedStudent]
  );

  const studentSelfAssessments = useMemo(
    () => (selectedStudent ? selfAssessments.filter((sa) => sa.studentId === selectedStudent.id) : []),
    [selfAssessments, selectedStudent]
  );

  const studentReflection = useMemo(
    () => (selectedStudent ? studentReflections.find((r) => r.studentId === selectedStudent.id) : undefined),
    [studentReflections, selectedStudent]
  );

  const studentAppreciations = useMemo(
    () => (selectedStudent ? appreciations.filter((ap) => ap.toStudentId === selectedStudent.id) : []),
    [appreciations, selectedStudent]
  );

  const combinedSummary = useMemo(
    () =>
      selectedStudent
        ? computeStudentCombinedSummary(selectedStudent, studentAllAssessments, appConfig)
        : null,
    [selectedStudent, studentAllAssessments, appConfig]
  );

  const notify = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleSelectGrowthLevel = async (indicatorCode: IndicatorCode, level: GrowthLevel) => {
    if (!selectedStudent || !activeDivisionId || !canScoreIndicators) return;
    setSavingCode(indicatorCode);
    try {
      await saveIndicatorAssessment({
        student: selectedStudent,
        divisionId: activeDivisionId,
        stageNumber: currentStageObj.stageNumber,
        stageTitle: currentStageObj.title,
        indicatorCode,
        growthLevel: level,
        feedback: teacherNoteInput.trim() || undefined
      });
      notify(`Indikator ${indicatorCode} tersimpan pada level "${level}".`);
    } finally {
      setSavingCode(null);
    }
  };

  const handleSubmitAppreciation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    setAppreciationError(null);

    const trimmed = appreciationMessage.trim();
    // Enforce at least 1 meaningful sentence (>= 12 chars)
    if (trimmed.length < 12) {
      setAppreciationError('Apresiasi naratif wajib ditulis minimal 1 kalimat yang hangat dan membangun.');
      return;
    }

    setSavingAppreciation(true);
    try {
      const divId = activeDivisionId || selectedStudent.primaryDivisionId;
      await addAppreciation({
        type: 'teacher_appreciation',
        toStudentId: selectedStudent.id,
        toStudentName: selectedStudent.name,
        toClassGroup: selectedStudent.classGroup,
        divisionId: divId,
        divisionName: getDivisionById(divId)?.shortName || divId,
        message: trimmed
      });
      setAppreciationMessage('');
      notify('Catatan apresiasi naratif guru berhasil dikirim ke siswa.');
    } finally {
      setSavingAppreciation(false);
    }
  };

  const handleSubmitSpecialContribution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    const trimmed = specialMessage.trim();
    if (trimmed.length < 12) {
      setAppreciationError('Catatan kontribusi khusus wajib diisi minimal 1 kalimat.');
      return;
    }

    setSavingAppreciation(true);
    try {
      const divId = activeDivisionId || selectedStudent.primaryDivisionId;
      await addAppreciation({
        type: 'special_contribution',
        toStudentId: selectedStudent.id,
        toStudentName: selectedStudent.name,
        toClassGroup: selectedStudent.classGroup,
        divisionId: divId,
        divisionName: getDivisionById(divId)?.shortName || divId,
        badgeTitle: specialBadge.trim() || 'Kontribusi Khusus',
        message: trimmed
      });
      setSpecialMessage('');
      notify('Apresiasi Kontribusi Khusus berhasil dicatat.');
    } finally {
      setSavingAppreciation(false);
    }
  };

  const handleSaveHomeroom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    setSavingHomeroom(true);
    try {
      await saveHomeroomNote({
        studentId: selectedStudent.id,
        studentName: selectedStudent.name,
        classGroup: selectedStudent.classGroup,
        attitudeNote: attitudeNote.trim(),
        independenceNote: independenceNote.trim(),
        holisticInvolvementNote: holisticNote.trim(),
        needsFollowUp
      });
      notify('Catatan pendampingan pribadi Wali Kelas berhasil disimpan.');
    } finally {
      setSavingHomeroom(false);
    }
  };

  if (students.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-10 border border-slate-200 text-center text-xs text-slate-500">
        Belum ada siswa dalam cakupan peran Anda. Tambahkan siswa melalui menu Data Siswa & Divisi.
      </div>
    );
  }

  const eligibleForSpecial =
    Boolean(selectedStudent?.isDpkCommittee) || Boolean(selectedStudent?.secondaryDivisionId);

  return (
    <div className="space-y-6">
      {toastMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Student & Stage Selector */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-[#032448] flex items-center gap-2">
              {isWaliKelasView ? (
                <>
                  <Eye className="w-5 h-5 text-indigo-600" />
                  Tinjauan Gabungan & Catatan Wali Kelas
                </>
              ) : (
                <>
                  <Award className="w-5 h-5 text-amber-600" />
                  Pendampingan 5 Dimensi Holistik & 15 Indikator Perilaku
                </>
              )}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isWaliKelasView
                ? 'Mode lihat-saja untuk skor per tahap lintas divisi. Anda dapat menulis catatan pendampingan pribadi dan apresiasi.'
                : 'Penilaian formatif menggunakan 3 level pertumbuhan berbahasa kasih (Mulai Tumbuh, Berkembang, Menjadi Teladan).'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <select
              value={selectedStudent?.id || ''}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="px-3.5 py-2 text-xs font-bold border border-slate-300 rounded-xl bg-white text-[#032448] focus:outline-none focus:ring-2 focus:ring-[#032448] min-w-[230px]"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.classGroup})
                </option>
              ))}
            </select>

            {activeRole === 'admin' && selectedStudent && (
              <select
                value={activeDivisionId}
                onChange={(e) => setActiveDivisionId(e.target.value)}
                className="px-3 py-2 text-xs font-semibold border border-slate-300 rounded-xl bg-blue-50 text-[#032448]"
              >
                <option value={selectedStudent.primaryDivisionId}>
                  Utama: {getDivisionById(selectedStudent.primaryDivisionId)?.shortName}
                </option>
                {selectedStudent.secondaryDivisionId && (
                  <option value={selectedStudent.secondaryDivisionId}>
                    Pendukung: {getDivisionById(selectedStudent.secondaryDivisionId)?.shortName}
                  </option>
                )}
              </select>
            )}
          </div>
        </div>

        {/* Selected Student Context Bar */}
        {selectedStudent && combinedSummary && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-sm text-[#032448]">{selectedStudent.name}</span>
              <span className="px-2 py-0.5 rounded bg-[#032448] text-white font-bold">
                {selectedStudent.classGroup}
              </span>
              <span className="px-2.5 py-0.5 rounded bg-blue-100 text-blue-900 font-semibold">
                Utama: {combinedSummary.primaryDivisionName}
              </span>
              {combinedSummary.secondaryDivisionName && (
                <span className="px-2.5 py-0.5 rounded bg-amber-100 text-amber-900 font-semibold">
                  Pendukung: {combinedSummary.secondaryDivisionName}
                </span>
              )}
              {selectedStudent.isDpkCommittee && (
                <span className="px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold inline-flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  {selectedStudent.dpkRoleNote || 'Panitia DPK Kelas X'}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600">
              <span>Bobot Gabungan: <strong>{combinedSummary.weightUsedLabel}</strong></span>
              {combinedSummary.overallGrowthLevel && (
                <span className={`px-2.5 py-0.5 rounded border font-bold ${GROWTH_LEVELS[combinedSummary.overallGrowthLevel].badgeClass}`}>
                  {combinedSummary.overallGrowthLevel}
                  {combinedSummary.weightedInternalScore !== null &&
                    ` (${combinedSummary.weightedInternalScore})`}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* WALI KELAS READ-ONLY COMBINED SUMMARY + PERSONAL MENTORING FORM */}
      {isWaliKelasView && selectedStudent && combinedSummary && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Read-Only 5 Dimension Weighted Summary */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div>
                <h3 className="text-base font-bold text-[#032448]">
                  Ringkasan Gabungan Lintas Divisi (Mode Lihat-Saja)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Akumulasi hasil pendampingan dari guru pendamping divisi ({combinedSummary.weightUsedLabel}).
                </p>
              </div>

              <div className="space-y-3">
                {combinedSummary.dimensionSummaries.map((dim) => (
                  <div
                    key={dim.dimensionId}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Formasi {dim.formasi} • {dim.stYosefValues}
                        </span>
                        <h4 className="font-bold text-sm text-[#032448]">{dim.dimensionName}</h4>
                      </div>
                      {dim.growthLevel ? (
                        <span
                          className={`px-2.5 py-1 rounded-lg border text-xs font-bold ${GROWTH_LEVELS[dim.growthLevel].badgeClass}`}
                        >
                          {dim.growthLevel}{' '}
                          {dim.internalAverage !== null ? `(${dim.internalAverage})` : ''}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">Belum dinilai pendamping</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600">
                      <strong>Langkah berikutnya:</strong> {dim.latestNextStep}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Detail Assessment entries read-only */}
            {studentAllAssessments.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
                <h3 className="text-sm font-bold text-[#032448]">
                  Catatan Indikator dari Pendamping Divisi
                </h3>
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {studentAllAssessments.map((a) => (
                    <div key={a.id} className="p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-[#032448]">
                          [{a.indicatorCode}] {a.indicatorTitle} • {a.divisionName}
                        </span>
                        <span className={`px-2 py-0.5 rounded border font-bold text-[10px] ${GROWTH_LEVELS[a.growthLevel].badgeClass}`}>
                          {a.growthLevel}
                        </span>
                      </div>
                      <p className="text-slate-600">{a.projectStage} • Pendamping: {a.teacherName}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Wali Kelas Personal Mentoring Note & Appreciation */}
          <div className="lg:col-span-5 space-y-5">
            <form
              onSubmit={handleSaveHomeroom}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4"
            >
              <div>
                <h3 className="text-base font-bold text-[#032448] flex items-center gap-2">
                  <HeartHandshake className="w-5 h-5 text-indigo-600" />
                  Catatan Pendampingan Wali Kelas
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Refleksi keseharian siswa berdasarkan pengamatan wali kelas (tidak mengubah nilai divisi).
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Sikap & Relasi Keseharian
                </label>
                <textarea
                  rows={2}
                  value={attitudeNote}
                  onChange={(e) => setAttitudeNote(e.target.value)}
                  placeholder="Bagaimana sikap dan kerendahan hati siswa di keseharian kelas?"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#032448]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kemandirian & Tanggung Jawab
                </label>
                <textarea
                  rows={2}
                  value={independenceNote}
                  onChange={(e) => setIndependenceNote(e.target.value)}
                  placeholder="Catatan pengelolaan diri dan tanggung jawab tugas harian..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#032448]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Keterlibatan Utuh
                </label>
                <textarea
                  rows={2}
                  value={holisticNote}
                  onChange={(e) => setHolisticNote(e.target.value)}
                  placeholder="Keterlibatan dalam komunitas kelas dan proyek kokurikuler..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#032448]"
                />
              </div>

              <label className="flex items-center gap-2 text-xs font-semibold text-rose-800 bg-rose-50 p-3 rounded-xl border border-rose-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={needsFollowUp}
                  onChange={(e) => setNeedsFollowUp(e.target.checked)}
                />
                <span>Tandai siswa ini perlu disapa secara hangat oleh Wali Kelas / Pendamping</span>
              </label>

              <button
                type="submit"
                disabled={savingHomeroom}
                className="w-full py-2.5 px-4 rounded-xl bg-[#032448] hover:bg-[#1F3A5F] text-white text-xs font-bold cursor-pointer disabled:opacity-50"
              >
                {savingHomeroom ? 'Menyimpan Catatan...' : 'Simpan Catatan Wali Kelas'}
              </button>
            </form>

            {/* Appreciation Form for Wali Kelas */}
            <form
              onSubmit={handleSubmitAppreciation}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3"
            >
              <h4 className="text-sm font-bold text-[#032448] flex items-center gap-2">
                <MessageSquarePlus className="w-4 h-4 text-amber-600" />
                Kirim Apresiasi Naratif Wali Kelas
              </h4>
              {appreciationError && (
                <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200 p-2 rounded-lg">
                  {appreciationError}
                </p>
              )}
              <textarea
                rows={3}
                value={appreciationMessage}
                onChange={(e) => setAppreciationMessage(e.target.value)}
                placeholder="Tuliskan minimal 1 kalimat apresiasi yang menguatkan hati siswa..."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#032448]"
              />
              <button
                type="submit"
                disabled={savingAppreciation}
                className="w-full py-2 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold cursor-pointer"
              >
                Kirim Apresiasi untuk Siswa
              </button>
            </form>
          </div>
        </div>
      )}

      {/* PENDAMPING / ADMIN INDICATOR ASSESSMENT MATRIX */}
      {canScoreIndicators && selectedStudent && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 8 Cols: Stage Selector + 5 Holistic Dimensions & 15 Indicators */}
          <div className="lg:col-span-8 space-y-5">
            {/* 6 Stages Picker */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Pilih Tahap Proyek yang Sedang Didampingi
                </h3>
                <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200">
                  Fokus Indikator Tahap {selectedStageNumber}: {recommendedCodes.join(', ')}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                {DEFAULT_PROJECT_STAGES.map((st) => (
                  <button
                    key={st.stageNumber}
                    type="button"
                    onClick={() => setSelectedStageNumber(st.stageNumber)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedStageNumber === st.stageNumber
                        ? 'bg-[#032448] text-white border-[#032448]'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-[10px] font-bold opacity-80">Tahap {st.stageNumber}</div>
                    <div className="text-xs font-bold truncate">
                      {st.title.replace(`Tahap ${st.stageNumber}: `, '')}
                    </div>
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Catatan Tambahan Observasi (opsional, melekat pada indikator yang diklik):
                </label>
                <input
                  type="text"
                  value={teacherNoteInput}
                  onChange={(e) => setTeacherNoteInput(e.target.value)}
                  placeholder="Contoh: Terlihat aktif merapikan alat gamelan seusai sesi latihan..."
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#032448]"
                />
              </div>
            </div>

            {/* 5 Holistic Dimensions Cards */}
            {FIVE_HOLISTIC_DIMENSIONS.map((dim) => (
              <div
                key={dim.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-900 border border-blue-200">
                        Formasi {dim.formasi}
                      </span>
                      <span className="text-[11px] font-semibold text-amber-800">
                        Nilai St. Yosef: {dim.stYosefValues}
                      </span>
                    </div>
                    <h3 className="text-base font-extrabold text-[#032448] mt-1">{dim.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{dim.rumusan}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {dim.indicators.map((ind) => {
                    const isFocused = recommendedCodes.includes(ind.code);
                    const currentAssessment = studentAllAssessments.find(
                      (a) =>
                        a.divisionId === activeDivisionId &&
                        a.stageNumber === selectedStageNumber &&
                        a.indicatorCode === ind.code
                    );
                    const selfAssess = studentSelfAssessments.find(
                      (sa) => sa.indicatorCode === ind.code
                    );

                    return (
                      <div
                        key={ind.code}
                        className={`p-4 rounded-xl border transition-all space-y-3 ${
                          isFocused
                            ? 'border-amber-300 bg-amber-50/30'
                            : 'border-slate-200 bg-slate-50/40'
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded font-mono text-xs font-bold bg-[#032448] text-white">
                              {ind.code}
                            </span>
                            <span className="font-bold text-sm text-slate-900">{ind.title}</span>
                            {isFocused && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                Fokus Tahap {selectedStageNumber}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {selfAssess && (
                              <span className="text-[11px] px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 border border-indigo-200 font-semibold">
                                Penilaian Diri: {selfAssess.growthLevel}
                              </span>
                            )}
                            {currentAssessment && (
                              <button
                                type="button"
                                onClick={() => deleteAssessment(currentAssessment.id)}
                                className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                                title="Hapus penilaian indikator ini"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* 3 Growth Level Selector Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                          {GROWTH_LEVEL_ORDER.map((lvl) => {
                            const selected = currentAssessment?.growthLevel === lvl;
                            const cfg = GROWTH_LEVELS[lvl];
                            const detail = ind.levels[lvl];
                            return (
                              <button
                                key={lvl}
                                type="button"
                                disabled={savingCode === ind.code}
                                onClick={() => handleSelectGrowthLevel(ind.code, lvl)}
                                className={`text-left p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                                  selected
                                    ? `${cfg.bgClass} ${cfg.borderClass} ring-2 ring-[#032448]/30 shadow-xs`
                                    : 'bg-white border-slate-200 hover:border-slate-400'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span
                                    className={`text-xs font-bold ${
                                      selected ? cfg.textClass : 'text-slate-800'
                                    }`}
                                  >
                                    {lvl}
                                  </span>
                                  {selected && (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                                  )}
                                </div>
                                <p className="text-[11px] text-slate-600 leading-snug">
                                  {detail.descriptor}
                                </p>
                              </button>
                            );
                          })}
                        </div>

                        {/* Growth-Language Next Step Preview */}
                        {currentAssessment && (
                          <div className="p-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-700">
                            <span className="font-bold text-emerald-800">Langkah berikutnya untuk siswa: </span>
                            {currentAssessment.nextStepMessage}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Right 4 Cols: Mandatory Narrative Appreciation, Special Contribution, Student Voice */}
          <div className="lg:col-span-4 space-y-5">
            {/* Teacher Narrative Appreciation (Mandatory >= 1 sentence) */}
            <form
              onSubmit={handleSubmitAppreciation}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3"
            >
              <div className="flex items-center gap-2 text-[#032448]">
                <HeartHandshake className="w-5 h-5 text-amber-600" />
                <h3 className="text-sm font-bold">Catatan Apresiasi Naratif Guru *</h3>
              </div>
              <p className="text-[11px] text-slate-500">
                Wajib diisi minimal 1 kalimat hangat yang melihat usaha, ketulusan, atau pertumbuhan konkret siswa.
              </p>

              {appreciationError && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{appreciationError}</span>
                </div>
              )}

              <textarea
                rows={3}
                value={appreciationMessage}
                onChange={(e) => setAppreciationMessage(e.target.value)}
                placeholder="Contoh: Terima kasih sudah setia merapikan perlengkapan setelah latihan tanpa diminta; ketulusanmu menguatkan divisi."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#032448]"
              />
              <button
                type="submit"
                disabled={savingAppreciation}
                className="w-full py-2.5 px-4 rounded-xl bg-[#032448] hover:bg-[#1F3A5F] text-white text-xs font-bold cursor-pointer disabled:opacity-50"
              >
                {savingAppreciation ? 'Mengirim...' : 'Simpan Apresiasi Naratif'}
              </button>
            </form>

            {/* Special Contribution (Only for DPK or Dual Division students) */}
            <form
              onSubmit={handleSubmitSpecialContribution}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#032448] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  Catatan Kontribusi Khusus
                </h3>
              </div>
              <p className="text-[11px] text-slate-500">
                Khusus bagi anggota Panitia DPK Kelas X atau siswa rangkap dua divisi yang menunjukkan komitmen nyata.
              </p>

              {!eligibleForSpecial ? (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500">
                  Siswa ini terdaftar di 1 divisi reguler (bukan DPK / rangkap divisi).
                </div>
              ) : (
                <>
                  <input
                    type="text"
                    value={specialBadge}
                    onChange={(e) => setSpecialBadge(e.target.value)}
                    placeholder="Penyebutan Sertifikat Khusus"
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                  />
                  <textarea
                    rows={2}
                    value={specialMessage}
                    onChange={(e) => setSpecialMessage(e.target.value)}
                    placeholder="Tuliskan bentuk pelayanan nyata lintas peran/DPK yang layak diapresiasi..."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#032448]"
                  />
                  <button
                    type="submit"
                    disabled={savingAppreciation}
                    className="w-full py-2 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold cursor-pointer disabled:opacity-50"
                  >
                    Catat Kontribusi Khusus
                  </button>
                </>
              )}
            </form>

            {/* Existing Appreciations History */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-[#032448] flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                Riwayat Apresiasi Siswa ({studentAppreciations.length})
              </h3>
              {studentAppreciations.length === 0 ? (
                <p className="text-xs text-slate-400">Belum ada catatan apresiasi.</p>
              ) : (
                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {studentAppreciations.map((ap) => (
                    <div
                      key={ap.id}
                      className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#032448]">
                          {ap.type === 'teacher_appreciation'
                            ? 'Apresiasi Guru'
                            : ap.type === 'special_contribution'
                            ? ap.badgeTitle || 'Kontribusi Khusus'
                            : 'Apresiasi Teman'}
                        </span>
                        <button
                          type="button"
                          onClick={() => deleteAppreciation(ap.id)}
                          className="text-slate-400 hover:text-rose-600 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-slate-700 leading-relaxed">{ap.message}</p>
                      <p className="text-[10px] text-slate-400">Dari: {ap.fromName}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Student Reflection Preview */}
            {studentReflection && studentReflection.isSubmitted && (
              <div className="bg-white rounded-2xl p-5 border border-emerald-200 shadow-xs space-y-2 text-xs">
                <h3 className="text-sm font-bold text-emerald-900 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                  Refleksi Relasional Siswa
                </h3>
                <p className="text-slate-700">
                  <strong>Yang membantu bertumbuh:</strong> {studentReflection.whoHelpedMeGrow}
                </p>
                <p className="text-slate-700">
                  <strong>Yang disyukuri:</strong> {studentReflection.whatIAmMostGratefulFor}
                </p>
                {studentReflection.mengalamiCintaNote && (
                  <p className="text-slate-700">
                    <strong>Mengalami cinta:</strong> {studentReflection.mengalamiCintaNote}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
