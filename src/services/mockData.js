/**
 * Realistic SRM KTR Academic Dataset for Hybrid Testing Mode.
 * Reflects authentic B.Tech CSE (Year 3, Semester 5) curriculum,
 * rotating Day Orders (Day 1 - 5), attendance records, and OD logs.
 */

const mockStudent = {
  regNumber: 'RA2211003010142',
  name: 'Arjun Sharma',
  program: 'B.Tech Computer Science & Engineering',
  semester: 5,
  section: 'A1',
  advisorName: 'Dr. K. Meenakshi (FA)',
  advisorEmail: 'meenakshi.k@srmist.edu.in',
  campus: 'SRMIST Kattankulathur (KTR)',
  cgpa: 8.92,
  overallAttendance: 77.4
};

const mockCourses = [
  {
    code: '21CSE301J',
    title: 'Design and Analysis of Algorithms',
    category: 'Professional Core',
    slot: 'A',
    faculty: 'Dr. R. Venkatraman',
    room: 'TP-502',
    conducted: 32,
    attended: 26,
    percentage: 81.25,
    minRequired: 75,
    safeBunks: 2,
    classesNeeded: 0
  },
  {
    code: '21CSE302T',
    title: 'Operating Systems',
    category: 'Professional Core',
    slot: 'B',
    faculty: 'Prof. Anitha S.',
    room: 'UB-604',
    conducted: 28,
    attended: 20,
    percentage: 71.43,
    minRequired: 75,
    safeBunks: 0,
    classesNeeded: 4 // Must attend 4 consecutive classes to reach 75%
  },
  {
    code: '21CSE303J',
    title: 'Computer Networks',
    category: 'Professional Core',
    slot: 'C',
    faculty: 'Dr. B. Rajesh',
    room: 'BEL-201',
    conducted: 30,
    attended: 24,
    percentage: 80.0,
    minRequired: 75,
    safeBunks: 2,
    classesNeeded: 0
  },
  {
    code: '21CSE304T',
    title: 'Theory of Computation',
    category: 'Professional Core',
    slot: 'D',
    faculty: 'Dr. Shalini V.',
    room: 'TP-603',
    conducted: 26,
    attended: 19,
    percentage: 73.08,
    minRequired: 75,
    safeBunks: 0,
    classesNeeded: 2
  },
  {
    code: '21CSE305J',
    title: 'Artificial Intelligence & Machine Learning',
    category: 'Professional Elective',
    slot: 'E',
    faculty: 'Dr. P. Karthik',
    room: 'TP-401',
    conducted: 34,
    attended: 28,
    percentage: 82.35,
    minRequired: 75,
    safeBunks: 3,
    classesNeeded: 0
  },
  {
    code: '21LEH301T',
    title: 'Professional Ethics & Social Responsibility',
    category: 'Humanities',
    slot: 'F',
    faculty: 'Dr. Sneha Nair',
    room: 'UB-1102',
    conducted: 16,
    attended: 14,
    percentage: 87.5,
    minRequired: 75,
    safeBunks: 2,
    classesNeeded: 0
  }
];

