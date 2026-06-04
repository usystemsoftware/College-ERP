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
  }
  return null;
};

// Auth & Users
const authRoutes = safeRequire('auth/auth.routes');
const userRoutes = safeRequire('users/user.routes');

// Core / New Academic Structure
const admissionRoutes = safeRequire('admission/admission.routes');
const departmentRoutes = safeRequire('departments/department.routes');
const courseRoutes = safeRequire('courses/course.routes');
const subjectRoutes = safeRequire('subjects/subject.routes');
const academicYearRoutes = safeRequire('academicYears/academicYear.routes');
const semesterRoutes = safeRequire('semesters/semester.routes');

// People
const studentRoutes = safeRequire('students/student.routes');
const facultyRoutes = safeRequire('faculty/faculty.routes');
const parentRoutes = safeRequire('parents/parent.routes');

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

// Finance & Admin
const feeRoutes = safeRequire('fees/fee.routes');
const feesRoutes = safeRequire('fees/fees.routes');
const hrRoutes = safeRequire('hr/hr.routes');
const inventoryRoutes = safeRequire('inventory/inventory.routes');
const hostelRoutes = safeRequire('hostel/hostel.routes');
const transportRoutes = safeRequire('transport/transport.routes');

// Campus Life & Communication
const eventRoutes = safeRequire('events/event.routes');
const placementRoutes = safeRequire('placements/placement.routes');
const gatepassRoutes = safeRequire('gatepasses/gatepass.routes');
const leaveRoutes = safeRequire('leave/leave.routes');
const notificationRoutes = safeRequire('notifications/notification.routes');
const analyticsRoutes = safeRequire('analytics/analytics.routes');

// --- Mount all routes ---

if (authRoutes) router.use('/auth', authRoutes);
if (userRoutes) router.use('/users', userRoutes);

if (admissionRoutes) router.use('/admission', admissionRoutes);
if (departmentRoutes) router.use('/departments', departmentRoutes);
if (courseRoutes) router.use('/courses', courseRoutes);
if (subjectRoutes) router.use('/subjects', subjectRoutes);
if (academicYearRoutes) router.use('/academic-years', academicYearRoutes);
if (semesterRoutes) router.use('/semesters', semesterRoutes);

if (studentRoutes) router.use('/students', studentRoutes);
if (facultyRoutes) router.use('/faculty', facultyRoutes);
if (parentRoutes) router.use('/parents', parentRoutes);

if (attendanceRoutes) router.use('/attendance', attendanceRoutes);
if (timetablesRoutes) router.use('/timetables', timetablesRoutes);
if (timetableRoutes) router.use('/timetable', timetableRoutes);
if (assignmentRoutes) router.use('/assignments', assignmentRoutes);
if (examRoutes) router.use('/exams', examRoutes);

if (lmsRoutes) router.use('/lms', lmsRoutes);
if (noteRoutes) router.use('/lms/notes', noteRoutes);
if (libraryRoutes) router.use('/library', libraryRoutes);

if (feesRoutes) router.use('/fees', feesRoutes);
if (feeRoutes) router.use('/fee', feeRoutes);
if (hrRoutes) router.use('/hr', hrRoutes);
if (inventoryRoutes) router.use('/inventory', inventoryRoutes);
if (hostelRoutes) router.use('/hostel', hostelRoutes);
if (transportRoutes) router.use('/transport', transportRoutes);

if (eventRoutes) router.use('/events', eventRoutes);
if (placementRoutes) router.use('/placements', placementRoutes);
if (gatepassRoutes) router.use('/gatepasses', gatepassRoutes);
if (leaveRoutes) router.use('/leave', leaveRoutes);

if (notificationRoutes) router.use('/notifications', notificationRoutes);
if (analyticsRoutes) router.use('/analytics', analyticsRoutes);

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date(),
    uptime: process.uptime()
  });
});

module.exports = router;
