const Application = require('./application.model');
const User = require('../users/user.model');
const Role = require('../roles/role.model');
const College = require('../colleges/college.model');
const Department = require('../departments/department.model');
const Course = require('../courses/course.model');
const ApiError = require('../../utils/apiError');
const ApiResponse = require('../../utils/apiResponse');
const crypto = require('crypto');
const Student = require('../students/student.model');
const Batch = require('../batches/batch.model');
const Semester = require('../semesters/semester.model');

// Get initial form data for Admission Portal (Public Route)
const getAdmissionFormData = async (req, res, next) => {
  try {
    const colleges = await College.find({ status: 'Active' }).select('name code');
    const departments = await Department.find({}).select('name code');
    const courses = await Course.find({}).select('name code department');

    return res.status(200).json(new ApiResponse(200, { colleges, departments, courses }, 'Form data fetched successfully'));
  } catch (error) {
    next(error);
  }
};

// Submit a new application (Public Route)
const submitApplication = async (req, res, next) => {
  try {
    const { firstName, lastName, email, phone, address, dob, gender, collegeId, courseId } = req.body;

    // Check if an application already exists with this email
    const existingApp = await Application.findOne({ email });
    if (existingApp) {
      throw new ApiError(400, 'An application with this email already exists');
    }

    // Process uploaded documents
    const documents = {
      photoUrl: req.files?.photo ? `/uploads/admissions/${req.files.photo[0].filename}` : null,
      idProofUrl: req.files?.idProof ? `/uploads/admissions/${req.files.idProof[0].filename}` : null,
      marksheetUrl: req.files?.marksheet ? `/uploads/admissions/${req.files.marksheet[0].filename}` : null,
    };

    const application = await Application.create({
      firstName, lastName, email, phone, address, dob, gender, collegeId, courseId, documents
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
      let user = await User.findOne({ email: application.email });
      if (!user) {
        user = await User.create({
          email: application.email,
          password: tempPassword,
          role: studentRole._id,
          collegeId: application.collegeId,
          status: 'Active',
          isVerified: true
        });
      }
      
      // We should also create a Student Profile here
      const courseDetails = await Course.findById(application.courseId);
      const batchDetails = await Batch.findById(allottedBatchId);
      const semester = await Semester.findOne({ isCurrent: true }) || await Semester.findOne();
      
      const rollNumber = `R-${year}-${crypto.randomInt(1000, 9999)}`;
      
      await Student.create({
        user: user._id,
        rollNumber: rollNumber,
        enrollmentNumber: application.enrollmentId,
        department: courseDetails.department,
        course: application.courseId,
        semester: semester ? semester._id : null, // Assuming at least one semester exists
        division: 'A',
        batch: batchDetails ? batchDetails.name : 'Unknown',
        personalDetails: {
          fullName: `${application.firstName} ${application.lastName}`,
          dob: application.dob,
          gender: application.gender,
          phone: application.phone,
          address: application.address || 'Not Provided'
        },
        collegeId: application.collegeId
      });
    }

    await application.save();

    return res.status(200).json(new ApiResponse(200, { application }, 'Application reviewed successfully'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdmissionFormData,
  submitApplication,
  getApplications,
  reviewApplication
};
