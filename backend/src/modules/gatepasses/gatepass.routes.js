const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/authMiddleware');
const { authorize } = require('../../middleware/roleMiddleware');
const { getGatePasses, createGatePass, approveGatePass, checkIn, checkOut } = require('./gatepass.controller');

router.get('/', protect, authorize(
  'Student', 'HOD', 'Security Officer', 'College Admin', 'Principal', 'Super Admin'
), getGatePasses);

router.post('/', protect, authorize(
  'Student', 'Security Officer', 'College Admin', 'Principal', 'Super Admin'
), createGatePass);

router.patch('/:id/approve', protect, authorize(
  'HOD', 'Security Officer', 'College Admin', 'Principal', 'Super Admin'
), approveGatePass);

router.patch('/:id/checkin', protect, authorize('Security Officer', 'College Admin', 'Super Admin'), checkIn);
router.patch('/:id/checkout', protect, authorize('Security Officer', 'College Admin', 'Super Admin'), checkOut);

module.exports = router;
