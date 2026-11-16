import React, { useMemo, useState } from 'react';
import { useStudent } from '../context/StudentContext';
import { useAuth } from '../context/AuthContext';
import {
  FIVE_HOLISTIC_DIMENSIONS,
  GROWTH_LEVELS,
  GrowthLevel,
  Student,
  getDivisionById
} from '../types';
import { buildMentoringOverview } from '../utils/assessmentUtils';
import {
  Users,
  HeartHandshake,
  MessageSquareHeart,
  AlertCircle,
  BookOpen,
  Sparkles,
  CheckCircle2,
  ClipboardCheck
} from 'lucide-react';

interface ClassStatisticsSummaryProps {
  onSelectStudentForAssessment?: (student: Student) => void;
  onSelectStudentForTimeline?: (student: Student) => void;
}

type AlertFilter = 'ALL' | 'REFLECTION' | 'SELF' | 'STALLED' | 'GREETING';

export const ClassStatisticsSummary: React.FC<ClassStatisticsSummaryProps> = ({
  onSelectStudentForAssessment,
  onSelectStudentForTimeline
}) => {
  const { activeRole } = useAuth();
  const {
    students,
    assessments,
    selfAssessments,
    studentReflections,
    progressLogs,
    appreciations,
    homeroomNotes
  } = useStudent();

  const [alertFilter, setAlertFilter] = useState<AlertFilter>('ALL');

  const overview = useMemo(
    () =>
      buildMentoringOverview(
        students,
        assessments,
        selfAssessments,
        studentReflections,
        progressLogs,
        appreciations,
        homeroomNotes
      ),
    [students, assessments, selfAssessments, studentReflections, progressLogs, appreciations, homeroomNotes]
  );

  const dualDivisionCount = students.filter((s) => Boolean(s.secondaryDivisionId)).length;
  const dpkCount = students.filter((s) => Boolean(s.isDpkCommittee)).length;

  const filteredAlerts = useMemo(() => {
    return overview.alerts.filter((item) => {
      if (alertFilter === 'REFLECTION') return item.missingReflection;
      if (alertFilter === 'SELF') return item.missingSelfAssessment;
      if (alertFilter === 'STALLED') return item.stalledStageNames.length > 0;
      if (alertFilter === 'GREETING') return item.needsWarmGreeting;
      return (
        item.missingReflection ||
        item.missingSelfAssessment ||
        item.stalledStageNames.length > 0 ||
        item.needsWarmGreeting
      );
    });
  }, [overview.alerts, alertFilter]);

  const growthDistribution = useMemo(() => {
    const counts: Record<GrowthLevel, number> = {
      'Mulai Tumbuh': 0,
      'Berkembang': 0,
      'Menjadi Teladan': 0
    };
    assessments.forEach((a) => {
      if (counts[a.growthLevel] !== undefined) {
        counts[a.growthLevel] += 1;
      }
    });
    return counts;
  }, [assessments]);

  return (
    <div className="space-y-6">
      {/* Top Level Mentoring Metrics (No Rankings / No Leaderboards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Siswa Didampingi</p>
            <h3 className="text-3xl font-extrabold text-[#032448] font-mono tabular-nums mt-1">
              {students.length}
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">
              {dualDivisionCount} rangkap divisi • {dpkCount} DPK
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#032448] flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Belum Refleksi Tahap 6</p>
            <h3 className="text-3xl font-extrabold text-amber-700 font-mono tabular-nums mt-1">
              {overview.missingReflectionCount}
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">
              {overview.completedReflectionCount} sudah mengisi refleksi
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Belum Penilaian Diri</p>
            <h3 className="text-3xl font-extrabold text-indigo-700 font-mono tabular-nums mt-1">
              {overview.missingSelfAssessmentCount}
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">
              Menunggu pengisian suara diri siswa
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
            <ClipboardCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Perlu Sapaan Hangat</p>
            <h3 className="text-3xl font-extrabold text-rose-700 font-mono tabular-nums mt-1">
              {overview.needsWarmGreetingCount}
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">
              {overview.stalledStudentsCount} tersendat tahap proyek
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center shrink-0">
            <HeartHandshake className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Daftar Sapaan & Pendampingan Siswa (Zero Ranking) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-[#032448] flex items-center gap-2">
              <MessageSquareHeart className="w-5 h-5 text-amber-600" />
              Meja Pendampingan Formatif (Fokus Sapaan, Tanpa Pemeringkatan)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Membantu pendidik mengenali siswa yang tersendat prosesnya atau belum sempat bersuara dalam refleksi maupun penilaian diri.
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {(
              [
                { id: 'ALL', label: 'Semua Perlu Perhatian' },
                { id: 'GREETING', label: `Butuh Sapaan (${overview.needsWarmGreetingCount})` },
                { id: 'STALLED', label: `Tahap Tersendat (${overview.stalledStudentsCount})` },
                { id: 'REFLECTION', label: `Belum Refleksi (${overview.missingReflectionCount})` },
                { id: 'SELF', label: `Belum Penilaian Diri (${overview.missingSelfAssessmentCount})` }
              ] as { id: AlertFilter; label: string }[]
            ).map((btn) => (
              <button
                key={btn.id}
                type="button"
                onClick={() => setAlertFilter(btn.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                  alertFilter === btn.id
                    ? 'bg-[#032448] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {students.length === 0 ? (
          <div className="text-center py-10 text-xs text-slate-500">
            Belum ada data siswa pada cakupan peran Anda. Tambahkan siswa melalui menu Data Siswa & Divisi.
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="p-6 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>
              Semua siswa pada filter ini telah terpantau aktif, mengisi refleksi, dan tidak memiliki tahap yang tersendat.
            </span>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
            {filteredAlerts.slice(0, 18).map((item) => {
              const primaryDiv = getDivisionById(item.student.primaryDivisionId)?.shortName;
              const secondaryDiv = item.student.secondaryDivisionId
                ? getDivisionById(item.student.secondaryDivisionId)?.shortName
                : null;

              return (
                <div
                  key={item.student.id}
                  className="p-4 bg-white hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-sm text-[#032448]">{item.student.name}</span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700">
                        {item.student.classGroup}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                        {primaryDiv}
                        {secondaryDiv ? ` + ${secondaryDiv}` : ''}
                      </span>
                      {item.needsWarmGreeting && (
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Perlu Sapaan Hangat
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5 text-[11px] text-slate-600">
                      {item.missingReflection && (
                        <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                          Belum isi Refleksi Tahap 6
                        </span>
                      )}
                      {item.missingSelfAssessment && (
                        <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 border border-indigo-200">
                          Belum isi Penilaian Diri
                        </span>
                      )}
                      {item.reasons.map((reason, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200"
                        >
                          {reason}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {onSelectStudentForAssessment && (
                      <button
                        type="button"
                        onClick={() => onSelectStudentForAssessment(item.student)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#032448] text-white hover:bg-[#1F3A5F] whitespace-nowrap cursor-pointer"
                      >
                        {activeRole === 'walikelas' ? 'Lihat & Catat Sapaan' : 'Buka Pendampingan'}
                      </button>
                    )}
                    {onSelectStudentForTimeline && (
                      <button
                        type="button"
                        onClick={() => onSelectStudentForTimeline(item.student)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 whitespace-nowrap cursor-pointer"
                      >
                        Progres Tahap
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pemetaan 5 Dimensi Holistik & 4 Formasi */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-[#032448] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-600" />
              Peta 5 Dimensi Holistik — 4 Formasi SMA PL Santo Yosef
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Gambaran kualitatif pertumbuhan bersama (bukan perbandingan antar kelas maupun antar individu).
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            {(Object.keys(GROWTH_LEVELS) as GrowthLevel[]).map((lvl) => (
              <span
                key={lvl}
                className={`px-2.5 py-1 rounded-md border font-semibold ${GROWTH_LEVELS[lvl].badgeClass}`}
              >
                {lvl}: <span className="font-mono">{growthDistribution[lvl]}</span>
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {FIVE_HOLISTIC_DIMENSIONS.map((dim) => {
            const dimAssessments = assessments.filter((a) => a.dimensionId === dim.id);
            const mulaiCount = dimAssessments.filter((a) => a.growthLevel === 'Mulai Tumbuh').length;
            const berkembangCount = dimAssessments.filter((a) => a.growthLevel === 'Berkembang').length;
            const teladanCount = dimAssessments.filter((a) => a.growthLevel === 'Menjadi Teladan').length;

            return (
              <div key={dim.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div>
                  <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                    Formasi {dim.formasi}
                  </span>
                  <h4 className="font-bold text-sm text-[#032448] mt-1.5">{dim.name}</h4>
                  <p className="text-[11px] text-amber-800 font-medium">{dim.stYosefValues}</p>
                </div>

                <div className="pt-2 border-t border-slate-200/80 space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-amber-800">Mulai Tumbuh</span>
                    <span className="font-mono font-bold text-slate-800">{mulaiCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-teal-800">Berkembang</span>
                    <span className="font-mono font-bold text-slate-800">{berkembangCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-emerald-800">Menjadi Teladan</span>
                    <span className="font-mono font-bold text-slate-800">{teladanCount}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
