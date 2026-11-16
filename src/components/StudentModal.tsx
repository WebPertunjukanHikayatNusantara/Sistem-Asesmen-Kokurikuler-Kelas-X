import React, { useState, useEffect } from 'react';
import {
  Student,
  ClassGroup,
  ALL_CLASSES,
  SEVEN_DPK_DIVISIONS
} from '../types';
import { X, UserPlus, Check, AlertCircle } from 'lucide-react';

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  initialData?: Student | null;
  defaultClass?: ClassGroup;
  defaultDivisionId?: string;
}

export const StudentModal: React.FC<StudentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  defaultClass = 'X-1',
  defaultDivisionId = SEVEN_DPK_DIVISIONS[0].id
}) => {
  const [nisn, setNisn] = useState('');
  const [name, setName] = useState('');
  const [classGroup, setClassGroup] = useState<ClassGroup>(defaultClass);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<'Laki-laki' | 'Perempuan' | '-'>('Laki-laki');
  const [primaryDivisionId, setPrimaryDivisionId] = useState<string>(defaultDivisionId);
  const [secondaryDivisionId, setSecondaryDivisionId] = useState<string>('');
  const [isDpkCommittee, setIsDpkCommittee] = useState<boolean>(false);
  const [dpkRoleNote, setDpkRoleNote] = useState<string>('');
  const [status, setStatus] = useState<'Aktif' | 'Perlu Sapaan'>('Aktif');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setNisn(initialData.nisn);
      setName(initialData.name);
      setClassGroup(initialData.classGroup);
      setEmail(initialData.email);
      setPhone(initialData.phone || '');
      setGender(initialData.gender);
      setPrimaryDivisionId(initialData.primaryDivisionId || defaultDivisionId);
      setSecondaryDivisionId(initialData.secondaryDivisionId || '');
      setIsDpkCommittee(Boolean(initialData.isDpkCommittee));
      setDpkRoleNote(initialData.dpkRoleNote || '');
      setStatus(initialData.status === 'Perlu Sapaan' ? 'Perlu Sapaan' : 'Aktif');
      setNotes(initialData.notes || '');
    } else {
      setNisn('');
      setName('');
      setClassGroup(defaultClass);
      setEmail('');
      setPhone('');
      setGender('Laki-laki');
      setPrimaryDivisionId(defaultDivisionId);
      setSecondaryDivisionId('');
      setIsDpkCommittee(false);
      setDpkRoleNote('');
      setStatus('Aktif');
      setNotes('');
    }
    setError(null);
  }, [initialData, defaultClass, defaultDivisionId, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nisn.trim() || !name.trim() || !primaryDivisionId) {
      setError('NISN, Nama Lengkap, dan Divisi Utama wajib diisi.');
      return;
    }
    if (secondaryDivisionId && secondaryDivisionId === primaryDivisionId) {
      setError('Divisi Pendukung tidak boleh sama dengan Divisi Utama.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onSubmit({
        nisn: nisn.trim(),
        name: name.trim(),
        classGroup,
        email: email.trim().toLowerCase() || `${nisn.trim()}@siswa.smyosef.sch.id`,
        phone: phone.trim() || undefined,
        gender,
        primaryDivisionId,
        secondaryDivisionId: secondaryDivisionId || undefined,
        isDpkCommittee,
        dpkRoleNote: isDpkCommittee ? dpkRoleNote.trim() || 'Panitia DPK Kelas X' : undefined,
        status,
        notes: notes.trim() || undefined
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan data siswa.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 bg-[#032448] text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <UserPlus className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base">
              {initialData ? 'Perbarui Data & Divisi Siswa' : 'Tambah Siswa Baru (Kelas X-1 s/d X-6)'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">NISN *</label>
              <input
                type="text"
                value={nisn}
                onChange={(e) => setNisn(e.target.value)}
                placeholder="Contoh: 0081234567"
                required
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#032448] font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Kelas *</label>
              <select
                value={classGroup}
                onChange={(e) => setClassGroup(e.target.value as ClassGroup)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#032448] font-semibold bg-white"
              >
                {ALL_CLASSES.map((cls) => (
                  <option key={cls} value={cls}>
                    Kelas {cls}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap Siswa *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama lengkap sesuai presensi"
              required
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#032448]"
            />
          </div>

          {/* 1 or 2 Divisions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <label className="block text-xs font-bold text-[#032448] mb-1">
                Divisi Utama *
              </label>
              <select
                value={primaryDivisionId}
                onChange={(e) => setPrimaryDivisionId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white font-semibold focus:outline-none focus:ring-2 focus:ring-[#032448]"
              >
                {SEVEN_DPK_DIVISIONS.map((div) => (
                  <option key={div.id} value={div.id}>
                    {div.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Divisi Pendukung (Opsional / Rangkap)
              </label>
              <select
                value={secondaryDivisionId}
                onChange={(e) => setSecondaryDivisionId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#032448]"
              >
                <option value="">Tidak merangkap (1 Divisi saja)</option>
                {SEVEN_DPK_DIVISIONS.filter((d) => d.id !== primaryDivisionId).map((div) => (
                  <option key={div.id} value={div.id}>
                    {div.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* DPK Committee Flag */}
          <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200 space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold text-amber-950 cursor-pointer">
              <input
                type="checkbox"
                checked={isDpkCommittee}
                onChange={(e) => setIsDpkCommittee(e.target.checked)}
                className="rounded border-amber-400 text-[#032448]"
              />
              <span>Siswa adalah Panitia DPK Kelas X</span>
            </label>
            {isDpkCommittee && (
              <input
                type="text"
                value={dpkRoleNote}
                onChange={(e) => setDpkRoleNote(e.target.value)}
                placeholder="Peran kepanitiaan DPK (mis. Sekretaris / Koordinator Divisi)"
                className="w-full px-3 py-1.5 text-xs border border-amber-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Jenis Kelamin</label>
              <div className="grid grid-cols-3 gap-2">
                {(['Laki-laki', 'Perempuan', '-'] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className={`py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                      gender === g
                        ? 'bg-blue-50 border-[#032448] text-[#032448]'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {g === '-' ? 'Belum Diisi' : g}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Status Pendampingan</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'Aktif' | 'Perlu Sapaan')}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#032448]"
              >
                <option value="Aktif">Aktif Berproses</option>
                <option value="Perlu Sapaan">Perlu Sapaan Hangat</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Akun Google Siswa</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@gmail.com"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#032448]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">No. Telepon (Opsional)</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0812..."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#032448]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Peran / Minat</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Pemeran Timun Mas & membantu penataan properti panggung"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#032448]"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-bold text-white bg-[#032448] hover:bg-[#1F3A5F] rounded-lg shadow-xs flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{loading ? 'Menyimpan...' : initialData ? 'Simpan Perubahan' : 'Tambahkan Siswa'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
