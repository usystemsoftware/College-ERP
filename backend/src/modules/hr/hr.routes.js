const express = require('express');
const router = express.Router();
const hrController = require('./hr.controller');
const { protect, authorize } = require('../../middleware/authMiddleware');

router.use(protect);

// Leave
router.post('/leave', authorize('Faculty'), hrController.applyLeave);
router.get('/leave', authorize('Super Admin', 'College Admin', 'HR Manager', 'Principal', 'HOD', 'Faculty'), hrController.getLeaves);
router.put('/leave/:id', authorize('Super Admin', 'College Admin', 'HR Manager', 'Principal', 'HOD'), hrController.updateLeaveStatus);

// Payroll
router.post('/payroll', authorize('Super Admin', 'College Admin', 'HR Manager', 'Accountant'), hrController.generatePayroll);
router.get('/payroll', authorize('Super Admin', 'College Admin', 'HR Manager', 'Accountant', 'Faculty'), hrController.getPayroll);

module.exports = router;
