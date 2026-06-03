const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/authMiddleware');
const { authorize } = require('../../middleware/roleMiddleware');
const { getSubjects, getSubject, createSubject, updateSubject, deleteSubject } = require('./subject.controller');

router.get('/', protect, getSubjects);
router.get('/:id', protect, getSubject);
router.post('/', protect, authorize('Super Admin', 'College Admin', 'Principal', 'HOD'), createSubject);
router.put('/:id', protect, authorize('Super Admin', 'College Admin', 'Principal', 'HOD'), updateSubject);
router.delete('/:id', protect, authorize('Super Admin', 'College Admin'), deleteSubject);

module.exports = router;
