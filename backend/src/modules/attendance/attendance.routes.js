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
  verifyQRToken,
  markQRAttendance,
  sendQRToFaculty,
  sendQRToStudents,
  markFacultyLectureAttendance,
  getFacultyLecturesWithAttendance,
  getFacultyAttendanceSummary,
  startLectureSession,
  endLectureSession,
  getDepartmentLectureAnomalies
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
router.post('/qr/verify', protect, authorize('Student'), verifyQRToken);
router.post('/qr/mark', protect, authorize('Student'), markQRAttendance);
router.post('/qr/send-to-faculty', protect, authorize('Faculty', 'Class Coordinator', 'HOD', 'Principal', 'College Admin', 'Super Admin'), sendQRToFaculty);
router.post('/qr/send-to-students', protect, authorize('Faculty', 'Class Coordinator', 'HOD', 'Principal', 'College Admin', 'Super Admin'), sendQRToStudents);

// Faculty Lecture Attendance routes
router.post('/faculty-lecture', protect, authorize('HR', 'Super Admin', 'College Admin', 'Principal', 'HOD', 'Faculty'), markFacultyLectureAttendance);
router.get('/faculty-lecture', protect, authorize('HR', 'Super Admin', 'College Admin', 'Principal', 'HOD', 'Faculty'), getFacultyLecturesWithAttendance);
router.get('/faculty-summary', protect, authorize('HR', 'Super Admin', 'College Admin', 'Principal', 'HOD', 'Faculty'), getFacultyAttendanceSummary);
router.post('/faculty-lecture/start-session', protect, authorize('Faculty'), startLectureSession);
router.post('/faculty-lecture/end-session', protect, authorize('Faculty'), endLectureSession);
router.get('/faculty-lecture/department-anomalies', protect, authorize('HOD', 'College Admin', 'Super Admin'), getDepartmentLectureAnomalies);

router.post('/campus-checkin',
  protect,
  authorize('Student'),
  studentCheckIn
);

router.post('/campus-checkout',
  protect,
  authorize('Student'),
  studentCheckOut
);

router.get('/campus-live',
  protect,
  authorize('Super Admin', 'College Admin', 'Principal'),
  getAdminLiveFeed
);

module.exports = router;
