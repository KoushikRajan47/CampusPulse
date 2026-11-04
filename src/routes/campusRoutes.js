const express = require('express');
const router = express.Router();

const {
  mockStudent,
  mockCourses,
  mockTimetable,
  mockODClaims,
  mockRecentAbsences,
  mockCourseCatalog
} = require('../services/mockData');
const AcademiaClient = require('../services/academiaClient');
const odAuditor = require('../services/odAuditor');
const clashSimulator = require('../services/clashSimulator');

const academiaClient = new AcademiaClient();

// ==========================================
// 1. Academia Authentication & Profile Routes
// ==========================================

// Authenticate student (Hybrid: live or mock)
router.post('/academia/login', async (req, res) => {
  try {
    const { username, password, captcha } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const result = await academiaClient.login(username, password, captcha);
    res.json({
      ...result,
      student: mockStudent
    });
  } catch (err) {
    res.status(500).json({ error: 'Authentication failed', details: err.message });
  }
});

// Student profile
router.get('/academia/profile', (req, res) => {
  res.json(mockStudent);
});

// Course-wise attendance with Safe Bunk calculations
router.get('/academia/courses', (req, res) => {
  const minTarget = Number(req.query.target || 75);
  const updatedCourses = mockCourses.map(course => {
    const stats = AcademiaClient.calculateBunkStats(course.conducted, course.attended, minTarget);
    return {
      ...course,
      percentage: stats.percentage,
      safeBunks: stats.safeBunks,
      classesNeeded: stats.classesNeeded,
      status: stats.status
    };
  });

  const totalConducted = updatedCourses.reduce((sum, c) => sum + c.conducted, 0);
  const totalAttended = updatedCourses.reduce((sum, c) => sum + c.attended, 0);
  const overallStats = AcademiaClient.calculateBunkStats(totalConducted, totalAttended, minTarget);

  res.json({
    student: mockStudent,
    minTarget,
    overall: {
      totalConducted,
      totalAttended,
      percentage: overallStats.percentage,
      safeBunks: overallStats.safeBunks,
      classesNeeded: overallStats.classesNeeded,
      status: overallStats.status
    },
    courses: updatedCourses
  });
});

// Day-order timetable
router.get('/academia/timetable', (req, res) => {
  res.json(mockTimetable);
});

// ==========================================
// 2. Feature 1: Ghost Absent & OD Auditor
// ==========================================

// Run automated discrepancy audit
router.get('/od/audit', (req, res) => {
  const auditResult = odAuditor.runAudit();
  res.json(auditResult);
});

// Get all OD claims
router.get('/od/claims', (req, res) => {
  res.json(odAuditor.getClaims());
});

// Add a new OD claim
router.post('/od/claims', (req, res) => {
  try {
    const { eventName, eventType, dates, periodsMissed, affectedCourses, notes } = req.body;
    if (!eventName || !dates) {
      return res.status(400).json({ error: 'Event name and dates are required' });
    }
    const newClaim = odAuditor.addClaim({
      eventName,
      eventType,
      dates,
      periodsMissed,
      affectedCourses,
      notes
    });
    res.status(201).json(newClaim);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create OD claim', details: err.message });
  }
});

// Get recent absences with ghost status
router.get('/od/absences', (req, res) => {
  res.json(odAuditor.getAbsences());
});

// Generate 1-click appeal email draft for Faculty Advisor
router.post('/od/appeal-email', (req, res) => {
  try {
    const absenceItem = req.body;
    if (!absenceItem.courseCode || !absenceItem.date) {
      return res.status(400).json({ error: 'Course code and date are required' });
    }
    const emailDraft = odAuditor.generateAppealEmail(absenceItem);
    res.json(emailDraft);
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate appeal draft', details: err.message });
  }
});

// ==========================================
// 3. Feature 4: Course Registration Clash Simulator
// ==========================================

// Get course catalog with slots
router.get('/simulator/catalog', (req, res) => {
  res.json(clashSimulator.getCatalog());
});

// Get saved schedule plans
router.get('/simulator/plans', (req, res) => {
  const plans = clashSimulator.getPlans();
  const validatedPlans = {};
  for (const [planName, courseIds] of Object.entries(plans)) {
    validatedPlans[planName] = clashSimulator.validateSchedule(courseIds);
  }
  res.json({
    rawPlans: plans,
    validatedPlans
  });
});

// Validate custom schedule for slot clashes
router.post('/simulator/validate', (req, res) => {
  try {
    const { courseIds } = req.body;
    if (!Array.isArray(courseIds)) {
      return res.status(400).json({ error: 'courseIds must be an array' });
    }
    const result = clashSimulator.validateSchedule(courseIds);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Validation failed', details: err.message });
  }
});

// Save or update a schedule plan (Plan A, Plan B, Plan C)
router.post('/simulator/save-plan', (req, res) => {
  try {
    const { planName, courseIds } = req.body;
    if (!planName || !Array.isArray(courseIds)) {
      return res.status(400).json({ error: 'planName and courseIds array are required' });
    }
    const result = clashSimulator.savePlan(planName, courseIds);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save plan', details: err.message });
  }
});

module.exports = router;

