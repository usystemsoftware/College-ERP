const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/authMiddleware');
const { authorize } = require('../../middleware/roleMiddleware');
const { createIncident, getIncidents, getMyIncidents, getIncidentById, updateIncident } = require('./incident.controller');

// Any authenticated user can submit an anonymous incident
router.post('/', protect, createIncident);
router.get('/my-incidents', protect, getMyIncidents);

// Only admins/security can view and manage incidents
router.get('/', protect, authorize(
  'Super Admin', 'College Admin', 'Principal', 'HOD', 'Security Officer'
), getIncidents);

router.get('/:id', protect, authorize(
  'Super Admin', 'College Admin', 'Principal', 'HOD', 'Security Officer'
), getIncidentById);

router.patch('/:id', protect, authorize(
  'Super Admin', 'College Admin', 'Principal', 'Security Officer'
), updateIncident);

module.exports = router;
