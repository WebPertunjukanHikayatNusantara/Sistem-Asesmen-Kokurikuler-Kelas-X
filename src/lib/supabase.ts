import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import {
  AppConfig,
  Appreciation,
  Assessment,
  ClassGroup,
  DivisionPeer,
  FormasiHolistik,
  GrowthLevel,
  HomeroomNote,
  IndicatorCode,
  DimensionId,
  ProgressLog,
  ProgressStatus,
  StaffAssignment,
  Student,
  StudentReflection,
  SelfAssessment,
  UserProfile,
  UserRole
} from '../types';
import type { RoleCodeRecord } from '../context/StudentContext';

function cleanEnvValue(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  return raw
    .trim()
    .replace(/^["']+|["']+$/g, '')
    .replace(/[\r\n]/g, '')
    .trim();
}

function normalizeSupabaseOrigin(rawUrl: string): string {
  if (!rawUrl) return '';
  try {
    return new URL(rawUrl).origin;
  } catch {
    return rawUrl.replace(/\/+$/, '');
  }
}

const supabaseUrl = normalizeSupabaseOrigin(cleanEnvValue(import.meta.env.VITE_SUPABASE_URL));
const supabaseAnonKey = cleanEnvValue(import.meta.env.VITE_SUPABASE_ANON_KEY);

export const isSupabaseConfigured = Boolean(
  supabaseUrl.startsWith('https://') &&
    supabaseAnonKey.length > 20 &&
    !supabaseUrl.includes('YOUR-PROJECT-ID') &&
    !supabaseAnonKey.includes('YOUR_SUPABASE_ANON_KEY')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        detectSessionInUrl: true,
        persistSession: true,
        autoRefreshToken: true
      },
      global: {
        headers: {
          apikey: supabaseAnonKey
        }
      }
    })
  : null;

export interface AuthUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
}

export function mapSupabaseUser(u: User): AuthUser {
  const meta = (u.user_metadata || {}) as Record<string, unknown>;
  const fullName =
    (typeof meta.full_name === 'string' && meta.full_name) ||
    (typeof meta.name === 'string' && meta.name) ||
    u.email?.split('@')[0] ||
    'Warga SMA PL Santo Yosef';
  const avatar =
    (typeof meta.avatar_url === 'string' && meta.avatar_url) ||
    (typeof meta.picture === 'string' && meta.picture) ||
    '';

  return {
    uid: u.id,
    email: (u.email || '').trim().toLowerCase(),
    displayName: fullName,
    photoURL: avatar
  };
}

export async function signInWithGoogleOAuth(): Promise<void> {
  if (!supabase) {
    throw new Error(
      'Konfigurasi Supabase belum terpasang (VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY). Periksa file .env atau GitHub Actions Secrets.'
    );
  }
  const redirectTo = `${window.location.origin}${window.location.pathname}`;
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      queryParams: {
        prompt: 'select_account'
      }
    }
  });
  if (error) {
    throw error;
  }
}

export async function signOutUser(): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
}

export function handleDbError(error: unknown, operation: string, target: string): never {
  const errObj = (error && typeof error === 'object' ? error : {}) as {
    code?: string;
    message?: string;
    details?: string;
    hint?: string;
  };
  const rawMessage = errObj.message || (error instanceof Error ? error.message : String(error));
  const code = errObj.code || '';

  console.error(`Supabase ${operation} error on ${target}:`, { code, rawMessage, details: errObj.details });

  const lower = rawMessage.toLowerCase();
  if (lower.includes('no api key found') || lower.includes('apikey')) {
    throw new Error(
      'API Key Supabase (VITE_SUPABASE_ANON_KEY) tidak terkirim atau tidak valid. Pastikan Secret VITE_SUPABASE_ANON_KEY di GitHub/file .env berisi anon/publishable key tanpa tanda kutip lalu build ulang aplikasi.'
    );
  }
  if (code === '42501' || lower.includes('row-level security') || lower.includes('permission denied')) {
    throw new Error(
      `Akses ditolak oleh aturan keamanan Supabase (RLS) pada ${target}. Pastikan peran/otorisasi akun Anda sesuai.`
    );
  }
  if (lower.includes('failed to fetch') || lower.includes('network')) {
    throw new Error(
      'Gagal terhubung ke server Supabase. Periksa koneksi internet Anda dan coba lagi.'
    );
  }

  throw new Error(rawMessage || `Terjadi kesalahan database saat ${operation} pada ${target}.`);
}

