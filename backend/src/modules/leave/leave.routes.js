const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/authMiddleware');
const { authorize } = require('../../middleware/roleMiddleware');
const { getLeaveRequests, createLeaveRequest, processLeaveRequest, cancelLeaveRequest } = require('./leave.controller');

router.get('/', protect, getLeaveRequests);
router.post('/', protect, createLeaveRequest);
router.patch('/:id/process', protect, authorize('Super Admin', 'College Admin', 'Principal', 'HOD', 'Vice Principal', 'Faculty', 'Class Coordinator'), processLeaveRequest);
router.patch('/:id/cancel', protect, cancelLeaveRequest);

module.exports = router;
