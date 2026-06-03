const express = require('express');
const router = express.Router();
const lmsController = require('./lms.controller');
const { protect, authorize } = require('../../middleware/authMiddleware');

router.use(protect);

router.post('/', authorize('Super Admin', 'College Admin', 'Principal', 'HOD', 'Faculty'), lmsController.uploadResource);
router.get('/', authorize('Super Admin', 'College Admin', 'Principal', 'HOD', 'Faculty', 'Student'), lmsController.getResources);
router.delete('/:id', authorize('Super Admin', 'College Admin', 'Principal', 'HOD', 'Faculty'), lmsController.deleteResource);

module.exports = router;
