const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/authMiddleware');
const { authorize } = require('../../middleware/roleMiddleware');
const { getMyNotifications, markAsRead, markAllAsRead, sendNotification, deleteNotification } = require('./notification.controller');

router.get('/my', protect, getMyNotifications);
router.patch('/mark-all-read', protect, markAllAsRead);
router.patch('/:id/read', protect, markAsRead);
router.delete('/:id', protect, deleteNotification);
router.post('/send', protect, authorize('Super Admin', 'College Admin', 'Principal', 'HOD', 'Faculty', 'Event Coordinator'), sendNotification);

module.exports = router;
