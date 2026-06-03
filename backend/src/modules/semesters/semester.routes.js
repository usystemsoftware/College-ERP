const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/authMiddleware');
const { authorize } = require('../../middleware/roleMiddleware');
const { getSemesters, getCurrentSemester, createSemester, updateSemester, deleteSemester } = require('./semester.controller');

router.get('/', protect, getSemesters);
router.get('/current', protect, getCurrentSemester);
router.post('/', protect, authorize('Super Admin', 'College Admin', 'Principal'), createSemester);
router.put('/:id', protect, authorize('Super Admin', 'College Admin', 'Principal'), updateSemester);
router.delete('/:id', protect, authorize('Super Admin', 'College Admin'), deleteSemester);

module.exports = router;