// ============================================================================
// Snake_case (PostgreSQL) <-> CamelCase (TypeScript) Row Mappers
// ============================================================================

type DbRow = Record<string, any>;

export const fromDbUser = (r: DbRow): UserProfile => ({
  uid: r.uid,
  email: r.email || '',
  displayName: r.display_name || '',
  photoURL: r.photo_url || '',
  role: r.role as UserRole,
  assignedDivisionId: r.assigned_division_id || undefined,
  secondaryDivisionId: r.secondary_division_id || '',
  assignedClassGroup: (r.assigned_class_group as ClassGroup) || undefined,
  studentId: r.student_id || undefined,
  classGroup: (r.class_group as ClassGroup) || undefined,
  nisn: r.nisn || undefined,
  canExport: Boolean(r.can_export),
  inviteCode: r.invite_code || undefined,
  createdAt: r.created_at || undefined,
  updatedAt: r.updated_at || undefined
});

export const toDbUser = (u: Partial<UserProfile>): DbRow => {
  const row: DbRow = {};
  if (u.uid !== undefined) row.uid = u.uid;
  if (u.email !== undefined) row.email = u.email;
  if (u.displayName !== undefined) row.display_name = u.displayName;
  if (u.photoURL !== undefined) row.photo_url = u.photoURL;
  if (u.role !== undefined) row.role = u.role;
  if (u.assignedDivisionId !== undefined) row.assigned_division_id = u.assignedDivisionId || null;
  if (u.secondaryDivisionId !== undefined) row.secondary_division_id = u.secondaryDivisionId || '';
  if (u.assignedClassGroup !== undefined) row.assigned_class_group = u.assignedClassGroup || null;
  if (u.studentId !== undefined) row.student_id = u.studentId || null;
  if (u.classGroup !== undefined) row.class_group = u.classGroup || null;
  if (u.nisn !== undefined) row.nisn = u.nisn || null;
  if (u.canExport !== undefined) row.can_export = Boolean(u.canExport);
  if (u.inviteCode !== undefined) row.invite_code = u.inviteCode || null;
  if (u.createdAt !== undefined) row.created_at = u.createdAt;
  if (u.updatedAt !== undefined) row.updated_at = u.updatedAt;
  return row;
};

export const fromDbStaff = (r: DbRow): StaffAssignment => ({
  id: r.id,
  email: r.email,
  displayName: r.display_name,
  role: r.role,
  assignedDivisionId: r.assigned_division_id || undefined,
  assignedClassGroup: (r.assigned_class_group as ClassGroup) || undefined,
  canExport: Boolean(r.can_export),
  assignedBy: r.assigned_by || undefined,
  createdAt: r.created_at || undefined,
  updatedAt: r.updated_at || undefined
});

export const toDbStaff = (s: Partial<StaffAssignment>): DbRow => ({
  id: s.id,
  email: s.email,
  display_name: s.displayName,
  role: s.role,
  assigned_division_id: s.assignedDivisionId || null,
  assigned_class_group: s.assignedClassGroup || null,
  can_export: s.canExport ?? true,
  assigned_by: s.assignedBy || null,
  created_at: s.createdAt,
  updated_at: s.updatedAt
});

export const fromDbAppConfig = (r: DbRow): AppConfig => ({
  id: r.id,
  primaryDivisionWeight: Number(r.primary_division_weight ?? 60),
  secondaryDivisionWeight: Number(r.secondary_division_weight ?? 40),
  allowStudentDivisionSelection: Boolean(r.allow_student_division_selection ?? true),
  updatedBy: r.updated_by || undefined,
  updatedAt: r.updated_at || undefined
});

export const toDbAppConfig = (c: AppConfig): DbRow => ({
  id: c.id || 'default',
  primary_division_weight: c.primaryDivisionWeight,
  secondary_division_weight: c.secondaryDivisionWeight,
  allow_student_division_selection: c.allowStudentDivisionSelection,
  updated_by: c.updatedBy || null,
  updated_at: c.updatedAt || new Date().toISOString()
});

export const fromDbRoleCode = (r: DbRow): RoleCodeRecord => ({
  code: r.code,
  role: r.role,
  label: r.label || undefined,
  active: Boolean(r.active),
  updatedAt: r.updated_at || undefined
});

export const toDbRoleCode = (rc: RoleCodeRecord): DbRow => ({
  code: rc.code,
  role: rc.role,
  label: rc.label || null,
  active: rc.active,
  updated_at: rc.updatedAt || new Date().toISOString()
});

