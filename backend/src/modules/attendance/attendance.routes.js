const express = require('express');
const router = express.Router();
const attendanceController = require('./attendance.controller');
const { protect, authorize } = require('../../middleware/authMiddleware');

router.use(protect);

router.post('/', authorize('Super Admin', 'College Admin', 'Principal', 'HOD', 'Faculty'), attendanceController.markAttendance);
router.get('/', authorize('Super Admin', 'College Admin', 'Principal', 'HOD', 'Faculty'), attendanceController.getAttendance);
router.get('/student/:studentId', authorize('Super Admin', 'College Admin', 'Principal', 'HOD', 'Faculty', 'Student'), attendanceController.getStudentAttendance);

module.exports = router;
