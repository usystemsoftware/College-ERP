const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/authMiddleware');
const { authorize } = require('../../middleware/roleMiddleware');
const alumniController = require('./alumni.controller');

router.get('/', protect, alumniController.getAllAlumni);
router.post('/', protect, alumniController.createOrUpdateAlumni);
router.get('/my', protect, authorize('Student'), alumniController.getMyAlumniProfile);

module.exports = router;
