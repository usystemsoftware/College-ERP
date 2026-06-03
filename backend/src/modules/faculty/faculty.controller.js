const Faculty = require('./faculty.model');
const User = require('../users/user.model');
const ApiError = require('../../utils/apiError');
const ApiResponse = require('../../utils/apiResponse');

// Get all faculty
const getFacultyList = async (req, res, next) => {
  try {
    const { department } = req.query;
    let filter = {};
    if (req.user.role.name !== 'Super Admin') filter.collegeId = req.user.collegeId;
    if (department) filter.department = department;

    const faculty = await Faculty.find(filter)
      .populate('user', 'email status isVerified')
      .populate('department', 'name code');

    return res.status(200).json(new ApiResponse(200, { faculty }, 'Faculty fetched successfully'));
  } catch (error) {
    next(error);
  }
};

// Get single faculty
const getFacultyById = async (req, res, next) => {
  try {
    const faculty = await Faculty.findById(req.params.id)
      .populate('user', 'email status profileImage')
      .populate('department', 'name code');

    if (!faculty) {
      throw new ApiError(404, 'Faculty not found');
    }

    return res.status(200).json(new ApiResponse(200, { faculty }, 'Faculty fetched successfully'));
  } catch (error) {
    next(error);
  }
};

// Create faculty profile
const createFaculty = async (req, res, next) => {
  try {
    const { user, employeeId, fullName, designation, department, joiningDate, collegeId } = req.body;

    const existingFaculty = await Faculty.findOne({ $or: [{ user }, { employeeId }] });
    if (existingFaculty) {
      throw new ApiError(400, 'Faculty profile already exists for this user or employee ID');
    }

    const faculty = await Faculty.create({
      user, employeeId, fullName, designation, department, joiningDate,
      collegeId: collegeId || req.user.collegeId
    });

    return res.status(201).json(new ApiResponse(201, { faculty }, 'Faculty profile created successfully'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFacultyList,
  getFacultyById,
  createFaculty
};
