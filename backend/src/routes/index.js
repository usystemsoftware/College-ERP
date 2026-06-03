const express = require('express');
const router = express.Router();

// Auth
const authRoutes = require('../modules/auth/auth.routes');
const userRoutes = require('../modules/users/user.routes');
const academicRoutes = require('../modules/academic/academic.routes');
const admissionRoutes = require('../modules/admission/admission.routes');
const studentRoutes = require('../modules/students/student.routes');
const facultyRoutes = require('../modules/faculty/faculty.routes');
const timetableRoutes = require('../modules/timetable/timetable.routes');
const attendanceRoutes = require('../modules/attendance/attendance.routes');
const assignmentRoutes = require('../modules/assignments/assignment.routes');
const examRoutes = require('../modules/exams/exam.routes');
const feesRoutes = require('../modules/fees/fees.routes');
const libraryRoutes = require('../modules/library/library.routes');
const hostelRoutes = require('../modules/hostel/hostel.routes');
const transportRoutes = require('../modules/transport/transport.routes');
const hrRoutes = require('../modules/hr/hr.routes');
const inventoryRoutes = require('../modules/inventory/inventory.routes');
const lmsRoutes = require('../modules/lms/lms.routes');
const analyticsRoutes = require('../modules/analytics/analytics.routes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/academic', academicRoutes);
router.use('/admission', admissionRoutes);
router.use('/students', studentRoutes);
router.use('/faculty', facultyRoutes);
router.use('/timetable', timetableRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/assignments', assignmentRoutes);
router.use('/exams', examRoutes);
router.use('/fees', feesRoutes);
router.use('/library', libraryRoutes);
router.use('/hostel', hostelRoutes);
router.use('/transport', transportRoutes);
router.use('/hr', hrRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/lms', lmsRoutes);
router.use('/analytics', analyticsRoutes);

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
