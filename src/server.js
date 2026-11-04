require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const db = require('./db');
const { sendNotification } = require('./notifications');
const campusRoutes = require('./routes/campusRoutes');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Campus Intelligence & Academia Routes (Ghost Absent, Clash Simulator, Bunk Forecaster)
app.use('/api', campusRoutes);

// Helper: run SELECT and return all rows as a Promise
function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

// Helper: run INSERT/UPDATE/DELETE as a Promise
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

// Compute attendance percentage for a student
async function getStudentAttendanceSummary(studentId) {
  const stats = await all(
    `
    SELECT
      COUNT(*) AS total_classes,
      SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) AS present_classes
    FROM attendance_records
    WHERE student_id = ?
  `,
    [studentId]
  );

  const { total_classes = 0, present_classes = 0 } = stats[0] || {};
  const percentage =
    total_classes === 0 ? null : Math.round((present_classes / total_classes) * 100);

  return { total_classes, present_classes, percentage };
}

// API: list all students
app.get('/api/students', async (req, res) => {
  try {
    const students = await all(
      `
      SELECT s.*,
             (
               SELECT COUNT(*) FROM attendance_records ar
               WHERE ar.student_id = s.id
             ) AS total_classes,
             (
               SELECT COUNT(*) FROM attendance_records ar
               WHERE ar.student_id = s.id AND ar.status = 'present'
             ) AS present_classes
      FROM students s
      ORDER BY s.class_name, s.roll_number
    `
    );

    const withPercent = students.map((s) => {
      const percentage =
        s.total_classes === 0
          ? null
          : Math.round((s.present_classes / s.total_classes) * 100);
      return { ...s, attendance_percentage: percentage };
    });

    res.json(withPercent);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// API: create student
app.post('/api/students', async (req, res) => {
  try {
    const {
      name,
      roll_number,
      class_name,
      parent_name,
      parent_phone,
      parent_whatsapp,
    } = req.body;

    if (!name || !roll_number || !class_name) {
      return res.status(400).json({ error: 'name, roll_number and class_name are required' });
    }

    const result = await run(
      `
      INSERT INTO students
        (name, roll_number, class_name, parent_name, parent_phone, parent_whatsapp)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
      [name, roll_number, class_name, parent_name || null, parent_phone || null, parent_whatsapp || null]
    );

    const student = await all('SELECT * FROM students WHERE id = ?', [result.id]);
    res.status(201).json(student[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create student' });
  }
});

// API: get single student with attendance summary
app.get('/api/students/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const students = await all('SELECT * FROM students WHERE id = ?', [id]);
    const student = students[0];
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const summary = await getStudentAttendanceSummary(id);
    const records = await all(
      `
      SELECT *
      FROM attendance_records
      WHERE student_id = ?
      ORDER BY date DESC
    `,
      [id]
    );

    res.json({ ...student, attendance_summary: summary, attendance_records: records });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch student' });
  }
});

// API: update student
app.put('/api/students/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const {
      name,
      roll_number,
      class_name,
      parent_name,
      parent_phone,
      parent_whatsapp,
    } = req.body;

    await run(
      `
      UPDATE students
      SET name = ?, roll_number = ?, class_name = ?, parent_name = ?, parent_phone = ?, parent_whatsapp = ?
      WHERE id = ?
    `,
      [
        name,
        roll_number,
        class_name,
        parent_name || null,
        parent_phone || null,
        parent_whatsapp || null,
        id,
      ]
    );

    const student = await all('SELECT * FROM students WHERE id = ?', [id]);
    res.json(student[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update student' });
  }
});

// API: delete student
app.delete('/api/students/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    await run('DELETE FROM students WHERE id = ?', [id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete student' });
  }
});

// API: list classes with counts and low attendance stats
app.get('/api/classes', async (req, res) => {
  try {
    const rows = await all(
      `
      SELECT
        class_name,
        COUNT(*) AS total_students
      FROM students
      GROUP BY class_name
      ORDER BY class_name
    `
    );

    const classesWithRisk = await Promise.all(
      rows.map(async (row) => {
        const students = await all(
          `
          SELECT s.id,
                 (
                   SELECT COUNT(*) FROM attendance_records ar
                   WHERE ar.student_id = s.id
                 ) AS total_classes,
                 (
                   SELECT COUNT(*) FROM attendance_records ar
                   WHERE ar.student_id = s.id AND ar.status = 'present'
                 ) AS present_classes
          FROM students s
          WHERE s.class_name = ?
        `,
          [row.class_name]
        );

        const lowCount = students.reduce((acc, s) => {
          if (!s.total_classes) return acc;
          const pct = Math.round((s.present_classes / s.total_classes) * 100);
          return pct < 75 ? acc + 1 : acc;
        }, 0);

        return {
          class_name: row.class_name,
          total_students: row.total_students,
          low_attendance_students: lowCount,
        };
      })
    );

    res.json(classesWithRisk);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch classes' });
  }
});

// API: get students in a class
app.get('/api/classes/:className/students', async (req, res) => {
  try {
    const className = req.params.className;
    const students = await all(
      'SELECT * FROM students WHERE class_name = ? ORDER BY roll_number',
      [className]
    );
    res.json(students);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch students for class' });
  }
});

// API: record attendance for a class and a date
app.post('/api/classes/:className/attendance', async (req, res) => {
  const className = req.params.className;
  const { date, records } = req.body;

  if (!date || !Array.isArray(records)) {
    return res.status(400).json({ error: 'date and records[] are required' });
  }

  try {
    // Upsert attendance records
    const stmtInsert = `
      INSERT INTO attendance_records (student_id, class_name, date, status)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(student_id, date) DO UPDATE SET status=excluded.status
    `;

    for (const rec of records) {
      if (!rec.studentId || !rec.status) continue;
      await run(stmtInsert, [rec.studentId, className, date, rec.status]);
    }

    // After recording, check for students below threshold and notify
    const THRESHOLD = Number(process.env.ATTENDANCE_THRESHOLD || 75);

    const classStudents = await all(
      'SELECT * FROM students WHERE class_name = ?',
      [className]
    );

    const notified = [];

    for (const student of classStudents) {
      const summary = await getStudentAttendanceSummary(student.id);
      if (summary.percentage !== null && summary.percentage < THRESHOLD) {
        const message = `Dear Parent, your ward ${student.name} (Roll: ${student.roll_number}, Class: ${student.class_name}) has an attendance of ${summary.percentage}%, which is below the required ${THRESHOLD}%. Please ensure regular attendance.`;

        const to =
          student.parent_whatsapp ||
          student.parent_phone ||
          null;

        if (to) {
          const channel = student.parent_whatsapp ? 'whatsapp' : 'sms';
          const result = await sendNotification({
            to,
            channel,
            body: message,
          });

          await run(
            `
            INSERT INTO notifications (student_id, channel, status, message, provider_message_id)
            VALUES (?, ?, ?, ?, ?)
          `,
            [
              student.id,
              channel,
              result.ok ? 'sent' : 'failed',
              message,
              result.providerMessageId || null,
            ]
          );

          notified.push({
            student_id: student.id,
            name: student.name,
            percentage: summary.percentage,
            channel,
            ok: result.ok,
          });
        }
      }
    }

    res.json({ ok: true, notified });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to record attendance' });
  }
});

// API: get attendance summary for a student
app.get('/api/students/:id/attendance', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const summary = await getStudentAttendanceSummary(id);
    const records = await all(
      `
      SELECT *
      FROM attendance_records
      WHERE student_id = ?
      ORDER BY date DESC
    `,
      [id]
    );

    res.json({ summary, records });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
});

// API: list notifications for a student
app.get('/api/students/:id/notifications', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const rows = await all(
      `
      SELECT *
      FROM notifications
      WHERE student_id = ?
      ORDER BY created_at DESC
    `,
      [id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Daily cron job at 6pm server time to re-check all students
cron.schedule('0 18 * * *', async () => {
  console.log('Running daily attendance check job...');
  try {
    const THRESHOLD = Number(process.env.ATTENDANCE_THRESHOLD || 75);
    const students = await all('SELECT * FROM students');

    for (const student of students) {
      const summary = await getStudentAttendanceSummary(student.id);
      if (summary.percentage !== null && summary.percentage < THRESHOLD) {
        const message = `Dear Parent, your ward ${student.name} (Roll: ${student.roll_number}, Class: ${student.class_name}) has an attendance of ${summary.percentage}%, which is below the required ${THRESHOLD}%. Please ensure regular attendance.`;

        const to =
          student.parent_whatsapp ||
          student.parent_phone ||
          null;

        if (!to) continue;

        const channel = student.parent_whatsapp ? 'whatsapp' : 'sms';
        const result = await sendNotification({
          to,
          channel,
          body: message,
        });

        await run(
          `
          INSERT INTO notifications (student_id, channel, status, message, provider_message_id)
          VALUES (?, ?, ?, ?, ?)
        `,
          [
            student.id,
            channel,
            result.ok ? 'sent' : 'failed',
            message,
            result.providerMessageId || null,
          ]
        );
      }
    }
  } catch (err) {
    console.error('Error in daily attendance job', err);
  }
});

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Attendance Tracker API running' });
});

app.listen(PORT, () => {
  console.log(`Attendance Tracker API listening on http://localhost:${PORT}`);
});

