const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/authMiddleware');
const { authorize } = require('../../middleware/roleMiddleware');
const upload = require('../../middleware/uploadMiddleware');
const documentController = require('./document.controller');

// Student routes
router.post('/upload', protect, upload.single('document'), documentController.uploadDocument);
router.get('/my', protect, documentController.getMyDocuments);

// Admin routes
router.get('/student/:studentId', protect, authorize('Super Admin', 'College Admin', 'Principal', 'Admission Officer'), documentController.getStudentDocuments);
router.put('/:id/status', protect, authorize('Super Admin', 'College Admin', 'Principal', 'Admission Officer'), documentController.updateDocumentStatus);

module.exports = router;
