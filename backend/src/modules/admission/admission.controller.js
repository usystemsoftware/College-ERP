const Application = require('./application.model');
const User = require('../users/user.model');
const Role = require('../roles/role.model');
const ApiError = require('../../utils/apiError');
const ApiResponse = require('../../utils/apiResponse');
const crypto = require('crypto');

// Submit a new application (Public Route)
const submitApplication = async (req, res, next) => {
  try {
    const { firstName, lastName, email, phone, dob, gender, collegeId, courseId, documents } = req.body;

    // Check if an application already exists with this email
    const existingApp = await Application.findOne({ email });
    if (existingApp) {
      throw new ApiError(400, 'An application with this email already exists');
    }

    const application = await Application.create({
      firstName, lastName, email, phone, dob, gender, collegeId, courseId, documents
    });

    return res.status(201).json(new ApiResponse(201, { application }, 'Application submitted successfully'));
  } catch (error) {
    next(error);
  }
};

// Get all applications (Admin Route)
const getApplications = async (req, res, next) => {
  try {
    const filter = req.user.role.name !== 'Super Admin' ? { collegeId: req.user.collegeId } : {};
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const applications = await Application.find(filter)
      .populate('courseId', 'name code')
      .sort({ createdAt: -1 });

    return res.status(200).json(new ApiResponse(200, { applications }, 'Applications fetched successfully'));
  } catch (error) {
    next(error);
  }
};

// Review and Approve/Reject (Admin Route)
const reviewApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, reviewNotes, allottedBatchId } = req.body;

    const application = await Application.findById(id);
    if (!application) {
      throw new ApiError(404, 'Application not found');
    }

    application.status = status;
    application.reviewNotes = reviewNotes;
    application.reviewedBy = req.user._id;

    if (status === 'Approved') {
      if (!allottedBatchId) throw new ApiError(400, 'Batch must be allotted to approve application');
      application.allottedBatchId = allottedBatchId;
      
      // Generate Enrollment ID: COL-YYYY-RANDOM
      const year = new Date().getFullYear();
      const randSeq = crypto.randomInt(1000, 9999);
      application.enrollmentId = `COL-${year}-${randSeq}`;

      // Create a Student User Account automatically
      const studentRole = await Role.findOne({ name: 'Student' });
      
      const tempPassword = `student@${year}`;
      const newUser = await User.create({
        email: application.email,
        password: tempPassword,
        role: studentRole._id,
        collegeId: application.collegeId,
        status: 'Active',
        isVerified: true
      });
      
      // We should also create a Student Profile here (linking User, Course, Batch), but we will handle that once the Student module is built. For now, the user account is created.
    }

    await application.save();

    return res.status(200).json(new ApiResponse(200, { application }, 'Application reviewed successfully'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitApplication,
  getApplications,
  reviewApplication
};
