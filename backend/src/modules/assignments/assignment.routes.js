const express = require('express');
const router = express.Router();
const assignmentController = require('./assignment.controller');
const { protect, authorize } = require('../../middleware/authMiddleware');

router.use(protect);

router.get('/dashboard', assignmentController.getAssignmentDashboardStats);
router.post('/', authorize('Super Admin', 'College Admin', 'Principal', 'HOD', 'Faculty'), assignmentController.createAssignment);
router.get('/', authorize('Super Admin', 'College Admin', 'Principal', 'HOD', 'Faculty', 'Student'), assignmentController.getAssignments);

router.post('/:assignmentId/submit', authorize('Student'), assignmentController.submitAssignment);
router.put('/:assignmentId/grade/:submissionId', authorize('Super Admin', 'College Admin', 'Principal', 'HOD', 'Faculty'), assignmentController.gradeAssignment);

module.exports = router;
