const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/authMiddleware');
const { authorize } = require('../../middleware/roleMiddleware');
const { getTimetable, createTimetableEntry, updateTimetableEntry, deleteTimetableEntry } = require('./timetable.controller');

router.get('/', protect, getTimetable);
router.post('/', protect, authorize('Super Admin', 'College Admin', 'Principal', 'HOD', 'Class Coordinator'), createTimetableEntry);
router.put('/:id', protect, authorize('Super Admin', 'College Admin', 'Principal', 'HOD', 'Class Coordinator'), updateTimetableEntry);
router.delete('/:id', protect, authorize('Super Admin', 'College Admin', 'Principal', 'HOD'), deleteTimetableEntry);

module.exports = router;
