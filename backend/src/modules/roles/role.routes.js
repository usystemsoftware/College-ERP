const express = require('express');
const router = express.Router();
const roleController = require('./role.controller');
const { protect, authorize } = require('../../middleware/authMiddleware');

// All role routes require authentication and Super Admin access
router.use(protect);

router.get('/', roleController.getRoles);
router.post('/', authorize('Super Admin'), roleController.createRole);
router.put('/:id', authorize('Super Admin'), roleController.updateRole);
router.delete('/:id', authorize('Super Admin'), roleController.deleteRole);

module.exports = router;
