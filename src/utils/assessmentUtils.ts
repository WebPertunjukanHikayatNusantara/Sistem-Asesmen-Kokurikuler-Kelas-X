import {
  Student,
  Assessment,
  SelfAssessment,
  StudentReflection,
  ProgressLog,
  Appreciation,
  HomeroomNote,
  AppConfig,
  GrowthLevel,
  GROWTH_LEVELS,
  FIVE_HOLISTIC_DIMENSIONS,
  DimensionId,
  ALL_BEHAVIOR_INDICATORS,
  IndicatorCode,
  getDivisionById
} from '../types';

export const DEFAULT_APP_CONFIG: AppConfig = {
  id: 'default',
  primaryDivisionWeight: 60,
  secondaryDivisionWeight: 40,
  allowStudentDivisionSelection: true
};

export function scoreToGrowthLevel(score: number): GrowthLevel {
  if (score >= 2.45) return 'Menjadi Teladan';
  if (score >= 1.55) return 'Berkembang';
  return 'Mulai Tumbuh';
}

export function getIndicatorMeta(code: IndicatorCode) {
  return ALL_BEHAVIOR_INDICATORS.find((ind) => ind.code === code);
}

export function getNextStepForIndicator(code: IndicatorCode, level: GrowthLevel): string {
  const ind = getIndicatorMeta(code);
  if (!ind) return GROWTH_LEVELS[level].generalMeaning;
  return ind.levels[level]?.nextStep || GROWTH_LEVELS[level].generalMeaning;
}

export interface DimensionGrowthSummary {
  dimensionId: DimensionId;
  dimensionName: string;
  formasi: string;
  stYosefValues: string;
  assessmentCount: number;
  internalAverage: number | null; // Strictly for weighted math & authorized teacher/admin view
  growthLevel: GrowthLevel | null;
  latestNextStep: string;
}

export interface StudentCombinedSummary {
  student: Student;
  primaryDivisionName: string;
  secondaryDivisionName?: string;
  isDualDivision: boolean;
  primaryCount: number;
  secondaryCount: number;
  primaryAvg: number | null;
  secondaryAvg: number | null;
  weightedInternalScore: number | null; // NO automatic bonus for dual division
  overallGrowthLevel: GrowthLevel | null;
  weightUsedLabel: string;
  dimensionSummaries: DimensionGrowthSummary[];
}

export function computeStudentCombinedSummary(
  student: Student,
  allStudentAssessments: Assessment[],
  config: AppConfig = DEFAULT_APP_CONFIG
): StudentCombinedSummary {
  const primaryAssessments = allStudentAssessments.filter(
    (a) => a.divisionId === student.primaryDivisionId
  );
  const secondaryAssessments = student.secondaryDivisionId
    ? allStudentAssessments.filter((a) => a.divisionId === student.secondaryDivisionId)
    : [];

  const avg = (list: Assessment[]): number | null => {
    if (list.length === 0) return null;
    const sum = list.reduce((acc, item) => acc + (item.internalScore || GROWTH_LEVELS[item.growthLevel]?.internalScore || 2), 0);
    return sum / list.length;
  };

  const primaryAvg = avg(primaryAssessments);
  const secondaryAvg = avg(secondaryAssessments);
  const isDualDivision = Boolean(student.secondaryDivisionId);

  let weightedInternalScore: number | null = null;
  let weightUsedLabel = '100% Divisi Utama';

  if (!isDualDivision) {
    weightedInternalScore = primaryAvg;
    weightUsedLabel = '100% Divisi Utama';
  } else {
    const w1 = config.primaryDivisionWeight / 100;
    const w2 = config.secondaryDivisionWeight / 100;
    weightUsedLabel = `${config.primaryDivisionWeight}% Utama / ${config.secondaryDivisionWeight}% Pendukung`;

    if (primaryAvg !== null && secondaryAvg !== null) {
      weightedInternalScore = Number((primaryAvg * w1 + secondaryAvg * w2).toFixed(2));
    } else if (primaryAvg !== null) {
      weightedInternalScore = Number(primaryAvg.toFixed(2));
    } else if (secondaryAvg !== null) {
      weightedInternalScore = Number(secondaryAvg.toFixed(2));
    }
  }

  const dimensionSummaries: DimensionGrowthSummary[] = FIVE_HOLISTIC_DIMENSIONS.map((dim) => {
    const dimPrimary = primaryAssessments.filter((a) => a.dimensionId === dim.id);
    const dimSecondary = secondaryAssessments.filter((a) => a.dimensionId === dim.id);
    const pDimAvg = avg(dimPrimary);
    const sDimAvg = avg(dimSecondary);

    let dimScore: number | null = null;
    if (!isDualDivision) {
      dimScore = pDimAvg;
    } else if (pDimAvg !== null && sDimAvg !== null) {
      dimScore =
        pDimAvg * (config.primaryDivisionWeight / 100) +
        sDimAvg * (config.secondaryDivisionWeight / 100);
    } else if (pDimAvg !== null) {
      dimScore = pDimAvg;
    } else if (sDimAvg !== null) {
      dimScore = sDimAvg;
    }

    const allDimAssessments = [...dimPrimary, ...dimSecondary].sort((a, b) =>
      (b.createdAt || '').localeCompare(a.createdAt || '')
    );

    const growthLevel = dimScore !== null ? scoreToGrowthLevel(dimScore) : null;
    const latestNextStep =
      allDimAssessments[0]?.nextStepMessage ||
      (growthLevel ? GROWTH_LEVELS[growthLevel].generalMeaning : 'Belum ada catatan pendampingan pada dimensi ini.');

    return {
      dimensionId: dim.id,
      dimensionName: dim.name,
      formasi: dim.formasi,
      stYosefValues: dim.stYosefValues,
      assessmentCount: allDimAssessments.length,
      internalAverage: dimScore !== null ? Number(dimScore.toFixed(2)) : null,
      growthLevel,
      latestNextStep
    };
  });

  return {
    student,
    primaryDivisionName: getDivisionById(student.primaryDivisionId)?.shortName || student.primaryDivisionId,
    secondaryDivisionName: student.secondaryDivisionId
      ? getDivisionById(student.secondaryDivisionId)?.shortName || student.secondaryDivisionId
      : undefined,
    isDualDivision,
    primaryCount: primaryAssessments.length,
    secondaryCount: secondaryAssessments.length,
    primaryAvg: primaryAvg !== null ? Number(primaryAvg.toFixed(2)) : null,
    secondaryAvg: secondaryAvg !== null ? Number(secondaryAvg.toFixed(2)) : null,
    weightedInternalScore,
    overallGrowthLevel: weightedInternalScore !== null ? scoreToGrowthLevel(weightedInternalScore) : null,
    weightUsedLabel,
    dimensionSummaries
  };
}

