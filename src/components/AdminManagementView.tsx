import React, { useState } from 'react';
import { useStudent } from '../context/StudentContext';
import { useAuth } from '../context/AuthContext';
import {
  ALL_CLASSES,
  ClassGroup,
  SEVEN_DPK_DIVISIONS,
  SCHOOL_MOTTO,
  getDivisionById
} from '../types';
import { exportHolisticDataToExcel } from '../utils/exportUtils';
import {
  Sliders,
  UserCog,
  KeyRound,
  HeartHandshake,
  FileSpreadsheet,
  Plus,
  Trash2,
  CheckCircle2,
  Users
} from 'lucide-react';

export const AdminManagementView: React.FC = () => {
  const { activeRole } = useAuth();
  const {
    students,
    assessments,
    appreciations,
    studentReflections,
    homeroomNotes,
    staffAssignments,
    roleCodes,
    appConfig,
    updateAppConfig,
    saveStaffAssignment,
    deleteStaffAssignment,
    saveRoleCode,
    deleteRoleCode,
    importOfficialRoster2026,
    isImportingRoster
  } = useStudent();

  const [primaryWeight, setPrimaryWeight] = useState<number>(appConfig.primaryDivisionWeight);
  const [allowStudentChoice, setAllowStudentChoice] = useState<boolean>(
    appConfig.allowStudentDivisionSelection
  );
  const [savingConfig, setSavingConfig] = useState(false);

  // New staff form
  const [staffEmail, setStaffEmail] = useState('');
  const [staffName, setStaffName] = useState('');
  const [staffRole, setStaffRole] = useState<'pendamping' | 'walikelas' | 'admin'>('pendamping');
  const [staffDivision, setStaffDivision] = useState(SEVEN_DPK_DIVISIONS[0].id);
  const [staffClass, setStaffClass] = useState<ClassGroup>('X-1');
  const [savingStaff, setSavingStaff] = useState(false);

  // New role code form
  const [newCode, setNewCode] = useState('');
  const [newCodeRole, setNewCodeRole] = useState<'pendamping' | 'walikelas' | 'admin'>('pendamping');
  const [newCodeLabel, setNewCodeLabel] = useState('');

  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleSaveWeights = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingConfig(true);
    try {
      await updateAppConfig({
        primaryDivisionWeight: primaryWeight,
        secondaryDivisionWeight: 100 - primaryWeight,
        allowStudentDivisionSelection: allowStudentChoice
      });
      showToast('Pengaturan bobot divisi & izin pemilihan siswa tersimpan.');
    } finally {
      setSavingConfig(false);
    }
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffEmail.trim() || !staffName.trim()) return;
    setSavingStaff(true);
    try {
      await saveStaffAssignment({
        email: staffEmail.trim().toLowerCase(),
        displayName: staffName.trim(),
        role: staffRole,
        assignedDivisionId: staffRole === 'pendamping' ? staffDivision : undefined,
        assignedClassGroup: staffRole === 'walikelas' ? staffClass : undefined,
        canExport: true
      });
      setStaffEmail('');
      setStaffName('');
      showToast('Penugasan akun guru/koordinator berhasil disimpan.');
    } finally {
      setSavingStaff(false);
    }
  };

  const handleAddRoleCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim()) return;
    await saveRoleCode({
      code: newCode.trim().toUpperCase(),
      role: newCodeRole,
      label: newCodeLabel.trim() || `Kode ${newCodeRole}`,
      active: true
    });
    setNewCode('');
    setNewCodeLabel('');
    showToast('Kode otorisasi baru ditambahkan.');
  };

  const submittedReflections = studentReflections.filter((r) => r.isSubmitted);

  return (
    <div className="space-y-6">
      {toast && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* 1. Bobot Divisi Utama / Pendukung & Kebijakan Pemilihan Divisi */}
      <form
        onSubmit={handleSaveWeights}
        className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-[#032448] flex items-center gap-2">
              <Sliders className="w-5 h-5 text-amber-600" />
              Pengaturan Bobot Divisi & Kebijakan Sistem
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Mengatur cara penggabungan hasil siswa yang merangkap dua divisi (default 60% Utama + 40% Pendukung, tanpa bonus otomatis).
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={isImportingRoster}
              onClick={async () => {
                const res = await importOfficialRoster2026();
                showToast(
                  res.added > 0
                    ? `Berhasil mengimpor ${res.added} siswa resmi (X-1 s/d X-6) ke Firestore.`
                    : `Seluruh 205 siswa resmi (X-1 s/d X-6) sudah tersinkronisasi.`
                );
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 cursor-pointer whitespace-nowrap disabled:opacity-50"
            >
              <Users className="w-4 h-4 text-amber-700" />
              <span>
                {isImportingRoster
                  ? 'Mengimpor 205 Siswa...'
                  : 'Sinkronkan 205 Siswa Resmi (X-1..X-6)'}
              </span>
            </button>
            <button
              type="button"
              onClick={() =>
                exportHolisticDataToExcel({
                  requesterRole: activeRole,
                  students,
                  assessments,
                  appreciations,
                  reflections: studentReflections,
                  homeroomNotes,
                  appConfig,
                  classFilter: 'ALL'
                })
              }
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 cursor-pointer whitespace-nowrap"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Ekspor Semua Data (X-1 s/d X-6)</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-[#032448]">
              <span>Bobot Divisi Utama: {primaryWeight}%</span>
              <span>Divisi Pendukung: {100 - primaryWeight}%</span>
            </div>
            <input
              type="range"
              min={50}
              max={90}
              step={5}
              value={primaryWeight}
              onChange={(e) => setPrimaryWeight(Number(e.target.value))}
              className="w-full accent-[#032448]"
            />
            <p className="text-[11px] text-slate-500">
              Siswa dengan 1 divisi tetap dihitung 100% dari divisi utamanya. Merangkap divisi tidak menambah poin otomatis.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3">
            <label className="flex items-start gap-2.5 text-xs font-semibold text-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={allowStudentChoice}
                onChange={(e) => setAllowStudentChoice(e.target.checked)}
                className="mt-0.5 rounded border-slate-400"
              />
              <span>
                Izinkan siswa memilih / mengubah Divisi Utama & Pendukung sendiri di Portal Siswa (awal proyek)
              </span>
            </label>
            <button
              type="submit"
              disabled={savingConfig}
              className="self-start px-5 py-2 rounded-xl bg-[#032448] hover:bg-[#1F3A5F] text-white text-xs font-bold cursor-pointer disabled:opacity-50"
            >
              {savingConfig ? 'Menyimpan...' : 'Simpan Pengaturan Sistem'}
            </button>
          </div>
        </div>
      </form>

      {/* 2. Penugasan Guru Pendamping Divisi, Wali Kelas & Admin */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-[#032448] flex items-center gap-2">
              <UserCog className="w-5 h-5 text-amber-600" />
              Penugasan Akun Pendidik (Guru Pendamping & Wali Kelas)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Daftarkan email Google guru agar langsung masuk sesuai peran, divisi, atau kelas perwaliannya.
            </p>
          </div>

          <form onSubmit={handleAddStaff} className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <input
              type="email"
              required
              value={staffEmail}
              onChange={(e) => setStaffEmail(e.target.value)}
              placeholder="Email Google Guru..."
              className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
            />
            <input
              type="text"
              required
              value={staffName}
              onChange={(e) => setStaffName(e.target.value)}
              placeholder="Nama Lengkap Guru..."
              className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
            />
            <select
              value={staffRole}
              onChange={(e) => setStaffRole(e.target.value as typeof staffRole)}
              className="px-3 py-2 text-xs font-semibold border border-slate-300 rounded-lg bg-white"
            >
              <option value="pendamping">Guru Pendamping Divisi</option>
              <option value="walikelas">Wali Kelas</option>
              <option value="admin">Admin / Koordinator</option>
            </select>

            {staffRole === 'pendamping' ? (
              <select
                value={staffDivision}
                onChange={(e) => setStaffDivision(e.target.value)}
                className="px-3 py-2 text-xs font-semibold border border-slate-300 rounded-lg bg-white"
              >
                {SEVEN_DPK_DIVISIONS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            ) : staffRole === 'walikelas' ? (
              <select
                value={staffClass}
                onChange={(e) => setStaffClass(e.target.value as ClassGroup)}
                className="px-3 py-2 text-xs font-semibold border border-slate-300 rounded-lg bg-white"
              >
                {ALL_CLASSES.map((c) => (
                  <option key={c} value={c}>
                    Kelas {c}
                  </option>
                ))}
              </select>
            ) : (
              <div className="px-3 py-2 text-xs text-slate-500 bg-white border border-slate-200 rounded-lg">
                Akses Penuh Koordinator
              </div>
            )}

            <button
              type="submit"
              disabled={savingStaff}
              className="sm:col-span-2 py-2 px-4 rounded-lg bg-[#032448] hover:bg-[#1F3A5F] text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{savingStaff ? 'Menyimpan...' : 'Simpan Penugasan Akun'}</span>
            </button>
          </form>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
            {staffAssignments.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                Belum ada penugasan email guru secara eksplisit (guru masih dapat masuk dengan Kode Otorisasi).
              </div>
            ) : (
              staffAssignments.map((st) => (
                <div key={st.id} className="p-3.5 flex items-center justify-between gap-2 text-xs bg-white">
                  <div>
                    <div className="font-bold text-[#032448]">{st.displayName}</div>
                    <div className="text-[11px] text-slate-500">{st.email}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-900 border border-blue-200 font-semibold">
                      {st.role === 'pendamping'
                        ? `Pendamping: ${getDivisionById(st.assignedDivisionId)?.shortName || st.assignedDivisionId}`
                        : st.role === 'walikelas'
                        ? `Wali Kelas: ${st.assignedClassGroup}`
                        : 'Admin'}
                    </span>
                    <button
                      type="button"
                      onClick={() => deleteStaffAssignment(st.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 3. Kode Otorisasi Peran */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-[#032448] flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-amber-600" />
              Kode Otorisasi Masuk Pendidik
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Bagikan kode aktif kepada Guru Pendamping atau Wali Kelas yang belum didaftarkan emailnya.
            </p>
          </div>

          <form onSubmit={handleAddRoleCode} className="space-y-2.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                placeholder="Kode (mis. TEATER2026)"
                className="px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-lg bg-white uppercase"
              />
              <select
                value={newCodeRole}
                onChange={(e) => setNewCodeRole(e.target.value as typeof newCodeRole)}
                className="px-3 py-1.5 text-xs font-semibold border border-slate-300 rounded-lg bg-white"
              >
                <option value="pendamping">Pendamping</option>
                <option value="walikelas">Wali Kelas</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <input
              type="text"
              value={newCodeLabel}
              onChange={(e) => setNewCodeLabel(e.target.value)}
              placeholder="Keterangan singkat kode..."
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
            />
            <button
              type="submit"
              className="w-full py-2 rounded-lg bg-[#032448] text-white text-xs font-bold cursor-pointer"
            >
              Simpan / Tambah Kode
            </button>
          </form>

          <div className="space-y-2">
            {roleCodes.map((rc) => (
              <div
                key={rc.code}
                className="p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-mono font-bold text-[#032448]">{rc.code}</span>
                  <span className="ml-2 px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold">
                    {rc.role}
                  </span>
                  {rc.label && <p className="text-[11px] text-slate-500 mt-0.5">{rc.label}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => saveRoleCode({ ...rc, active: !rc.active })}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                      rc.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {rc.active ? 'Aktif' : 'Nonaktif'}
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteRoleCode(rc.code)}
                    className="text-slate-400 hover:text-rose-600 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Pemetaan Kualitatif Amor Gignit Amorem (Tanpa Skor & Tanpa Perbandingan) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="pb-3 border-b border-slate-100">
          <h3 className="text-base font-bold text-[#032448] flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-amber-600" />
            Pembacaan Kualitatif “{SCHOOL_MOTTO.full}”
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Hanya untuk pendampingan tim pastoral & koordinator — bukan skor, bukan pemeringkatan siswa maupun kelas.
          </p>
        </div>

        {submittedReflections.length === 0 ? (
          <p className="text-xs text-slate-400 py-4">
            Belum ada siswa yang mengirimkan Refleksi Relasional Tahap 6.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {submittedReflections.map((ref) => (
              <div
                key={ref.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#032448]">{ref.studentName}</span>
                  <span className="px-2 py-0.5 rounded bg-white border border-slate-200 font-bold text-[10px]">
                    {ref.classGroup}
                  </span>
                </div>
                {ref.mengalamiCintaNote && (
                  <p className="text-slate-700">
                    <strong className="text-amber-800">Mengalami cinta:</strong> {ref.mengalamiCintaNote}
                  </p>
                )}
                {ref.menghidupiCintaNote && (
                  <p className="text-slate-700">
                    <strong className="text-teal-800">Menghidupi cinta:</strong> {ref.menghidupiCintaNote}
                  </p>
                )}
                {ref.meneruskanCintaNote && (
                  <p className="text-slate-700">
                    <strong className="text-emerald-800">Meneruskan cinta:</strong> {ref.meneruskanCintaNote}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
