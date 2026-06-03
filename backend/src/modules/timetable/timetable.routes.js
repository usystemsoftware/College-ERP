const express = require('express');
const router = express.Router();
const timetableController = require('./timetable.controller');
const { protect, authorize } = require('../../middleware/authMiddleware');

router.use(protect);

router.get('/', timetableController.getTimetables);
router.post('/', authorize('Super Admin', 'College Admin', 'Principal', 'HOD', 'Class Coordinator'), timetableController.saveTimetable);

module.exports = router;
