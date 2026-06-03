const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/authMiddleware');
const { authorize } = require('../../middleware/roleMiddleware');
const { getCompanies, createCompany, getPlacements, getPlacement, createPlacement, applyForPlacement, updateApplicationStatus } = require('./placement.controller');

router.get('/companies', protect, getCompanies);
router.post('/companies', protect, authorize('Placement Officer', 'College Admin', 'Super Admin'), createCompany);
router.get('/', protect, getPlacements);
router.get('/:id', protect, getPlacement);
router.post('/', protect, authorize('Placement Officer', 'College Admin', 'Super Admin'), createPlacement);
router.post('/:id/apply', protect, authorize('Student'), applyForPlacement);
router.patch('/:id/status', protect, authorize('Placement Officer', 'College Admin', 'Super Admin'), updateApplicationStatus);

module.exports = router;
