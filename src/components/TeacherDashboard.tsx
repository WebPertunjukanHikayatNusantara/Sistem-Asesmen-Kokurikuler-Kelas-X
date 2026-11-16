import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useStudent } from '../context/StudentContext';
import {
  Student,
  ALL_CLASSES,
  PROJECT_PHILOSOPHY,
  SCHOOL_MOTTO,
  getDivisionById
} from '../types';
import { ClassStatisticsSummary } from './ClassStatisticsSummary';
import { StudentManagementView } from './StudentManagementView';
import { ProgressMonitoringView } from './ProgressMonitoringView';
import { AssessmentMatrixView } from './AssessmentMatrixView';
import { AdministrativePrintView } from './AdministrativePrintView';
import { AdminManagementView } from './AdminManagementView';
import { ProjectShowcaseOverview } from './ProjectShowcaseOverview';
import { RoleGuideView } from './RoleGuideView';
import { GitHubExportModal } from './GitHubExportModal';
import { exportHolisticDataToExcel } from '../utils/exportUtils';
import {
  LayoutDashboard,
  Users,
  Clock,
  Award,
  Printer,
  FileSpreadsheet,
  FolderArchive,
  Film,
  Sliders,
  HeartHandshake,
  HelpCircle
} from 'lucide-react';

type TeacherTab = 'overview' | 'students' | 'timeline' | 'assessment' | 'showcase' | 'print' | 'guide' | 'admin';

export const TeacherDashboard: React.FC = () => {
  const { activeRole, profile, realRole, previewDivisionId, previewClassGroup } = useAuth();
  const {
    students,
    assessments,
    appreciations,
    studentReflections,
    homeroomNotes,
    appConfig,
    selectedClassFilter,
    setSelectedClassFilter
  } = useStudent();

  const [activeTab, setActiveTab] = useState<TeacherTab>('overview');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);

  const handleSelectStudentForAssessment = (student: Student) => {
    setSelectedStudent(student);
    setActiveTab('assessment');
  };

  const handleSelectStudentForTimeline = (student: Student) => {
    setSelectedStudent(student);
    setActiveTab('timeline');
  };

  const handleExportExcel = () => {
    exportHolisticDataToExcel({
      requesterRole: activeRole,
      students,
      assessments,
      appreciations,
      reflections: studentReflections,
      homeroomNotes,
      appConfig,
      classFilter: selectedClassFilter
    });
  };

  const activeDivisionLabel =
    activeRole === 'pendamping'
      ? getDivisionById(realRole === 'admin' ? previewDivisionId : profile?.assignedDivisionId)
          ?.name || 'Divisi Pendampingan'
      : null;

  const activeClassLabel =
    activeRole === 'walikelas'
      ? realRole === 'admin'
        ? previewClassGroup
        : profile?.assignedClassGroup || 'Kelas Perwalian'
      : null;

  return (
    <div className="space-y-6">
      {/* Motto & Role Context Banner */}
      <div className="p-5 rounded-2xl bg-white border border-amber-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-800">
                {SCHOOL_MOTTO.full}
              </span>
              {activeDivisionLabel && (
                <span className="px-2 py-0.5 rounded bg-blue-50 text-[#032448] border border-blue-200 text-[11px] font-bold">
                  {activeDivisionLabel}
                </span>
              )}
              {activeClassLabel && (
                <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-900 border border-indigo-200 text-[11px] font-bold">
                  Wali Kelas {activeClassLabel} (Mode Lihat-Saja Skor Tahap)
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 italic leading-relaxed">
              “{PROJECT_PHILOSOPHY.quote}”
            </p>
          </div>
        </div>
      </div>

      {/* Top Navigation Tabs */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200 shadow-xs flex items-center justify-between gap-2 no-print overflow-x-auto">
        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-[#032448] text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-amber-400" />
            <span>Meja Pendampingan</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('students')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'students'
                ? 'bg-[#032448] text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4 text-amber-400" />
            <span>Data Siswa & Divisi</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('assessment')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'assessment'
                ? 'bg-[#032448] text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Award className="w-4 h-4 text-amber-400" />
            <span>
              {activeRole === 'walikelas' ? 'Tinjauan & Catatan Wali Kelas' : 'Asesmen 5 Dimensi & Apresiasi'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('timeline')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'timeline'
                ? 'bg-[#032448] text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Progres 6 Tahap</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('showcase')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'showcase'
                ? 'bg-[#032448] text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Film className="w-4 h-4 text-amber-400" />
            <span>Panduan Blok & DPK</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('print')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'print'
                ? 'bg-[#032448] text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>Cetak Rapor & Sertifikat</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('guide')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'guide'
                ? 'bg-[#032448] text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span>Panduan Pengisian</span>
          </button>

          {activeRole === 'admin' && (
            <button
              type="button"
              onClick={() => setActiveTab('admin')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'admin'
                  ? 'bg-[#032448] text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Sliders className="w-4 h-4 text-amber-400" />
              <span>Pengaturan Admin</span>
            </button>
          )}
        </div>

        {/* Action buttons */}
        <div className="hidden xl:flex items-center space-x-2 pl-2 shrink-0">
          <button
            type="button"
            onClick={handleExportExcel}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 cursor-pointer whitespace-nowrap"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Ekspor (.xlsx)</span>
          </button>

          {activeRole === 'admin' && (
            <button
              type="button"
              onClick={() => setIsGitHubModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-[#032448] bg-amber-100/80 border border-amber-300 hover:bg-amber-200 cursor-pointer whitespace-nowrap"
            >
              <FolderArchive className="w-3.5 h-3.5 text-amber-700" />
              <span>ZIP / GitHub</span>
            </button>
          )}
        </div>
      </div>

      {/* Class Filter Bar for Admin & Pendamping */}
      {activeRole !== 'walikelas' && activeTab !== 'admin' && activeTab !== 'showcase' && activeTab !== 'guide' && (
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs no-print flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-bold text-slate-600">Filter Kelas:</span>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedClassFilter('ALL')}
              className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                selectedClassFilter === 'ALL'
                  ? 'bg-[#032448] text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Semua ({students.length})
            </button>
            {ALL_CLASSES.map((cls) => (
              <button
                key={cls}
                type="button"
                onClick={() => setSelectedClassFilter(cls)}
                className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                  selectedClassFilter === cls
                    ? 'bg-[#032448] text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cls} ({students.filter((s) => s.classGroup === cls).length})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      {activeTab === 'overview' && (
        <ClassStatisticsSummary
          onSelectStudentForAssessment={handleSelectStudentForAssessment}
          onSelectStudentForTimeline={handleSelectStudentForTimeline}
        />
      )}

      {activeTab === 'students' && (
        <StudentManagementView
          onSelectStudentForAssessment={handleSelectStudentForAssessment}
          onSelectStudentForTimeline={handleSelectStudentForTimeline}
        />
      )}

      {activeTab === 'timeline' && (
        <ProgressMonitoringView initialStudent={selectedStudent} />
      )}

      {activeTab === 'assessment' && (
        <AssessmentMatrixView initialStudent={selectedStudent} />
      )}

      {activeTab === 'showcase' && <ProjectShowcaseOverview role={activeRole} />}

      {activeTab === 'print' && (
        <AdministrativePrintView onBack={() => setActiveTab('overview')} />
      )}

      {activeTab === 'guide' && <RoleGuideView portalRole={activeRole} />}

      {activeTab === 'admin' && activeRole === 'admin' && <AdminManagementView />}

      <GitHubExportModal isOpen={isGitHubModalOpen} onClose={() => setIsGitHubModalOpen(false)} />
    </div>
  );
};
