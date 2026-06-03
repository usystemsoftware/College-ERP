const express = require('express');
const router = express.Router();

// Auth
const authRoutes = require('../modules/auth/auth.routes');

// Academic Structure
const departmentRoutes = require('../modules/departments/department.routes');
const courseRoutes = require('../modules/courses/course.routes');
const subjectRoutes = require('../modules/subjects/subject.routes');
const academicYearRoutes = require('../modules/academicYears/academicYear.routes');
const semesterRoutes = require('../modules/semesters/semester.routes');

// People
const studentRoutes = require('../modules/students/student.routes');
const facultyRoutes = require('../modules/faculty/faculty.routes');

// Academic Operations
const attendanceRoutes = require('../modules/attendance/attendance.routes');
const timetableRoutes = require('../modules/timetables/timetable.routes');

// LMS
const noteRoutes = require('../modules/lms/note.routes');
const assignmentRoutes = require('../modules/assignments/assignment.routes');

// Finance
const feeRoutes = require('../modules/fees/fee.routes');

// Library
const libraryRoutes = require('../modules/library/library.routes');

// Campus Life
const eventRoutes = require('../modules/events/event.routes');
const placementRoutes = require('../modules/placements/placement.routes');
const gatepassRoutes = require('../modules/gatepasses/gatepass.routes');
const leaveRoutes = require('../modules/leave/leave.routes');

// Communication
const notificationRoutes = require('../modules/notifications/notification.routes');

// Mount all routes
router.use('/auth', authRoutes);
router.use('/departments', departmentRoutes);
router.use('/courses', courseRoutes);
router.use('/subjects', subjectRoutes);
router.use('/academic-years', academicYearRoutes);
router.use('/semesters', semesterRoutes);
router.use('/students', studentRoutes);
router.use('/faculty', facultyRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/timetables', timetableRoutes);
router.use('/lms/notes', noteRoutes);
router.use('/assignments', assignmentRoutes);
router.use('/fees', feeRoutes);
router.use('/library', libraryRoutes);
router.use('/events', eventRoutes);
router.use('/placements', placementRoutes);
router.use('/gatepasses', gatepassRoutes);
router.use('/leave', leaveRoutes);
router.use('/notifications', notificationRoutes);

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date(),
    uptime: process.uptime()
  });
});

module.exports = router;
