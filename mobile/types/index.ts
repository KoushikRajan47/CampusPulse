export interface Student {
  regNumber: string;
  name: string;
  program: string;
  semester: number;
  section: string;
  advisorName: string;
  advisorEmail: string;
  campus: string;
  cgpa: number;
  overallAttendance: number;
}

export interface Course {
  code: string;
  title: string;
  category: string;
  slot: string;
  faculty: string;
  room: string;
  conducted: number;
  attended: number;
  percentage: number;
  minRequired: number;
  safeBunks: number;
  classesNeeded: number;
  status: 'good' | 'warning' | 'danger';
}

export interface AttendanceResponse {
  student: Student;
  minTarget: number;
  overall: {
    totalConducted: number;
    totalAttended: number;
    percentage: number;
    safeBunks: number;
    classesNeeded: number;
    status: 'good' | 'warning' | 'danger';
  };
  courses: Course[];
}

export interface TimetablePeriod {
  period: number;
  time: string;
  code: string;
  title: string;
  room: string;
  slot: string;
}

export interface TimetableResponse {
  currentDayOrder: number;
  schedule: Record<number, TimetablePeriod[]>;
}

export interface ODClaim {
  id: string;
  eventName: string;
  eventType: string;
  dates: string[];
  periodsMissed: number[];
  affectedCourses: string[];
  approvalStatus: string;
  academiaStatus: string;
  hasDiscrepancy: boolean;
  certificateRef: string;
  notes: string;
}

export interface GhostAbsence {
  date: string;
  dayOrder: number;
  period: number;
  courseCode: string;
  courseTitle: string;
  status: string;
  claimedOD: boolean;
  odId: string | null;
  isGhostAbsent: boolean;
  appealStatus: string;
}

export interface ODAuditResponse {
  timestamp: string;
  totalAbsencesAudited: number;
  ghostAbsencesFound: number;
  uncreditedODsFound: number;
  ghostAbsences: GhostAbsence[];
  uncreditedODs: ODClaim[];
  alertMessage: string;
}

export interface AppealEmailDraft {
  recipient: string;
  recipientName: string;
  subject: string;
  body: string;
  mailToLink: string;
}

export interface CatalogCourse {
  id: string;
  code: string;
  title: string;
  credits: number;
  slots: string[];
  faculty: string;
  room: string;
  seatsLeft: number;
}

export interface ConflictDetail {
  slot: string;
  courses: Array<{ id: string; code: string; title: string; faculty: string }>;
  reason: string;
}

export interface ValidationResult {
  isValid: boolean;
  totalCourses: number;
  totalCredits: number;
  conflictCount: number;
  conflicts: ConflictDetail[];
  selectedCourses: CatalogCourse[];
  quickCopyCodes: string;
  quickCopyDetailed: string;
  statusMessage: string;
}

