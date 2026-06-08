const express = require('express');
const router = express.Router();
const examController = require('./exam.controller');
const { protect, authorize } = require('../../middleware/authMiddleware');

router.use(protect);

router.get('/dashboard', examController.getExamDashboardStats);
router.post('/', authorize('Super Admin', 'College Admin', 'Principal', 'HOD', 'Faculty'), examController.createExam);
router.get('/', authorize('Super Admin', 'College Admin', 'Principal', 'HOD', 'Faculty', 'Student'), examController.getExams);
router.put('/:id/results', authorize('Super Admin', 'College Admin', 'Principal', 'HOD', 'Faculty'), examController.updateResults);
router.get('/student/:studentId', authorize('Super Admin', 'College Admin', 'Principal', 'HOD', 'Faculty', 'Student'), examController.getStudentResults);

module.exports = router;
