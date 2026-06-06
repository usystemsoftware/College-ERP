const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const admissionController = require('./admission.controller');
const { protect, authorize } = require('../../middleware/authMiddleware');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../../public/uploads/admissions');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'admission-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB max per file
});

// Public routes for admission portal
router.get('/form-data', admissionController.getAdmissionFormData);

router.post('/apply', upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'idProof', maxCount: 1 },
  { name: 'marksheet', maxCount: 1 }
]), admissionController.submitApplication);

// Protected routes for admins
router.use(protect);
router.get('/applications', authorize('Super Admin', 'College Admin', 'Admission Officer'), admissionController.getApplications);
router.put('/applications/:id/review', authorize('Super Admin', 'College Admin', 'Admission Officer'), admissionController.reviewApplication);

module.exports = router;
