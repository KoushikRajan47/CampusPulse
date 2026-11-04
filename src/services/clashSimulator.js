const { mockCourseCatalog } = require('./mockData');

/**
 * Course Registration (Enrollment) Clash Simulator
 * Allows students to build clash-free schedules (Plan A, Plan B, Plan C)
 * and generate fast 1-tap copy code strings for SRM enrollment portals.
 */
class ClashSimulator {
  constructor() {
    this.catalog = [...mockCourseCatalog];
    this.savedPlans = {
      'Plan A': ['c1', 'c2', 'c3', 'c4', 'c5', 'c10'], // Standard schedule
      'Plan B': ['c1', 'c6', 'c3', 'c7', 'c5'], // Alternate electives
      'Plan C': []
    };
  }

  // Get full course catalog
  getCatalog() {
    return this.catalog;
  }

  // Get saved plans
  getPlans() {
    return this.savedPlans;
  }

  /**
   * Validate a list of selected course IDs for slot clashes
   * @param {string[]} courseIds - Array of course IDs
   */
  validateSchedule(courseIds = []) {
    const selectedCourses = this.catalog.filter(c => courseIds.includes(c.id));
    const slotUsage = {};
    const conflicts = [];

    let totalCredits = 0;

    for (const course of selectedCourses) {
      totalCredits += course.credits;
      for (const slot of course.slots) {
        if (!slotUsage[slot]) {
          slotUsage[slot] = [];
        }
        slotUsage[slot].push(course);
      }
    }

    // Identify clashes (where any slot has > 1 course)
    for (const [slot, courses] of Object.entries(slotUsage)) {
      if (courses.length > 1) {
        conflicts.push({
          slot,
          courses: courses.map(c => ({ id: c.id, code: c.code, title: c.title, faculty: c.faculty })),
          reason: `Slot ${slot} conflict between: ${courses.map(c => `${c.code} (${c.title})`).join(' and ')}`
        });
      }
    }

    const isValid = conflicts.length === 0;

    // Generate quick-copy string for rapid registration pasting
    const quickCopyCodes = selectedCourses.map(c => c.code).join(', ');
    const quickCopyDetailed = selectedCourses.map(c => `${c.code}:${c.slot}:${c.faculty}`).join(' | ');

    return {
      isValid,
      totalCourses: selectedCourses.length,
      totalCredits,
      conflictCount: conflicts.length,
      conflicts,
      selectedCourses,
      quickCopyCodes,
      quickCopyDetailed,
      statusMessage: isValid
        ? `✅ Clash-Free Schedule! (${totalCredits} Credits across ${selectedCourses.length} courses)`
        : `⚠️ Detected ${conflicts.length} Slot Clash(es)! Resolve conflicts before portal registration.`
    };
  }

  /**
   * Save a plan (Plan A, Plan B, Plan C)
   */
  savePlan(planName, courseIds) {
    this.savedPlans[planName] = courseIds;
    return this.validateSchedule(courseIds);
  }
}

module.exports = new ClashSimulator();

