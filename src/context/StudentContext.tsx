import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  fromDbAppConfig,
  fromDbAppreciation,
  fromDbAssessment,
  fromDbHomeroomNote,
  fromDbPeer,
  fromDbProgressLog,
  fromDbReflection,
  fromDbRoleCode,
  fromDbSelfAssessment,
  fromDbStaff,
  fromDbStudent,
  handleDbError,
  supabase,
  toDbAppConfig,
  toDbAppreciation,
  toDbAssessment,
  toDbHomeroomNote,
  toDbPeer,
  toDbProgressLog,
  toDbReflection,
  toDbRoleCode,
  toDbSelfAssessment,
  toDbStaff,
  toDbStudent
} from '../lib/supabase';
import { useAuth } from './AuthContext';
import { OFFICIAL_ROSTER_2026, OfficialRosterEntry } from '../data/roster2026';
import {
  Student,
  DivisionPeer,
  Assessment,
  SelfAssessment,
  StudentReflection,
  Appreciation,
  HomeroomNote,
  ProgressLog,
  ProgressStatus,
  StaffAssignment,
  AppConfig,
  ClassGroup,
  DEFAULT_PROJECT_STAGES,
  GROWTH_LEVELS,
  GrowthLevel,
  IndicatorCode,
  DimensionId,
  ALL_BEHAVIOR_INDICATORS,
  getDivisionById
} from '../types';
import { DEFAULT_APP_CONFIG, getNextStepForIndicator } from '../utils/assessmentUtils';

export interface RoleCodeRecord {
  code: string;
  role: 'admin' | 'pendamping' | 'walikelas';
  label?: string;
  active: boolean;
  updatedAt?: string;
}

