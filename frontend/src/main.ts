import './style.css';

// Types
interface Student {
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

interface Course {
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

interface AttendanceResponse {
  student: Student;
  minTarget: number;
  overall: {
    totalConducted: number;
    totalAttended: number;
    percentage: number;
    safeBunks: number;
    classesNeeded: number;
    status: string;
  };
  courses: Course[];
}

interface GhostAbsence {
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

interface ODClaim {
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

interface ODAuditResponse {
  timestamp: string;
  totalAbsencesAudited: number;
  ghostAbsencesFound: number;
  uncreditedODsFound: number;
  ghostAbsences: GhostAbsence[];
  uncreditedODs: ODClaim[];
  alertMessage: string;
}

interface CatalogCourse {
  id: string;
  code: string;
  title: string;
  credits: number;
  slots: string[];
  faculty: string;
  room: string;
  seatsLeft: number;
}

interface ValidationResult {
  isValid: boolean;
  totalCourses: number;
  totalCredits: number;
  conflictCount: number;
  conflicts: Array<{ slot: string; reason: string }>;
  selectedCourses: CatalogCourse[];
  quickCopyCodes: string;
  statusMessage: string;
}

interface TimetablePeriod {
  period: number;
  time: string;
  code: string;
  title: string;
  room: string;
  slot: string;
}

interface TimetableResponse {
  currentDayOrder: number;
  schedule: Record<number, TimetablePeriod[]>;
}

// State
let activeTab: 'attendance' | 'od' | 'simulator' | 'timetable' | 'security' = 'attendance';
let targetThreshold = 75;
let activePlan: 'Plan A' | 'Plan B' | 'Plan C' = 'Plan A';
let selectedPlanIds: string[] = ['c1', 'c2', 'c3', 'c4', 'c5', 'c10'];
let selectedDay = 3;

// Helper: Fetch JSON
async function fetchAPI<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`/api${url}`, options);
  if (!res.ok) throw new Error(`API error: ${res.statusText}`);
  return res.json();
}

// Room Decoder Helper
function decodeRoom(roomCode: string) {
  if (roomCode.startsWith('TP-')) {
    const num = roomCode.replace('TP-', '');
    return { bldg: 'Tech Park', flr: `${num.charAt(0)}th Floor`, rm: `Room ${num}`, tip: 'Nearest Lift: Lift B' };
  }
  if (roomCode.startsWith('UB-')) {
    const num = roomCode.replace('UB-', '');
    const flr = num.length >= 4 ? num.substring(0, 2) : num.charAt(0);
    return { bldg: 'University Building (UB)', flr: `${flr}th Floor`, rm: `Room ${num}`, tip: 'East Stairwell' };
  }
  if (roomCode.startsWith('BEL-')) {
    const num = roomCode.replace('BEL-', '');
    return { bldg: 'Believers Block', flr: `${num.charAt(0)}th Floor`, rm: `Room ${num}`, tip: 'Near Bio-Engg Connector' };
  }
  return { bldg: 'Campus Building', flr: 'Main Block', rm: roomCode, tip: 'Campus Directory' };
}

// Render Shell
function renderShell() {
  const app = document.getElementById('app');
  if (!app) return;

  app.innerHTML = `
    <div class="mobile-frame">
      <!-- App Header -->
      <header class="app-header">
        <div class="brand">
          <div class="logo-badge">CP</div>
          <div>
            <div class="brand-title">CampusPulse</div>
            <div class="brand-tagline">SRM Student Intelligence</div>
          </div>
        </div>
        <div class="status-indicator">
          <span class="status-dot"></span>
          <span class="status-label">Hybrid Online</span>
        </div>
      </header>

      <!-- Main Scrollable Content -->
      <main id="tab-content" class="tab-content"></main>

      <!-- Bottom Nav Bar -->
      <nav class="bottom-nav">
        <button class="nav-btn ${activeTab === 'attendance' ? 'active' : ''}" data-tab="attendance">
          <span class="nav-icon">📊</span>
          <span class="nav-text">Attendance</span>
        </button>
        <button class="nav-btn ${activeTab === 'od' ? 'active' : ''}" data-tab="od">
          <span class="nav-icon">🚨</span>
          <span class="nav-text">OD Auditor</span>
        </button>
        <button class="nav-btn ${activeTab === 'simulator' ? 'active' : ''}" data-tab="simulator">
          <span class="nav-icon">🎰</span>
          <span class="nav-text">Clash Sim</span>
        </button>
        <button class="nav-btn ${activeTab === 'timetable' ? 'active' : ''}" data-tab="timetable">
          <span class="nav-icon">📅</span>
          <span class="nav-text">Timetable</span>
        </button>
        <button class="nav-btn ${activeTab === 'security' ? 'active' : ''}" data-tab="security">
          <span class="nav-icon">⚙️</span>
          <span class="nav-text">Security</span>
        </button>
      </nav>
    </div>

    <!-- Modal Container -->
    <div id="modal-container" class="modal-overlay hidden"></div>
  `;

  document.querySelectorAll('.bottom-nav button').forEach(btn => {
    btn.addEventListener('click', () => {
      activeTab = btn.getAttribute('data-tab') as typeof activeTab;
      renderShell();
      loadActiveTab();
    });
  });
}

// Load Active Tab View
async function loadActiveTab() {
  const content = document.getElementById('tab-content');
  if (!content) return;

  content.innerHTML = `<div class="loader-box"><div class="spinner"></div><p>Syncing SRM Campus Engine...</p></div>`;

  try {
    switch (activeTab) {
      case 'attendance':
        content.innerHTML = await renderAttendanceView();
        bindAttendanceEvents();
        break;
      case 'od':
        content.innerHTML = await renderODView();
        bindODEvents();
        break;
      case 'simulator':
        content.innerHTML = await renderSimulatorView();
        bindSimulatorEvents();
        break;
      case 'timetable':
        content.innerHTML = await renderTimetableView();
        bindTimetableEvents();
        break;
      case 'security':
        content.innerHTML = renderSecurityView();
        break;
    }
  } catch (err: any) {
    content.innerHTML = `<div class="error-box"><h3>Sync Error</h3><p>${err.message}</p></div>`;
  }
}

// 1. Attendance & Safe Bunk View
async function renderAttendanceView(): Promise<string> {
  const data = await fetchAPI<AttendanceResponse>(`/academia/courses?target=${targetThreshold}`);
  const { student, overall, courses } = data;

  return `
    <div class="view-container">
      <!-- Student Card -->
      <div class="student-card">
        <div>
          <div class="student-name">${student.name}</div>
          <div class="student-sub">${student.regNumber} · Sec ${student.section} · Sem ${student.semester}</div>
          <div class="student-campus">${student.campus}</div>
        </div>
        <div class="cgpa-badge">
          <div class="cgpa-label">CGPA</div>
          <div class="cgpa-val">${student.cgpa.toFixed(2)}</div>
        </div>
      </div>

      <!-- Day Order Quick Banner -->
      <div class="banner-box day-banner clickable" id="goto-timetable">
        <div class="day-badge">Day 3</div>
        <div class="banner-text">
          <div class="banner-title">Today's Schedule Active</div>
          <div class="banner-desc">Next: DAA at TP-502 (Period 3) • Tap for route</div>
        </div>
        <span class="arrow">→</span>
      </div>

      <!-- Ghost Absent Quick Action Banner -->
      <div class="banner-box alert-banner clickable" id="goto-od">
        <span class="alert-icon">⚠️</span>
        <div class="banner-text">
          <div class="banner-title alert-title">Ghost Absent Alert Detected!</div>
          <div class="banner-desc alert-desc">2 absences found on 2026-10-24 during Milan '26 OD. Tap to appeal.</div>
        </div>
        <span class="action-btn-sm">Review</span>
      </div>

      <!-- Overall Attendance Card -->
      <div class="card overall-card">
        <div class="overall-header">
          <div>
            <div class="card-title">Overall Attendance</div>
            <div class="card-subtitle">${overall.totalAttended} / ${overall.totalConducted} Hours Attended</div>
          </div>
          <div class="pct-pill ${overall.percentage >= targetThreshold ? 'good' : 'danger'}">
            ${overall.percentage.toFixed(1)}%
          </div>
        </div>

        <!-- Target Selector -->
        <div class="target-row">
          <span class="target-label">Target Minimum:</span>
          ${[75, 80, 85].map(t => `
            <button class="target-btn ${targetThreshold === t ? 'active' : ''}" data-target="${t}">${t}%</button>
          `).join('')}
        </div>

        <div class="bunk-verdict ${overall.safeBunks > 0 ? 'verdict-good' : 'verdict-danger'}">
          ${overall.safeBunks > 0
            ? `🛡️ <strong>Safe Buffer:</strong> You can safely miss <strong>${overall.safeBunks} hours</strong> overall while staying above ${targetThreshold}%.`
            : `🚨 <strong>Attendance Deficit:</strong> You must attend the next <strong>${overall.classesNeeded} hours</strong> consecutively to reach ${targetThreshold}%.`
          }
        </div>
      </div>

      <!-- Course Breakdown Header -->
      <div class="section-title-row">
        <h3>Course Breakdown</h3>
        <span class="count-tag">${courses.length} Enrolled</span>
      </div>

      <!-- Courses List -->
      <div class="course-list">
        ${courses.map(c => `
          <div class="card course-card">
            <div class="course-top">
              <div>
                <div class="code-row">
                  <span class="course-code">${c.code}</span>
                  <span class="slot-pill">Slot ${c.slot}</span>
                </div>
                <div class="course-name">${c.title}</div>
                <div class="course-faculty">${c.faculty} · ${c.room}</div>
              </div>
              <div class="pct-pill-sm ${c.percentage >= targetThreshold ? 'good' : 'danger'}">
                ${c.percentage.toFixed(1)}%
              </div>
            </div>

            <!-- Progress Bar -->
            <div class="progress-bar-bg">
              <div class="progress-bar-fill ${c.percentage >= targetThreshold ? 'good' : 'danger'}" style="width: ${Math.min(100, c.percentage)}%"></div>
            </div>

            <div class="course-footer">
              <span class="stat-hours">${c.attended}/${c.conducted} Hours</span>
              ${c.safeBunks > 0
                ? `<span class="bunk-tag safe">✓ Can miss ${c.safeBunks} class${c.safeBunks > 1 ? 'es' : ''}</span>`
                : `<span class="bunk-tag danger">⚠️ Must attend next ${c.classesNeeded} class${c.classesNeeded > 1 ? 'es' : ''}</span>`
              }
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function bindAttendanceEvents() {
  document.getElementById('goto-timetable')?.addEventListener('click', () => {
    activeTab = 'timetable';
    renderShell();
    loadActiveTab();
  });

  document.getElementById('goto-od')?.addEventListener('click', () => {
    activeTab = 'od';
    renderShell();
    loadActiveTab();
  });

  document.querySelectorAll('.target-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      targetThreshold = Number(btn.getAttribute('data-target'));
      loadActiveTab();
    });
  });
}

