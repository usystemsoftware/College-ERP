const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/authMiddleware');
const { authorize } = require('../../middleware/roleMiddleware');
const { markAttendance, getAttendanceBySubjectDate, getStudentAttendance, getAttendanceReport } = require('./attendance.controller');

router.post('/mark', protect, authorize('Faculty', 'Class Coordinator', 'HOD', 'Principal', 'College Admin', 'Super Admin'), markAttendance);
router.get('/by-subject-date', protect, getAttendanceBySubjectDate);
router.get('/my-summary', protect, getStudentAttendance);
router.get('/report', protect, authorize('Super Admin', 'College Admin', 'Principal', 'HOD', 'Faculty'), getAttendanceReport);

module.exports = router;
