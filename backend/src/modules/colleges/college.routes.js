const express = require('express');
const router = express.Router();
const collegeController = require('./college.controller');
const { protect, authorize } = require('../../middleware/authMiddleware');

router.use(protect);

router.get('/', collegeController.getColleges);
router.get('/:id', collegeController.getCollege);

// Only Super Admins can create or delete colleges
router.post('/', authorize('Super Admin'), collegeController.createCollege);
router.delete('/:id', authorize('Super Admin'), collegeController.deleteCollege);

// College Admins can update their own college details
router.put('/:id', authorize('Super Admin', 'College Admin'), collegeController.updateCollege);

module.exports = router;