// 2. Feature 1: Ghost Absent & OD Auditor View
async function renderODView(): Promise<string> {
  const [audit, claims] = await Promise.all([
    fetchAPI<ODAuditResponse>('/od/audit'),
    fetchAPI<ODClaim[]>('/od/claims')
  ]);

  return `
    <div class="view-container">
      <div class="hero-banner">
        <h2>Ghost Absent & OD Auditor</h2>
        <p>Detects when university professors mistakenly mark you absent during approved On-Duty events before the 7-day cutoff.</p>
      </div>

      <!-- Discrepancy Status Card -->
      <div class="card status-card ${audit.ghostAbsencesFound > 0 ? 'status-danger' : 'status-good'}">
        <span class="status-icon">${audit.ghostAbsencesFound > 0 ? '🚨' : '✅'}</span>
        <div>
          <div class="status-title">${audit.ghostAbsencesFound} Uncredited Ghost Absence(s) Detected</div>
          <div class="status-desc">${audit.alertMessage}</div>
        </div>
      </div>

      <!-- Discrepancy List -->
      <div class="section-title-row">
        <h3>Detected Ghost Absences</h3>
        <span class="count-tag-warn">${audit.ghostAbsences.length} Found</span>
      </div>

      ${audit.ghostAbsences.map((item, idx) => `
        <div class="card absence-card">
          <div class="absence-header">
            <div>
              <div class="badge-row">
                <span class="tag-ghost">Ghost Absent</span>
                <span class="absence-date">${item.date} · Period ${item.period}</span>
              </div>
              <div class="course-name">${item.courseTitle}</div>
              <div class="course-code-dim">${item.courseCode} (Day Order ${item.dayOrder})</div>
            </div>
            <span class="status-absent">Absent</span>
          </div>

          <div class="od-linked-box">
            <span class="od-label">Approved OD Reference:</span>
            <div class="od-desc">Ref: ${item.odId} (Milan '26 Hackathon) — Signed by HoD, but professor marked Absent.</div>
          </div>

          <button class="btn-appeal" data-idx="${idx}">
            ✉️ Generate 1-Click Appeal Email to FA
          </button>
        </div>
      `).join('')}

      <!-- OD Claims Tracker -->
      <div class="section-title-row" style="margin-top: 24px;">
        <h3>Logged OD Claims</h3>
        <button class="btn-add-claim" id="btn-open-claim-modal">+ Log New OD</button>
      </div>

      ${claims.map(claim => `
        <div class="card claim-card">
          <div class="claim-top">
            <div>
              <div class="claim-title">${claim.eventName}</div>
              <div class="claim-dates">Dates: ${claim.dates.join(', ')}</div>
            </div>
            <span class="claim-status ${claim.hasDiscrepancy ? 'warn' : 'ok'}">${claim.academiaStatus}</span>
          </div>
          <p class="claim-notes">${claim.notes}</p>
          <div class="claim-meta">
            <span>📎 ${claim.certificateRef}</span>
            <span class="claim-check">✓ ${claim.approvalStatus}</span>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function bindODEvents() {
  document.querySelectorAll('.btn-appeal').forEach(btn => {
    btn.addEventListener('click', async () => {
      try {
        const audit = await fetchAPI<ODAuditResponse>('/od/audit');
        const item = audit.ghostAbsences[0];
        const draft = await fetchAPI<{ recipient: string; recipientName: string; subject: string; body: string; mailToLink: string }>('/od/appeal-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item)
        });

        openAppealModal(draft);
      } catch (err: any) {
        alert('Error: ' + err.message);
      }
    });
  });

  document.getElementById('btn-open-claim-modal')?.addEventListener('click', () => {
    openClaimModal();
  });
}

function openAppealModal(draft: { recipient: string; recipientName: string; subject: string; body: string; mailToLink: string }) {
  const modal = document.getElementById('modal-container');
  if (!modal) return;

  modal.innerHTML = `
    <div class="modal-box">
      <div class="modal-header">
        <h3>Faculty Advisor Appeal Draft</h3>
        <button class="modal-close" id="modal-close">✕</button>
      </div>
      <div class="modal-body">
        <div class="field-group">
          <label>Recipient:</label>
          <div class="field-val">${draft.recipient} (${draft.recipientName})</div>
        </div>
        <div class="field-group">
          <label>Subject:</label>
          <div class="field-val">${draft.subject}</div>
        </div>
        <div class="field-group">
          <label>Email Body:</label>
          <pre class="email-preview">${draft.body}</pre>
        </div>
      </div>
      <div class="modal-footer">
        <a href="${draft.mailToLink}" class="btn-primary" target="_blank">Open in Email Client</a>
      </div>
    </div>
  `;

  modal.classList.remove('hidden');
  document.getElementById('modal-close')?.addEventListener('click', () => modal.classList.add('hidden'));
}

function openClaimModal() {
  const modal = document.getElementById('modal-container');
  if (!modal) return;

  modal.innerHTML = `
    <div class="modal-box">
      <div class="modal-header">
        <h3>Log OD Event for Tracking</h3>
        <button class="modal-close" id="modal-close">✕</button>
      </div>
      <div class="modal-body">
        <div class="input-row">
          <label>Event Name</label>
          <input type="text" id="new-event-name" placeholder="e.g. SRM Milan Hackathon" class="text-input" />
        </div>
        <div class="input-row">
          <label>Date of Event</label>
          <input type="text" id="new-event-date" value="2026-11-10" class="text-input" />
        </div>
        <div class="input-row">
          <label>Notes / Proof</label>
          <textarea id="new-event-notes" placeholder="Approved by FA or HoD" class="text-input" rows="3"></textarea>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-primary" id="btn-save-claim">Save OD Claim</button>
      </div>
    </div>
  `;

  modal.classList.remove('hidden');
  document.getElementById('modal-close')?.addEventListener('click', () => modal.classList.add('hidden'));
  document.getElementById('btn-save-claim')?.addEventListener('click', async () => {
    const eventName = (document.getElementById('new-event-name') as HTMLInputElement)?.value;
    const date = (document.getElementById('new-event-date') as HTMLInputElement)?.value;
    const notes = (document.getElementById('new-event-notes') as HTMLTextAreaElement)?.value;

    if (!eventName) return alert('Event Name is required');

    await fetchAPI('/od/claims', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventName, dates: [date], notes })
    });

    modal.classList.add('hidden');
    loadActiveTab();
  });
}

