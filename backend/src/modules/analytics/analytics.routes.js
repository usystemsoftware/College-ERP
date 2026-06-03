const express = require('express');
const router = express.Router();
const analyticsController = require('./analytics.controller');
const { protect, authorize } = require('../../middleware/authMiddleware');

router.use(protect);
router.use(authorize('Super Admin', 'College Admin', 'Principal'));

router.get('/dashboard', analyticsController.getDashboardStats);

module.exports = router;
