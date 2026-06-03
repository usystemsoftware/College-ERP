const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/authMiddleware');
const { authorize } = require('../../middleware/roleMiddleware');
const { getAssignments, getAssignment, createAssignment, updateAssignment, deleteAssignment, submitAssignment, getSubmissions, gradeSubmission } = require('./assignment.controller');

router.get('/', protect, getAssignments);
router.get('/:id', protect, getAssignment);
router.post('/', protect, authorize('Faculty', 'HOD', 'College Admin', 'Super Admin'), createAssignment);
router.put('/:id', protect, authorize('Faculty', 'HOD', 'College Admin', 'Super Admin'), updateAssignment);
router.delete('/:id', protect, authorize('Faculty', 'HOD', 'College Admin', 'Super Admin'), deleteAssignment);
router.post('/:id/submit', protect, authorize('Student'), submitAssignment);
router.get('/:id/submissions', protect, authorize('Faculty', 'HOD', 'College Admin', 'Super Admin'), getSubmissions);
router.patch('/:id/submissions/:subId/grade', protect, authorize('Faculty', 'HOD'), gradeSubmission);

module.exports = router;