// 3. Feature 4: Course Registration Clash Simulator View
async function renderSimulatorView(): Promise<string> {
  const [catalog, valRes] = await Promise.all([
    fetchAPI<CatalogCourse[]>('/simulator/catalog'),
    fetchAPI<ValidationResult>('/simulator/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseIds: selectedPlanIds })
    })
  ]);

  return `
    <div class="view-container">
      <div class="hero-banner">
        <h2>Course Registration Clash Simulator</h2>
        <p>Pre-build conflict-free schedules before portal openings. Test combinations, eliminate slot clashes, and quick-copy course codes.</p>
      </div>

      <!-- Plan Selector -->
      <div class="plan-tabs">
        ${(['Plan A', 'Plan B', 'Plan C'] as const).map(p => `
          <button class="plan-tab ${activePlan === p ? 'active' : ''}" data-plan="${p}">${p}</button>
        `).join('')}
      </div>

      <!-- Validation Status Banner -->
      <div class="card status-card ${valRes.isValid ? 'status-good' : 'status-danger'}">
        <span class="status-icon">${valRes.isValid ? '✅' : '🚨'}</span>
        <div>
          <div class="status-title">${valRes.isValid ? 'Clash-Free Schedule' : `${valRes.conflictCount} Slot Conflict(s) Detected`}</div>
          <div class="status-desc">${valRes.statusMessage}</div>
        </div>
      </div>

      <!-- Conflicts Breakdown -->
      ${valRes.conflicts.map(c => `
        <div class="card conflict-card">
          <div class="conflict-title">Slot ${c.slot} Overlap Conflict</div>
          <div class="conflict-desc">${c.reason}</div>
        </div>
      `).join('')}

      <!-- Quick Copy Bar -->
      <div class="card quick-copy-card">
        <div class="quick-copy-header">
          <span class="quick-copy-title">⚡ Quick-Copy Portal Codes</span>
          <button class="btn-copy" id="btn-copy-codes">Copy</button>
        </div>
        <div class="copy-string">${valRes.quickCopyCodes || 'No courses selected'}</div>
      </div>

      <!-- Summary Row -->
      <div class="card summary-card">
        <div>
          <div class="summary-val">${valRes.totalCredits} Credits</div>
          <div class="summary-sub">${valRes.totalCourses} Courses in ${activePlan}</div>
        </div>
        <button class="btn-save-plan" id="btn-save-plan">Save ${activePlan}</button>
      </div>

      <!-- Course Catalog -->
      <div class="section-title-row">
        <h3>Available Course Catalog</h3>
        <span class="count-tag">Tap to Toggle</span>
      </div>

      <div class="catalog-list">
        ${catalog.map(course => {
          const isSelected = selectedPlanIds.includes(course.id);
          return `
            <div class="card catalog-card ${isSelected ? 'selected' : ''}" data-id="${course.id}">
              <div class="catalog-top">
                <div>
                  <div class="code-row">
                    <span class="course-code">${course.code}</span>
                    <span class="slot-badge">Slot ${course.slots.join(', ')}</span>
                    <span class="credits-tag">${course.credits} Credits</span>
                  </div>
                  <div class="course-name">${course.title}</div>
                  <div class="course-faculty">${course.faculty} · ${course.room}</div>
                </div>
                <div class="toggle-indicator ${isSelected ? 'checked' : ''}">
                  ${isSelected ? '✓' : '+'}
                </div>
              </div>
              <div class="catalog-footer">
                <span class="seats-info">Seats Left: ${course.seatsLeft}</span>
                <span class="action-hint">${isSelected ? 'Included in Plan' : '+ Tap to Include'}</span>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

