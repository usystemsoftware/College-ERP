const express = require('express');
const router = express.Router();
const inventoryController = require('./inventory.controller');
const { protect, authorize } = require('../../middleware/authMiddleware');

router.use(protect);
router.use(authorize('Super Admin', 'College Admin', 'Inventory Manager'));

router.get('/dashboard', inventoryController.getInventoryDashboardStats);
router.post('/', inventoryController.addAsset);
router.get('/', inventoryController.getAssets);
router.put('/:id', inventoryController.updateAsset);

module.exports = router;
