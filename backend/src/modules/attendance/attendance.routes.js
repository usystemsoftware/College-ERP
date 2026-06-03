const express = require('express');
const router = express.Router();
<<<<<<< HEAD
const attendanceController = require('./attendance.controller');
const { protect, authorize } = require('../../middleware/authMiddleware');

router.use(protect);

router.post('/', authorize('Super Admin', 'College Admin', 'Principal', 'HOD', 'Faculty'), attendanceController.markAttendance);
router.get('/', authorize('Super Admin', 'College Admin', 'Principal', 'HOD', 'Faculty'), attendanceController.getAttendance);
router.get('/student/:studentId', authorize('Super Admin', 'College Admin', 'Principal', 'HOD', 'Faculty', 'Student'), attendanceController.getStudentAttendance);
=======
const { protect } = require('../../middleware/authMiddleware');
const { authorize } = require('../../middleware/roleMiddleware');
const { markAttendance, getAttendanceBySubjectDate, getStudentAttendance, getAttendanceReport } = require('./attendance.controller');

router.post('/mark', protect, authorize('Faculty', 'Class Coordinator', 'HOD', 'Principal', 'College Admin', 'Super Admin'), markAttendance);
router.get('/by-subject-date', protect, getAttendanceBySubjectDate);
router.get('/my-summary', protect, getStudentAttendance);
router.get('/report', protect, authorize('Super Admin', 'College Admin', 'Principal', 'HOD', 'Faculty'), getAttendanceReport);
>>>>>>> 7b4a3a7751aa63252c46edeef69f5e1c88a642af

module.exports = router;
