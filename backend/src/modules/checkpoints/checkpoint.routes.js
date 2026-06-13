const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/authMiddleware');
const { authorize } = require('../../middleware/roleMiddleware');
const {
  generateCheckpointQR,
  scanCheckpoint,
  getStudentCheckpoints,
  getCheckpointDashboard
} = require('./checkpoint.controller');

router.use(protect);

// Admin/Faculty: generate checkpoint QR
router.post('/generate', authorize('Super Admin', 'College Admin', 'Principal', 'Faculty', 'HOD', 'Security Officer'), generateCheckpointQR);

// Student: scan checkpoint QR
router.post('/scan', authorize('Student'), scanCheckpoint);

// Get checkpoints (for student or admin viewing a student)
router.get('/student', getStudentCheckpoints);

// Admin dashboard
router.get('/dashboard', authorize('Super Admin', 'College Admin', 'Principal', 'HOD', 'Security Officer'), getCheckpointDashboard);

module.exports = router;
