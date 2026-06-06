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
  getAdminLiveFeed
} = require('./attendance.controller');

// Faculty / Admin routes
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

module.exports = router;