export const fromDbStudent = (r: DbRow): Student => ({
  id: r.id,
  nisn: r.nisn,
  name: r.name,
  classGroup: r.class_group as ClassGroup,
  email: r.email || '',
  phone: r.phone || undefined,
  gender: (r.gender || '-') as Student['gender'],
  primaryDivisionId: r.primary_division_id,
  secondaryDivisionId: r.secondary_division_id || '',
  isDpkCommittee: Boolean(r.is_dpk_committee),
  dpkRoleNote: r.dpk_role_note || undefined,
  status: (r.status || 'Aktif') as Student['status'],
  notes: r.notes || undefined,
  createdBy: r.created_by || undefined,
  createdAt: r.created_at || undefined,
  updatedAt: r.updated_at || undefined
});

export const toDbStudent = (s: Partial<Student>): DbRow => {
  const row: DbRow = {};
  if (s.id !== undefined) row.id = s.id;
  if (s.nisn !== undefined) row.nisn = s.nisn;
  if (s.name !== undefined) row.name = s.name;
  if (s.classGroup !== undefined) row.class_group = s.classGroup;
  if (s.email !== undefined) row.email = s.email;
  if (s.phone !== undefined) row.phone = s.phone || null;
  if (s.gender !== undefined) row.gender = s.gender;
  if (s.primaryDivisionId !== undefined) row.primary_division_id = s.primaryDivisionId;
  if (s.secondaryDivisionId !== undefined) row.secondary_division_id = s.secondaryDivisionId || '';
  if (s.isDpkCommittee !== undefined) row.is_dpk_committee = Boolean(s.isDpkCommittee);
  if (s.dpkRoleNote !== undefined) row.dpk_role_note = s.dpkRoleNote || null;
  if (s.status !== undefined) row.status = s.status;
  if (s.notes !== undefined) row.notes = s.notes || null;
  if (s.createdBy !== undefined) row.created_by = s.createdBy || null;
  if (s.createdAt !== undefined) row.created_at = s.createdAt;
  if (s.updatedAt !== undefined) row.updated_at = s.updatedAt;
  return row;
};

export const fromDbPeer = (r: DbRow): DivisionPeer => ({
  id: r.id,
  studentId: r.student_id,
  studentName: r.student_name,
  classGroup: r.class_group as ClassGroup,
  divisionId: r.division_id,
  divisionRole: r.division_role as 'utama' | 'pendukung',
  isDpkCommittee: Boolean(r.is_dpk_committee)
});

export const toDbPeer = (p: DivisionPeer): DbRow => ({
  id: p.id,
  student_id: p.studentId,
  student_name: p.studentName,
  class_group: p.classGroup,
  division_id: p.divisionId,
  division_role: p.divisionRole,
  is_dpk_committee: Boolean(p.isDpkCommittee)
});

export const fromDbAssessment = (r: DbRow): Assessment => ({
  id: r.id,
  studentId: r.student_id,
  studentName: r.student_name,
  classGroup: r.class_group as ClassGroup,
  divisionId: r.division_id,
  divisionName: r.division_name,
  projectStage: r.project_stage,
  stageNumber: Number(r.stage_number),
  dimensionId: r.dimension_id as DimensionId,
  dimensionName: r.dimension_name,
  formasiGrandDesain: r.formasi_grand_desain as FormasiHolistik,
  indicatorCode: r.indicator_code as IndicatorCode,
  indicatorTitle: r.indicator_title,
  growthLevel: r.growth_level as GrowthLevel,
  internalScore: Number(r.internal_score) as 1 | 2 | 3,
  nextStepMessage: r.next_step_message,
  feedback: r.feedback || undefined,
  teacherId: r.teacher_id,
  teacherName: r.teacher_name,
  date: r.date,
  createdAt: r.created_at || undefined,
  updatedAt: r.updated_at || undefined
});

export const toDbAssessment = (a: Assessment): DbRow => ({
  id: a.id,
  student_id: a.studentId,
  student_name: a.studentName,
  class_group: a.classGroup,
  division_id: a.divisionId,
  division_name: a.divisionName,
  project_stage: a.projectStage,
  stage_number: a.stageNumber,
  dimension_id: a.dimensionId,
  dimension_name: a.dimensionName,
  formasi_grand_desain: a.formasiGrandDesain,
  indicator_code: a.indicatorCode,
  indicator_title: a.indicatorTitle,
  growth_level: a.growthLevel,
  internal_score: a.internalScore,
  next_step_message: a.nextStepMessage,
  feedback: a.feedback || null,
  teacher_id: a.teacherId,
  teacher_name: a.teacherName,
  date: a.date,
  created_at: a.createdAt || new Date().toISOString(),
  updated_at: a.updatedAt || new Date().toISOString()
});

