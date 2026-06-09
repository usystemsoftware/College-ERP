const express = require('express');
const router = express.Router();
const parentController = require('./parent.controller');
const { protect, authorize } = require('../../middleware/authMiddleware');

router.use(protect);

router.get('/', parentController.getParents);
router.get('/me', parentController.getMyProfile);
router.get('/:id', parentController.getParentById);
router.post('/', authorize('Super Admin', 'College Admin', 'Principal'), parentController.createParent);

module.exports = router;