export interface StudentMentoringAlert {
  student: Student;
  missingReflection: boolean;
  missingSelfAssessment: boolean;
  stalledStageNames: string[];
  mulaiTumbuhCount: number;
  missingTeacherAppreciation: boolean;
  homeroomFollowUp: boolean;
  needsWarmGreeting: boolean;
  reasons: string[];
}

export function buildMentoringOverview(
  students: Student[],
  assessments: Assessment[],
  selfAssessments: SelfAssessment[],
  reflections: StudentReflection[],
  progressLogs: ProgressLog[],
  appreciations: Appreciation[],
  homeroomNotes: HomeroomNote[]
): {
  alerts: StudentMentoringAlert[];
  missingReflectionCount: number;
  missingSelfAssessmentCount: number;
  stalledStudentsCount: number;
  needsWarmGreetingCount: number;
  completedReflectionCount: number;
} {
  const alerts: StudentMentoringAlert[] = students.map((student) => {
    const stdReflection = reflections.find((r) => r.studentId === student.id && r.isSubmitted);
    const stdSelf = selfAssessments.filter((sa) => sa.studentId === student.id);
    const stdLogs = progressLogs.filter((l) => l.studentId === student.id);
    const stdStalled = stdLogs
      .filter((l) => l.status === 'Tersendat / Perlu Sapaan')
      .map((l) => l.stageTitle);
    const stdAssessments = assessments.filter((a) => a.studentId === student.id);
    const mulaiTumbuhCount = stdAssessments.filter((a) => a.growthLevel === 'Mulai Tumbuh').length;
    const teacherAppreciations = appreciations.filter(
      (ap) => ap.toStudentId === student.id && ap.type === 'teacher_appreciation'
    );
    const hrNote = homeroomNotes.find((h) => h.studentId === student.id);

    const missingReflection = !stdReflection;
    const missingSelfAssessment = stdSelf.length === 0;
    const missingTeacherAppreciation = teacherAppreciations.length === 0;
    const homeroomFollowUp = Boolean(hrNote?.needsFollowUp);

    const reasons: string[] = [];
    if (student.status === 'Perlu Sapaan') reasons.push('Ditandai Perlu Sapaan');
    if (homeroomFollowUp) reasons.push('Catatan Wali Kelas meminta tindak lanjut');
    if (stdStalled.length > 0) reasons.push(`Tersendat di ${stdStalled[0]}`);
    if (mulaiTumbuhCount > 0) reasons.push(`${mulaiTumbuhCount} indikator masih Mulai Tumbuh`);
    if (missingTeacherAppreciation && stdAssessments.length > 0) {
      reasons.push('Belum menerima apresiasi naratif guru');
    }

    const needsWarmGreeting =
      student.status === 'Perlu Sapaan' ||
      homeroomFollowUp ||
      stdStalled.length > 0 ||
      mulaiTumbuhCount >= 2;

    return {
      student,
      missingReflection,
      missingSelfAssessment,
      stalledStageNames: stdStalled,
      mulaiTumbuhCount,
      missingTeacherAppreciation,
      homeroomFollowUp,
      needsWarmGreeting,
      reasons
    };
  });

  return {
    alerts,
    missingReflectionCount: alerts.filter((a) => a.missingReflection).length,
    missingSelfAssessmentCount: alerts.filter((a) => a.missingSelfAssessment).length,
    stalledStudentsCount: alerts.filter((a) => a.stalledStageNames.length > 0).length,
    needsWarmGreetingCount: alerts.filter((a) => a.needsWarmGreeting).length,
    completedReflectionCount: alerts.filter((a) => !a.missingReflection).length
  };
}