export const fromDbSelfAssessment = (r: DbRow): SelfAssessment => ({
  id: r.id,
  studentId: r.student_id,
  studentName: r.student_name,
  classGroup: r.class_group as ClassGroup,
  primaryDivisionId: r.primary_division_id || undefined,
  secondaryDivisionId: r.secondary_division_id || '',
  dimensionId: r.dimension_id as DimensionId,
  dimensionName: r.dimension_name,
  indicatorCode: r.indicator_code as IndicatorCode,
  indicatorTitle: r.indicator_title,
  growthLevel: r.growth_level as GrowthLevel,
  reflectionNote: r.reflection_note || undefined,
  createdAt: r.created_at || undefined,
  updatedAt: r.updated_at || undefined
});

export const toDbSelfAssessment = (sa: SelfAssessment): DbRow => ({
  id: sa.id,
  student_id: sa.studentId,
  student_name: sa.studentName,
  class_group: sa.classGroup,
  primary_division_id: sa.primaryDivisionId || '',
  secondary_division_id: sa.secondaryDivisionId || '',
  dimension_id: sa.dimensionId,
  dimension_name: sa.dimensionName,
  indicator_code: sa.indicatorCode,
  indicator_title: sa.indicatorTitle,
  growth_level: sa.growthLevel,
  reflection_note: sa.reflectionNote || null,
  created_at: sa.createdAt || new Date().toISOString(),
  updated_at: sa.updatedAt || new Date().toISOString()
});

export const fromDbReflection = (r: DbRow): StudentReflection => ({
  id: r.id,
  studentId: r.student_id,
  studentName: r.student_name,
  classGroup: r.class_group as ClassGroup,
  primaryDivisionId: r.primary_division_id,
  secondaryDivisionId: r.secondary_division_id || '',
  whoHelpedMeGrow: r.who_helped_me_grow || '',
  whoIHelpedAndHowItFelt: r.who_i_helped_and_how_it_felt || '',
  whenIFeltValued: r.when_i_felt_valued || '',
  whatIAmMostGratefulFor: r.what_i_am_most_grateful_for || '',
  whatIWantToImprove: r.what_i_want_to_improve || '',
  projectReflectionSummary: r.project_reflection_summary || '',
  mengalamiCintaNote: r.mengalami_cinta_note || '',
  menghidupiCintaNote: r.menghidupi_cinta_note || '',
  meneruskanCintaNote: r.meneruskan_cinta_note || '',
  isSubmitted: Boolean(r.is_submitted),
  submittedAt: r.submitted_at || undefined,
  updatedAt: r.updated_at || undefined
});

export const toDbReflection = (sr: StudentReflection): DbRow => ({
  id: sr.id,
  student_id: sr.studentId,
  student_name: sr.studentName,
  class_group: sr.classGroup,
  primary_division_id: sr.primaryDivisionId,
  secondary_division_id: sr.secondaryDivisionId || '',
  who_helped_me_grow: sr.whoHelpedMeGrow || '',
  who_i_helped_and_how_it_felt: sr.whoIHelpedAndHowItFelt || '',
  when_i_felt_valued: sr.whenIFeltValued || '',
  what_i_am_most_grateful_for: sr.whatIAmMostGratefulFor || '',
  what_i_want_to_improve: sr.whatIWantToImprove || '',
  project_reflection_summary: sr.projectReflectionSummary || '',
  mengalami_cinta_note: sr.mengalamiCintaNote || '',
  menghidupi_cinta_note: sr.menghidupiCintaNote || '',
  meneruskan_cinta_note: sr.meneruskanCintaNote || '',
  is_submitted: Boolean(sr.isSubmitted),
  submitted_at: sr.submittedAt || null,
  updated_at: sr.updatedAt || new Date().toISOString()
});

export const fromDbAppreciation = (r: DbRow): Appreciation => ({
  id: r.id,
  type: r.type as Appreciation['type'],
  toStudentId: r.to_student_id,
  toStudentName: r.to_student_name,
  toClassGroup: r.to_class_group as ClassGroup,
  divisionId: r.division_id || undefined,
  divisionName: r.division_name || undefined,
  fromUserId: r.from_user_id,
  fromStudentId: r.from_student_id || undefined,
  fromName: r.from_name,
  fromRole: r.from_role as UserRole,
  message: r.message,
  badgeTitle: r.badge_title || undefined,
  createdAt: r.created_at || undefined,
  updatedAt: r.updated_at || undefined
});

