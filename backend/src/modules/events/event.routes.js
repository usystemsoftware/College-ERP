const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/authMiddleware');
const { authorize } = require('../../middleware/roleMiddleware');
const { getEvents, getEvent, createEvent, updateEvent, registerForEvent, deleteEvent } = require('./event.controller');

router.get('/', protect, getEvents);
router.get('/:id', protect, getEvent);
router.post('/', protect, authorize('Event Coordinator', 'College Admin', 'Principal', 'Super Admin'), createEvent);
router.put('/:id', protect, authorize('Event Coordinator', 'College Admin', 'Principal', 'Super Admin'), updateEvent);
router.post('/:id/register', protect, registerForEvent);
router.delete('/:id', protect, authorize('Event Coordinator', 'College Admin', 'Super Admin'), deleteEvent);

module.exports = router;
