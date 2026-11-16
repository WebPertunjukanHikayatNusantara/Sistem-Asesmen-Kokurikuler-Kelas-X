import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useStudent } from '../context/StudentContext';
import { OFFICIAL_ROSTER_2026 } from '../data/roster2026';
import {
  ALL_CLASSES,
  ClassGroup,
  DEFAULT_PROJECT_STAGES,
  FIVE_HOLISTIC_DIMENSIONS,
  GROWTH_LEVELS,
  GROWTH_LEVEL_ORDER,
  GrowthLevel,
  IndicatorCode,
  SCHOOL_MOTTO,
  SEVEN_DPK_DIVISIONS,
  getDivisionById
} from '../types';
import { ProjectShowcaseOverview } from './ProjectShowcaseOverview';
import { RoleGuideView } from './RoleGuideView';
import {
  Sparkles,
  HeartHandshake,
  Award,
  CheckCircle2,
  BookOpen,
  Calendar,
  Send,
  Shield,
  Users,
  Clock,
  HelpCircle,
  UserCheck,
  AlertCircle,
  Search
} from 'lucide-react';

type StudentTab = 'beranda' | 'capaian' | 'apresiasi' | 'refleksi' | 'jadwal' | 'panduan';

export const StudentPortalView: React.FC = () => {
  const { user, profile } = useAuth();
  const {
    students,
    divisionPeers,
    assessments,
    selfAssessments,
    studentReflections,
    appreciations,
    homeroomNotes,
    progressLogs,
    appConfig,
    addStudent,
    claimOfficialStudent,
    updateStudent,
    saveSelfAssessment,
    saveStudentReflection,
    addAppreciation,
    updateProgressLog,
    loading
  } = useStudent();

  const [activeTab, setActiveTab] = useState<StudentTab>('beranda');
  const [toast, setToast] = useState<string | null>(null);

  // Roster claim / onboarding state (inline inside Beranda if logged-in Google email is not yet linked)
  const [manualMode, setManualMode] = useState(false);
  const [onboardClass, setOnboardClass] = useState<ClassGroup>(profile?.classGroup || 'X-1');
  const [rosterSearch, setRosterSearch] = useState('');
  const [selectedRosterId, setSelectedRosterId] = useState('');
  const [onboardNisn, setOnboardNisn] = useState('');
  const [onboardName, setOnboardName] = useState(user?.displayName || '');
  const [onboardGender, setOnboardGender] = useState<'Laki-laki' | 'Perempuan'>('Laki-laki');
  const [onboardPrimaryDiv, setOnboardPrimaryDiv] = useState(SEVEN_DPK_DIVISIONS[0].id);
  const [onboardSecondaryDiv, setOnboardSecondaryDiv] = useState('');
  const [onboardIsDpk, setOnboardIsDpk] = useState(false);
  const [savingOnboard, setSavingOnboard] = useState(false);
  const [onboardError, setOnboardError] = useState<string | null>(null);

  // Division editor (if allowStudentDivisionSelection is enabled)
  const [editingDivisions, setEditingDivisions] = useState(false);
  const [editPrimaryDiv, setEditPrimaryDiv] = useState('');
  const [editSecondaryDiv, setEditSecondaryDiv] = useState('');

  // Stage note editing
  const [editingStageId, setEditingStageId] = useState<string | null>(null);
  const [stageNoteInput, setStageNoteInput] = useState('');
  const [stageArtifactInput, setStageArtifactInput] = useState('');

  // Self assessment note
  const [selfNoteInput, setSelfNoteInput] = useState('');

  // Peer Appreciation form ("Satu hal yang saya syukuri dari temanku")
  const [peerTargetId, setPeerTargetId] = useState('');
  const [peerMessage, setPeerMessage] = useState('');
  const [sendingPeerAppreciation, setSendingPeerAppreciation] = useState(false);

  // One-time Stage 6 Relational Reflection state
  const [whoHelpedMeGrow, setWhoHelpedMeGrow] = useState('');
  const [whoIHelpedAndHowItFelt, setWhoIHelpedAndHowItFelt] = useState('');
  const [whenIFeltValued, setWhenIFeltValued] = useState('');
  const [whatIAmMostGratefulFor, setWhatIAmMostGratefulFor] = useState('');
  const [whatIWantToImprove, setWhatIWantToImprove] = useState('');
  const [projectReflectionSummary, setProjectReflectionSummary] = useState('');
  const [mengalamiCintaNote, setMengalamiCintaNote] = useState('');
  const [menghidupiCintaNote, setMenghidupiCintaNote] = useState('');
  const [meneruskanCintaNote, setMeneruskanCintaNote] = useState('');
  const [savingReflection, setSavingReflection] = useState(false);

  const myStudent = students[0] || null;

  const rosterStudentsInClass = useMemo(() => {
    const keyword = rosterSearch.trim().toLowerCase();
    return OFFICIAL_ROSTER_2026.filter((entry) => {
      if (entry.classGroup !== onboardClass) return false;
      if (!keyword) return true;
      return (
        entry.name.toLowerCase().includes(keyword) ||
        entry.nisn.toLowerCase().includes(keyword)
      );
    });
  }, [onboardClass, rosterSearch]);

  const selectedRosterEntry = useMemo(
    () => rosterStudentsInClass.find((e) => e.id === selectedRosterId) || null,
    [rosterStudentsInClass, selectedRosterId]
  );

  // Auto-select matching name if user displayName matches, or reset when class changes
  useEffect(() => {
    if (rosterStudentsInClass.length === 0) {
      setSelectedRosterId('');
      return;
    }
    const currentStillValid = rosterStudentsInClass.some((e) => e.id === selectedRosterId);
    if (!currentStillValid) {
      const displayLower = (user?.displayName || '').trim().toLowerCase();
      const matched =
        displayLower.length >= 4
          ? rosterStudentsInClass.find((e) => e.name.toLowerCase().includes(displayLower))
          : undefined;
      const picked = matched || rosterStudentsInClass[0];
      setSelectedRosterId(picked.id);
      setOnboardPrimaryDiv(picked.primaryDivisionId);
    }
  }, [rosterStudentsInClass, selectedRosterId, user?.displayName]);

  useEffect(() => {
    if (myStudent) {
      setEditPrimaryDiv(myStudent.primaryDivisionId);
      setEditSecondaryDiv(myStudent.secondaryDivisionId || '');
    }
  }, [myStudent]);

  const myReflection = useMemo(
    () => (myStudent ? studentReflections.find((r) => r.studentId === myStudent.id) : undefined),
    [studentReflections, myStudent]
  );

  useEffect(() => {
    if (myReflection) {
      setWhoHelpedMeGrow(myReflection.whoHelpedMeGrow || '');
      setWhoIHelpedAndHowItFelt(myReflection.whoIHelpedAndHowItFelt || '');
      setWhenIFeltValued(myReflection.whenIFeltValued || '');
      setWhatIAmMostGratefulFor(myReflection.whatIAmMostGratefulFor || '');
      setWhatIWantToImprove(myReflection.whatIWantToImprove || '');
      setProjectReflectionSummary(myReflection.projectReflectionSummary || '');
      setMengalamiCintaNote(myReflection.mengalamiCintaNote || '');
      setMenghidupiCintaNote(myReflection.menghidupiCintaNote || '');
      setMeneruskanCintaNote(myReflection.meneruskanCintaNote || '');
    }
  }, [myReflection]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const myAssessments = useMemo(
    () => (myStudent ? assessments.filter((a) => a.studentId === myStudent.id) : []),
    [assessments, myStudent]
  );
  const mySelfAssessments = useMemo(
    () => (myStudent ? selfAssessments.filter((sa) => sa.studentId === myStudent.id) : []),
    [selfAssessments, myStudent]
  );
  const myLogs = useMemo(
    () =>
      myStudent
        ? progressLogs
            .filter((l) => l.studentId === myStudent.id)
            .sort((a, b) => a.stageNumber - b.stageNumber)
        : [],
    [progressLogs, myStudent]
  );
  const myHomeroomNote = useMemo(
    () => (myStudent ? homeroomNotes.find((h) => h.studentId === myStudent.id) : undefined),
    [homeroomNotes, myStudent]
  );

  const receivedAppreciations = useMemo(
    () => (myStudent ? appreciations.filter((ap) => ap.toStudentId === myStudent.id) : []),
    [appreciations, myStudent]
  );
  const sentPeerAppreciations = useMemo(
    () =>
      myStudent
        ? appreciations.filter(
            (ap) => ap.type === 'peer_appreciation' && ap.fromUserId === user?.uid
          )
        : [],
    [appreciations, myStudent, user?.uid]
  );

  // Teammates in my primary or secondary division (excluding self, zero PII)
  const myDivisionPeers = useMemo(() => {
    if (!myStudent) return [];
    const seen = new Set<string>();
    return divisionPeers.filter((p) => {
      if (p.studentId === myStudent.id || seen.has(p.studentId)) return false;
      seen.add(p.studentId);
      return true;
    });
  }, [divisionPeers, myStudent]);

  const handleCompleteOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    setOnboardError(null);
    if (onboardSecondaryDiv && onboardSecondaryDiv === onboardPrimaryDiv) {
      setOnboardError('Divisi pendukung tidak boleh sama dengan divisi utama.');
      return;
    }

    setSavingOnboard(true);
    try {
      if (!manualMode && selectedRosterEntry) {
        await claimOfficialStudent({
          entry: selectedRosterEntry,
          gender: onboardGender,
          primaryDivisionId: onboardPrimaryDiv,
          secondaryDivisionId: onboardSecondaryDiv || undefined,
          isDpkCommittee: onboardIsDpk
        });
        showToast(`Selamat datang, ${selectedRosterEntry.name}! Profil siswamu berhasil ditautkan.`);
      } else {
        if (!onboardName.trim() || !onboardNisn.trim()) {
          setOnboardError('Nama lengkap dan NISN wajib diisi.');
          return;
        }
        await addStudent({
          nisn: onboardNisn.trim(),
          name: onboardName.trim(),
          classGroup: onboardClass,
          email: (user?.email || '').toLowerCase(),
          gender: onboardGender,
          primaryDivisionId: onboardPrimaryDiv,
          secondaryDivisionId: onboardSecondaryDiv || undefined,
          isDpkCommittee: onboardIsDpk,
          status: 'Aktif'
        });
        showToast('Data siswa dan penempatan divisi berhasil dibuat!');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.toLowerCase().includes('permission') || msg.toLowerCase().includes('insufficient')) {
        setOnboardError(
          'Data siswa ini kemungkinan sudah ditautkan ke akun Gmail lain. Periksa kembali nama pilihanmu atau hubungi Koordinator/Admin (Pak Tio).'
        );
      } else {
        setOnboardError('Gagal menautkan profil siswa. Silakan coba kembali.');
      }
    } finally {
      setSavingOnboard(false);
    }
  };

  const handleUpdateDivisions = async () => {
    if (!myStudent || !editPrimaryDiv) return;
    if (editSecondaryDiv && editSecondaryDiv === editPrimaryDiv) return;
    await updateStudent(myStudent.id, {
      primaryDivisionId: editPrimaryDiv,
      secondaryDivisionId: editSecondaryDiv || undefined
    });
    setEditingDivisions(false);
    showToast('Pilihan divisi kamu berhasil diperbarui.');
  };

  const handleSaveStageReflection = async (logId: string) => {
    await updateProgressLog(logId, {
      studentReflection: stageNoteInput.trim(),
      artifactsNote: stageArtifactInput.trim()
    });
    setEditingStageId(null);
    showToast('Catatan tahap proyek tersimpan.');
  };

  const handleSelectSelfLevel = async (indicatorCode: IndicatorCode, level: GrowthLevel) => {
    if (!myStudent) {
      showToast('Tautkan data siswamu di tab Beranda terlebih dahulu untuk menyimpan penilaian diri.');
      return;
    }
    await saveSelfAssessment({
      student: myStudent,
      indicatorCode,
      growthLevel: level,
      reflectionNote: selfNoteInput.trim() || undefined
    });
    showToast(`Penilaian dirimu untuk indikator ${indicatorCode} tersimpan.`);
  };

  const handleSendPeerAppreciation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myStudent) {
      showToast('Tautkan data siswamu di tab Beranda terlebih dahulu untuk mengirim apresiasi.');
      return;
    }
    if (!peerTargetId || peerMessage.trim().length < 5) return;
    const peer = myDivisionPeers.find((p) => p.studentId === peerTargetId);
    if (!peer) return;

    setSendingPeerAppreciation(true);
    try {
      await addAppreciation({
        type: 'peer_appreciation',
        toStudentId: peer.studentId,
        toStudentName: peer.studentName,
        toClassGroup: peer.classGroup,
        divisionId: peer.divisionId,
        divisionName: getDivisionById(peer.divisionId)?.shortName || peer.divisionId,
        fromStudentId: myStudent.id,
        message: peerMessage.trim()
      });
      setPeerMessage('');
      setPeerTargetId('');
      showToast(`Apresiasi untuk ${peer.studentName} berhasil dikirim!`);
    } finally {
      setSendingPeerAppreciation(false);
    }
  };

  const handleSubmitFinalReflection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myStudent) {
      showToast('Tautkan data siswamu di tab Beranda terlebih dahulu untuk mengirim refleksi.');
      return;
    }
    setSavingReflection(true);
    try {
      await saveStudentReflection({
        studentId: myStudent.id,
        studentName: myStudent.name,
        classGroup: myStudent.classGroup,
        primaryDivisionId: myStudent.primaryDivisionId,
        secondaryDivisionId: myStudent.secondaryDivisionId || '',
        whoHelpedMeGrow: whoHelpedMeGrow.trim(),
        whoIHelpedAndHowItFelt: whoIHelpedAndHowItFelt.trim(),
        whenIFeltValued: whenIFeltValued.trim(),
        whatIAmMostGratefulFor: whatIAmMostGratefulFor.trim(),
        whatIWantToImprove: whatIWantToImprove.trim(),
        projectReflectionSummary: projectReflectionSummary.trim(),
        mengalamiCintaNote: mengalamiCintaNote.trim(),
        menghidupiCintaNote: menghidupiCintaNote.trim(),
        meneruskanCintaNote: meneruskanCintaNote.trim(),
        isSubmitted: true
      });
      showToast('Refleksi Tahap 6 berhasil disimpan. Terima kasih atas kejujuran hatimu!');
    } finally {
      setSavingReflection(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center text-xs text-slate-500">
        Memuat ruang belajar dan pendampingan pribadimu...
      </div>
    );
  }

  const headerName = myStudent
    ? myStudent.name
    : user?.displayName || profile?.displayName || 'Siswa Kelas X';
  const headerClass = myStudent ? myStudent.classGroup : onboardClass;
  const headerPrimaryDivId = myStudent ? myStudent.primaryDivisionId : onboardPrimaryDiv;
  const headerSecondaryDivId = myStudent ? myStudent.secondaryDivisionId : onboardSecondaryDiv;
  const headerIsDpk = myStudent ? myStudent.isDpkCommittee : onboardIsDpk;

  const renderUnlinkedNotice = () =>
    !myStudent ? (
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <UserCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <span>
            Akun Google kamu (<strong>{user?.email}</strong>) belum ditautkan dengan data siswa resmi. Tautkan terlebih dahulu di tab <strong>Beranda &amp; Tahap Proses</strong> agar isianmu tersimpan ke profilmu.
          </span>
        </div>
        <button
          type="button"
          onClick={() => setActiveTab('beranda')}
          className="px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold whitespace-nowrap cursor-pointer"
        >
          Tautkan Data Sekarang
        </button>
      </div>
    ) : null;

  return (
    <div className="space-y-6">
      {toast && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Motto & Student Header (Identical in Real Student Login & Admin Simulation Mode) */}
      <div className="bg-emerald-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-white/15 text-amber-200 text-[11px] font-bold">
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>{SCHOOL_MOTTO.full}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Halo, {headerName}
            </h1>
            <p className="text-xs text-emerald-100/90">
              Kelas {headerClass} • Ruang proses pribadimu dalam proyek Symphony of Nusantara
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="px-3 py-1.5 rounded-xl bg-white/15 border border-white/20 font-semibold">
              Utama: {getDivisionById(headerPrimaryDivId)?.shortName}
            </span>
            {headerSecondaryDivId && (
              <span className="px-3 py-1.5 rounded-xl bg-amber-400/20 border border-amber-300/40 text-amber-100 font-semibold">
                Pendukung: {getDivisionById(headerSecondaryDivId)?.shortName}
              </span>
            )}
            {headerIsDpk && (
              <span className="px-3 py-1.5 rounded-xl bg-emerald-500/30 border border-emerald-300/40 font-bold inline-flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" />
                Panitia DPK Kelas X
              </span>
            )}
            {!myStudent && (
              <span className="px-3 py-1.5 rounded-xl bg-amber-500/30 border border-amber-300/50 text-amber-100 font-bold inline-flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5" />
                Belum Tertaut ke Daftar Siswa
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200 shadow-xs flex flex-wrap gap-1.5">
        {(
          [
            { id: 'beranda', label: 'Beranda & Tahap Proses', icon: <Clock className="w-4 h-4" /> },
            { id: 'capaian', label: 'Capaian & Penilaian Diri', icon: <Award className="w-4 h-4" /> },
            {
              id: 'apresiasi',
              label: `Apresiasi (${receivedAppreciations.length})`,
              icon: <HeartHandshake className="w-4 h-4" />
            },
            { id: 'refleksi', label: 'Refleksi Tahap 6', icon: <BookOpen className="w-4 h-4" /> },
            { id: 'jadwal', label: 'Jadwal & 7 Divisi', icon: <Calendar className="w-4 h-4" /> },
            { id: 'panduan', label: 'Panduan Pengisian', icon: <HelpCircle className="w-4 h-4" /> }
          ] as { id: StudentTab; label: string; icon: React.ReactNode }[]
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? 'bg-emerald-800 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: BERANDA & LINIMASA */}
      {activeTab === 'beranda' && (
        <div className="space-y-6">
          {/* Inline Claim / Link Profile Card when logged-in student email is not linked yet */}
          {!myStudent && (
            <form
              onSubmit={handleCompleteOnboarding}
              className="bg-white rounded-2xl p-6 border-2 border-emerald-300 shadow-xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-emerald-100">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                    <UserCheck className="w-4 h-4" />
                    <span>Hubungkan Akun Google ke Data Siswa Resmi (X-1 s/d X-6)</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Pilih kelas dan namamu dari daftar resmi kelas X agar seluruh catatan proses, penilaian diri, dan apresiasimu tersimpan otomatis.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setManualMode((prev) => !prev);
                    setOnboardError(null);
                  }}
                  className="text-xs font-semibold text-emerald-700 hover:underline whitespace-nowrap self-start cursor-pointer"
                >
                  {manualMode
                    ? 'Pilih dari Daftar Resmi X-1..X-6'
                    : 'Namaku belum ada di daftar resmi?'}
                </button>
              </div>

              {onboardError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{onboardError}</span>
                </div>
              )}

              {!manualMode ? (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                  <div className="md:col-span-3">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Kelas *</label>
                    <select
                      value={onboardClass}
                      onChange={(e) => {
                        setOnboardClass(e.target.value as ClassGroup);
                        setRosterSearch('');
                      }}
                      className="w-full px-3 py-2 text-xs font-semibold border border-slate-300 rounded-lg bg-white"
                    >
                      {ALL_CLASSES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-4">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Cari Nama / NISN</label>
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={rosterSearch}
                        onChange={(e) => setRosterSearch(e.target.value)}
                        placeholder={`Filter siswa ${onboardClass}...`}
                        className="w-full pl-8 pr-3 py-2 text-xs border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-5">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nama Siswa Resmi *
                    </label>
                    <select
                      required
                      value={selectedRosterId}
                      onChange={(e) => {
                        const id = e.target.value;
                        setSelectedRosterId(id);
                        const found = OFFICIAL_ROSTER_2026.find((item) => item.id === id);
                        if (found) setOnboardPrimaryDiv(found.primaryDivisionId);
                      }}
                      className="w-full px-3 py-2 text-xs font-semibold border border-slate-300 rounded-lg bg-white"
                    >
                      {rosterStudentsInClass.length === 0 ? (
                        <option value="">Tidak ada nama yang cocok</option>
                      ) : (
                        rosterStudentsInClass.map((entry) => (
                          <option key={entry.id} value={entry.id}>
                            {entry.name} ({entry.nisn})
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Kelas *</label>
                    <select
                      value={onboardClass}
                      onChange={(e) => setOnboardClass(e.target.value as ClassGroup)}
                      className="w-full px-3 py-2 text-xs font-semibold border border-slate-300 rounded-lg bg-white"
                    >
                      {ALL_CLASSES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">NIS / NISN *</label>
                    <input
                      type="text"
                      required={manualMode}
                      value={onboardNisn}
                      onChange={(e) => setOnboardNisn(e.target.value)}
                      placeholder="Contoh: 18999/0118210255"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap *</label>
                    <input
                      type="text"
                      required={manualMode}
                      value={onboardName}
                      onChange={(e) => setOnboardName(e.target.value)}
                      placeholder="Nama sesuai presensi"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-emerald-50/50 border border-emerald-200">
                <div>
                  <label className="block text-xs font-bold text-emerald-950 mb-1">
                    Divisi Utama *
                  </label>
                  <select
                    value={onboardPrimaryDiv}
                    onChange={(e) => setOnboardPrimaryDiv(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-semibold border border-emerald-300 rounded-lg bg-white"
                  >
                    {SEVEN_DPK_DIVISIONS.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Divisi Pendukung (Opsional)
                  </label>
                  <select
                    value={onboardSecondaryDiv}
                    onChange={(e) => setOnboardSecondaryDiv(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="">Hanya 1 divisi</option>
                    {SEVEN_DPK_DIVISIONS.filter((d) => d.id !== onboardPrimaryDiv).map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jenis Kelamin
                  </label>
                  <select
                    value={onboardGender}
                    onChange={(e) => setOnboardGender(e.target.value as typeof onboardGender)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onboardIsDpk}
                    onChange={(e) => setOnboardIsDpk(e.target.checked)}
                  />
                  <span>Saya terdaftar sebagai Panitia DPK Kelas X</span>
                </label>

                <button
                  type="submit"
                  disabled={savingOnboard || (!manualMode && !selectedRosterEntry)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold cursor-pointer disabled:opacity-50"
                >
                  {savingOnboard ? 'Menghubungkan Data...' : 'Tautkan & Aktifkan Ruang Proses Saya'}
                </button>
              </div>
            </form>
          )}

          {/* Division Choice Summary + Motto Box */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-[#032448]">
                  Divisi &amp; Peran Pendampinganmu
                </h2>
                <p className="text-xs text-slate-500 mt-0.5 italic">
                  “{SCHOOL_MOTTO.full}” — Setiap peran, baik di atas panggung maupun di balik layar, sama berharganya bagi tim.
                </p>
              </div>
              {myStudent && appConfig.allowStudentDivisionSelection && !editingDivisions && (
                <button
                  type="button"
                  onClick={() => setEditingDivisions(true)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 cursor-pointer whitespace-nowrap"
                >
                  Ubah Pilihan Divisi
                </button>
              )}
            </div>

            {myStudent && editingDivisions && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Divisi Utama</label>
                  <select
                    value={editPrimaryDiv}
                    onChange={(e) => setEditPrimaryDiv(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                  >
                    {SEVEN_DPK_DIVISIONS.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Divisi Pendukung</label>
                  <select
                    value={editSecondaryDiv}
                    onChange={(e) => setEditSecondaryDiv(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="">Hanya 1 Divisi</option>
                    {SEVEN_DPK_DIVISIONS.filter((d) => d.id !== editPrimaryDiv).map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingDivisions(false)}
                    className="px-3 py-1.5 text-xs text-slate-600"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleUpdateDivisions}
                    className="px-4 py-1.5 rounded-lg bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                  >
                    Simpan Divisi
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 6 Stage Timeline (Shows live logs when linked, or clean stage preview matching Simulation Mode) */}
          <div className="space-y-3">
            {myLogs.length > 0
              ? myLogs.map((log) => (
                  <div key={log.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded bg-emerald-800 text-white text-xs font-bold">
                        {log.stageTitle}
                      </span>
                      <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {log.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 whitespace-pre-line">{log.description}</p>

                    {log.teacherFeedback && (
                      <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950">
                        <strong>Sapaan Pendamping:</strong> {log.teacherFeedback}
                      </div>
                    )}

                    {editingStageId === log.id ? (
                      <div className="space-y-2 pt-2 border-t border-slate-100">
                        <input
                          type="text"
                          value={stageArtifactInput}
                          onChange={(e) => setStageArtifactInput(e.target.value)}
                          placeholder="Link atau catatan karya / tugas yang sudah dikerjakan..."
                          className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                        />
                        <textarea
                          rows={2}
                          value={stageNoteInput}
                          onChange={(e) => setStageNoteInput(e.target.value)}
                          placeholder="Ceritakan pengalamanmu atau kendala pada tahap ini..."
                          className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingStageId(null)}
                            className="px-3 py-1 text-xs text-slate-600"
                          >
                            Batal
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveStageReflection(log.id)}
                            className="px-3 py-1 rounded-lg bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                          >
                            Simpan Catatan
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                        <span className="text-slate-500">
                          {log.studentReflection
                            ? `Catatanku: "${log.studentReflection}"`
                            : 'Belum ada catatanmu di tahap ini.'}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingStageId(log.id);
                            setStageNoteInput(log.studentReflection || '');
                            setStageArtifactInput(log.artifactsNote || '');
                          }}
                          className="font-semibold text-emerald-700 hover:underline cursor-pointer"
                        >
                          Tulis Catatan Proses
                        </button>
                      </div>
                    )}
                  </div>
                ))
              : DEFAULT_PROJECT_STAGES.map((stage) => (
                  <div
                    key={stage.stageNumber}
                    className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded bg-emerald-800 text-white text-xs font-bold">
                        {stage.title}
                      </span>
                      <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {stage.stageNumber === 1 ? 'Sedang Berjalan' : 'Belum Dimulai'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 whitespace-pre-line">{stage.description}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      <span className="text-slate-500">Belum ada catatanmu di tahap ini.</span>
                      <span className="text-slate-400 font-semibold">
                        {!myStudent
                          ? 'Tautkan profil siswa di atas untuk menulis catatan'
                          : 'Menunggu sinkronisasi log'}
                      </span>
                    </div>
                  </div>
                ))}
          </div>
        </div>
      )}

      {/* TAB 2: CAPAIAN PERTUMBUHAN & PENILAIAN DIRI (TANPA ANGKA 1-3!) */}
      {activeTab === 'capaian' && (
        <div className="space-y-6">
          {renderUnlinkedNotice()}

          {/* Homeroom Personal Note */}
          {myHomeroomNote && (
            <div className="bg-white rounded-2xl p-6 border border-indigo-200 shadow-xs space-y-2 text-xs">
              <h3 className="text-sm font-bold text-[#032448]">
                Catatan Pendampingan dari Wali Kelas ({myHomeroomNote.teacherName})
              </h3>
              {myHomeroomNote.attitudeNote && (
                <p className="text-slate-700">
                  <strong>Sikap &amp; Relasi:</strong> {myHomeroomNote.attitudeNote}
                </p>
              )}
              {myHomeroomNote.independenceNote && (
                <p className="text-slate-700">
                  <strong>Kemandirian:</strong> {myHomeroomNote.independenceNote}
                </p>
              )}
              {myHomeroomNote.holisticInvolvementNote && (
                <p className="text-slate-700">
                  <strong>Keterlibatan Utuh:</strong> {myHomeroomNote.holisticInvolvementNote}
                </p>
              )}
            </div>
          )}

          {/* Growth Level & Next Steps per Dimension (NO NUMBERS!) */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
            <div>
              <h2 className="text-base font-bold text-[#032448]">
                Umpan Balik Pertumbuhan &amp; Penilaian Diri (5 Dimensi Holistik)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Penilaian bukan untuk menghakimi, melainkan menemani langkah pertumbuhanmu berikutnya. Kamu juga dapat mengisi penilaian diri sendiri di tiap indikator.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Catatan Singkat Penilaian Diri (opsional sebelum memilih level):
              </label>
              <input
                type="text"
                value={selfNoteInput}
                onChange={(e) => setSelfNoteInput(e.target.value)}
                placeholder="Contoh: Saya sudah berusaha hadir tepat waktu saat latihan divisi..."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>

            <div className="space-y-5">
              {FIVE_HOLISTIC_DIMENSIONS.map((dim) => {
                const dimObservations = myAssessments.filter((a) => a.dimensionId === dim.id);

                return (
                  <div
                    key={dim.id}
                    className="p-5 rounded-2xl border border-slate-200 bg-slate-50/40 space-y-4"
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                        Formasi {dim.formasi} • {dim.stYosefValues}
                      </span>
                      <h3 className="text-base font-extrabold text-[#032448] mt-1">{dim.name}</h3>
                      <p className="text-xs text-slate-600">{dim.rumusan}</p>
                    </div>

                    {/* Teacher observations for this dimension (Qualitative Growth Level + Next Step ONLY) */}
                    {dimObservations.length > 0 && (
                      <div className="space-y-2">
                        {dimObservations.map((obs) => (
                          <div
                            key={obs.id}
                            className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs space-y-1.5"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="font-bold text-[#032448]">
                                {obs.indicatorTitle} ({obs.divisionName} • {obs.projectStage})
                              </span>
                              <span
                                className={`px-2.5 py-0.5 rounded border font-bold text-[11px] ${GROWTH_LEVELS[obs.growthLevel].badgeClass}`}
                              >
                                {obs.growthLevel}
                              </span>
                            </div>
                            <p className="text-slate-700">
                              <strong className="text-emerald-800">Langkah berikutnya:</strong>{' '}
                              {obs.nextStepMessage}
                            </p>
                            {obs.feedback && (
                              <p className="text-slate-600 italic">Catatan pendamping: “{obs.feedback}”</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Student Self-Assessment per indicator */}
                    <div className="space-y-2.5 pt-2 border-t border-slate-200/80">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                        Penilaian Diri Kamu:
                      </p>
                      {dim.indicators.map((ind) => {
                        const mySelf = mySelfAssessments.find(
                          (sa) => sa.indicatorCode === ind.code
                        );
                        return (
                          <div
                            key={ind.code}
                            className="p-3 rounded-xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs"
                          >
                            <div>
                              <span className="font-bold text-slate-900">{ind.title}</span>
                              {ind.stageHint && (
                                <span className="ml-2 text-[10px] text-slate-400">
                                  ({ind.stageHint})
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {GROWTH_LEVEL_ORDER.map((lvl) => {
                                const selected = mySelf?.growthLevel === lvl;
                                return (
                                  <button
                                    key={lvl}
                                    type="button"
                                    onClick={() => handleSelectSelfLevel(ind.code, lvl)}
                                    className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                                      selected
                                        ? `${GROWTH_LEVELS[lvl].badgeClass} ring-1 ring-emerald-600`
                                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                    }`}
                                  >
                                    {lvl}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: APRESIASI (DITERIMA & DIKIRIM KE TEMAN SEDIVISI) */}
      {activeTab === 'apresiasi' && (
        <div className="space-y-6">
          {renderUnlinkedNotice()}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
                <h2 className="text-base font-bold text-[#032448] flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-600" />
                  Apresiasi yang Saya Terima ({receivedAppreciations.length})
                </h2>

                {receivedAppreciations.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4">
                    Belum ada catatan apresiasi masuk. Teruslah berkarya dengan tulus bersama divisimu.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {receivedAppreciations.map((ap) => (
                      <div
                        key={ap.id}
                        className={`p-4 rounded-xl border text-xs space-y-1.5 ${
                          ap.type === 'special_contribution'
                            ? 'bg-amber-50/70 border-amber-300'
                            : ap.type === 'teacher_appreciation'
                            ? 'bg-blue-50/60 border-blue-200'
                            : 'bg-emerald-50/60 border-emerald-200'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-[#032448]">
                            {ap.type === 'teacher_appreciation'
                              ? 'Apresiasi Pendamping / Wali Kelas'
                              : ap.type === 'special_contribution'
                              ? `Kontribusi Khusus: ${ap.badgeTitle || 'DPK / Lintas Divisi'}`
                              : 'Apresiasi Teman Sedivisi'}
                          </span>
                          <span className="text-[11px] text-slate-500">{ap.divisionName}</span>
                        </div>
                        <p className="text-slate-800 leading-relaxed">{ap.message}</p>
                        <p className="text-[11px] font-semibold text-slate-500">
                          Dari: {ap.fromName}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-5 space-y-4">
              <form
                onSubmit={handleSendPeerAppreciation}
                className="bg-white rounded-2xl p-6 border border-emerald-200 shadow-xs space-y-4"
              >
                <div>
                  <h3 className="text-base font-bold text-emerald-950 flex items-center gap-2">
                    <Users className="w-5 h-5 text-emerald-700" />
                    Satu Hal yang Saya Syukuri dari Temanku
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Pilih teman satu divisimu dan tuliskan hal baik yang kamu lihat darinya selama berproses bersama.
                  </p>
                </div>

                {myDivisionPeers.length === 0 ? (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
                    {!myStudent
                      ? 'Daftar rekan satu divisi akan muncul setelah akun Google-mu ditautkan ke data siswa.'
                      : 'Belum ada teman lain terdaftar di divisimu saat ini.'}
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Pilih Teman Satu Divisi *
                      </label>
                      <select
                        required
                        value={peerTargetId}
                        onChange={(e) => setPeerTargetId(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-semibold border border-slate-300 rounded-lg bg-white"
                      >
                        <option value="">-- Pilih rekan divisi --</option>
                        {myDivisionPeers.map((peer) => (
                          <option key={peer.id} value={peer.studentId}>
                            {peer.studentName} ({peer.classGroup}) —{' '}
                            {getDivisionById(peer.divisionId)?.shortName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Pesan Syukur &amp; Apresiasi *
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={peerMessage}
                        onChange={(e) => setPeerMessage(e.target.value)}
                        placeholder="Contoh: Terima kasih sudah sabar mengajariku bagian ritme dan selalu menyemangatiku waktu lelah latihan."
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={sendingPeerAppreciation}
                      className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      <span>{sendingPeerAppreciation ? 'Mengirim...' : 'Kirim Apresiasi untuk Teman'}</span>
                    </button>
                  </>
                )}

                {sentPeerAppreciations.length > 0 && (
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <p className="text-[11px] font-bold text-slate-500">
                      Apresiasi yang Telah Kamu Kirim ({sentPeerAppreciations.length}):
                    </p>
                    {sentPeerAppreciations.map((sp) => (
                      <div key={sp.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                        <span className="font-bold text-[#032448]">Untuk {sp.toStudentName}: </span>
                        <span className="text-slate-700">{sp.message}</span>
                      </div>
                    ))}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: REFLEKSI RELASIONAL TAHAP 6 (DIISI SATU KALI LINTAS DIVISI) */}
      {activeTab === 'refleksi' && (
        <div className="space-y-6">
          {renderUnlinkedNotice()}

          <div className="bg-white rounded-2xl p-6 border border-amber-200 shadow-xs text-center space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-700">
              Motto Refleksi Tahap 6
            </p>
            <h2 className="text-xl font-extrabold text-[#032448] italic">
              “{SCHOOL_MOTTO.full}”
            </h2>
            <p className="text-xs text-slate-600 max-w-2xl mx-auto">
              Refleksi ini diisi <strong>satu kali</strong> sebagai rangkuman perjalanan hatimu di semua divisi yang kamu ikuti selama proyek Symphony of Nusantara.
            </p>
          </div>

          <form
            onSubmit={handleSubmitFinalReflection}
            className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5"
          >
            <h3 className="text-base font-bold text-[#032448]">5 Pertanyaan Refleksi Relasional</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  1. Siapa yang membantu saya bertumbuh selama proyek ini? *
                </label>
                <textarea
                  rows={3}
                  required
                  value={whoHelpedMeGrow}
                  onChange={(e) => setWhoHelpedMeGrow(e.target.value)}
                  placeholder="Sebutkan teman, guru, atau pengalaman bersama siapa yang menguatkanmu..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  2. Siapa yang saya bantu, dan bagaimana rasanya? *
                </label>
                <textarea
                  rows={3}
                  required
                  value={whoIHelpedAndHowItFelt}
                  onChange={(e) => setWhoIHelpedAndHowItFelt(e.target.value)}
                  placeholder="Ceritakan saat kamu menolong atau merangkul temanmu..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  3. Kapan saya merasa dihargai dalam kelompok? *
                </label>
                <textarea
                  rows={3}
                  required
                  value={whenIFeltValued}
                  onChange={(e) => setWhenIFeltValued(e.target.value)}
                  placeholder="Momen ketika pendapat atau kehadiranmu diterima dengan hangat..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  4. Apa yang paling saya syukuri dari proses ini? *
                </label>
                <textarea
                  rows={3}
                  required
                  value={whatIAmMostGratefulFor}
                  onChange={(e) => setWhatIAmMostGratefulFor(e.target.value)}
                  placeholder="Rasa syukurmu atas proses, persahabatan, maupun pentas..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                5. Apa yang ingin saya perbaiki untuk proyek berikutnya? *
              </label>
              <textarea
                rows={2}
                required
                value={whatIWantToImprove}
                onChange={(e) => setWhatIWantToImprove(e.target.value)}
                placeholder="Langkah nyata bertumbuh untuk dirimu ke depan..."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Penghargaan Budaya Nusantara &amp; Evaluasi Karya
              </label>
              <textarea
                rows={2}
                value={projectReflectionSummary}
                onChange={(e) => setProjectReflectionSummary(e.target.value)}
                placeholder="Apa yang berhasil, tantangan teknis, dan cara menjaga identitas budaya karya Nusantara?"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>

            {/* Pemetaan Amor Gignit Amorem Kualitatif */}
            <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                Jurnal Hati: Amor Gignit Amorem
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mengalami Cinta
                  </label>
                  <textarea
                    rows={2}
                    value={mengalamiCintaNote}
                    onChange={(e) => setMengalamiCintaNote(e.target.value)}
                    placeholder="Bagaimana kamu merasakan kasih & penerimaan di tim?"
                    className="w-full px-3 py-2 text-xs border border-amber-200 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Menghidupi Cinta
                  </label>
                  <textarea
                    rows={2}
                    value={menghidupiCintaNote}
                    onChange={(e) => setMenghidupiCintaNote(e.target.value)}
                    placeholder="Pelayanan kecil penuh kasih apa yang kamu lakukan?"
                    className="w-full px-3 py-2 text-xs border border-amber-200 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Meneruskan Cinta
                  </label>
                  <textarea
                    rows={2}
                    value={meneruskanCintaNote}
                    onChange={(e) => setMeneruskanCintaNote(e.target.value)}
                    placeholder="Kebaikan apa yang ingin kamu lanjutkan setelah pentas?"
                    className="w-full px-3 py-2 text-xs border border-amber-200 rounded-lg bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500">
                {myReflection?.isSubmitted
                  ? `Tersimpan terakhir pada ${new Date(myReflection.updatedAt || '').toLocaleDateString('id-ID')}`
                  : 'Belum dikirim'}
              </span>
              <button
                type="submit"
                disabled={savingReflection || !myStudent}
                className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold cursor-pointer disabled:opacity-50"
              >
                {savingReflection
                  ? 'Menyimpan Refleksi...'
                  : myReflection?.isSubmitted
                  ? 'Perbarui Refleksi Tahap 6'
                  : 'Kirim Refleksi Tahap 6'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 5: JADWAL BLOK & 7 DIVISI */}
      {activeTab === 'jadwal' && <ProjectShowcaseOverview role="murid" />}

      {/* TAB 6: PANDUAN PENGISIAN SISWA */}
      {activeTab === 'panduan' && <RoleGuideView portalRole="murid" />}
    </div>
  );
};