export const toDbAppreciation = (ap: Appreciation): DbRow => ({
  id: ap.id,
  type: ap.type,
  to_student_id: ap.toStudentId,
  to_student_name: ap.toStudentName,
  to_class_group: ap.toClassGroup,
  division_id: ap.divisionId || '',
  division_name: ap.divisionName || '',
  from_user_id: ap.fromUserId,
  from_student_id: ap.fromStudentId || null,
  from_name: ap.fromName,
  from_role: ap.fromRole,
  message: ap.message,
  badge_title: ap.badgeTitle || null,
  created_at: ap.createdAt || new Date().toISOString(),
  updated_at: ap.updatedAt || new Date().toISOString()
});

export const fromDbHomeroomNote = (r: DbRow): HomeroomNote => ({
  id: r.id,
  studentId: r.student_id,
  studentName: r.student_name,
  classGroup: r.class_group as ClassGroup,
  teacherId: r.teacher_id,
  teacherName: r.teacher_name,
  attitudeNote: r.attitude_note || '',
  independenceNote: r.independence_note || '',
  holisticInvolvementNote: r.holistic_involvement_note || '',
  needsFollowUp: Boolean(r.needs_follow_up),
  createdAt: r.created_at || undefined,
  updatedAt: r.updated_at || undefined
});

export const toDbHomeroomNote = (hn: HomeroomNote): DbRow => ({
  id: hn.id,
  student_id: hn.studentId,
  student_name: hn.studentName,
  class_group: hn.classGroup,
  teacher_id: hn.teacherId,
  teacher_name: hn.teacherName,
  attitude_note: hn.attitudeNote || '',
  independence_note: hn.independenceNote || '',
  holistic_involvement_note: hn.holisticInvolvementNote || '',
  needs_follow_up: Boolean(hn.needsFollowUp),
  created_at: hn.createdAt || new Date().toISOString(),
  updated_at: hn.updatedAt || new Date().toISOString()
});

export const fromDbProgressLog = (r: DbRow): ProgressLog => ({
  id: r.id,
  studentId: r.student_id,
  studentName: r.student_name,
  classGroup: r.class_group as ClassGroup,
  primaryDivisionId: r.primary_division_id || undefined,
  secondaryDivisionId: r.secondary_division_id || '',
  stageTitle: r.stage_title,
  stageNumber: Number(r.stage_number),
  description: r.description || '',
  status: r.status as ProgressStatus,
  milestoneDate: r.milestone_date || '',
  artifactsNote: r.artifacts_note || undefined,
  teacherFeedback: r.teacher_feedback || undefined,
  studentReflection: r.student_reflection || undefined,
  updatedBy: r.updated_by || undefined,
  createdAt: r.created_at || undefined,
  updatedAt: r.updated_at || undefined
});

export const toDbProgressLog = (pl: Partial<ProgressLog>): DbRow => {
  const row: DbRow = {};
  if (pl.id !== undefined) row.id = pl.id;
  if (pl.studentId !== undefined) row.student_id = pl.studentId;
  if (pl.studentName !== undefined) row.student_name = pl.studentName;
  if (pl.classGroup !== undefined) row.class_group = pl.classGroup;
  if (pl.primaryDivisionId !== undefined) row.primary_division_id = pl.primaryDivisionId || null;
  if (pl.secondaryDivisionId !== undefined) row.secondary_division_id = pl.secondaryDivisionId || '';
  if (pl.stageTitle !== undefined) row.stage_title = pl.stageTitle;
  if (pl.stageNumber !== undefined) row.stage_number = pl.stageNumber;
  if (pl.description !== undefined) row.description = pl.description;
  if (pl.status !== undefined) row.status = pl.status;
  if (pl.milestoneDate !== undefined) row.milestone_date = pl.milestoneDate;
  if (pl.artifactsNote !== undefined) row.artifacts_note = pl.artifactsNote || null;
  if (pl.teacherFeedback !== undefined) row.teacher_feedback = pl.teacherFeedback || null;
  if (pl.studentReflection !== undefined) row.student_reflection = pl.studentReflection || null;
  if (pl.updatedBy !== undefined) row.updated_by = pl.updatedBy || null;
  if (pl.createdAt !== undefined) row.created_at = pl.createdAt;
  if (pl.updatedAt !== undefined) row.updated_at = pl.updatedAt;
  return row;
};
