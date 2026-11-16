import React, { useEffect, useState } from 'react';
import { useStudent } from '../context/StudentContext';
import { useAuth } from '../context/AuthContext';
import {
  Student,
  ProgressLog,
  ProgressStatus,
  DEFAULT_PROJECT_STAGES,
  getDivisionById
} from '../types';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  MessageSquare,
  Calendar,
  FileText,
  Sparkles,
  Check
} from 'lucide-react';

interface ProgressMonitoringViewProps {
  initialStudent?: Student | null;
}

export const ProgressMonitoringView: React.FC<ProgressMonitoringViewProps> = ({
  initialStudent
}) => {
  const { activeRole } = useAuth();
  const { students, progressLogs, updateProgressLog } = useStudent();

  const [selectedStudentId, setSelectedStudentId] = useState<string>(initialStudent?.id || '');
  const [editingFeedbackId, setEditingFeedbackId] = useState<string | null>(null);
  const [feedbackInput, setFeedbackInput] = useState<string>('');
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    if (initialStudent) {
      setSelectedStudentId(initialStudent.id);
    } else if (!selectedStudentId && students.length > 0) {
      setSelectedStudentId(students[0].id);
    }
  }, [initialStudent, students, selectedStudentId]);

  const selectedStudent = students.find((s) => s.id === selectedStudentId) || students[0] || null;
  const studentLogs = selectedStudent
    ? progressLogs
        .filter((p) => p.studentId === selectedStudent.id)
        .sort((a, b) => a.stageNumber - b.stageNumber)
    : [];

  const canEditStages = activeRole === 'admin' || activeRole === 'pendamping';

  const handleStatusChange = async (log: ProgressLog, newStatus: ProgressStatus) => {
    if (!canEditStages) return;
    setSavingId(log.id);
    await updateProgressLog(log.id, {
      status: newStatus,
      milestoneDate: new Date().toLocaleDateString('id-ID')
    });
    setSavingId(null);
  };

  const handleSaveFeedback = async (logId: string) => {
    setSavingId(logId);
    await updateProgressLog(logId, { teacherFeedback: feedbackInput });
    setEditingFeedbackId(null);
    setSavingId(null);
  };

  const getStatusBadge = (status: ProgressStatus) => {
    switch (status) {
      case 'Selesai':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Selesai
          </span>
        );
      case 'Sedang Berjalan':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            Sedang Berjalan
          </span>
        );
      case 'Tersendat / Perlu Sapaan':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            Tersendat / Perlu Sapaan
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200">
            Belum Dimulai
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Selector */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#032448] flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-600" />
            Linimasa Proses 6 Tahap Pendampingan
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {canEditStages
              ? 'Tandai tahapan Explore s/d Reflect dan beri catatan sapaan hangat jika ada tahap yang tersendat.'
              : 'Mode tinjau Wali Kelas: memantau kelancaran proses siswa di seluruh 6 tahap proyek.'}
          </p>
        </div>

        <select
          value={selectedStudent?.id || ''}
          onChange={(e) => setSelectedStudentId(e.target.value)}
          className="px-3.5 py-2 text-xs font-bold border border-slate-300 rounded-xl bg-white text-[#032448] min-w-[230px]"
        >
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.classGroup})
            </option>
          ))}
        </select>
      </div>

      {!selectedStudent ? (
        <div className="bg-white rounded-2xl p-10 border border-slate-200 text-center text-xs text-slate-500">
          Belum ada data siswa yang dapat ditampilkan.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-sm text-[#032448]">{selectedStudent.name}</span>
              <span className="px-2 py-0.5 rounded bg-[#032448] text-white font-bold">
                {selectedStudent.classGroup}
              </span>
              <span className="px-2.5 py-0.5 rounded bg-blue-50 text-blue-900 border border-blue-200 font-semibold">
                {getDivisionById(selectedStudent.primaryDivisionId)?.shortName}
                {selectedStudent.secondaryDivisionId
                  ? ` + ${getDivisionById(selectedStudent.secondaryDivisionId)?.shortName}`
                  : ''}
              </span>
            </div>
            <span className="font-semibold text-slate-600">
              {studentLogs.filter((l) => l.status === 'Selesai').length} / {DEFAULT_PROJECT_STAGES.length} Tahap Selesai
            </span>
          </div>

          {studentLogs.map((log) => (
            <div
              key={log.id}
              className={`bg-white rounded-2xl p-6 border shadow-xs space-y-4 ${
                log.status === 'Tersendat / Perlu Sapaan'
                  ? 'border-amber-300 bg-amber-50/20'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-[#032448] text-white">
                      {log.stageTitle}
                    </span>
                    {getStatusBadge(log.status)}
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {log.milestoneDate}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed pt-1">
                    {log.description}
                  </p>
                </div>

                {canEditStages && (
                  <div className="flex flex-wrap gap-1.5 shrink-0">
                    {(
                      [
                        'Belum Dimulai',
                        'Sedang Berjalan',
                        'Tersendat / Perlu Sapaan',
                        'Selesai'
                      ] as ProgressStatus[]
                    ).map((st) => (
                      <button
                        key={st}
                        type="button"
                        disabled={savingId === log.id}
                        onClick={() => handleStatusChange(log, st)}
                        className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg border transition-colors cursor-pointer ${
                          log.status === st
                            ? 'bg-[#032448] text-white border-[#032448]'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {(log.artifactsNote || log.studentReflection) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
                  {log.artifactsNote && (
                    <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100">
                      <span className="font-bold text-[#032448] flex items-center gap-1 mb-1">
                        <FileText className="w-3.5 h-3.5 text-blue-600" />
                        Catatan Karya / Bukti Proses:
                      </span>
                      <p className="text-slate-700">{log.artifactsNote}</p>
                    </div>
                  )}
                  {log.studentReflection && (
                    <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100">
                      <span className="font-bold text-emerald-900 flex items-center gap-1 mb-1">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        Catatan Siswa pada Tahap Ini:
                      </span>
                      <p className="text-slate-700 italic">“{log.studentReflection}”</p>
                    </div>
                  )}
                </div>
              )}

              {/* Mentor Feedback Note */}
              <div className="pt-3 border-t border-slate-100 text-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-slate-700 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                    Catatan Sapaan & Pendampingan Guru:
                  </span>
                  {canEditStages && editingFeedbackId !== log.id && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingFeedbackId(log.id);
                        setFeedbackInput(log.teacherFeedback || '');
                      }}
                      className="text-xs font-semibold text-blue-700 hover:underline cursor-pointer"
                    >
                      {log.teacherFeedback ? 'Ubah Catatan' : '+ Tambah Catatan'}
                    </button>
                  )}
                </div>

                {editingFeedbackId === log.id ? (
                  <div className="space-y-2">
                    <textarea
                      rows={2}
                      value={feedbackInput}
                      onChange={(e) => setFeedbackInput(e.target.value)}
                      placeholder="Tuliskan sapaan atau arahan langkah berikutnya dengan hangat..."
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#032448]"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingFeedbackId(null)}
                        className="px-3 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                      >
                        Batal
                      </button>
                      <button
                        type="button"
                        disabled={savingId === log.id}
                        onClick={() => handleSaveFeedback(log.id)}
                        className="px-3 py-1 text-xs font-bold text-white bg-[#032448] rounded-lg inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Simpan
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700">
                    {log.teacherFeedback || 'Belum ada catatan pada tahap ini.'}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
