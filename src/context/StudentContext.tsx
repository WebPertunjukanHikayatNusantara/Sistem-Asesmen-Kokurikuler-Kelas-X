import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  writeBatch,
  Unsubscribe
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
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
  ALL_CLASSES,
  DEFAULT_PROJECT_STAGES,
  SEVEN_DPK_DIVISIONS,
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
  addAppreciation: (data: Omit<Appreciation, 'id' | 'fromUserId' | 'fromName' | 'fromRole' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  deleteAppreciation: (id: string) => Promise<void>;
  // Homeroom Notes CRUD (Wali Kelas & Admin)
  saveHomeroomNote: (data: Omit<HomeroomNote, 'id' | 'teacherId' | 'teacherName' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  // Progress Log CRUD
  updateProgressLog: (id: string, data: Partial<ProgressLog>) => Promise<void>;
  // Admin Config & Staff
  updateAppConfig: (data: Partial<AppConfig>) => Promise<void>;
  saveStaffAssignment: (assignment: Omit<StaffAssignment, 'id' | 'assignedBy' | 'createdAt' | 'updatedAt'>) => Promise<void>;
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

function stripUndefined<T extends object>(obj: T): T {
  const cleaned: Record<string, unknown> = {};
  Object.entries(obj).forEach(([k, v]) => {
    if (v !== undefined) {
      cleaned[k] = v;
    }
  });
  return cleaned as T;
}

export const StudentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, realRole, activeRole, previewDivisionId, previewClassGroup, updateProfileData } = useAuth();

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
  const [studentsSnapReady, setStudentsSnapReady] = useState<boolean>(false);
  const [isImportingRoster, setIsImportingRoster] = useState<boolean>(false);
  const autoImportedRef = useRef<boolean>(false);
  const [selectedClassFilter, setSelectedClassFilter] = useState<ClassGroup | 'ALL'>('ALL');
  const [selectedDivisionFilter, setSelectedDivisionFilter] = useState<string | 'ALL'>('ALL');

  const userEmailLower = (user?.email || '').trim().toLowerCase();

  // Real-time role-scoped Firestore subscriptions
  useEffect(() => {
    if (!user || !profile) {
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

    setLoading(true);
    const unsubs: Unsubscribe[] = [];

    // 1. AppConfig listener (readable by all signed-in users)
    unsubs.push(
      onSnapshot(
        doc(db, 'appConfig', 'default'),
        (snap) => {
          if (snap.exists()) {
            setAppConfig(snap.data() as AppConfig);
          }
        },
        (error) => {
          console.warn('AppConfig read warning:', error.message);
        }
      )
    );

    if (realRole === 'admin') {
      // Admin sees all collections
      unsubs.push(
        onSnapshot(
          collection(db, 'students'),
          (snap) => {
            const list: Student[] = [];
            snap.forEach((d) => list.push({ id: d.id, ...d.data() } as Student));
            list.sort((a, b) => a.name.localeCompare(b.name));
            setRawStudents(list);
            setStudentsSnapReady(true);
            setLoading(false);
          },
          (err) => handleFirestoreError(err, OperationType.GET, 'students')
        )
      );

      unsubs.push(
        onSnapshot(
          collection(db, 'divisionPeers'),
          (snap) => {
            const list: DivisionPeer[] = [];
            snap.forEach((d) => list.push({ id: d.id, ...d.data() } as DivisionPeer));
            setRawPeers(list);
          },
          (err) => handleFirestoreError(err, OperationType.GET, 'divisionPeers')
        )
      );

      unsubs.push(
        onSnapshot(
          collection(db, 'assessments'),
          (snap) => {
            const list: Assessment[] = [];
            snap.forEach((d) => list.push({ id: d.id, ...d.data() } as Assessment));
            list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
            setRawAssessments(list);
          },
          (err) => handleFirestoreError(err, OperationType.GET, 'assessments')
        )
      );

      unsubs.push(
        onSnapshot(
          collection(db, 'selfAssessments'),
          (snap) => {
            const list: SelfAssessment[] = [];
            snap.forEach((d) => list.push({ id: d.id, ...d.data() } as SelfAssessment));
            setRawSelfAssessments(list);
          },
          (err) => handleFirestoreError(err, OperationType.GET, 'selfAssessments')
        )
      );

      unsubs.push(
        onSnapshot(
          collection(db, 'studentReflections'),
          (snap) => {
            const list: StudentReflection[] = [];
            snap.forEach((d) => list.push({ id: d.id, ...d.data() } as StudentReflection));
            setRawReflections(list);
          },
          (err) => handleFirestoreError(err, OperationType.GET, 'studentReflections')
        )
      );

      unsubs.push(
        onSnapshot(
          collection(db, 'appreciations'),
          (snap) => {
            const list: Appreciation[] = [];
            snap.forEach((d) => list.push({ id: d.id, ...d.data() } as Appreciation));
            list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
            setRawAppreciations(list);
          },
          (err) => handleFirestoreError(err, OperationType.GET, 'appreciations')
        )
      );

      unsubs.push(
        onSnapshot(
          collection(db, 'homeroomNotes'),
          (snap) => {
            const list: HomeroomNote[] = [];
            snap.forEach((d) => list.push({ id: d.id, ...d.data() } as HomeroomNote));
            setRawHomeroomNotes(list);
          },
          (err) => handleFirestoreError(err, OperationType.GET, 'homeroomNotes')
        )
      );

      unsubs.push(
        onSnapshot(
          collection(db, 'progressLogs'),
          (snap) => {
            const list: ProgressLog[] = [];
            snap.forEach((d) => list.push({ id: d.id, ...d.data() } as ProgressLog));
            list.sort((a, b) => a.stageNumber - b.stageNumber);
            setRawProgressLogs(list);
          },
          (err) => handleFirestoreError(err, OperationType.GET, 'progressLogs')
        )
      );

      unsubs.push(
        onSnapshot(
          collection(db, 'staffAssignments'),
          (snap) => {
            const list: StaffAssignment[] = [];
            snap.forEach((d) => list.push({ id: d.id, ...d.data() } as StaffAssignment));
            list.sort((a, b) => a.displayName.localeCompare(b.displayName));
            setStaffAssignments(list);
          },
          (err) => handleFirestoreError(err, OperationType.GET, 'staffAssignments')
        )
      );

      unsubs.push(
        onSnapshot(
          collection(db, 'roleCodes'),
          (snap) => {
            const list: RoleCodeRecord[] = [];
            snap.forEach((d) => list.push(d.data() as RoleCodeRecord));
            setRoleCodes(list);
          },
          (err) => handleFirestoreError(err, OperationType.GET, 'roleCodes')
        )
      );
    } else if (realRole === 'pendamping' && profile.assignedDivisionId) {
      const myDiv = profile.assignedDivisionId;

      // Dual-query merge helper for primaryDivisionId + secondaryDivisionId
      const studentPrimaryMap = new Map<string, Student>();
      const studentSecondaryMap = new Map<string, Student>();
      const syncStudents = () => {
        const merged = new Map<string, Student>([...studentPrimaryMap, ...studentSecondaryMap]);
        setRawStudents(Array.from(merged.values()).sort((a, b) => a.name.localeCompare(b.name)));
        setLoading(false);
      };

      unsubs.push(
        onSnapshot(
          query(collection(db, 'students'), where('primaryDivisionId', '==', myDiv)),
          (snap) => {
            studentPrimaryMap.clear();
            snap.forEach((d) => studentPrimaryMap.set(d.id, { id: d.id, ...d.data() } as Student));
            syncStudents();
          },
          (err) => handleFirestoreError(err, OperationType.GET, 'students/primary')
        )
      );
      unsubs.push(
        onSnapshot(
          query(collection(db, 'students'), where('secondaryDivisionId', '==', myDiv)),
          (snap) => {
            studentSecondaryMap.clear();
            snap.forEach((d) => studentSecondaryMap.set(d.id, { id: d.id, ...d.data() } as Student));
            syncStudents();
          },
          (err) => handleFirestoreError(err, OperationType.GET, 'students/secondary')
        )
      );

      unsubs.push(
        onSnapshot(
          query(collection(db, 'assessments'), where('divisionId', '==', myDiv)),
          (snap) => {
            const list: Assessment[] = [];
            snap.forEach((d) => list.push({ id: d.id, ...d.data() } as Assessment));
            list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
            setRawAssessments(list);
          },
          (err) => handleFirestoreError(err, OperationType.GET, 'assessments')
        )
      );

      const saPrimary = new Map<string, SelfAssessment>();
      const saSecondary = new Map<string, SelfAssessment>();
      const syncSA = () => {
        const merged = new Map<string, SelfAssessment>([...saPrimary, ...saSecondary]);
        setRawSelfAssessments(Array.from(merged.values()));
      };
      unsubs.push(
        onSnapshot(
          query(collection(db, 'selfAssessments'), where('primaryDivisionId', '==', myDiv)),
          (snap) => {
            saPrimary.clear();
            snap.forEach((d) => saPrimary.set(d.id, { id: d.id, ...d.data() } as SelfAssessment));
            syncSA();
          },
          (err) => handleFirestoreError(err, OperationType.GET, 'selfAssessments/primary')
        )
      );
      unsubs.push(
        onSnapshot(
          query(collection(db, 'selfAssessments'), where('secondaryDivisionId', '==', myDiv)),
          (snap) => {
            saSecondary.clear();
            snap.forEach((d) => saSecondary.set(d.id, { id: d.id, ...d.data() } as SelfAssessment));
            syncSA();
          },
          (err) => handleFirestoreError(err, OperationType.GET, 'selfAssessments/secondary')
        )
      );

      const refPrimary = new Map<string, StudentReflection>();
      const refSecondary = new Map<string, StudentReflection>();
      const syncRef = () => {
        const merged = new Map<string, StudentReflection>([...refPrimary, ...refSecondary]);
        setRawReflections(Array.from(merged.values()));
      };
      unsubs.push(
        onSnapshot(
          query(collection(db, 'studentReflections'), where('primaryDivisionId', '==', myDiv)),
          (snap) => {
            refPrimary.clear();
            snap.forEach((d) => refPrimary.set(d.id, { id: d.id, ...d.data() } as StudentReflection));
            syncRef();
          },
          (err) => handleFirestoreError(err, OperationType.GET, 'studentReflections/primary')
        )
      );
      unsubs.push(
        onSnapshot(
          query(collection(db, 'studentReflections'), where('secondaryDivisionId', '==', myDiv)),
          (snap) => {
            refSecondary.clear();
            snap.forEach((d) => refSecondary.set(d.id, { id: d.id, ...d.data() } as StudentReflection));
            syncRef();
          },
          (err) => handleFirestoreError(err, OperationType.GET, 'studentReflections/secondary')
        )
      );

      unsubs.push(
        onSnapshot(
          query(collection(db, 'appreciations'), where('divisionId', '==', myDiv)),
          (snap) => {
            const list: Appreciation[] = [];
            snap.forEach((d) => list.push({ id: d.id, ...d.data() } as Appreciation));
            list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
            setRawAppreciations(list);
          },
          (err) => handleFirestoreError(err, OperationType.GET, 'appreciations')
        )
      );

      const logPrimary = new Map<string, ProgressLog>();
      const logSecondary = new Map<string, ProgressLog>();
      const syncLogs = () => {
        const merged = new Map<string, ProgressLog>([...logPrimary, ...logSecondary]);
        setRawProgressLogs(Array.from(merged.values()).sort((a, b) => a.stageNumber - b.stageNumber));
      };
      unsubs.push(
        onSnapshot(
          query(collection(db, 'progressLogs'), where('primaryDivisionId', '==', myDiv)),
          (snap) => {
            logPrimary.clear();
            snap.forEach((d) => logPrimary.set(d.id, { id: d.id, ...d.data() } as ProgressLog));
            syncLogs();
          },
          (err) => handleFirestoreError(err, OperationType.GET, 'progressLogs/primary')
        )
      );
      unsubs.push(
        onSnapshot(
          query(collection(db, 'progressLogs'), where('secondaryDivisionId', '==', myDiv)),
          (snap) => {
            logSecondary.clear();
            snap.forEach((d) => logSecondary.set(d.id, { id: d.id, ...d.data() } as ProgressLog));
            syncLogs();
          },
          (err) => handleFirestoreError(err, OperationType.GET, 'progressLogs/secondary')
        )
      );
    } else if (realRole === 'walikelas' && profile.assignedClassGroup) {
      const myCls = profile.assignedClassGroup;

      unsubs.push(
        onSnapshot(
          query(collection(db, 'students'), where('classGroup', '==', myCls)),
          (snap) => {
            const list: Student[] = [];
            snap.forEach((d) => list.push({ id: d.id, ...d.data() } as Student));
            list.sort((a, b) => a.name.localeCompare(b.name));
            setRawStudents(list);
            setLoading(false);
          },
          (err) => handleFirestoreError(err, OperationType.GET, 'students/walikelas')
        )
      );

      unsubs.push(
        onSnapshot(
          query(collection(db, 'assessments'), where('classGroup', '==', myCls)),
          (snap) => {
            const list: Assessment[] = [];
            snap.forEach((d) => list.push({ id: d.id, ...d.data() } as Assessment));
            list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
            setRawAssessments(list);
          },
          (err) => handleFirestoreError(err, OperationType.GET, 'assessments/walikelas')
        )
      );

      unsubs.push(
        onSnapshot(
          query(collection(db, 'selfAssessments'), where('classGroup', '==', myCls)),
          (snap) => {
            const list: SelfAssessment[] = [];
            snap.forEach((d) => list.push({ id: d.id, ...d.data() } as SelfAssessment));
            setRawSelfAssessments(list);
          },
          (err) => handleFirestoreError(err, OperationType.GET, 'selfAssessments/walikelas')
        )
      );

      unsubs.push(
        onSnapshot(
          query(collection(db, 'studentReflections'), where('classGroup', '==', myCls)),
          (snap) => {
            const list: StudentReflection[] = [];
            snap.forEach((d) => list.push({ id: d.id, ...d.data() } as StudentReflection));
            setRawReflections(list);
          },
          (err) => handleFirestoreError(err, OperationType.GET, 'studentReflections/walikelas')
        )
      );

      unsubs.push(
        onSnapshot(
          query(collection(db, 'appreciations'), where('toClassGroup', '==', myCls)),
          (snap) => {
            const list: Appreciation[] = [];
            snap.forEach((d) => list.push({ id: d.id, ...d.data() } as Appreciation));
            list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
            setRawAppreciations(list);
          },
          (err) => handleFirestoreError(err, OperationType.GET, 'appreciations/walikelas')
        )
      );

      unsubs.push(
        onSnapshot(
          query(collection(db, 'homeroomNotes'), where('classGroup', '==', myCls)),
          (snap) => {
            const list: HomeroomNote[] = [];
            snap.forEach((d) => list.push({ id: d.id, ...d.data() } as HomeroomNote));
            setRawHomeroomNotes(list);
          },
          (err) => handleFirestoreError(err, OperationType.GET, 'homeroomNotes/walikelas')
        )
      );

      unsubs.push(
        onSnapshot(
          query(collection(db, 'progressLogs'), where('classGroup', '==', myCls)),
          (snap) => {
            const list: ProgressLog[] = [];
            snap.forEach((d) => list.push({ id: d.id, ...d.data() } as ProgressLog));
            list.sort((a, b) => a.stageNumber - b.stageNumber);
            setRawProgressLogs(list);
          },
          (err) => handleFirestoreError(err, OperationType.GET, 'progressLogs/walikelas')
        )
      );
    } else if (realRole === 'murid' && userEmailLower) {
      // Student listens strictly to own student record by email
      unsubs.push(
        onSnapshot(
          query(collection(db, 'students'), where('email', '==', userEmailLower)),
          (snap) => {
            const list: Student[] = [];
            snap.forEach((d) => list.push({ id: d.id, ...d.data() } as Student));
            setRawStudents(list);
            setLoading(false);

            const me = list[0];
            if (me) {
              const needsSync =
                profile.studentId !== me.id ||
                profile.assignedDivisionId !== me.primaryDivisionId ||
                (profile.secondaryDivisionId || '') !== (me.secondaryDivisionId || '') ||
                profile.classGroup !== me.classGroup;

              if (needsSync) {
                updateProfileData({
                  studentId: me.id,
                  assignedDivisionId: me.primaryDivisionId,
                  secondaryDivisionId: me.secondaryDivisionId || '',
                  classGroup: me.classGroup
                });
              }
            }
          },
          (err) => handleFirestoreError(err, OperationType.GET, 'students/self')
        )
      );
    } else {
      setLoading(false);
    }

    return () => {
      unsubs.forEach((fn) => fn());
    };
  }, [user, realRole, profile?.assignedDivisionId, profile?.assignedClassGroup, userEmailLower]);

  // Separate effect for student-scoped sub-resources once profile.studentId and division IDs are synced
  useEffect(() => {
    if (!user || !profile || realRole !== 'murid' || !profile.studentId) {
      return;
    }

    const stdId = profile.studentId;
    const unsubs: Unsubscribe[] = [];

    unsubs.push(
      onSnapshot(
        query(collection(db, 'assessments'), where('studentId', '==', stdId)),
        (snap) => {
          const list: Assessment[] = [];
          snap.forEach((d) => list.push({ id: d.id, ...d.data() } as Assessment));
          setRawAssessments(list);
        },
        (err) => handleFirestoreError(err, OperationType.GET, 'assessments/self')
      )
    );

    unsubs.push(
      onSnapshot(
        query(collection(db, 'selfAssessments'), where('studentId', '==', stdId)),
        (snap) => {
          const list: SelfAssessment[] = [];
          snap.forEach((d) => list.push({ id: d.id, ...d.data() } as SelfAssessment));
          setRawSelfAssessments(list);
        },
        (err) => handleFirestoreError(err, OperationType.GET, 'selfAssessments/self')
      )
    );

    unsubs.push(
      onSnapshot(
        query(collection(db, 'studentReflections'), where('studentId', '==', stdId)),
        (snap) => {
          const list: StudentReflection[] = [];
          snap.forEach((d) => list.push({ id: d.id, ...d.data() } as StudentReflection));
          setRawReflections(list);
        },
        (err) => handleFirestoreError(err, OperationType.GET, 'studentReflections/self')
      )
    );

    const apReceived = new Map<string, Appreciation>();
    const apSent = new Map<string, Appreciation>();
    const syncAp = () => {
      const merged = new Map<string, Appreciation>([...apReceived, ...apSent]);
      setRawAppreciations(
        Array.from(merged.values()).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
      );
    };

    unsubs.push(
      onSnapshot(
        query(collection(db, 'appreciations'), where('toStudentId', '==', stdId)),
        (snap) => {
          apReceived.clear();
          snap.forEach((d) => apReceived.set(d.id, { id: d.id, ...d.data() } as Appreciation));
          syncAp();
        },
        (err) => handleFirestoreError(err, OperationType.GET, 'appreciations/received')
      )
    );

    unsubs.push(
      onSnapshot(
        query(collection(db, 'appreciations'), where('fromUserId', '==', user.uid)),
        (snap) => {
          apSent.clear();
          snap.forEach((d) => apSent.set(d.id, { id: d.id, ...d.data() } as Appreciation));
          syncAp();
        },
        (err) => handleFirestoreError(err, OperationType.GET, 'appreciations/sent')
      )
    );

    unsubs.push(
      onSnapshot(
        query(collection(db, 'homeroomNotes'), where('studentId', '==', stdId)),
        (snap) => {
          const list: HomeroomNote[] = [];
          snap.forEach((d) => list.push({ id: d.id, ...d.data() } as HomeroomNote));
          setRawHomeroomNotes(list);
        },
        (err) => handleFirestoreError(err, OperationType.GET, 'homeroomNotes/self')
      )
    );

    unsubs.push(
      onSnapshot(
        query(collection(db, 'progressLogs'), where('studentId', '==', stdId)),
        (snap) => {
          const list: ProgressLog[] = [];
          snap.forEach((d) => list.push({ id: d.id, ...d.data() } as ProgressLog));
          list.sort((a, b) => a.stageNumber - b.stageNumber);
          setRawProgressLogs(list);
        },
        (err) => handleFirestoreError(err, OperationType.GET, 'progressLogs/self')
      )
    );

    if (profile.assignedDivisionId) {
      const peerPrimary = new Map<string, DivisionPeer>();
      const peerSecondary = new Map<string, DivisionPeer>();
      const syncPeers = () => {
        const merged = new Map<string, DivisionPeer>([...peerPrimary, ...peerSecondary]);
        setRawPeers(Array.from(merged.values()).sort((a, b) => a.studentName.localeCompare(b.studentName)));
      };

      unsubs.push(
        onSnapshot(
          query(collection(db, 'divisionPeers'), where('divisionId', '==', profile.assignedDivisionId)),
          (snap) => {
            peerPrimary.clear();
            snap.forEach((d) => peerPrimary.set(d.id, { id: d.id, ...d.data() } as DivisionPeer));
            syncPeers();
          },
          (err) => handleFirestoreError(err, OperationType.GET, 'divisionPeers/primary')
        )
      );

      if (profile.secondaryDivisionId) {
        unsubs.push(
          onSnapshot(
            query(collection(db, 'divisionPeers'), where('divisionId', '==', profile.secondaryDivisionId)),
            (snap) => {
              peerSecondary.clear();
              snap.forEach((d) => peerSecondary.set(d.id, { id: d.id, ...d.data() } as DivisionPeer));
              syncPeers();
            },
            (err) => handleFirestoreError(err, OperationType.GET, 'divisionPeers/secondary')
          )
        );
      }
    }

    return () => {
      unsubs.forEach((fn) => fn());
    };
  }, [user, realRole, profile?.studentId, profile?.assignedDivisionId, profile?.secondaryDivisionId]);

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

    // Previewing Murid: show first student matching email or first available sample student
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

  // Helper: sync divisionPeers for a student
  const syncDivisionPeers = async (student: Student, previous?: Student) => {
    const primaryPeerId = `${student.primaryDivisionId}_${student.id}`;
    const primaryPeer: DivisionPeer = {
      id: primaryPeerId,
      studentId: student.id,
      studentName: student.name,
      classGroup: student.classGroup,
      divisionId: student.primaryDivisionId,
      divisionRole: 'utama',
      isDpkCommittee: Boolean(student.isDpkCommittee)
    };
    await setDoc(doc(db, 'divisionPeers', primaryPeerId), primaryPeer);

    if (previous && previous.primaryDivisionId !== student.primaryDivisionId) {
      try {
        await deleteDoc(doc(db, 'divisionPeers', `${previous.primaryDivisionId}_${student.id}`));
      } catch {
        // Ignore if not present
      }
    }

    if (student.secondaryDivisionId) {
      const secondaryPeerId = `${student.secondaryDivisionId}_${student.id}`;
      const secondaryPeer: DivisionPeer = {
        id: secondaryPeerId,
        studentId: student.id,
        studentName: student.name,
        classGroup: student.classGroup,
        divisionId: student.secondaryDivisionId,
        divisionRole: 'pendukung',
        isDpkCommittee: Boolean(student.isDpkCommittee)
      };
      await setDoc(doc(db, 'divisionPeers', secondaryPeerId), secondaryPeer);
    }

    if (previous?.secondaryDivisionId && previous.secondaryDivisionId !== student.secondaryDivisionId) {
      try {
        await deleteDoc(doc(db, 'divisionPeers', `${previous.secondaryDivisionId}_${student.id}`));
      } catch {
        // Ignore if not present
      }
    }
  };

  // Student CRUD
  const addStudent = async (data: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    const studentId = `std_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const newStudent: Student = stripUndefined({
      ...data,
      email: (data.email || '').trim().toLowerCase(),
      id: studentId,
      createdBy: user?.uid || 'anon',
      createdAt: now,
      updatedAt: now
    });

    try {
      await setDoc(doc(db, 'students', studentId), newStudent);

      if (realRole === 'murid') {
        await updateProfileData({
          studentId,
          assignedDivisionId: newStudent.primaryDivisionId,
          secondaryDivisionId: newStudent.secondaryDivisionId || '',
          classGroup: newStudent.classGroup
        });
      }

      await syncDivisionPeers(newStudent);

      // Baseline 6-stage progress logs
      for (const stage of DEFAULT_PROJECT_STAGES) {
        const logId = `log_${studentId}_s${stage.stageNumber}`;
        const baselineLog: ProgressLog = stripUndefined({
          id: logId,
          studentId,
          studentName: newStudent.name,
          classGroup: newStudent.classGroup,
          primaryDivisionId: newStudent.primaryDivisionId,
          secondaryDivisionId: newStudent.secondaryDivisionId,
          stageTitle: stage.title,
          stageNumber: stage.stageNumber,
          description: stage.description,
          status: (stage.stageNumber === 1 ? 'Sedang Berjalan' : 'Belum Dimulai') as ProgressStatus,
          milestoneDate: new Date().toLocaleDateString('id-ID'),
          createdAt: now,
          updatedAt: now
        });
        await setDoc(doc(db, 'progressLogs', logId), baselineLog);
      }

      return studentId;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `students/${studentId}`);
    }
  };

  const claimOfficialStudent: StudentContextType['claimOfficialStudent'] = async ({
    entry,
    gender,
    primaryDivisionId,
    secondaryDivisionId,
    isDpkCommittee
  }) => {
    if (!user || !userEmailLower) {
      throw new Error('Silakan masuk dengan akun Google terlebih dahulu.');
    }

    const now = new Date().toISOString();
    const milestoneDate = new Date().toLocaleDateString('id-ID');
    const normalizedSecondary = secondaryDivisionId ? secondaryDivisionId.trim() : '';

    try {
      // 1. Update user profile first so firestore.rules myStudentId() matches entry.id
      await updateProfileData({
        studentId: entry.id,
        assignedDivisionId: primaryDivisionId,
        secondaryDivisionId: normalizedSecondary,
        classGroup: entry.classGroup,
        nisn: entry.nisn
      });

      // 2. Claim pre-imported roster record (or create if admin hasn't imported roster yet)
      try {
        await updateDoc(doc(db, 'students', entry.id), {
          email: userEmailLower,
          gender,
          primaryDivisionId,
          secondaryDivisionId: normalizedSecondary,
          isDpkCommittee: Boolean(isDpkCommittee),
          updatedAt: now
        });
      } catch (updateErr: unknown) {
        const errCode =
          updateErr && typeof updateErr === 'object' && 'code' in updateErr
            ? String((updateErr as { code: string }).code)
            : '';

        if (errCode === 'not-found') {
          const fullStudent: Student = stripUndefined({
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
          });
          await setDoc(doc(db, 'students', entry.id), fullStudent);

          for (const stage of DEFAULT_PROJECT_STAGES) {
            const logId = `log_${entry.id}_s${stage.stageNumber}`;
            const baselineLog: ProgressLog = stripUndefined({
              id: logId,
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
            });
            await setDoc(doc(db, 'progressLogs', logId), baselineLog);
          }
        } else {
          throw updateErr;
        }
      }

      // 3. Keep PII-free divisionPeers directory synchronized
      const claimedStudent: Student = {
        id: entry.id,
        nisn: entry.nisn,
        name: entry.name,
        classGroup: entry.classGroup,
        email: userEmailLower,
        gender,
        primaryDivisionId,
        secondaryDivisionId: normalizedSecondary,
        isDpkCommittee: Boolean(isDpkCommittee),
        status: 'Aktif'
      };
      await syncDivisionPeers(
        claimedStudent,
        primaryDivisionId !== entry.primaryDivisionId
          ? { ...claimedStudent, primaryDivisionId: entry.primaryDivisionId }
          : undefined
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `students/${entry.id}`);
    }
  };

  const updateStudent = async (id: string, data: Partial<Student>): Promise<void> => {
    try {
      const existing = rawStudents.find((s) => s.id === id);
      const hasSecondaryKey = Object.prototype.hasOwnProperty.call(data, 'secondaryDivisionId');
      const updatePayload = stripUndefined({
        ...data,
        ...(hasSecondaryKey ? { secondaryDivisionId: data.secondaryDivisionId || '' } : {}),
        ...(data.email ? { email: data.email.trim().toLowerCase() } : {}),
        updatedAt: new Date().toISOString()
      });

      await updateDoc(doc(db, 'students', id), updatePayload);

      if (existing) {
        const merged: Student = { ...existing, ...updatePayload };
        if (realRole === 'murid') {
          await updateProfileData({
            assignedDivisionId: merged.primaryDivisionId,
            secondaryDivisionId: merged.secondaryDivisionId || '',
            classGroup: merged.classGroup
          });
        }

        await syncDivisionPeers(merged, existing);

        // Keep existing progressLogs & reflections division IDs synced if division changed (for educators/admin)
        if (
          realRole !== 'murid' &&
          (data.primaryDivisionId !== undefined || hasSecondaryKey)
        ) {
          const stdLogs = rawProgressLogs.filter((l) => l.studentId === id);
          for (const log of stdLogs) {
            await updateDoc(
              doc(db, 'progressLogs', log.id),
              stripUndefined({
                primaryDivisionId: merged.primaryDivisionId,
                secondaryDivisionId: merged.secondaryDivisionId || '',
                updatedAt: new Date().toISOString()
              })
            );
          }
        }
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `students/${id}`);
    }
  };

  const deleteStudent = async (id: string): Promise<void> => {
    try {
      const existing = rawStudents.find((s) => s.id === id);
      await deleteDoc(doc(db, 'students', id));
      if (existing) {
        try {
          await deleteDoc(doc(db, 'divisionPeers', `${existing.primaryDivisionId}_${id}`));
          if (existing.secondaryDivisionId) {
            await deleteDoc(doc(db, 'divisionPeers', `${existing.secondaryDivisionId}_${id}`));
          }
        } catch {
          // Non-fatal
        }
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `students/${id}`);
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
    const indMeta = ALL_BEHAVIOR_INDICATORS.find((ind) => ind.code === indicatorCode);
    if (!indMeta) throw new Error(`Indikator ${indicatorCode} tidak ditemukan.`);

    const divisionName = getDivisionById(divisionId)?.shortName || divisionId;
    const assessmentId = `asm_${student.id}_${divisionId}_s${stageNumber}_${indicatorCode}`;
    const levelCfg = GROWTH_LEVELS[growthLevel];
    const now = new Date().toISOString();

    const payload: Assessment = stripUndefined({
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
    });

    try {
      await setDoc(doc(db, 'assessments', assessmentId), payload, { merge: true });
      return assessmentId;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `assessments/${assessmentId}`);
    }
  };

  const deleteAssessment = async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, 'assessments', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `assessments/${id}`);
    }
  };

  // Self Assessment upsert
  const saveSelfAssessment: StudentContextType['saveSelfAssessment'] = async ({
    student,
    indicatorCode,
    growthLevel,
    reflectionNote
  }) => {
    const indMeta = ALL_BEHAVIOR_INDICATORS.find((ind) => ind.code === indicatorCode);
    if (!indMeta) throw new Error(`Indikator ${indicatorCode} tidak ditemukan.`);

    const saId = `sa_${student.id}_${indicatorCode}`;
    const now = new Date().toISOString();
    const payload: SelfAssessment = stripUndefined({
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
    });

    try {
      await setDoc(doc(db, 'selfAssessments', saId), payload, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `selfAssessments/${saId}`);
    }
  };

  // One-time Stage 6 Student Reflection
  const saveStudentReflection: StudentContextType['saveStudentReflection'] = async (reflection) => {
    const refId = reflection.studentId;
    const now = new Date().toISOString();
    const payload: StudentReflection = stripUndefined({
      ...reflection,
      id: refId,
      submittedAt: reflection.isSubmitted ? reflection.submittedAt || now : reflection.submittedAt,
      updatedAt: now
    });

    try {
      await setDoc(doc(db, 'studentReflections', refId), payload, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `studentReflections/${refId}`);
    }
  };

  // Appreciation CRUD
  const addAppreciation: StudentContextType['addAppreciation'] = async (data) => {
    const appId = `apr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const payload: Appreciation = stripUndefined({
      ...data,
      id: appId,
      fromUserId: user?.uid || 'user',
      fromName: profile?.displayName || user?.displayName || 'Warga Sekolah',
      fromRole: realRole,
      createdAt: now,
      updatedAt: now
    });

    try {
      await setDoc(doc(db, 'appreciations', appId), payload);
      return appId;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `appreciations/${appId}`);
    }
  };

  const deleteAppreciation = async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, 'appreciations', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `appreciations/${id}`);
    }
  };

  // Homeroom Notes CRUD
  const saveHomeroomNote: StudentContextType['saveHomeroomNote'] = async (data) => {
    const noteId = `hr_${data.studentId}`;
    const now = new Date().toISOString();
    const payload: HomeroomNote = stripUndefined({
      ...data,
      id: noteId,
      teacherId: user?.uid || 'walikelas',
      teacherName: profile?.displayName || user?.displayName || 'Wali Kelas',
      createdAt: now,
      updatedAt: now
    });

    try {
      await setDoc(doc(db, 'homeroomNotes', noteId), payload, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `homeroomNotes/${noteId}`);
    }
  };

  // Progress Log CRUD
  const updateProgressLog = async (id: string, data: Partial<ProgressLog>): Promise<void> => {
    try {
      await updateDoc(
        doc(db, 'progressLogs', id),
        stripUndefined({
          ...data,
          updatedBy: profile?.displayName || user?.displayName || 'Pendamping',
          updatedAt: new Date().toISOString()
        })
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `progressLogs/${id}`);
    }
  };

  // Admin Config & Staff
  const updateAppConfig = async (data: Partial<AppConfig>): Promise<void> => {
    try {
      const merged = stripUndefined({
        ...appConfig,
        ...data,
        id: 'default',
        updatedBy: userEmailLower,
        updatedAt: new Date().toISOString()
      });
      await setDoc(doc(db, 'appConfig', 'default'), merged, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'appConfig/default');
    }
  };

  const saveStaffAssignment: StudentContextType['saveStaffAssignment'] = async (assignment) => {
    const emailKey = assignment.email.trim().toLowerCase();
    const now = new Date().toISOString();
    const payload: StaffAssignment = stripUndefined({
      ...assignment,
      id: emailKey,
      email: emailKey,
      assignedBy: userEmailLower,
      createdAt: now,
      updatedAt: now
    });
    try {
      await setDoc(doc(db, 'staffAssignments', emailKey), payload, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `staffAssignments/${emailKey}`);
    }
  };

  const deleteStaffAssignment = async (emailKey: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, 'staffAssignments', emailKey));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `staffAssignments/${emailKey}`);
    }
  };

  const saveRoleCode = async (record: RoleCodeRecord): Promise<void> => {
    const codeKey = record.code.trim().toUpperCase();
    try {
      await setDoc(
        doc(db, 'roleCodes', codeKey),
        stripUndefined({
          ...record,
          code: codeKey,
          updatedAt: new Date().toISOString()
        }),
        { merge: true }
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `roleCodes/${codeKey}`);
    }
  };

  const deleteRoleCode = async (code: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, 'roleCodes', code));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `roleCodes/${code}`);
    }
  };

  // Idempotent batch importer for all 205 official Class X-1..X-6 students from 2026 PDFs
  const importOfficialRoster2026 = async (
    targetClass?: ClassGroup
  ): Promise<{ added: number; skipped: number }> => {
    if (realRole !== 'admin') {
      throw new Error('Hanya Koordinator / Admin yang dapat mengimpor daftar siswa resmi.');
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
      // Each student generates 8 writes (1 student + 1 divisionPeer + 6 progressLogs).
      // 45 students * 8 = 360 writes per batch (well below Firestore 500 writeBatch limit).
      const CHUNK_SIZE = 45;

      for (let i = 0; i < toInsert.length; i += CHUNK_SIZE) {
        const chunk = toInsert.slice(i, i + CHUNK_SIZE);
        const batch = writeBatch(db);

        for (const entry of chunk) {
          const studentDoc: Student = {
            id: entry.id,
            nisn: entry.nisn,
            name: entry.name,
            classGroup: entry.classGroup,
            email: entry.email,
            gender: '-',
            primaryDivisionId: entry.primaryDivisionId,
            isDpkCommittee: false,
            status: 'Aktif',
            notes: 'Data resmi presensi Kelas X Tahun Ajaran 2026/2027 (penempatan divisi awal, dapat disesuaikan).',
            createdBy: user?.uid || 'admin',
            createdAt: now,
            updatedAt: now
          };

          batch.set(doc(db, 'students', entry.id), studentDoc);

          const primaryPeerId = `${entry.primaryDivisionId}_${entry.id}`;
          const peerDoc: DivisionPeer = {
            id: primaryPeerId,
            studentId: entry.id,
            studentName: entry.name,
            classGroup: entry.classGroup,
            divisionId: entry.primaryDivisionId,
            divisionRole: 'utama',
            isDpkCommittee: false
          };
          batch.set(doc(db, 'divisionPeers', primaryPeerId), peerDoc);

          for (const stage of DEFAULT_PROJECT_STAGES) {
            const logId = `log_${entry.id}_s${stage.stageNumber}`;
            const logDoc: ProgressLog = {
              id: logId,
              studentId: entry.id,
              studentName: entry.name,
              classGroup: entry.classGroup,
              primaryDivisionId: entry.primaryDivisionId,
              stageTitle: stage.title,
              stageNumber: stage.stageNumber,
              description: stage.description,
              status: (stage.stageNumber === 1 ? 'Sedang Berjalan' : 'Belum Dimulai') as ProgressStatus,
              milestoneDate,
              createdAt: now,
              updatedAt: now
            };
            batch.set(doc(db, 'progressLogs', logId), logDoc);
          }
        }

        await batch.commit();
      }

      return { added: toInsert.length, skipped };
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'students/importOfficialRoster2026');
    } finally {
      setIsImportingRoster(false);
    }
  };

  // Automatically populate the 205 official students on first Admin session if collection is empty
  useEffect(() => {
    if (
      realRole === 'admin' &&
      studentsSnapReady &&
      rawStudents.length === 0 &&
      !autoImportedRef.current &&
      !isImportingRoster
    ) {
      autoImportedRef.current = true;
      importOfficialRoster2026().catch((err) => {
        console.error('Auto-import roster failed:', err);
      });
    }
  }, [realRole, studentsSnapReady, rawStudents.length, isImportingRoster]);

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