function bindSimulatorEvents() {
  document.querySelectorAll('.plan-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      activePlan = btn.getAttribute('data-plan') as typeof activePlan;
      if (activePlan === 'Plan A') selectedPlanIds = ['c1', 'c2', 'c3', 'c4', 'c5', 'c10'];
      else if (activePlan === 'Plan B') selectedPlanIds = ['c1', 'c6', 'c3', 'c7', 'c5'];
      else selectedPlanIds = ['c1', 'c3'];
      loadActiveTab();
    });
  });

  document.querySelectorAll('.catalog-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.getAttribute('data-id');
      if (!id) return;
      if (selectedPlanIds.includes(id)) {
        selectedPlanIds = selectedPlanIds.filter(x => x !== id);
      } else {
        selectedPlanIds.push(id);
      }
      loadActiveTab();
    });
  });

  document.getElementById('btn-copy-codes')?.addEventListener('click', () => {
    const text = document.querySelector('.copy-string')?.textContent || '';
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard: ' + text);
  });

  document.getElementById('btn-save-plan')?.addEventListener('click', async () => {
    await fetchAPI('/simulator/save-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planName: activePlan, courseIds: selectedPlanIds })
    });
    alert(`${activePlan} saved successfully!`);
  });
}

// 4. Timetable & Room Decoder View
async function renderTimetableView(): Promise<string> {
  const timetable = await fetchAPI<TimetableResponse>('/academia/timetable');
  const periods = timetable.schedule[selectedDay] || [];

  return `
    <div class="view-container">
      <div class="hero-banner">
        <h2>Rotating Day-Order Timetable</h2>
        <p>SRM rotating 5-day cycle with smart room decoding and shortest walking route navigation.</p>
      </div>

      <!-- Day Selector -->
      <div class="day-tabs">
        ${[1, 2, 3, 4, 5].map(d => `
          <button class="day-tab ${selectedDay === d ? 'active' : ''} ${timetable.currentDayOrder === d ? 'today' : ''}" data-day="${d}">
            Day ${d}
            ${timetable.currentDayOrder === d ? '<span class="today-indicator"></span>' : ''}
          </button>
        `).join('')}
      </div>

      <div class="section-title-row">
        <h3>Day Order ${selectedDay} Schedule ${timetable.currentDayOrder === selectedDay ? '(Today)' : ''}</h3>
        <span class="count-tag">${periods.length} Periods</span>
      </div>

      <!-- Periods -->
      <div class="period-list">
        ${periods.map(p => {
          const room = decodeRoom(p.room);
          return `
            <div class="card period-card">
              <div class="period-time-col">
                <div class="period-p">P${p.period}</div>
                <div class="period-time">${p.time}</div>
              </div>
              <div class="period-details">
                <div class="period-header">
                  <span class="period-title">${p.title}</span>
                  <span class="slot-pill">Slot ${p.slot}</span>
                </div>
                <div class="period-code">${p.code}</div>

                <!-- Room Decoder Box -->
                <div class="room-decoder-box">
                  <div class="room-row">
                    <span class="room-tag">📍 ${p.room}</span>
                    <span class="bldg-name">${room.bldg} · ${room.flr}</span>
                  </div>
                  <div class="room-tip">${room.tip}</div>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

function bindTimetableEvents() {
  document.querySelectorAll('.day-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedDay = Number(btn.getAttribute('data-day'));
      loadActiveTab();
    });
  });
}

