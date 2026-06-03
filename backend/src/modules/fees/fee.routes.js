const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/authMiddleware');
const { authorize } = require('../../middleware/roleMiddleware');
const { getStudentFees, getAllFees, createFee, bulkCreateFees, recordPayment, getPayments, getFeeStats } = require('./fee.controller');

const FINANCE_ROLES = ['Super Admin', 'College Admin', 'Accountant', 'Principal'];

router.get('/stats', protect, authorize(...FINANCE_ROLES), getFeeStats);
router.get('/all', protect, authorize(...FINANCE_ROLES), getAllFees);
router.get('/my', protect, getStudentFees);
router.get('/student/:studentId', protect, authorize(...FINANCE_ROLES), getStudentFees);
router.get('/payments/student/:studentId', protect, getPayments);
router.post('/', protect, authorize(...FINANCE_ROLES), createFee);
router.post('/bulk', protect, authorize(...FINANCE_ROLES), bulkCreateFees);
router.post('/:feeId/pay', protect, authorize(...FINANCE_ROLES), recordPayment);

module.exports = router;
