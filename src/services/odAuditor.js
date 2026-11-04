const { mockODClaims, mockRecentAbsences, mockStudent } = require('./mockData');

/**
 * OD (On-Duty) and Ghost Absent Auditing Engine
 * Compares timetable periods with marked attendance and tracks OD conversions.
 */
class ODAuditor {
  constructor() {
    this.claims = [...mockODClaims];
    this.absences = [...mockRecentAbsences];
  }

  // Get all active OD claims
  getClaims() {
    return this.claims;
  }

  // Get recent absences with ghost status
  getAbsences() {
    return this.absences;
  }

  /**
   * Run automated audit to detect ghost absences and uncredited ODs
   */
  runAudit() {
    const ghostAbsences = [];
    const uncreditedODs = [];

    for (const absence of this.absences) {
      if (absence.claimedOD && absence.isGhostAbsent) {
        ghostAbsences.push(absence);
      }
    }

    for (const claim of this.claims) {
      if (claim.hasDiscrepancy) {
        uncreditedODs.push(claim);
      }
    }

    return {
      timestamp: new Date().toISOString(),
      totalAbsencesAudited: this.absences.length,
      ghostAbsencesFound: ghostAbsences.length,
      uncreditedODsFound: uncreditedODs.length,
      ghostAbsences,
      uncreditedODs,
      alertMessage: ghostAbsences.length > 0
        ? `⚠️ Discrepancy Found: You have ${ghostAbsences.length} class(es) marked Absent during your approved OD periods!`
        : 'All OD claims are currently synchronized.'
    };
  }

  /**
   * Submit or log a new OD claim
   */
  addClaim(claimData) {
    const newClaim = {
      id: `OD-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      eventName: claimData.eventName,
      eventType: claimData.eventType || 'College Event',
      dates: Array.isArray(claimData.dates) ? claimData.dates : [claimData.dates],
      periodsMissed: claimData.periodsMissed || [1, 2],
      affectedCourses: claimData.affectedCourses || [],
      approvalStatus: 'Submitted to Faculty Advisor',
      academiaStatus: 'Pending Verification',
      hasDiscrepancy: false,
      certificateRef: claimData.certificateRef || 'pending_upload.pdf',
      notes: claimData.notes || '',
      createdAt: new Date().toISOString()
    };

    this.claims.unshift(newClaim);
    return newClaim;
  }

  /**
   * Generate an official 1-Click Appeal Email Draft to the Faculty Advisor
   */
  generateAppealEmail(absenceItem) {
    const student = mockStudent;
    const claim = this.claims.find(c => c.id === absenceItem.odId) || {
      eventName: 'Approved University Event / Hackathon',
      certificateRef: 'Attached OD Form'
    };

    const subject = `Urgent: Attendance Correction Request (On-Duty OD) - ${student.name} [${student.regNumber}]`;

    const body = 
`Respected Dr. ${student.advisorName},

I hope this email finds you well.

I am writing to respectfully bring to your kind attention an attendance discrepancy in my Academia records for the subject ${absenceItem.courseTitle} (${absenceItem.courseCode}).

On ${absenceItem.date} (Day Order ${absenceItem.dayOrder}, Period ${absenceItem.period}), I was marked 'Absent' on Academia. However, I was participating in "${claim.eventName}", for which my On-Duty (OD) request was formally approved (Ref: ${claim.id || 'Attached'}).

Details of the Discrepancy:
• Student Name: ${student.name}
• Registration No: ${student.regNumber}
• Program & Section: ${student.program}, Sec ${student.section}
• Date of Event: ${absenceItem.date} (Period ${absenceItem.period})
• Subject: ${absenceItem.courseTitle} (${absenceItem.courseCode})
• Event / OD Reference: ${claim.eventName} [${claim.certificateRef || 'Approved Proof'}]

Could you kindly convert this absence to 'On-Duty' (OD) in Academia so that it reflects correctly in my attendance percentage before the condonation/review cutoff?

I have attached the approved OD requisition slip and event certificate for your reference.

Thank you very much for your time and guidance.

Yours sincerely,
${student.name}
Reg No: ${student.regNumber}
Phone: +91 98401 23456
${student.program}`;

    return {
      recipient: student.advisorEmail,
      recipientName: student.advisorName,
      subject,
      body,
      mailToLink: `mailto:${student.advisorEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    };
  }
}

module.exports = new ODAuditor();

