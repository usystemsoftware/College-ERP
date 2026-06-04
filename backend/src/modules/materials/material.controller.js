const Material = require('./material.model');
const ApiError = require('../../utils/apiError');
const fs = require('fs');
const path = require('path');

// Upload a new material
exports.uploadMaterial = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new ApiError(400, 'Please upload a file'));
    }

    const { title, subject, materialType, description, facultyName } = req.body;

    const material = await Material.create({
      title,
      subject,
      materialType,
      description,
      facultyName,
      fileName: req.file.originalname,
      fileUrl: `/uploads/materials/${req.file.filename}`,
      fileSize: req.file.size,
      uploadedBy: req.user.id,
      collegeId: req.user.collegeId
    });

    res.status(201).json({
      success: true,
      data: material
    });
  } catch (error) {
    next(error);
  }
};

// Get all materials (with search and filters)
exports.getMaterials = async (req, res, next) => {
  try {
    const { search, subject, materialType } = req.query;
    
    // Build query
    const query = {};
    if (req.user.collegeId) {
      query.collegeId = req.user.collegeId;
    }

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }
    
    if (subject && subject !== 'All') {
      query.subject = subject;
    }
    
    if (materialType && materialType !== 'All') {
      query.materialType = materialType;
    }

    const materials = await Material.find(query)
      .populate('uploadedBy', 'name')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: materials.length,
      data: materials
    });
  } catch (error) {
    next(error);
  }
};

// Increment download count
exports.incrementDownload = async (req, res, next) => {
  try {
    const material = await Material.findByIdAndUpdate(
      req.params.id,
      { $inc: { downloadCount: 1 } },
      { new: true, runValidators: true }
    );

    if (!material) {
      return next(new ApiError(404, 'Material not found'));
    }

    res.status(200).json({
      success: true,
      data: material
    });
  } catch (error) {
    next(error);
  }
};

// Delete material
exports.deleteMaterial = async (req, res, next) => {
  try {
    const material = await Material.findById(req.params.id);

    if (!material) {
      return next(new ApiError(404, 'Material not found'));
    }

    // Check permissions
    if (material.uploadedBy.toString() !== req.user.id && !['Super Admin', 'College Admin'].includes(req.user.role.name || req.user.role)) {
      return next(new ApiError(403, 'Not authorized to delete this material'));
    }

    // Delete file from filesystem
    if (material.fileUrl) {
      const filePath = path.join(__dirname, '../../../public', material.fileUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await material.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};
