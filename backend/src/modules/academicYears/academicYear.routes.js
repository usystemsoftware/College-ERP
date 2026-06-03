const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/authMiddleware');
const { authorize } = require('../../middleware/roleMiddleware');
const { getAcademicYears, getCurrentAcademicYear, createAcademicYear, updateAcademicYear, deleteAcademicYear } = require('./academicYear.controller');

router.get('/', protect, getAcademicYears);
router.get('/current', protect, getCurrentAcademicYear);
router.post('/', protect, authorize('Super Admin', 'College Admin', 'Principal'), createAcademicYear);
router.put('/:id', protect, authorize('Super Admin', 'College Admin', 'Principal'), updateAcademicYear);
router.delete('/:id', protect, authorize('Super Admin', 'College Admin'), deleteAcademicYear);

module.exports = router;
