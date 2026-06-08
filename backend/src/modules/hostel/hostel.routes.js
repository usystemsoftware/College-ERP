const express = require('express');
const router = express.Router();
const hostelController = require('./hostel.controller');
const { protect, authorize } = require('../../middleware/authMiddleware');

router.use(protect);

router.get('/dashboard', hostelController.getHostelDashboardStats);
router.post('/', authorize('Super Admin', 'College Admin', 'Hostel Warden'), hostelController.createHostel);
router.get('/', authorize('Super Admin', 'College Admin', 'Hostel Warden', 'Student'), hostelController.getHostels);

router.post('/rooms', authorize('Super Admin', 'College Admin', 'Hostel Warden'), hostelController.createRoom);
router.get('/rooms', authorize('Super Admin', 'College Admin', 'Hostel Warden', 'Student'), hostelController.getRooms);

router.post('/allocate', authorize('Super Admin', 'College Admin', 'Hostel Warden'), hostelController.allocateRoom);
router.get('/allocation/:studentId', authorize('Super Admin', 'College Admin', 'Hostel Warden', 'Student'), hostelController.getStudentAllocation);

module.exports = router;
