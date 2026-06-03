const express = require('express');
const router = express.Router();
const batchController = require('./batch.controller');
const { protect, authorize } = require('../../middleware/authMiddleware');

router.use(protect);

router.get('/', batchController.getBatches);
router.post('/', authorize('Super Admin', 'College Admin', 'Principal'), batchController.createBatch);
router.put('/:id', authorize('Super Admin', 'College Admin', 'Principal'), batchController.updateBatch);
router.delete('/:id', authorize('Super Admin', 'College Admin', 'Principal'), batchController.deleteBatch);

module.exports = router;
