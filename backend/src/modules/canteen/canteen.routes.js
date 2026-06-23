const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/authMiddleware');
const { authorize } = require('../../middleware/roleMiddleware');
const canteenController = require('./canteen.controller');

// Shared routes
router.get('/menu', protect, canteenController.getMenu);
router.post('/orders', protect, canteenController.placeOrder);
router.get('/orders/my', protect, canteenController.getMyOrders);

// Admin routes (Canteen Management)
router.post('/menu', protect, authorize('Super Admin', 'College Admin'), canteenController.addMenuItem);
router.patch('/menu/:id/toggle', protect, authorize('Super Admin', 'College Admin'), canteenController.toggleMenuItemAvailability);
router.get('/orders/all', protect, authorize('Super Admin', 'College Admin'), canteenController.getAllOrders);
router.put('/orders/:id/status', protect, authorize('Super Admin', 'College Admin'), canteenController.updateOrderStatus);

module.exports = router;
