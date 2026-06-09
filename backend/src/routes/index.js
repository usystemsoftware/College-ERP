const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Safe require helper to avoid crashes during merges
const safeRequire = (modulePath) => {
  try {
    const fullPath = path.join(__dirname, '..', 'modules', modulePath);
    if (fs.existsSync(fullPath + '.js') || fs.existsSync(fullPath + '/index.js') || fs.existsSync(fullPath)) {
      return require(fullPath);
    }
  } catch (err) {
    console.warn(`Could not load route module: ${modulePath}`);
    console.error(err);
  }
  return null;
};

// Auth & Users
const authRoutes = require('../modules/auth/auth.routes');
const userRoutes = require('../modules/users/user.routes');
const roleRoutes = require('../modules/roles/role.routes');

// Old Academic & Admission
// const academicRoutes = require('../modules/academic/academic.routes');
const admissionRoutes = require('../modules/admission/admission.routes');

// New Academic Structure
const collegeRoutes = require('../modules/colleges/college.routes');
const departmentRoutes = require('../modules/departments/department.routes');
const courseRoutes = require('../modules/courses/course.routes');
const subjectRoutes = require('../modules/subjects/subject.routes');
const academicYearRoutes = require('../modules/academicYears/academicYear.routes');
const semesterRoutes = require('../modules/semesters/semester.routes');
const batchRoutes = require('../modules/batches/batch.routes');

// People
const studentRoutes = require('../modules/students/student.routes');
const facultyRoutes = require('../modules/faculty/faculty.routes');
const parentRoutes = require('../modules/parents/parent.routes');

// Operations
const attendanceRoutes = safeRequire('attendance/attendance.routes');
const timetablesRoutes = safeRequire('timetables/timetable.routes');
const timetableRoutes = safeRequire('timetable/timetable.routes');
const assignmentRoutes = safeRequire('assignments/assignment.routes');
const examRoutes = safeRequire('exams/exam.routes');

// LMS & Library
const lmsRoutes = safeRequire('lms/lms.routes');
const noteRoutes = safeRequire('lms/note.routes');
const libraryRoutes = safeRequire('library/library.routes');
const materialRoutes = safeRequire('materials/material.routes');

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
// Analytics
const analyticsRoutes = require('../modules/analytics/analytics.routes');

// --- Mount all routes ---

// Auth & Users
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/roles', roleRoutes);

if (admissionRoutes) router.use('/admission', admissionRoutes);
if (departmentRoutes) router.use('/departments', departmentRoutes);
if (courseRoutes) router.use('/courses', courseRoutes);
if (subjectRoutes) router.use('/subjects', subjectRoutes);
if (academicYearRoutes) router.use('/academic-years', academicYearRoutes);
if (semesterRoutes) router.use('/semesters', semesterRoutes);

// New Academic Structure
router.use('/colleges', collegeRoutes);
router.use('/departments', departmentRoutes);
router.use('/courses', courseRoutes);
router.use('/subjects', subjectRoutes);
router.use('/academic-years', academicYearRoutes);
router.use('/semesters', semesterRoutes);
router.use('/batches', batchRoutes);

// People
router.use('/students', studentRoutes);
router.use('/faculty', facultyRoutes);
router.use('/parents', parentRoutes);

if (attendanceRoutes) router.use('/attendance', attendanceRoutes);
if (timetablesRoutes) router.use('/timetables', timetablesRoutes);
if (timetableRoutes) router.use('/timetable', timetableRoutes);
if (assignmentRoutes) router.use('/assignments', assignmentRoutes);
if (examRoutes) router.use('/exams', examRoutes);

if (lmsRoutes) router.use('/lms', lmsRoutes);
if (noteRoutes) router.use('/lms/notes', noteRoutes);
if (libraryRoutes) router.use('/library', libraryRoutes);
if (materialRoutes) router.use('/materials', materialRoutes);

// Finance & Admin
router.use('/fee', feeRoutes);
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
