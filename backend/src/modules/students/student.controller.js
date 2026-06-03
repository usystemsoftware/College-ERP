const Student = require('./student.model');
const User = require('../users/user.model');
const ApiError = require('../../utils/apiError');
const ApiResponse = require('../../utils/apiResponse');

// Get all students
const getStudents = async (req, res, next) => {
  try {
    const { department, course, semester } = req.query;
    let filter = {};
    if (req.user.role.name !== 'Super Admin') filter.collegeId = req.user.collegeId;
    if (department) filter.department = department;
    if (course) filter.course = course;
    if (semester) filter.semester = semester;

    const students = await Student.find(filter)
      .populate('user', 'email status isVerified')
      .populate('department', 'name code')
      .populate('course', 'name code')
      .populate('semester', 'name');

    return res.status(200).json(new ApiResponse(200, { students }, 'Students fetched successfully'));
  } catch (error) {
    next(error);
  }
};

// Get single student by ID
const getStudentById = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('user', 'email status isVerified profileImage')
      .populate('department', 'name code')
      .populate('course', 'name code')
      .populate('semester', 'name');

    if (!student) {
      throw new ApiError(404, 'Student not found');
    }

    return res.status(200).json(new ApiResponse(200, { student }, 'Student fetched successfully'));
  } catch (error) {
    next(error);
  }
};

// Create a new student profile
const createStudent = async (req, res, next) => {
  try {
    const {
      user, rollNumber, enrollmentNumber,
      department, course, semester, division, batch,
      personalDetails, collegeId
    } = req.body;

    const existingStudent = await Student.findOne({
      $or: [{ user }, { rollNumber }, { enrollmentNumber }]
    });

    if (existingStudent) {
      throw new ApiError(400, 'Student profile already exists for this user, roll number, or enrollment number');
    }

    const student = await Student.create({
      user, rollNumber, enrollmentNumber,
      department, course, semester, division, batch,
      personalDetails, collegeId: collegeId || req.user.collegeId
    });

    return res.status(201).json(new ApiResponse(201, { student }, 'Student profile created successfully'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStudents,
  getStudentById,
  createStudent
};
