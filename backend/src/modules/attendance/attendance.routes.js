const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/authMiddleware');
const { authorize } = require('../../middleware/roleMiddleware');
const {
  markAttendance,
  getAttendanceBySubjectDate,
  getStudentAttendance,
  getAttendanceReport,
  studentCheckIn,
  studentCheckOut,
  getStudentTodayAttendance,
  getAdminLiveFeed,
  getAttendanceDashboardStats,
  generateQRToken,
  markQRAttendance,
  sendQRToFaculty,
  markFacultyLectureAttendance,
  getFacultyLecturesWithAttendance
} = require('./attendance.controller');

// Faculty / Admin routes
router.get('/dashboard', protect, getAttendanceDashboardStats);
router.post('/mark', protect, authorize('Faculty', 'Class Coordinator', 'HOD', 'Principal', 'College Admin', 'Super Admin'), markAttendance);
router.get('/by-subject-date', protect, getAttendanceBySubjectDate);
router.get('/my-summary', protect, getStudentAttendance);
router.get('/report', protect, authorize('Super Admin', 'College Admin', 'Principal', 'HOD', 'Faculty'), getAttendanceReport);

// Admin live feed of student self-check-ins
router.get('/admin-live-feed', protect, authorize('Super Admin', 'College Admin', 'Principal', 'HOD', 'Faculty'), getAdminLiveFeed);

// Student self-attendance routes
router.post('/student-checkin', protect, authorize('Student'), studentCheckIn);
router.post('/student-checkout', protect, authorize('Student'), studentCheckOut);
router.get('/student-today', protect, authorize('Student'), getStudentTodayAttendance);

// QR Attendance routes
router.post('/qr/generate', protect, authorize('Faculty', 'Class Coordinator', 'HOD', 'Principal', 'College Admin', 'Super Admin'), generateQRToken);
router.post('/qr/mark', protect, authorize('Student'), markQRAttendance);
router.post('/qr/send-to-faculty', protect, authorize('Faculty', 'Class Coordinator', 'HOD', 'Principal', 'College Admin', 'Super Admin'), sendQRToFaculty);

// Faculty Lecture Attendance routes
router.post('/faculty-lecture', protect, authorize('HR', 'Super Admin', 'College Admin', 'Principal', 'HOD', 'Faculty'), markFacultyLectureAttendance);
router.get('/faculty-lecture', protect, authorize('HR', 'Super Admin', 'College Admin', 'Principal', 'HOD', 'Faculty'), getFacultyLecturesWithAttendance);

module.exports = router;
