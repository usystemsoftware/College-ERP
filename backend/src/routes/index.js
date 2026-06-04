const express = require('express');
const router = express.Router();

// Auth & Users
const authRoutes = require('../modules/auth/auth.routes');
const userRoutes = require('../modules/users/user.routes');

// Old Academic & Admission
// const academicRoutes = require('../modules/academic/academic.routes');
const admissionRoutes = require('../modules/admission/admission.routes');

// New Academic Structure
const departmentRoutes = require('../modules/departments/department.routes');
const courseRoutes = require('../modules/courses/course.routes');
const subjectRoutes = require('../modules/subjects/subject.routes');
const academicYearRoutes = require('../modules/academicYears/academicYear.routes');
const semesterRoutes = require('../modules/semesters/semester.routes');

// People
const studentRoutes = require('../modules/students/student.routes');
const facultyRoutes = require('../modules/faculty/faculty.routes');
const parentRoutes = require('../modules/parents/parent.routes');

// Operations
const attendanceRoutes = require('../modules/attendance/attendance.routes');
// const timetableRoutes = require('../modules/timetable/timetable.routes');
const timetablesRoutes = require('../modules/timetables/timetable.routes');
const assignmentRoutes = require('../modules/assignments/assignment.routes');
const examRoutes = require('../modules/exams/exam.routes');

// LMS & Library
const lmsRoutes = require('../modules/lms/lms.routes');
const noteRoutes = require('../modules/lms/note.routes');
const libraryRoutes = require('../modules/library/library.routes');

// Finance & Admin
const feeRoutes = require('../modules/fees/fee.routes');
const hrRoutes = require('../modules/hr/hr.routes');
const inventoryRoutes = require('../modules/inventory/inventory.routes');
const hostelRoutes = require('../modules/hostel/hostel.routes');
const transportRoutes = require('../modules/transport/transport.routes');

// Campus Life & Communication
const eventRoutes = require('../modules/events/event.routes');
const placementRoutes = require('../modules/placements/placement.routes');
const gatepassRoutes = require('../modules/gatepasses/gatepass.routes');
const leaveRoutes = require('../modules/leave/leave.routes');
const notificationRoutes = require('../modules/notifications/notification.routes');
const analyticsRoutes = require('../modules/analytics/analytics.routes');
// --- Mount all routes ---

// Auth & Users
router.use('/auth', authRoutes);
router.use('/users', userRoutes);

// Old Academic & Admission
// router.use('/academic', academicRoutes);
router.use('/admission', admissionRoutes);

// New Academic Structure
router.use('/departments', departmentRoutes);
router.use('/courses', courseRoutes);
router.use('/subjects', subjectRoutes);
router.use('/academic-years', academicYearRoutes);
router.use('/semesters', semesterRoutes);

// People
router.use('/students', studentRoutes);
router.use('/faculty', facultyRoutes);

// Operations
router.use('/attendance', attendanceRoutes);
// router.use('/timetable', timetableRoutes);
router.use('/timetables', timetablesRoutes);
router.use('/assignments', assignmentRoutes);
router.use('/exams', examRoutes);

// LMS & Library
router.use('/lms', lmsRoutes);
router.use('/lms/notes', noteRoutes);
router.use('/library', libraryRoutes);

// Finance & Admin
router.use('/fees', feeRoutes);
router.use('/hr', hrRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/hostel', hostelRoutes);
router.use('/transport', transportRoutes);

// Campus Life & Communication
router.use('/events', eventRoutes);
router.use('/placements', placementRoutes);
router.use('/gatepasses', gatepassRoutes);
router.use('/leave', leaveRoutes);

router.use('/notifications', notificationRoutes);
router.use('/analytics', analyticsRoutes);

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date(),
    uptime: process.uptime()
  });
});

module.exports = router;