// 5. Security & Settings View
function renderSecurityView(): string {
  return `
    <div class="view-container">
      <div class="hero-banner">
        <h2>Security & Zero-Knowledge</h2>
        <p>Client-direct encryption ensuring credentials stay private and protected.</p>
      </div>

      <div class="card setting-card">
        <div class="setting-row">
          <div>
            <div class="setting-title">Zero-Knowledge Storage</div>
            <div class="setting-desc">Student NetID credentials are encrypted on-device. No telemetry is transmitted to third-party databases.</div>
          </div>
          <input type="checkbox" checked disabled class="switch" />
        </div>
      </div>

      <div class="card setting-card">
        <div class="setting-row">
          <div>
            <div class="setting-title">Offline-First Caching</div>
            <div class="setting-desc">Caches timetable, syllabus, and attendance snapshots locally to bypass morning SRM Academia server outages.</div>
          </div>
          <input type="checkbox" checked class="switch" />
        </div>
      </div>

      <div class="card setting-card">
        <div class="setting-row">
          <div>
            <div class="setting-title">Hybrid SRM Demo Mode</div>
            <div class="setting-desc">Active dataset: Arjun Sharma (B.Tech CSE Year 3, KTR Campus) with live slot catalog and OD logs.</div>
          </div>
          <input type="checkbox" checked class="switch" />
        </div>
      </div>

      <div class="about-footer">
        <div class="about-name">CampusPulse v1.0.0</div>
        <div class="about-sub">Campus Intelligence & Student Rights Companion</div>
        <div class="about-legal">100% Free · Open Source Architecture · Zero Paywalls</div>
      </div>
    </div>
  `;
}

// Initialize Application
renderShell();
loadActiveTab();
