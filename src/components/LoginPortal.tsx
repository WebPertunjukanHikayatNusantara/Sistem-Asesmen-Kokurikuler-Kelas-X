import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { isSupabaseConfigured } from '../lib/supabase';
import {
  Users,
  BookOpenCheck,
  GraduationCap,
  ShieldCheck,
  Eye,
  EyeOff,
  KeyRound,
  HeartHandshake,
  AlertCircle,
  CheckCircle2,
  Database
} from 'lucide-react';
import {
  ClassGroup,
  ALL_CLASSES,
  SEVEN_DPK_DIVISIONS,
  SCHOOL_MOTTO,
  UserRole
} from '../types';

export const LoginPortal: React.FC = () => {
  const { loginWithGoogle, loading, profileError, clearProfileError } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>('murid');
  const [selectedClass, setSelectedClass] = useState<ClassGroup>('X-1');
  const [selectedDivision, setSelectedDivision] = useState<string>(SEVEN_DPK_DIVISIONS[0].id);
  const [accessCode, setAccessCode] = useState<string>('');
  const [showCode, setShowCode] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState<boolean>(false);

  const displayedError = errorMessage || profileError;

  const handleLogin = async () => {
    setErrorMessage(null);
    clearProfileError();
    setIsRedirecting(true);
    try {
      await loginWithGoogle({
        intendedRole: selectedRole,
        preferredClass: selectedRole === 'walikelas' || selectedRole === 'murid' ? selectedClass : undefined,
        preferredDivisionId: selectedRole === 'pendamping' ? selectedDivision : undefined,
        accessCode: accessCode.trim() || undefined
      });
    } catch (err: unknown) {
      setIsRedirecting(false);
      setErrorMessage(
        err instanceof Error ? err.message : 'Gagal masuk dengan Google. Silakan periksa akun dan coba kembali.'
      );
    }
  };

  const roleCards: {
    id: UserRole;
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    accentBg: string;
    accentRing: string;
  }[] = [
    {
      id: 'pendamping',
      title: 'Guru Pendamping Divisi',
      subtitle: 'Mendampingi & menilai proses siswa per divisi (1–7)',
      icon: <Users className="w-5 h-5" />,
      accentBg: 'bg-[#032448] text-amber-300',
      accentRing: 'border-[#032448] bg-blue-50/60'
    },
    {
      id: 'walikelas',
      title: 'Wali Kelas',
      subtitle: 'Melihat progres seluruh siswa kelas & menulis catatan sapaan',
      icon: <BookOpenCheck className="w-5 h-5" />,
      accentBg: 'bg-indigo-900 text-indigo-200',
      accentRing: 'border-indigo-700 bg-indigo-50/60'
    },
    {
      id: 'murid',
      title: 'Siswa / Murid',
      subtitle: 'Melihat proses pribadi, refleksi relasional & apresiasi',
      icon: <GraduationCap className="w-5 h-5" />,
      accentBg: 'bg-emerald-700 text-white',
      accentRing: 'border-emerald-600 bg-emerald-50/60'
    },
    {
      id: 'admin',
      title: 'Admin / Koordinator',
      subtitle: 'Mengelola peran guru, bobot divisi & ekspor data',
      icon: <ShieldCheck className="w-5 h-5" />,
      accentBg: 'bg-amber-700 text-amber-50',
      accentRing: 'border-amber-600 bg-amber-50/60'
    }
  ];

  const needsEducatorInfo = selectedRole !== 'murid';

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F8FAFC] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto w-full space-y-8">
        {/* Header Hero & Prominent School Motto */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 p-1.5 bg-white rounded-2xl shadow-sm border border-slate-200">
              <img
                src={`${import.meta.env.BASE_URL}assets/aistudio/new2-LOGO-YOSEF_c283a7fd.jpg`}
                alt="Logo SMA Pangudi Luhur St. Yosef Surakarta"
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="text-xs font-bold uppercase tracking-widest text-amber-700">
              {SCHOOL_MOTTO.schoolName} • Kokurikuler Kelas X
            </p>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-[#032448] tracking-tight">
              Symphony of Nusantara
            </h1>
          </div>

          {/* Prominent Motto Banner */}
          <div className="max-w-2xl mx-auto bg-white border border-amber-200 rounded-2xl px-6 py-4 shadow-xs">
            <div className="flex items-center justify-center gap-2 text-amber-700 mb-1">
              <HeartHandshake className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Motto Pendampingan Sekolah</span>
            </div>
            <p className="text-lg sm:text-xl font-extrabold text-[#032448] italic">
              “{SCHOOL_MOTTO.full}”
            </p>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              Alat pendampingan formasi holistik siswa kelas X. Manusia dibentuk oleh pengalaman dicintai, bukan oleh tekanan.
            </p>
          </div>
        </div>

        {!isSupabaseConfigured && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-medium flex items-start gap-2.5 max-w-2xl mx-auto">
            <Database className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">Database Supabase Belum Terhubung</p>
              <p className="text-amber-800 leading-relaxed">
                Lengkapi environment variable <code>VITE_SUPABASE_URL</code> dan <code>VITE_SUPABASE_ANON_KEY</code> pada file <code>.env</code> (lokal) atau <strong>GitHub Actions Repository Secrets</strong>, serta jalankan <code>supabase/schema.sql</code> di SQL Editor Supabase agar tombol login aktif.
              </p>
            </div>
          </div>
        )}

        {displayedError && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-start gap-2.5 max-w-2xl mx-auto">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{displayedError}</span>
          </div>
        )}

        {/* Role Selector Panel */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 max-w-3xl mx-auto space-y-6">
          <div>
            <h2 className="text-base font-bold text-[#032448]">Pilih Peran Masuk</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Setiap peran memiliki ruang kerja yang disesuaikan agar proses pendampingan berlangsung aman dan terfokus.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {roleCards.map((card) => {
              const active = selectedRole === card.id;
              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => {
                    setSelectedRole(card.id);
                    setErrorMessage(null);
                    clearProfileError();
                  }}
                  className={`text-left p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                    active
                      ? `${card.accentRing} shadow-xs`
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${card.accentBg}`}>
                    {card.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-[#032448]">{card.title}</span>
                      {active && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 leading-snug">{card.subtitle}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Role-Specific Context Configuration */}
          <div className="pt-2 border-t border-slate-100 space-y-4">
            {selectedRole === 'pendamping' && (
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-2">
                <label className="block text-xs font-bold text-[#032448]">
                  Divisi yang Didampingi
                </label>
                <select
                  value={selectedDivision}
                  onChange={(e) => setSelectedDivision(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#032448]"
                >
                  {SEVEN_DPK_DIVISIONS.map((div) => (
                    <option key={div.id} value={div.id}>
                      {div.name}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500">
                  Jika email Anda sudah ditugaskan langsung oleh Admin, divisi akan tersinkronisasi otomatis.
                </p>
              </div>
            )}

            {(selectedRole === 'walikelas' || selectedRole === 'murid') && (
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-2">
                <label className="block text-xs font-bold text-[#032448]">
                  {selectedRole === 'walikelas' ? 'Kelas Perwalian' : 'Kelas Anda Saat Ini'}
                </label>
                <div className="grid grid-cols-6 gap-1.5">
                  {ALL_CLASSES.map((cls) => (
                    <button
                      key={cls}
                      type="button"
                      onClick={() => setSelectedClass(cls)}
                      className={`py-2 text-xs font-bold rounded-lg border transition-colors cursor-pointer whitespace-nowrap ${
                        selectedClass === cls
                          ? 'bg-[#032448] text-white border-[#032448]'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      {cls}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {needsEducatorInfo && (
              <div className="bg-blue-50/60 rounded-xl border border-blue-200 p-4 space-y-2">
                <label className="block text-xs font-bold text-[#032448] flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                  <span>Kode Otorisasi Peran (Opsional jika email sudah didaftarkan Admin)</span>
                </label>
                <div className="relative">
                  <input
                    type={showCode ? 'text' : 'password'}
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    placeholder={
                      selectedRole === 'admin'
                        ? 'Kosongkan untuk akun Admin utama atau isi kode admin...'
                        : 'Masukkan kode undangan pendidik dari koordinator...'
                    }
                    className="w-full pl-3 pr-10 py-2 text-xs font-mono font-semibold border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#032448]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCode(!showCode)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showCode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  Menjaga privasi catatan pendampingan siswa agar hanya dibuka oleh pihak berwenang.
                </p>
              </div>
            )}

            <button
              type="button"
              disabled={loading || isRedirecting || !isSupabaseConfigured}
              onClick={handleLogin}
              className={`w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl text-white font-bold text-xs shadow-sm transition-all disabled:opacity-50 cursor-pointer ${
                selectedRole === 'murid'
                  ? 'bg-emerald-700 hover:bg-emerald-800'
                  : 'bg-[#032448] hover:bg-[#1F3A5F]'
              }`}
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>
                {loading || isRedirecting
                  ? 'Mengalihkan ke login Google...'
                  : `Masuk sebagai ${roleCards.find((r) => r.id === selectedRole)?.title} (Gmail)`}
              </span>
            </button>
          </div>
        </div>

        {/* Institutional Attribution */}
        <div className="text-center text-xs text-slate-500 space-y-1">
          <p className="font-semibold text-slate-700">{SCHOOL_MOTTO.basis}</p>
          <p>Penerapan Standar Penilaian Badan Kebijakan Pendidikan Dasar dan Menengah (BKPDM).</p>
        </div>
      </div>
    </div>
  );
};
