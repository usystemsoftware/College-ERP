const Document = require('./document.model');
const ApiError = require('../../utils/apiError');
const ApiResponse = require('../../utils/apiResponse');

// Upload a new document
const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new ApiError(400, 'Please upload a file');
    }

    const { title, documentType } = req.body;
    
    // File path relative to server root
    const fileUrl = `/uploads/${req.file.filename}`;

    const document = await Document.create({
      title,
      documentType,
      fileUrl,
      studentId: req.user._id,
      collegeId: req.user.collegeId,
      uploadedBy: req.user._id
    });

    return res.status(201).json(new ApiResponse(201, document, 'Document uploaded successfully'));
  } catch (error) { next(error); }
};

// Get logged-in student's documents
const getMyDocuments = async (req, res, next) => {
  try {
    const documents = await Document.find({ studentId: req.user._id })
      .sort({ createdAt: -1 });
      
    return res.json(new ApiResponse(200, documents, 'Documents fetched successfully'));
  } catch (error) { next(error); }
};

// Get a specific student's documents (For Admins)
const getStudentDocuments = async (req, res, next) => {
  try {
    const documents = await Document.find({ studentId: req.params.studentId })
      .populate('uploadedBy', 'firstName lastName')
      .sort({ createdAt: -1 });
      
    return res.json(new ApiResponse(200, documents, 'Student documents fetched successfully'));
  } catch (error) { next(error); }
};

// Update document status (Verify/Reject)
const updateDocumentStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const document = await Document.findById(req.params.id);
    
    if (!document) throw new ApiError(404, 'Document not found');
    
    if (req.user.collegeId && document.collegeId.toString() !== req.user.collegeId.toString() && req.user.role.name !== 'Super Admin') {
       throw new ApiError(403, 'Not authorized');
    }

    document.status = status;
    await document.save();
    
    return res.json(new ApiResponse(200, document, 'Document status updated'));
  } catch (error) { next(error); }
};

module.exports = {
  uploadDocument,
  getMyDocuments,
  getStudentDocuments,
  updateDocumentStatus
};
