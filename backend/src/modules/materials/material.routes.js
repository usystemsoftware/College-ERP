const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect, authorize } = require('../../middleware/authMiddleware');
const materialController = require('./material.controller');
const ApiError = require('../../utils/apiError');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../../public/uploads/materials');
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
    cb(null, 'material-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'application/pdf',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'video/mp4'
  ];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'Invalid file type. Only PDF, PPT, DOC, and MP4 are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB max file size
  },
  fileFilter: fileFilter
});

// Routes
router.use(protect);

router.route('/')
  .get(materialController.getMaterials);

router.route('/upload')
  .post(
    authorize('Super Admin', 'College Admin', 'Faculty'),
    upload.single('file'),
    materialController.uploadMaterial
  );

router.route('/:id')
  .delete(authorize('Super Admin', 'College Admin', 'Faculty'), materialController.deleteMaterial);

router.route('/:id/download')
  .put(materialController.incrementDownload);

module.exports = router;
