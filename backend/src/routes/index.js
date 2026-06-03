const express = require('express');
const router = express.Router();

// Auth & Users
const authRoutes = require('../modules/auth/auth.routes');
const userRoutes = require('../modules/users/user.routes');

// Core
const admissionRoutes = require('../modules/admission/admission.routes');
const departmentRoutes = require('../modules/departments/department.routes');
const courseRoutes = require('../modules/courses/course.routes');
const subjectRoutes = require('../modules/subjects/subject.routes');
const academicYearRoutes = require('../modules/academicYears/academicYear.routes');
const semesterRoutes = require('../modules/semesters/semester.routes');

// People
const studentRoutes = require('../modules/students/student.routes');
const facultyRoutes = require('../modules/faculty/faculty.routes');

// Academics
const timetableRoutes = require('../modules/timetable/timetable.routes');
const attendanceRoutes = require('../modules/attendance/attendance.routes');
const assignmentRoutes = require('../modules/assignments/assignment.routes');
const examRoutes = require('../modules/exams/exam.routes');
const feesRoutes = require('../modules/fees/fees.routes');

// Logistics
const libraryRoutes = require('../modules/library/library.routes');
const hostelRoutes = require('../modules/hostel/hostel.routes');
const transportRoutes = require('../modules/transport/transport.routes');
const inventoryRoutes = require('../modules/inventory/inventory.routes');

// Others
const hrRoutes = require('../modules/hr/hr.routes');
const analyticsRoutes = require('../modules/analytics/analytics.routes');
const lmsRoutes = require('../modules/lms/lms.routes');
const noteRoutes = require('../modules/lms/note.routes');

// Campus Life
const eventRoutes = require('../modules/events/event.routes');
const placementRoutes = require('../modules/placements/placement.routes');
const gatepassRoutes = require('../modules/gatepasses/gatepass.routes');
const leaveRoutes = require('../modules/leave/leave.routes');
const notificationRoutes = require('../modules/notifications/notification.routes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);

router.use('/admission', admissionRoutes);
router.use('/departments', departmentRoutes);
router.use('/courses', courseRoutes);
router.use('/subjects', subjectRoutes);
router.use('/academic-years', academicYearRoutes);
router.use('/semesters', semesterRoutes);

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
router.use('/inventory', inventoryRoutes);

router.use('/hr', hrRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/lms', lmsRoutes);
router.use('/lms/notes', noteRoutes);

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
