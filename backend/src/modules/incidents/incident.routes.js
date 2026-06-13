const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/authMiddleware');
const { authorize } = require('../../middleware/roleMiddleware');
const { uploadIncidentFiles } = require('../../middleware/upload');
const { createIncident, getIncidents, getMyIncidents, getIncidentById, updateIncident } = require('./incident.controller');

// Any authenticated user can submit an anonymous incident (with optional file uploads)
router.post('/', protect, uploadIncidentFiles.array('attachments', 5), createIncident);
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