const mockTimetable = {
  currentDayOrder: 3,
  schedule: {
    1: [
      { period: 1, time: '08:00 - 08:50', code: '21CSE301J', title: 'DAA', room: 'TP-502', slot: 'A' },
      { period: 2, time: '08:55 - 09:45', code: '21CSE302T', title: 'OS', room: 'UB-604', slot: 'B' },
      { period: 3, time: '09:50 - 10:40', code: '21CSE303J', title: 'CN', room: 'BEL-201', slot: 'C' },
      { period: 4, time: '10:45 - 11:35', code: '21CSE304T', title: 'TOC', room: 'TP-603', slot: 'D' },
      { period: 5, time: '12:30 - 01:20', code: '21CSE305J', title: 'AI/ML Lab', room: 'TP-401', slot: 'E' }
    ],
    2: [
      { period: 1, time: '08:00 - 08:50', code: '21CSE302T', title: 'OS', room: 'UB-604', slot: 'B' },
      { period: 2, time: '08:55 - 09:45', code: '21CSE303J', title: 'CN', room: 'BEL-201', slot: 'C' },
      { period: 3, time: '09:50 - 10:40', code: '21CSE305J', title: 'AI/ML', room: 'TP-401', slot: 'E' },
      { period: 4, time: '10:45 - 11:35', code: '21LEH301T', title: 'Ethics', room: 'UB-1102', slot: 'F' }
    ],
    3: [
      { period: 1, time: '08:00 - 08:50', code: '21CSE303J', title: 'CN', room: 'BEL-201', slot: 'C' },
      { period: 2, time: '08:55 - 09:45', code: '21CSE304T', title: 'TOC', room: 'TP-603', slot: 'D' },
      { period: 3, time: '09:50 - 10:40', code: '21CSE301J', title: 'DAA', room: 'TP-502', slot: 'A' },
      { period: 4, time: '10:45 - 11:35', code: '21CSE302T', title: 'OS', room: 'UB-604', slot: 'B' },
      { period: 5, time: '12:30 - 01:20', code: '21CSE305J', title: 'AI/ML', room: 'TP-401', slot: 'E' }
    ],
    4: [
      { period: 1, time: '08:00 - 08:50', code: '21CSE304T', title: 'TOC', room: 'TP-603', slot: 'D' },
      { period: 2, time: '08:55 - 09:45', code: '21CSE305J', title: 'AI/ML', room: 'TP-401', slot: 'E' },
      { period: 3, time: '09:50 - 10:40', code: '21CSE301J', title: 'DAA Lab', room: 'TP-502', slot: 'A' },
      { period: 4, time: '10:45 - 11:35', code: '21LEH301T', title: 'Ethics', room: 'UB-1102', slot: 'F' }
    ],
    5: [
      { period: 1, time: '08:00 - 08:50', code: '21CSE305J', title: 'AI/ML', room: 'TP-401', slot: 'E' },
      { period: 2, time: '08:55 - 09:45', code: '21CSE301J', title: 'DAA', room: 'TP-502', slot: 'A' },
      { period: 3, time: '09:50 - 10:40', code: '21CSE302T', title: 'OS Lab', room: 'UB-604', slot: 'B' },
      { period: 4, time: '10:45 - 11:35', code: '21CSE303J', title: 'CN', room: 'BEL-201', slot: 'C' }
    ]
  }
};

/**
 * Realistic OD Claims and Attendance Log for Ghost Absent Detection.
 * Notice: On 2026-10-24, student attended Milan '26 Hackathon on approved OD,
 * but the professor for 21CSE302T (OS) and 21CSE304T (TOC) marked them ABSENT!
 */
const mockODClaims = [
  {
    id: 'OD-2026-102',
    eventName: 'Milan 2026 National Hackathon',
    eventType: 'Technical / Hackathon',
    dates: ['2026-10-24'],
    periodsMissed: [2, 4],
    affectedCourses: ['21CSE302T', '21CSE304T'],
    approvalStatus: 'Approved by HoD',
    academiaStatus: 'Uncredited (Marked Absent on Academia)',
    hasDiscrepancy: true,
    certificateRef: 'MILAN26-CERT-8849.pdf',
    notes: 'Won 2nd prize in Web3 track. OD form signed by FA and HoD, but OS & TOC professors forgot to convert absent to OD.'
  },
  {
    id: 'OD-2026-091',
    eventName: 'SRM Cricket Inter-Collegiate Tournament',
    eventType: 'Sports',
    dates: ['2026-10-12'],
    periodsMissed: [1, 2, 3],
    affectedCourses: ['21CSE301J', '21CSE302T'],
    approvalStatus: 'Approved by Physical Director',
    academiaStatus: 'Credited',
    hasDiscrepancy: false,
    certificateRef: 'SPORTS-OD-012.pdf',
    notes: 'Credited successfully on Academia.'
  }
];