interface StudentContextType {
  students: Student[];
  divisionPeers: DivisionPeer[];
  assessments: Assessment[];
  selfAssessments: SelfAssessment[];
  studentReflections: StudentReflection[];
  appreciations: Appreciation[];
  homeroomNotes: HomeroomNote[];
  progressLogs: ProgressLog[];
  staffAssignments: StaffAssignment[];
  roleCodes: RoleCodeRecord[];
  appConfig: AppConfig;
  loading: boolean;
  refreshData: () => Promise<void>;
  selectedClassFilter: ClassGroup | 'ALL';
  setSelectedClassFilter: (cls: ClassGroup | 'ALL') => void;
  selectedDivisionFilter: string | 'ALL';
  setSelectedDivisionFilter: (divId: string | 'ALL') => void;
  // Student CRUD
  addStudent: (data: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  claimOfficialStudent: (params: {
    entry: OfficialRosterEntry;
    gender: 'Laki-laki' | 'Perempuan' | '-';
    primaryDivisionId: string;
    secondaryDivisionId?: string;
    isDpkCommittee?: boolean;
  }) => Promise<void>;
  updateStudent: (id: string, data: Partial<Student>) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  // Assessment CRUD (Pendamping & Admin only)
  saveIndicatorAssessment: (params: {
    student: Student;
    divisionId: string;
    stageNumber: number;
    stageTitle: string;
    indicatorCode: IndicatorCode;
    growthLevel: GrowthLevel;
    feedback?: string;
    date?: string;
  }) => Promise<string>;
  deleteAssessment: (id: string) => Promise<void>;
  // Self Assessment CRUD (Murid)
  saveSelfAssessment: (params: {
    student: Student;
    indicatorCode: IndicatorCode;
    growthLevel: GrowthLevel;
    reflectionNote?: string;
  }) => Promise<void>;
  // Reflection CRUD (Murid, once across all divisions)
  saveStudentReflection: (reflection: Omit<StudentReflection, 'id' | 'updatedAt'>) => Promise<void>;
  // Appreciation CRUD
  addAppreciation: (
    data: Omit<Appreciation, 'id' | 'fromUserId' | 'fromName' | 'fromRole' | 'createdAt' | 'updatedAt'>
  ) => Promise<string>;
  deleteAppreciation: (id: string) => Promise<void>;
  // Homeroom Notes CRUD (Wali Kelas & Admin)
  saveHomeroomNote: (
    data: Omit<HomeroomNote, 'id' | 'teacherId' | 'teacherName' | 'createdAt' | 'updatedAt'>
  ) => Promise<void>;
  // Progress Log CRUD
  updateProgressLog: (id: string, data: Partial<ProgressLog>) => Promise<void>;
  // Admin Config & Staff
  updateAppConfig: (data: Partial<AppConfig>) => Promise<void>;
  saveStaffAssignment: (
    assignment: Omit<StaffAssignment, 'id' | 'assignedBy' | 'createdAt' | 'updatedAt'>
  ) => Promise<void>;
  deleteStaffAssignment: (emailKey: string) => Promise<void>;
  saveRoleCode: (record: RoleCodeRecord) => Promise<void>;
  deleteRoleCode: (code: string) => Promise<void>;
  // Quick helper getters
  getStudentAssessments: (studentId: string) => Assessment[];
  getStudentSelfAssessments: (studentId: string) => SelfAssessment[];
  getStudentReflection: (studentId: string) => StudentReflection | undefined;
  getStudentAppreciations: (studentId: string) => Appreciation[];
  getStudentHomeroomNote: (studentId: string) => HomeroomNote | undefined;
  getStudentProgressLogs: (studentId: string) => ProgressLog[];
  importOfficialRoster2026: (targetClass?: ClassGroup) => Promise<{ added: number; skipped: number }>;
  isImportingRoster: boolean;
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

async function fetchAllRows(table: string, orderBy?: { column: string; ascending: boolean }) {
  if (!supabase) return [];
  const PAGE_SIZE = 1000;
  let from = 0;
  const allRows: Record<string, any>[] = [];

  while (true) {
    let query = supabase.from(table).select('*').range(from, from + PAGE_SIZE - 1);
    if (orderBy) {
      query = query.order(orderBy.column, { ascending: orderBy.ascending });
    }
    const { data, error } = await query;
    if (error) {
      handleDbError(error, 'select', table);
    }
    if (!data || data.length === 0) break;
    allRows.push(...data);
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  return allRows;
}

export const StudentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, realRole, activeRole, previewDivisionId, previewClassGroup, updateProfileData } =
    useAuth();

  const [rawStudents, setRawStudents] = useState<Student[]>([]);
  const [rawPeers, setRawPeers] = useState<DivisionPeer[]>([]);
  const [rawAssessments, setRawAssessments] = useState<Assessment[]>([]);
  const [rawSelfAssessments, setRawSelfAssessments] = useState<SelfAssessment[]>([]);
  const [rawReflections, setRawReflections] = useState<StudentReflection[]>([]);
  const [rawAppreciations, setRawAppreciations] = useState<Appreciation[]>([]);
  const [rawHomeroomNotes, setRawHomeroomNotes] = useState<HomeroomNote[]>([]);
  const [rawProgressLogs, setRawProgressLogs] = useState<ProgressLog[]>([]);
  const [staffAssignments, setStaffAssignments] = useState<StaffAssignment[]>([]);
  const [roleCodes, setRoleCodes] = useState<RoleCodeRecord[]>([]);
  const [appConfig, setAppConfig] = useState<AppConfig>(DEFAULT_APP_CONFIG);

  const [loading, setLoading] = useState<boolean>(true);
  const [dataReady, setDataReady] = useState<boolean>(false);
  const [isImportingRoster, setIsImportingRoster] = useState<boolean>(false);
  const autoImportedRef = useRef<boolean>(false);
  const [selectedClassFilter, setSelectedClassFilter] = useState<ClassGroup | 'ALL'>('ALL');
  const [selectedDivisionFilter, setSelectedDivisionFilter] = useState<string | 'ALL'>('ALL');

  const userEmailLower = (user?.email || '').trim().toLowerCase();

  // Supabase RLS automatically enforces strict role-based row isolation on every SELECT.
  const refreshData = useCallback(async () => {
    if (!user || !profile || !supabase) {
      setRawStudents([]);
      setRawPeers([]);
      setRawAssessments([]);
      setRawSelfAssessments([]);
      setRawReflections([]);
      setRawAppreciations([]);
      setRawHomeroomNotes([]);
      setRawProgressLogs([]);
      setStaffAssignments([]);
      setRoleCodes([]);
      setLoading(false);
      return;
    }

    try {
      const [
        configRes,
        studentRows,
        peerRows,
        assessmentRows,
        selfRows,
        reflectionRows,
        appreciationRows,
        homeroomRows,
        progressRows
      ] = await Promise.all([
        supabase.from('app_config').select('*').eq('id', 'default').maybeSingle(),
        fetchAllRows('students', { column: 'name', ascending: true }),
        fetchAllRows('division_peers', { column: 'student_name', ascending: true }),
        fetchAllRows('assessments', { column: 'created_at', ascending: false }),
        fetchAllRows('self_assessments'),
        fetchAllRows('student_reflections'),
        fetchAllRows('appreciations', { column: 'created_at', ascending: false }),
        fetchAllRows('homeroom_notes'),
        fetchAllRows('progress_logs', { column: 'stage_number', ascending: true })
      ]);

      if (!configRes.error && configRes.data) {
        setAppConfig(fromDbAppConfig(configRes.data));
      }

      const mappedStudents = studentRows.map(fromDbStudent);
      setRawStudents(mappedStudents);
      setRawPeers(peerRows.map(fromDbPeer));
      setRawAssessments(assessmentRows.map(fromDbAssessment));
      setRawSelfAssessments(selfRows.map(fromDbSelfAssessment));
      setRawReflections(reflectionRows.map(fromDbReflection));
      setRawAppreciations(appreciationRows.map(fromDbAppreciation));
      setRawHomeroomNotes(homeroomRows.map(fromDbHomeroomNote));
      setRawProgressLogs(progressRows.map(fromDbProgressLog));

      if (realRole === 'admin') {
        const [staffRows, codeRows] = await Promise.all([
          fetchAllRows('staff_assignments', { column: 'display_name', ascending: true }),
          fetchAllRows('role_codes')
        ]);
        setStaffAssignments(staffRows.map(fromDbStaff));
        setRoleCodes(codeRows.map(fromDbRoleCode));
      } else {
        setStaffAssignments([]);
        setRoleCodes([]);
      }

      // Auto-sync profile pointers for student account if student record already exists by email
      if (realRole === 'murid' && mappedStudents[0]) {
        const me = mappedStudents[0];
        const needsSync =
          profile.studentId !== me.id ||
          profile.assignedDivisionId !== me.primaryDivisionId ||
          (profile.secondaryDivisionId || '') !== (me.secondaryDivisionId || '') ||
          profile.classGroup !== me.classGroup;

        if (needsSync) {
          await updateProfileData({
            studentId: me.id,
            assignedDivisionId: me.primaryDivisionId,
            secondaryDivisionId: me.secondaryDivisionId || '',
            classGroup: me.classGroup
          }).catch(() => {});
        }
      }

      setDataReady(true);
    } catch (err) {
      console.error('Failed to load Supabase data:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.uid, realRole, profile?.studentId, profile?.assignedDivisionId, profile?.assignedClassGroup]);

  useEffect(() => {
    setLoading(true);
    refreshData();
  }, [refreshData]);

  // Optional non-blocking Realtime listener so multi-user updates reflect automatically when enabled
  useEffect(() => {
    if (!user || !profile || !supabase) return;

    let timer: ReturnType<typeof setTimeout> | null = null;
    const scheduleRefresh = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        refreshData();
      }, 600);
    };

    const channel = supabase
      .channel(`son-changes-${user.uid}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'students' }, scheduleRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'assessments' }, scheduleRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'self_assessments' }, scheduleRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'student_reflections' }, scheduleRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appreciations' }, scheduleRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'homeroom_notes' }, scheduleRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'progress_logs' }, scheduleRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'app_config' }, scheduleRefresh)
      .subscribe();

    return () => {
      if (timer) clearTimeout(timer);
      supabase?.removeChannel(channel);
    };
  }, [user?.uid, profile?.role, refreshData]);

  // Apply Admin preview scoping seamlessly without affecting Admin DB rights
  const scopedView = useMemo(() => {
    if (realRole !== 'admin' || activeRole === 'admin') {
      return {
        students: rawStudents,
        divisionPeers: rawPeers,
        assessments: rawAssessments,
        selfAssessments: rawSelfAssessments,
        studentReflections: rawReflections,
        appreciations: rawAppreciations,
        homeroomNotes: rawHomeroomNotes,
        progressLogs: rawProgressLogs
      };
    }

    if (activeRole === 'pendamping') {
      const divStudents = rawStudents.filter(
        (s) => s.primaryDivisionId === previewDivisionId || s.secondaryDivisionId === previewDivisionId
      );
      const ids = new Set(divStudents.map((s) => s.id));
      return {
        students: divStudents,
        divisionPeers: rawPeers.filter((p) => p.divisionId === previewDivisionId),
        assessments: rawAssessments.filter((a) => a.divisionId === previewDivisionId),
        selfAssessments: rawSelfAssessments.filter((sa) => ids.has(sa.studentId)),
        studentReflections: rawReflections.filter((r) => ids.has(r.studentId)),
        appreciations: rawAppreciations.filter((ap) => ap.divisionId === previewDivisionId),
        homeroomNotes: [],
        progressLogs: rawProgressLogs.filter((l) => ids.has(l.studentId))
      };
    }

    if (activeRole === 'walikelas') {
      const clsStudents = rawStudents.filter((s) => s.classGroup === previewClassGroup);
      const ids = new Set(clsStudents.map((s) => s.id));
      return {
        students: clsStudents,
        divisionPeers: rawPeers,
        assessments: rawAssessments.filter((a) => a.classGroup === previewClassGroup),
        selfAssessments: rawSelfAssessments.filter((sa) => ids.has(sa.studentId)),
        studentReflections: rawReflections.filter((r) => ids.has(r.studentId)),
        appreciations: rawAppreciations.filter((ap) => ap.toClassGroup === previewClassGroup),
        homeroomNotes: rawHomeroomNotes.filter((h) => h.classGroup === previewClassGroup),
        progressLogs: rawProgressLogs.filter((l) => ids.has(l.studentId))
      };
    }

    // Previewing Murid
    const sampleStudent =
      rawStudents.find((s) => s.email.toLowerCase() === userEmailLower) || rawStudents[0];
    if (!sampleStudent) {
      return {
        students: [],
        divisionPeers: [],
        assessments: [],
        selfAssessments: [],
        studentReflections: [],
        appreciations: [],
        homeroomNotes: [],
        progressLogs: []
      };
    }
    return {
      students: [sampleStudent],
      divisionPeers: rawPeers.filter(
        (p) =>
          p.divisionId === sampleStudent.primaryDivisionId ||
          (sampleStudent.secondaryDivisionId && p.divisionId === sampleStudent.secondaryDivisionId)
      ),
      assessments: rawAssessments.filter((a) => a.studentId === sampleStudent.id),
      selfAssessments: rawSelfAssessments.filter((sa) => sa.studentId === sampleStudent.id),
      studentReflections: rawReflections.filter((r) => r.studentId === sampleStudent.id),
      appreciations: rawAppreciations.filter((ap) => ap.toStudentId === sampleStudent.id),
      homeroomNotes: rawHomeroomNotes.filter((h) => h.studentId === sampleStudent.id),
      progressLogs: rawProgressLogs.filter((l) => l.studentId === sampleStudent.id)
    };
  }, [
    realRole,
    activeRole,
    previewDivisionId,
    previewClassGroup,
    rawStudents,
    rawPeers,
    rawAssessments,
    rawSelfAssessments,
    rawReflections,
    rawAppreciations,
    rawHomeroomNotes,
    rawProgressLogs,
    userEmailLower
  ]);

  // Helper: sync division_peers for a student
  const syncDivisionPeers = async (student: Student, previous?: Student) => {
    if (!supabase) return;

    const upserts: DivisionPeer[] = [
      {
        id: `${student.primaryDivisionId}_${student.id}`,
        studentId: student.id,
        studentName: student.name,
        classGroup: student.classGroup,
        divisionId: student.primaryDivisionId,
        divisionRole: 'utama',
        isDpkCommittee: Boolean(student.isDpkCommittee)
      }
    ];

    if (student.secondaryDivisionId) {
      upserts.push({
        id: `${student.secondaryDivisionId}_${student.id}`,
        studentId: student.id,
        studentName: student.name,
        classGroup: student.classGroup,
        divisionId: student.secondaryDivisionId,
        divisionRole: 'pendukung',
        isDpkCommittee: Boolean(student.isDpkCommittee)
      });
    }

    const { error: upsertErr } = await supabase
      .from('division_peers')
      .upsert(upserts.map(toDbPeer), { onConflict: 'id' });
    if (upsertErr) {
      console.warn('Peer sync warning:', upsertErr.message);
    }

    const toDeleteIds: string[] = [];
    if (previous && previous.primaryDivisionId !== student.primaryDivisionId) {
      toDeleteIds.push(`${previous.primaryDivisionId}_${student.id}`);
    }
    if (previous?.secondaryDivisionId && previous.secondaryDivisionId !== student.secondaryDivisionId) {
      toDeleteIds.push(`${previous.secondaryDivisionId}_${student.id}`);
    }
    if (toDeleteIds.length > 0) {
      await supabase.from('division_peers').delete().in('id', toDeleteIds);
    }

    setRawPeers((prev) => {
      const deletedSet = new Set(toDeleteIds);
      const map = new Map(prev.filter((p) => !deletedSet.has(p.id)).map((p) => [p.id, p]));
      upserts.forEach((p) => map.set(p.id, p));
      return Array.from(map.values()).sort((a, b) => a.studentName.localeCompare(b.studentName));
    });
  };

  // Student CRUD
  const addStudent: StudentContextType['addStudent'] = async (data) => {
    if (!supabase) throw new Error('Supabase belum terkonfigurasi.');
    const studentId = `std_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const newStudent: Student = {
      ...data,
      email: (data.email || '').trim().toLowerCase(),
      secondaryDivisionId: data.secondaryDivisionId || '',
      id: studentId,
      createdBy: user?.uid || 'anon',
      createdAt: now,
      updatedAt: now
    };

    try {
      const { error: insertErr } = await supabase.from('students').insert(toDbStudent(newStudent));
      if (insertErr) handleDbError(insertErr, 'insert', 'students');

      setRawStudents((prev) => [...prev, newStudent].sort((a, b) => a.name.localeCompare(b.name)));

      if (realRole === 'murid') {
        await updateProfileData({
          studentId,
          assignedDivisionId: newStudent.primaryDivisionId,
          secondaryDivisionId: newStudent.secondaryDivisionId || '',
          classGroup: newStudent.classGroup
        });
      }

      await syncDivisionPeers(newStudent);

      const milestoneDate = new Date().toLocaleDateString('id-ID');
      const baselineLogs: ProgressLog[] = DEFAULT_PROJECT_STAGES.map((stage) => ({
        id: `log_${studentId}_s${stage.stageNumber}`,
        studentId,
        studentName: newStudent.name,
        classGroup: newStudent.classGroup,
        primaryDivisionId: newStudent.primaryDivisionId,
        secondaryDivisionId: newStudent.secondaryDivisionId || '',
        stageTitle: stage.title,
        stageNumber: stage.stageNumber,
        description: stage.description,
        status: (stage.stageNumber === 1 ? 'Sedang Berjalan' : 'Belum Dimulai') as ProgressStatus,
        milestoneDate,
        createdAt: now,
        updatedAt: now
      }));

      const { error: logsErr } = await supabase
        .from('progress_logs')
        .upsert(baselineLogs.map(toDbProgressLog), { onConflict: 'id' });
      if (logsErr) handleDbError(logsErr, 'insert', 'progress_logs');

      setRawProgressLogs((prev) => [...prev, ...baselineLogs].sort((a, b) => a.stageNumber - b.stageNumber));

      return studentId;
    } catch (error) {
      handleDbError(error, 'create', `students/${studentId}`);
    }
  };

  const claimOfficialStudent: StudentContextType['claimOfficialStudent'] = async ({
    entry,
    gender,
    primaryDivisionId,
    secondaryDivisionId,
    isDpkCommittee
  }) => {
    if (!user || !userEmailLower || !supabase) {
      throw new Error('Silakan masuk dengan akun Google terlebih dahulu.');
    }

    const now = new Date().toISOString();
    const milestoneDate = new Date().toLocaleDateString('id-ID');
    const normalizedSecondary = secondaryDivisionId ? secondaryDivisionId.trim() : '';

    try {
      // 1. Update user profile first so PostgreSQL my_student_id() matches entry.id
      await updateProfileData({
        studentId: entry.id,
        assignedDivisionId: primaryDivisionId,
        secondaryDivisionId: normalizedSecondary,
        classGroup: entry.classGroup,
        nisn: entry.nisn
      });

      // 2. Claim pre-imported roster record (or insert if admin hasn't synced roster yet)
      const { data: updatedRows, error: updErr } = await supabase
        .from('students')
        .update(
          toDbStudent({
            email: userEmailLower,
            gender,
            primaryDivisionId,
            secondaryDivisionId: normalizedSecondary,
            isDpkCommittee: Boolean(isDpkCommittee),
            updatedAt: now
          })
        )
        .eq('id', entry.id)
        .select('*');

      if (updErr) {
        handleDbError(updErr, 'update', `students/${entry.id}`);
      }

      let finalStudent: Student;
      if (!updatedRows || updatedRows.length === 0) {
        finalStudent = {
          id: entry.id,
          nisn: entry.nisn,
          name: entry.name,
          classGroup: entry.classGroup,
          email: userEmailLower,
          gender,
          primaryDivisionId,
          secondaryDivisionId: normalizedSecondary,
          isDpkCommittee: Boolean(isDpkCommittee),
          status: 'Aktif',
          createdBy: user.uid,
          createdAt: now,
          updatedAt: now
        };
        const { error: insErr } = await supabase.from('students').insert(toDbStudent(finalStudent));
        if (insErr) handleDbError(insErr, 'insert', `students/${entry.id}`);

        const baselineLogs: ProgressLog[] = DEFAULT_PROJECT_STAGES.map((stage) => ({
          id: `log_${entry.id}_s${stage.stageNumber}`,
          studentId: entry.id,
          studentName: entry.name,
          classGroup: entry.classGroup,
          primaryDivisionId,
          secondaryDivisionId: normalizedSecondary,
          stageTitle: stage.title,
          stageNumber: stage.stageNumber,
          description: stage.description,
          status: (stage.stageNumber === 1 ? 'Sedang Berjalan' : 'Belum Dimulai') as ProgressStatus,
          milestoneDate,
          createdAt: now,
          updatedAt: now
        }));
        const { error: logsErr } = await supabase
          .from('progress_logs')
          .upsert(baselineLogs.map(toDbProgressLog), { onConflict: 'id' });
        if (logsErr) handleDbError(logsErr, 'insert', 'progress_logs');
        setRawProgressLogs(baselineLogs);
      } else {
        finalStudent = fromDbStudent(updatedRows[0]);
        // Keep student's progressLogs synced with updated division IDs
        await supabase
          .from('progress_logs')
          .update({
            primary_division_id: primaryDivisionId,
            secondary_division_id: normalizedSecondary,
            updated_at: now
          })
          .eq('student_id', entry.id);
      }

      setRawStudents([finalStudent]);

      // 3. Keep PII-free divisionPeers directory synchronized
      await syncDivisionPeers(
        finalStudent,
        primaryDivisionId !== entry.primaryDivisionId
          ? { ...finalStudent, primaryDivisionId: entry.primaryDivisionId }
          : undefined
      );

      await refreshData();
    } catch (error) {
      handleDbError(error, 'write', `students/${entry.id}`);
    }
  };

  const updateStudent: StudentContextType['updateStudent'] = async (id, data) => {
    if (!supabase) return;
    try {
      const existing = rawStudents.find((s) => s.id === id);
      const hasSecondaryKey = Object.prototype.hasOwnProperty.call(data, 'secondaryDivisionId');
      const now = new Date().toISOString();
      const patch: Partial<Student> = {
        ...data,
        ...(hasSecondaryKey ? { secondaryDivisionId: data.secondaryDivisionId || '' } : {}),
        ...(data.email !== undefined ? { email: data.email.trim().toLowerCase() } : {}),
        updatedAt: now
      };

      const { data: savedRow, error } = await supabase
        .from('students')
        .update(toDbStudent(patch))
        .eq('id', id)
        .select('*')
        .single();

      if (error) handleDbError(error, 'update', `students/${id}`);
      const merged = fromDbStudent(savedRow);

      setRawStudents((prev) =>
        prev.map((s) => (s.id === id ? merged : s)).sort((a, b) => a.name.localeCompare(b.name))
      );

      if (realRole === 'murid') {
        await updateProfileData({
          assignedDivisionId: merged.primaryDivisionId,
          secondaryDivisionId: merged.secondaryDivisionId || '',
          classGroup: merged.classGroup
        });
      }

      await syncDivisionPeers(merged, existing);

      if (data.primaryDivisionId !== undefined || hasSecondaryKey) {
        const { error: logErr } = await supabase
          .from('progress_logs')
          .update({
            primary_division_id: merged.primaryDivisionId,
            secondary_division_id: merged.secondaryDivisionId || '',
            updated_at: now
          })
          .eq('student_id', id);

        if (!logErr) {
          setRawProgressLogs((prev) =>
            prev.map((l) =>
              l.studentId === id
                ? {
                    ...l,
                    primaryDivisionId: merged.primaryDivisionId,
                    secondaryDivisionId: merged.secondaryDivisionId || '',
                    updatedAt: now
                  }
                : l
            )
          );
        }
      }
    } catch (error) {
      handleDbError(error, 'update', `students/${id}`);
    }
  };

  const deleteStudent: StudentContextType['deleteStudent'] = async (id) => {
    if (!supabase) return;
    try {
      const existing = rawStudents.find((s) => s.id === id);
      const { error } = await supabase.from('students').delete().eq('id', id);
      if (error) handleDbError(error, 'delete', `students/${id}`);

      setRawStudents((prev) => prev.filter((s) => s.id !== id));

      if (existing) {
        const peerIds = [`${existing.primaryDivisionId}_${id}`];
        if (existing.secondaryDivisionId) peerIds.push(`${existing.secondaryDivisionId}_${id}`);
        await supabase.from('division_peers').delete().in('id', peerIds);
        setRawPeers((prev) => prev.filter((p) => !peerIds.includes(p.id)));
      }
    } catch (error) {
      handleDbError(error, 'delete', `students/${id}`);
    }
  };

  // Assessment upsert (deterministic per student + division + stage + indicator)
  const saveIndicatorAssessment: StudentContextType['saveIndicatorAssessment'] = async ({
    student,
    divisionId,
    stageNumber,
    stageTitle,
    indicatorCode,
    growthLevel,
    feedback,
    date
  }) => {
    if (!supabase) throw new Error('Supabase belum terkonfigurasi.');
    const indMeta = ALL_BEHAVIOR_INDICATORS.find((ind) => ind.code === indicatorCode);
    if (!indMeta) throw new Error(`Indikator ${indicatorCode} tidak ditemukan.`);

    const divisionName = getDivisionById(divisionId)?.shortName || divisionId;
    const assessmentId = `asm_${student.id}_${divisionId}_s${stageNumber}_${indicatorCode}`;
    const levelCfg = GROWTH_LEVELS[growthLevel];
    const now = new Date().toISOString();

    const payload: Assessment = {
      id: assessmentId,
      studentId: student.id,
      studentName: student.name,
      classGroup: student.classGroup,
      divisionId,
      divisionName,
      projectStage: stageTitle,
      stageNumber,
      dimensionId: indMeta.dimensionId as DimensionId,
      dimensionName: indMeta.dimensionName,
      formasiGrandDesain: indMeta.formasi,
      indicatorCode,
      indicatorTitle: indMeta.title,
      growthLevel,
      internalScore: levelCfg.internalScore,
      nextStepMessage: getNextStepForIndicator(indicatorCode, growthLevel),
      feedback: feedback?.trim() || undefined,
      teacherId: user?.uid || 'teacher',
      teacherName: profile?.displayName || user?.displayName || 'Pendamping Divisi',
      date: date || now.split('T')[0],
      createdAt: now,
      updatedAt: now
    };

    try {
      const { data: savedRow, error } = await supabase
        .from('assessments')
        .upsert(toDbAssessment(payload), { onConflict: 'id' })
        .select('*')
        .single();
      if (error) handleDbError(error, 'upsert', `assessments/${assessmentId}`);

      const saved = fromDbAssessment(savedRow);
      setRawAssessments((prev) => {
        const filtered = prev.filter((a) => a.id !== saved.id);
        return [saved, ...filtered];
      });
      return assessmentId;
    } catch (error) {
      handleDbError(error, 'write', `assessments/${assessmentId}`);
    }
  };

  const deleteAssessment = async (id: string): Promise<void> => {
    if (!supabase) return;
    try {
      const { error } = await supabase.from('assessments').delete().eq('id', id);
      if (error) handleDbError(error, 'delete', `assessments/${id}`);
      setRawAssessments((prev) => prev.filter((a) => a.id !== id));
    } catch (error) {
      handleDbError(error, 'delete', `assessments/${id}`);
    }
  };

  // Self Assessment upsert
  const saveSelfAssessment: StudentContextType['saveSelfAssessment'] = async ({
    student,
    indicatorCode,
    growthLevel,
    reflectionNote
  }) => {
    if (!supabase) return;
    const indMeta = ALL_BEHAVIOR_INDICATORS.find((ind) => ind.code === indicatorCode);
    if (!indMeta) throw new Error(`Indikator ${indicatorCode} tidak ditemukan.`);

    const saId = `sa_${student.id}_${indicatorCode}`;
    const now = new Date().toISOString();
    const payload: SelfAssessment = {
      id: saId,
      studentId: student.id,
      studentName: student.name,
      classGroup: student.classGroup,
      primaryDivisionId: student.primaryDivisionId,
      secondaryDivisionId: student.secondaryDivisionId || '',
      dimensionId: indMeta.dimensionId,
      dimensionName: indMeta.dimensionName,
      indicatorCode,
      indicatorTitle: indMeta.title,
      growthLevel,
      reflectionNote: reflectionNote?.trim() || undefined,
      createdAt: now,
      updatedAt: now
    };

    try {
      const { data: savedRow, error } = await supabase
        .from('self_assessments')
        .upsert(toDbSelfAssessment(payload), { onConflict: 'id' })
        .select('*')
        .single();
      if (error) handleDbError(error, 'upsert', `self_assessments/${saId}`);
      const saved = fromDbSelfAssessment(savedRow);
      setRawSelfAssessments((prev) => [saved, ...prev.filter((sa) => sa.id !== saved.id)]);
    } catch (error) {
      handleDbError(error, 'write', `self_assessments/${saId}`);
    }
  };

  // One-time Stage 6 Student Reflection
  const saveStudentReflection: StudentContextType['saveStudentReflection'] = async (reflection) => {
    if (!supabase) return;
    const refId = reflection.studentId;
    const now = new Date().toISOString();
    const payload: StudentReflection = {
      ...reflection,
      id: refId,
      submittedAt: reflection.isSubmitted ? reflection.submittedAt || now : reflection.submittedAt,
      updatedAt: now
    };

    try {
      const { data: savedRow, error } = await supabase
        .from('student_reflections')
        .upsert(toDbReflection(payload), { onConflict: 'id' })
        .select('*')
        .single();
      if (error) handleDbError(error, 'upsert', `student_reflections/${refId}`);
      const saved = fromDbReflection(savedRow);
      setRawReflections((prev) => [saved, ...prev.filter((r) => r.id !== saved.id)]);
    } catch (error) {
      handleDbError(error, 'write', `student_reflections/${refId}`);
    }
  };

  // Appreciation CRUD
  const addAppreciation: StudentContextType['addAppreciation'] = async (data) => {
    if (!supabase) throw new Error('Supabase belum terkonfigurasi.');
    const appId = `apr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const payload: Appreciation = {
      ...data,
      id: appId,
      fromUserId: user?.uid || 'user',
      fromName: profile?.displayName || user?.displayName || 'Warga Sekolah',
      fromRole: realRole,
      createdAt: now,
      updatedAt: now
    };

    try {
      const { data: savedRow, error } = await supabase
        .from('appreciations')
        .insert(toDbAppreciation(payload))
        .select('*')
        .single();
      if (error) handleDbError(error, 'insert', `appreciations/${appId}`);
      const saved = fromDbAppreciation(savedRow);
      setRawAppreciations((prev) => [saved, ...prev]);
      return appId;
    } catch (error) {
      handleDbError(error, 'create', `appreciations/${appId}`);
    }
  };

  const deleteAppreciation = async (id: string): Promise<void> => {
    if (!supabase) return;
    try {
      const { error } = await supabase.from('appreciations').delete().eq('id', id);
      if (error) handleDbError(error, 'delete', `appreciations/${id}`);
      setRawAppreciations((prev) => prev.filter((a) => a.id !== id));
    } catch (error) {
      handleDbError(error, 'delete', `appreciations/${id}`);
    }
  };

  // Homeroom Notes CRUD
  const saveHomeroomNote: StudentContextType['saveHomeroomNote'] = async (data) => {
    if (!supabase) return;
    const noteId = `hr_${data.studentId}`;
    const now = new Date().toISOString();
    const payload: HomeroomNote = {
      ...data,
      id: noteId,
      teacherId: user?.uid || 'walikelas',
      teacherName: profile?.displayName || user?.displayName || 'Wali Kelas',
      createdAt: now,
      updatedAt: now
    };

    try {
      const { data: savedRow, error } = await supabase
        .from('homeroom_notes')
        .upsert(toDbHomeroomNote(payload), { onConflict: 'id' })
        .select('*')
        .single();
      if (error) handleDbError(error, 'upsert', `homeroom_notes/${noteId}`);
      const saved = fromDbHomeroomNote(savedRow);
      setRawHomeroomNotes((prev) => [saved, ...prev.filter((h) => h.id !== saved.id)]);
    } catch (error) {
      handleDbError(error, 'write', `homeroom_notes/${noteId}`);
    }
  };

  // Progress Log CRUD
  const updateProgressLog = async (id: string, data: Partial<ProgressLog>): Promise<void> => {
    if (!supabase) return;
    try {
      const now = new Date().toISOString();
      const dbPatch = toDbProgressLog({
        ...data,
        updatedBy: profile?.displayName || user?.displayName || 'Pendamping',
        updatedAt: now
      });
      const { data: savedRow, error } = await supabase
        .from('progress_logs')
        .update(dbPatch)
        .eq('id', id)
        .select('*')
        .single();
      if (error) handleDbError(error, 'update', `progress_logs/${id}`);
      const saved = fromDbProgressLog(savedRow);
      setRawProgressLogs((prev) =>
        prev.map((l) => (l.id === id ? saved : l)).sort((a, b) => a.stageNumber - b.stageNumber)
      );
    } catch (error) {
      handleDbError(error, 'update', `progress_logs/${id}`);
    }
  };

  // Admin Config & Staff
  const updateAppConfig = async (data: Partial<AppConfig>): Promise<void> => {
    if (!supabase) return;
    try {
      const merged: AppConfig = {
        ...appConfig,
        ...data,
        id: 'default',
        updatedBy: userEmailLower,
        updatedAt: new Date().toISOString()
      };
      const { data: savedRow, error } = await supabase
        .from('app_config')
        .upsert(toDbAppConfig(merged), { onConflict: 'id' })
        .select('*')
        .single();
      if (error) handleDbError(error, 'upsert', 'app_config/default');
      setAppConfig(fromDbAppConfig(savedRow));
    } catch (error) {
      handleDbError(error, 'write', 'app_config/default');
    }
  };

  const saveStaffAssignment: StudentContextType['saveStaffAssignment'] = async (assignment) => {
    if (!supabase) return;
    const emailKey = assignment.email.trim().toLowerCase();
    const now = new Date().toISOString();
    const payload: StaffAssignment = {
      ...assignment,
      id: emailKey,
      email: emailKey,
      assignedBy: userEmailLower,
      createdAt: now,
      updatedAt: now
    };
    try {
      const { data: savedRow, error } = await supabase
        .from('staff_assignments')
        .upsert(toDbStaff(payload), { onConflict: 'id' })
        .select('*')
        .single();
      if (error) handleDbError(error, 'upsert', `staff_assignments/${emailKey}`);
      const saved = fromDbStaff(savedRow);
      setStaffAssignments((prev) =>
        [...prev.filter((s) => s.id !== saved.id), saved].sort((a, b) =>
          a.displayName.localeCompare(b.displayName)
        )
      );
    } catch (error) {
      handleDbError(error, 'write', `staff_assignments/${emailKey}`);
    }
  };

  const deleteStaffAssignment = async (emailKey: string): Promise<void> => {
    if (!supabase) return;
    try {
      const { error } = await supabase.from('staff_assignments').delete().eq('id', emailKey);
      if (error) handleDbError(error, 'delete', `staff_assignments/${emailKey}`);
      setStaffAssignments((prev) => prev.filter((s) => s.id !== emailKey));
    } catch (error) {
      handleDbError(error, 'delete', `staff_assignments/${emailKey}`);
    }
  };

  const saveRoleCode = async (record: RoleCodeRecord): Promise<void> => {
    if (!supabase) return;
    const codeKey = record.code.trim().toUpperCase();
    const payload: RoleCodeRecord = {
      ...record,
      code: codeKey,
      updatedAt: new Date().toISOString()
    };
    try {
      const { data: savedRow, error } = await supabase
        .from('role_codes')
        .upsert(toDbRoleCode(payload), { onConflict: 'code' })
        .select('*')
        .single();
      if (error) handleDbError(error, 'upsert', `role_codes/${codeKey}`);
      const saved = fromDbRoleCode(savedRow);
      setRoleCodes((prev) => [...prev.filter((r) => r.code !== saved.code), saved]);
    } catch (error) {
      handleDbError(error, 'write', `role_codes/${codeKey}`);
    }
  };

  const deleteRoleCode = async (code: string): Promise<void> => {
    if (!supabase) return;
    try {
      const { error } = await supabase.from('role_codes').delete().eq('code', code);
      if (error) handleDbError(error, 'delete', `role_codes/${code}`);
      setRoleCodes((prev) => prev.filter((r) => r.code !== code));
    } catch (error) {
      handleDbError(error, 'delete', `role_codes/${code}`);
    }
  };

  // Idempotent batch importer for all 205 official Class X-1..X-6 students from 2026 PDFs
  const importOfficialRoster2026 = async (
    targetClass?: ClassGroup
  ): Promise<{ added: number; skipped: number }> => {
    if (realRole !== 'admin') {
      throw new Error('Hanya Koordinator / Admin yang dapat mengimpor daftar siswa resmi.');
    }
    if (!supabase) {
      throw new Error('Supabase belum terkonfigurasi.');
    }

    setIsImportingRoster(true);
    try {
      const entries = targetClass
        ? OFFICIAL_ROSTER_2026.filter((e) => e.classGroup === targetClass)
        : OFFICIAL_ROSTER_2026;

      const existingIds = new Set(rawStudents.map((s) => s.id));
      const existingByClassName = new Set(
        rawStudents.map((s) => `${s.classGroup}::${s.name.trim().toLowerCase()}`)
      );

      const toInsert = entries.filter(
        (entry) =>
          !existingIds.has(entry.id) &&
          !existingByClassName.has(`${entry.classGroup}::${entry.name.trim().toLowerCase()}`)
      );

      const skipped = entries.length - toInsert.length;
      if (toInsert.length === 0) {
        return { added: 0, skipped };
      }

      const now = new Date().toISOString();
      const milestoneDate = new Date().toLocaleDateString('id-ID');

      const studentRows: Record<string, any>[] = [];
      const peerRows: Record<string, any>[] = [];
      const logRows: Record<string, any>[] = [];

      for (const entry of toInsert) {
        const studentDoc: Student = {
          id: entry.id,
          nisn: entry.nisn,
          name: entry.name,
          classGroup: entry.classGroup,
          email: entry.email,
          gender: '-',
          primaryDivisionId: entry.primaryDivisionId,
          secondaryDivisionId: '',
          isDpkCommittee: false,
          status: 'Aktif',
          notes:
            'Data resmi presensi Kelas X Tahun Ajaran 2026/2027 (penempatan divisi awal, dapat disesuaikan).',
          createdBy: user?.uid || 'admin',
          createdAt: now,
          updatedAt: now
        };
        studentRows.push(toDbStudent(studentDoc));

        peerRows.push(
          toDbPeer({
            id: `${entry.primaryDivisionId}_${entry.id}`,
            studentId: entry.id,
            studentName: entry.name,
            classGroup: entry.classGroup,
            divisionId: entry.primaryDivisionId,
            divisionRole: 'utama',
            isDpkCommittee: false
          })
        );

        for (const stage of DEFAULT_PROJECT_STAGES) {
          logRows.push(
            toDbProgressLog({
              id: `log_${entry.id}_s${stage.stageNumber}`,
              studentId: entry.id,
              studentName: entry.name,
              classGroup: entry.classGroup,
              primaryDivisionId: entry.primaryDivisionId,
              secondaryDivisionId: '',
              stageTitle: stage.title,
              stageNumber: stage.stageNumber,
              description: stage.description,
              status: (stage.stageNumber === 1 ? 'Sedang Berjalan' : 'Belum Dimulai') as ProgressStatus,
              milestoneDate,
              createdAt: now,
              updatedAt: now
            })
          );
        }
      }

      const CHUNK_SIZE = 100;
      for (let i = 0; i < studentRows.length; i += CHUNK_SIZE) {
        const { error: sErr } = await supabase
          .from('students')
          .upsert(studentRows.slice(i, i + CHUNK_SIZE), { onConflict: 'id', ignoreDuplicates: true });
        if (sErr) handleDbError(sErr, 'batch-insert', 'students');
      }

      for (let i = 0; i < peerRows.length; i += CHUNK_SIZE) {
        const { error: pErr } = await supabase
          .from('division_peers')
          .upsert(peerRows.slice(i, i + CHUNK_SIZE), { onConflict: 'id', ignoreDuplicates: true });
        if (pErr) handleDbError(pErr, 'batch-insert', 'division_peers');
      }

      for (let i = 0; i < logRows.length; i += 200) {
        const { error: lErr } = await supabase
          .from('progress_logs')
          .upsert(logRows.slice(i, i + 200), { onConflict: 'id', ignoreDuplicates: true });
        if (lErr) handleDbError(lErr, 'batch-insert', 'progress_logs');
      }

      await refreshData();
      return { added: toInsert.length, skipped };
    } catch (error) {
      handleDbError(error, 'write', 'students/importOfficialRoster2026');
    } finally {
      setIsImportingRoster(false);
    }
  };

  // Automatically populate the 205 official students on first Admin session if table is empty
  useEffect(() => {
    if (
      realRole === 'admin' &&
      dataReady &&
      rawStudents.length === 0 &&
      !autoImportedRef.current &&
      !isImportingRoster
    ) {
      autoImportedRef.current = true;
      importOfficialRoster2026().catch((err) => {
        console.error('Auto-import roster failed:', err);
      });
    }
  }, [realRole, dataReady, rawStudents.length, isImportingRoster]);

  return (
    <StudentContext.Provider
      value={{
        students: scopedView.students,
        divisionPeers: scopedView.divisionPeers,
        assessments: scopedView.assessments,
        selfAssessments: scopedView.selfAssessments,
        studentReflections: scopedView.studentReflections,
        appreciations: scopedView.appreciations,
        homeroomNotes: scopedView.homeroomNotes,
        progressLogs: scopedView.progressLogs,
        staffAssignments,
        roleCodes,
        appConfig,
        loading,
        refreshData,
        selectedClassFilter,
        setSelectedClassFilter,
        selectedDivisionFilter,
        setSelectedDivisionFilter,
        addStudent,
        claimOfficialStudent,
        updateStudent,
        deleteStudent,
        saveIndicatorAssessment,
        deleteAssessment,
        saveSelfAssessment,
        saveStudentReflection,
        addAppreciation,
        deleteAppreciation,
        saveHomeroomNote,
        updateProgressLog,
        updateAppConfig,
        saveStaffAssignment,
        deleteStaffAssignment,
        saveRoleCode,
        deleteRoleCode,
        getStudentAssessments: (studentId) =>
          scopedView.assessments.filter((a) => a.studentId === studentId),
        getStudentSelfAssessments: (studentId) =>
          scopedView.selfAssessments.filter((sa) => sa.studentId === studentId),
        getStudentReflection: (studentId) =>
          scopedView.studentReflections.find((r) => r.studentId === studentId),
        getStudentAppreciations: (studentId) =>
          scopedView.appreciations.filter((ap) => ap.toStudentId === studentId),
        getStudentHomeroomNote: (studentId) =>
          scopedView.homeroomNotes.find((h) => h.studentId === studentId),
        getStudentProgressLogs: (studentId) =>
          scopedView.progressLogs
            .filter((l) => l.studentId === studentId)
            .sort((a, b) => a.stageNumber - b.stageNumber),
        importOfficialRoster2026,
        isImportingRoster
      }}
    >
      {children}
    </StudentContext.Provider>
  );
};

export const useStudent = () => {
  const context = useContext(StudentContext);
  if (!context) {
    throw new Error('useStudent must be used within a StudentProvider');
  }
  return context;
};
