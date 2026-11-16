import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, LogOut, Eye } from 'lucide-react';
import {
  ALL_CLASSES,
  ClassGroup,
  getDivisionById,
  SEVEN_DPK_DIVISIONS,
  UserRole
} from '../types';

export const Navbar: React.FC = () => {
  const {
    user,
    profile,
    realRole,
    activeRole,
    previewDivisionId,
    previewClassGroup,
    isPreviewing,
    setPreviewContext,
    clearPreview,
    logout
  } = useAuth();

  const isStudentView = activeRole === 'murid';

  const getRoleBadgeLabel = () => {
    if (activeRole === 'admin') return 'Admin / Koordinator';
    if (activeRole === 'pendamping') {
      const divId = realRole === 'admin' ? previewDivisionId : profile?.assignedDivisionId;
      return `Pendamping • ${getDivisionById(divId)?.shortName || 'Divisi'}`;
    }
    if (activeRole === 'walikelas') {
      const cls = realRole === 'admin' ? previewClassGroup : profile?.assignedClassGroup;
      return `Wali Kelas • ${cls || 'Kelas X'}`;
    }
    return `Siswa • ${profile?.classGroup || 'Kelas X'}`;
  };

  return (
    <header
      className={`sticky top-0 z-40 text-white shadow-sm transition-colors duration-300 no-print ${
        isStudentView
          ? 'bg-emerald-900 border-b border-emerald-800'
          : 'bg-[#032448] border-b border-[#1F3A5F]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-xs overflow-hidden bg-white p-0.5 shrink-0">
              <img
                src={`${import.meta.env.BASE_URL}assets/aistudio/new2-LOGO-YOSEF_c283a7fd.jpg`}
                alt="Logo SMA Pangudi Luhur St. Yosef Surakarta"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-base sm:text-lg tracking-tight text-white truncate">
                  Symphony of Nusantara
                </span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md border bg-white/10 text-amber-200 border-white/20 whitespace-nowrap">
                  {getRoleBadgeLabel()}
                </span>
              </div>
              <p className="text-xs hidden md:block text-blue-100/80 italic truncate">
                Amor Gignit Amorem: Cinta Melahirkan Cinta • SMA Pangudi Luhur St. Yosef Surakarta
              </p>
            </div>
          </div>

          {/* Admin Role Preview Switcher + User Profile */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            {user && realRole === 'admin' && (
              <div className="hidden lg:flex items-center gap-1.5 bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-xs">
                <Eye className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span className="text-[11px] text-amber-200 font-semibold whitespace-nowrap">Tinjau Peran:</span>
                <select
                  value={activeRole}
                  onChange={(e) => {
                    const nextRole = e.target.value as UserRole;
                    if (nextRole === 'admin') {
                      clearPreview();
                    } else {
                      setPreviewContext(nextRole, previewDivisionId, previewClassGroup);
                    }
                  }}
                  className="bg-[#032448] text-white text-[11px] font-bold rounded px-1.5 py-0.5 border border-white/20 focus:outline-none cursor-pointer"
                >
                  <option value="admin">Admin Utama</option>
                  <option value="pendamping">Guru Pendamping</option>
                  <option value="walikelas">Wali Kelas</option>
                  <option value="murid">Tampilan Siswa</option>
                </select>

                {activeRole === 'pendamping' && (
                  <select
                    value={previewDivisionId}
                    onChange={(e) => setPreviewContext('pendamping', e.target.value, previewClassGroup)}
                    className="bg-[#032448] text-amber-200 text-[11px] font-semibold rounded px-1.5 py-0.5 border border-white/20 focus:outline-none cursor-pointer max-w-[130px]"
                  >
                    {SEVEN_DPK_DIVISIONS.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.shortName}
                      </option>
                    ))}
                  </select>
                )}

                {activeRole === 'walikelas' && (
                  <select
                    value={previewClassGroup}
                    onChange={(e) =>
                      setPreviewContext('walikelas', previewDivisionId, e.target.value as ClassGroup)
                    }
                    className="bg-[#032448] text-amber-200 text-[11px] font-semibold rounded px-1.5 py-0.5 border border-white/20 focus:outline-none cursor-pointer"
                  >
                    {ALL_CLASSES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {user && (
              <div className="flex items-center space-x-2.5">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Avatar'}
                    className="w-8 h-8 rounded-full ring-1 ring-white/40 object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/15 text-white">
                    <User className="w-4 h-4" />
                  </div>
                )}
                <div className="hidden md:block text-left">
                  <p className="text-xs font-semibold text-white truncate max-w-[140px]">
                    {user.displayName || 'Pengguna'}
                  </p>
                  <p className="text-[11px] text-white/70 truncate max-w-[140px]">
                    {isPreviewing ? 'Mode Simulasi Admin' : user.email}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="p-2 text-white/75 hover:text-rose-200 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                  title="Keluar dari akun Google"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