const mockRecentAbsences = [
  {
    date: '2026-10-24',
    dayOrder: 3,
    period: 2,
    courseCode: '21CSE302T',
    courseTitle: 'Operating Systems',
    status: 'Absent',
    claimedOD: true,
    odId: 'OD-2026-102',
    isGhostAbsent: true,
    appealStatus: 'Ready to Appeal'
  },
  {
    date: '2026-10-24',
    dayOrder: 3,
    period: 4,
    courseCode: '21CSE304T',
    courseTitle: 'Theory of Computation',
    status: 'Absent',
    claimedOD: true,
    odId: 'OD-2026-102',
    isGhostAbsent: true,
    appealStatus: 'Ready to Appeal'
  },
  {
    date: '2026-10-18',
    dayOrder: 1,
    period: 3,
    courseCode: '21CSE303J',
    courseTitle: 'Computer Networks',
    status: 'Absent',
    claimedOD: false,
    odId: null,
    isGhostAbsent: false,
    appealStatus: 'Valid Absence'
  }
];

/**
 * Course Catalog & Slot Mapping for Course Registration Clash Simulator (Feature 4).
 * Standard SRM slotting structure (Slots A - G for theory, P1 - P5 for labs).
 */
const mockCourseCatalog = [
  { id: 'c1', code: '21CSE301J', title: 'Design and Analysis of Algorithms', credits: 4, slots: ['A', 'P1'], faculty: 'Dr. R. Venkatraman', room: 'TP-502', seatsLeft: 8 },
  { id: 'c2', code: '21CSE302T', title: 'Operating Systems', credits: 3, slots: ['B'], faculty: 'Prof. Anitha S.', room: 'UB-604', seatsLeft: 3 },
  { id: 'c3', code: '21CSE303J', title: 'Computer Networks', credits: 4, slots: ['C', 'P2'], faculty: 'Dr. B. Rajesh', room: 'BEL-201', seatsLeft: 14 },
  { id: 'c4', code: '21CSE304T', title: 'Theory of Computation', credits: 3, slots: ['D'], faculty: 'Dr. Shalini V.', room: 'TP-603', seatsLeft: 2 },
  { id: 'c5', code: '21CSE305J', title: 'Artificial Intelligence & Machine Learning', credits: 4, slots: ['E', 'P3'], faculty: 'Dr. P. Karthik', room: 'TP-401', seatsLeft: 11 },
  // Electives & Alternatives that might clash:
  { id: 'c6', code: '21CSE311T', title: 'Cloud Computing Architecture', credits: 3, slots: ['B'], faculty: 'Dr. Murali Krishna', room: 'TP-702', seatsLeft: 19 }, // Clashes with c2 on Slot B!
  { id: 'c7', code: '21CSE312T', title: 'Cyber Security & Cryptography', credits: 3, slots: ['D'], faculty: 'Prof. Geetha M.', room: 'BEL-304', seatsLeft: 6 }, // Clashes with c4 on Slot D!
  { id: 'c8', code: '21CSE313T', title: 'Mobile Application Development', credits: 3, slots: ['A'], faculty: 'Dr. S. Ramesh', room: 'UB-802', seatsLeft: 22 }, // Clashes with c1 on Slot A!
  { id: 'c9', code: '21CSE314T', title: 'Big Data Analytics', credits: 3, slots: ['E'], faculty: 'Dr. Deepa K.', room: 'TP-302', seatsLeft: 15 }, // Clashes with c5 on Slot E!
  { id: 'c10', code: '21LEH301T', title: 'Professional Ethics', credits: 2, slots: ['F'], faculty: 'Dr. Sneha Nair', room: 'UB-1102', seatsLeft: 40 }
];

module.exports = {
  mockStudent,
  mockCourses,
  mockTimetable,
  mockODClaims,
  mockRecentAbsences,
  mockCourseCatalog
};

