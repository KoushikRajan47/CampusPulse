import {
  AttendanceResponse,
  TimetableResponse,
  ODAuditResponse,
  ODClaim,
  GhostAbsence,
  AppealEmailDraft,
  CatalogCourse,
  ValidationResult
} from '../types';

const API_BASE = 'http://localhost:4000/api';

export const ApiService = {
  // 1. Fetch attendance with Safe Bunk calculation
  async getCourses(target = 75): Promise<AttendanceResponse> {
    const res = await fetch(`${API_BASE}/academia/courses?target=${target}`);
    if (!res.ok) throw new Error('Failed to load courses');
    return res.json();
  },

  // 2. Fetch Day Order Timetable
  async getTimetable(): Promise<TimetableResponse> {
    const res = await fetch(`${API_BASE}/academia/timetable`);
    if (!res.ok) throw new Error('Failed to load timetable');
    return res.json();
  },

  // 3. Feature 1: Run Ghost Absent & OD Audit
  async getODAudit(): Promise<ODAuditResponse> {
    const res = await fetch(`${API_BASE}/od/audit`);
    if (!res.ok) throw new Error('Failed to run OD audit');
    return res.json();
  },

  // 4. Feature 1: Get OD claims
  async getODClaims(): Promise<ODClaim[]> {
    const res = await fetch(`${API_BASE}/od/claims`);
    if (!res.ok) throw new Error('Failed to load OD claims');
    return res.json();
  },

  // 5. Feature 1: Submit new OD Claim
  async submitODClaim(claim: Partial<ODClaim>): Promise<ODClaim> {
    const res = await fetch(`${API_BASE}/od/claims`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(claim)
    });
    if (!res.ok) throw new Error('Failed to submit OD claim');
    return res.json();
  },

  // 6. Feature 1: Generate 1-Click Appeal Draft
  async generateAppealDraft(absence: GhostAbsence): Promise<AppealEmailDraft> {
    const res = await fetch(`${API_BASE}/od/appeal-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(absence)
    });
    if (!res.ok) throw new Error('Failed to generate appeal draft');
    return res.json();
  },

  // 7. Feature 4: Course Registration Clash Simulator
  async getCatalog(): Promise<CatalogCourse[]> {
    const res = await fetch(`${API_BASE}/simulator/catalog`);
    if (!res.ok) throw new Error('Failed to load course catalog');
    return res.json();
  },

  async getPlans(): Promise<{ rawPlans: Record<string, string[]>; validatedPlans: Record<string, ValidationResult> }> {
    const res = await fetch(`${API_BASE}/simulator/plans`);
    if (!res.ok) throw new Error('Failed to load plans');
    return res.json();
  },

  async validateSchedule(courseIds: string[]): Promise<ValidationResult> {
    const res = await fetch(`${API_BASE}/simulator/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseIds })
    });
    if (!res.ok) throw new Error('Failed to validate schedule');
    return res.json();
  },

  async savePlan(planName: string, courseIds: string[]): Promise<ValidationResult> {
    const res = await fetch(`${API_BASE}/simulator/save-plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planName, courseIds })
    });
    if (!res.ok) throw new Error('Failed to save plan');
    return res.json();
  }
};

