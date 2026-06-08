const express = require('express');
const router = express.Router();
const transportController = require('./transport.controller');
const { protect, authorize } = require('../../middleware/authMiddleware');

router.use(protect);

router.get('/dashboard', transportController.getTransportDashboardStats);
router.post('/routes', authorize('Super Admin', 'College Admin', 'Transport Manager'), transportController.createRoute);
router.get('/routes', authorize('Super Admin', 'College Admin', 'Transport Manager', 'Student'), transportController.getRoutes);

router.post('/vehicles', authorize('Super Admin', 'College Admin', 'Transport Manager'), transportController.addVehicle);
router.get('/vehicles', authorize('Super Admin', 'College Admin', 'Transport Manager'), transportController.getVehicles);

router.post('/allocate', authorize('Super Admin', 'College Admin', 'Transport Manager'), transportController.allocateTransport);
router.get('/allocation/:studentId', authorize('Super Admin', 'College Admin', 'Transport Manager', 'Student'), transportController.getStudentTransport);

module.exports = router;
