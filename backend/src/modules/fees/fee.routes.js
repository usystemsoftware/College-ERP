const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/authMiddleware');
const { authorize } = require('../../middleware/roleMiddleware');
const feeController = require('./fee.controller');

const FINANCE_ROLES = ['Super Admin', 'College Admin', 'Accountant', 'Principal'];

router.get('/dashboard', protect, feeController.getFeeDashboardStats);
router.get('/stats', protect, authorize(...FINANCE_ROLES), feeController.getFeeStats);
router.get('/all', protect, authorize(...FINANCE_ROLES), feeController.getAllFees);
router.get('/my', protect, feeController.getStudentFees);
router.get('/student/:studentId', protect, authorize(...FINANCE_ROLES), feeController.getStudentFees);
router.get('/payments/student/:studentId', protect, feeController.getPayments);
router.post('/', protect, authorize(...FINANCE_ROLES), feeController.createFee);
router.post('/bulk', protect, authorize(...FINANCE_ROLES), feeController.bulkCreateFees);
router.post('/:feeId/pay', protect, authorize(...FINANCE_ROLES), feeController.recordPayment);

module.exports = router;
