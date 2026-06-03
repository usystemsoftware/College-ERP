const express = require('express');
const router = express.Router();
const admissionController = require('./admission.controller');
const { protect, authorize } = require('../../middleware/authMiddleware');

// Public route for students to apply
router.post('/apply', admissionController.submitApplication);

// Protected routes for admins
router.use(protect);
router.get('/applications', authorize('Super Admin', 'College Admin', 'Admission Officer'), admissionController.getApplications);
router.put('/applications/:id/review', authorize('Super Admin', 'College Admin', 'Admission Officer'), admissionController.reviewApplication);

module.exports = router;
