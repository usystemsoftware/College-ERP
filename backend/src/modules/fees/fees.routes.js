const express = require('express');
const router = express.Router();
const feesController = require('./fees.controller');
const { protect, authorize } = require('../../middleware/authMiddleware');

router.use(protect);

router.post('/', authorize('Super Admin', 'College Admin', 'Accountant'), feesController.createInvoice);
router.get('/', authorize('Super Admin', 'College Admin', 'Accountant', 'Principal', 'Student'), feesController.getInvoices);
router.post('/:id/pay', authorize('Super Admin', 'College Admin', 'Accountant', 'Student'), feesController.recordPayment);
router.get('/summary', authorize('Super Admin', 'College Admin', 'Accountant', 'Principal'), feesController.getFinancialSummary);

module.exports = router;
