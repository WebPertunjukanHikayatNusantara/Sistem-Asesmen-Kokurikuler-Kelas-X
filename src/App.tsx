import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StudentProvider } from './context/StudentContext';
import { Navbar } from './components/Navbar';
import { LoginPortal } from './components/LoginPortal';
import { TeacherDashboard } from './components/TeacherDashboard';
import { StudentPortalView } from './components/StudentPortalView';
import { Loader2 } from 'lucide-react';
import { SCHOOL_MOTTO } from './types';

const AppContent: React.FC = () => {
  const { user, loading, activeRole } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
        <div className="w-14 h-14 rounded-2xl bg-[#032448] flex items-center justify-center text-amber-300 shadow-md mb-4">
          <Loader2 className="w-7 h-7 animate-spin" />
        </div>
        <h2 className="text-lg font-bold text-[#032448]">Symphony of Nusantara</h2>
        <p className="text-xs text-slate-600 mt-1 italic">{SCHOOL_MOTTO.full}</p>
        <p className="text-xs text-slate-500 mt-1">Menyiapkan ruang pendampingan holistik...</p>
      </div>
    );
  }

  const isStudentView = activeRole === 'murid';

  return (
    <div
      className={`min-h-screen flex flex-col font-['Plus_Jakarta_Sans',sans-serif] transition-colors duration-300 ${
        !user
          ? 'bg-[#F8FAFC]'
          : isStudentView
          ? 'bg-[#F7FBF9]'
          : 'bg-[#F8FAFC]'
      }`}
    >
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {!user ? (
          <LoginPortal />
        ) : (
          <StudentProvider>
            {isStudentView ? <StudentPortalView /> : <TeacherDashboard />}
          </StudentProvider>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-5 text-center text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 space-y-0.5">
          <p className="font-bold text-[#032448] italic">{SCHOOL_MOTTO.full}</p>
          <p>
            Pendampingan Formasi Holistik Kokurikuler Kelas X • {SCHOOL_MOTTO.schoolName}
          </p>
        </div>
      </footer>
    </div>
  );
};

class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; errorMessage: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, errorMessage: error?.message || 'Terjadi kesalahan saat memuat aplikasi.' };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Uncaught UI error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 font-['Plus_Jakarta_Sans',sans-serif]">
          <div className="max-w-md w-full bg-white rounded-2xl border border-rose-200 p-6 shadow-sm space-y-3 text-center">
            <h2 className="text-base font-bold text-[#032448]">Aplikasi Mengalami Kendala Tampilan</h2>
            <p className="text-xs text-slate-600 break-words">{this.state.errorMessage}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-xl bg-[#032448] text-white text-xs font-bold cursor-pointer hover:bg-[#1F3A5F]"
            >
              Muat Ulang Halaman
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <AppErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </AppErrorBoundary>
  );
}
