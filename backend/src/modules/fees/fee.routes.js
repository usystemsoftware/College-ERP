const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/authMiddleware');
const { authorize } = require('../../middleware/roleMiddleware');
const feeController = require('./fee.controller');
const feeCategoryController = require('./feeCategory.controller');
const feeStructureController = require('./feeStructure.controller');

const FINANCE_ROLES = ['Super Admin', 'College Admin', 'Accountant', 'Principal'];

// Dashboard & Stats
router.get('/dashboard', protect, feeController.getFeeDashboardStats);
router.get('/stats', protect, authorize(...FINANCE_ROLES), feeController.getFeeStats);

// Fee Categories
router.post('/categories', protect, authorize(...FINANCE_ROLES), feeCategoryController.createCategory);
router.get('/categories', protect, authorize(...FINANCE_ROLES), feeCategoryController.getCategories);
router.put('/categories/:id', protect, authorize(...FINANCE_ROLES), feeCategoryController.updateCategory);
router.delete('/categories/:id', protect, authorize(...FINANCE_ROLES), feeCategoryController.deleteCategory);

// Fee Structures
router.post('/structures', protect, authorize(...FINANCE_ROLES), feeStructureController.createStructure);
router.get('/structures', protect, authorize(...FINANCE_ROLES), feeStructureController.getStructures);
router.get('/structures/:id', protect, authorize(...FINANCE_ROLES), feeStructureController.getStructureById);
router.put('/structures/:id', protect, authorize(...FINANCE_ROLES), feeStructureController.updateStructure);
router.delete('/structures/:id', protect, authorize(...FINANCE_ROLES), feeStructureController.deleteStructure);

// Fee Assignments
router.post('/bulk', protect, authorize(...FINANCE_ROLES), feeController.bulkCreateFees);
router.post('/', protect, authorize(...FINANCE_ROLES), feeController.createFee);
router.get('/all', protect, authorize(...FINANCE_ROLES), feeController.getAllFees);

// Student specific fee APIs
router.get('/my', protect, feeController.getStudentFees);
router.get('/student/:studentId', protect, authorize(...FINANCE_ROLES), feeController.getStudentFees);

// Payments
router.post('/:feeId/pay', protect, authorize(...FINANCE_ROLES), feeController.recordPayment);
router.get('/payments/student/:studentId', protect, feeController.getPayments);

module.exports = router;
