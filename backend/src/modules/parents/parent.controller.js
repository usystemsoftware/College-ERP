const Parent = require('./parent.model');
const User = require('../users/user.model');
const ApiError = require('../../utils/apiError');
const ApiResponse = require('../../utils/apiResponse');

// Get all parents
const getParents = async (req, res, next) => {
  try {
    let filter = {};
    if (req.user.role.name !== 'Super Admin') filter.collegeId = req.user.collegeId;

    const parents = await Parent.find(filter)
      .populate('user', 'email status isVerified')
      .populate({
        path: 'students',
        select: 'rollNumber personalDetails.fullName course department semester',
        populate: [
          { path: 'course', select: 'name code' },
          { path: 'department', select: 'name code' },
          { path: 'semester', select: 'name' }
        ]
      })
      .populate('collegeId', 'name code');

    return res.status(200).json(new ApiResponse(200, { parents }, 'Parents fetched successfully'));
  } catch (error) {
    next(error);
  }
};

// Get current parent profile
const getMe = async (req, res, next) => {
  try {
    const parent = await Parent.findOne({ user: req.user._id })
      .populate('user', 'email status profileImage')
      .populate({
        path: 'students',
        select: 'rollNumber personalDetails.fullName course department semester',
        populate: [
          { path: 'course', select: 'name code' },
          { path: 'department', select: 'name code' }
        ]
      })
      .populate('collegeId', 'name code');

    if (!parent) {
      throw new ApiError(404, 'Parent profile not found');
    }

    return res.status(200).json(new ApiResponse(200, { parent }, 'Parent profile fetched successfully'));
  } catch (error) {
    next(error);
  }
};

// Get single parent
const getParentById = async (req, res, next) => {
  try {
    const parent = await Parent.findById(req.params.id)
      .populate('user', 'email status profileImage')
      .populate({
        path: 'students',
        select: 'rollNumber personalDetails.fullName course department semester',
        populate: [
          { path: 'course', select: 'name code' },
          { path: 'department', select: 'name code' },
          { path: 'semester', select: 'name' }
        ]
      })
      .populate('collegeId', 'name code');

    if (!parent) {
      throw new ApiError(404, 'Parent not found');
    }

    // Role check if needed

    return res.status(200).json(new ApiResponse(200, { parent }, 'Parent fetched successfully'));
  } catch (error) {
    next(error);
  }
};

// Create parent profile
const createParent = async (req, res, next) => {
  try {
    const { user, fullName, phone, alternatePhone, email, occupation, address, relation, students, collegeId } = req.body;

    const existingParent = await Parent.findOne({ user });
    if (existingParent) {
      throw new ApiError(400, 'Parent profile already exists for this user');
    }

    const parent = await Parent.create({
      user, fullName, phone, alternatePhone, email, occupation, address, relation, students,
      collegeId: collegeId || req.user.collegeId
    });

    return res.status(201).json(new ApiResponse(201, { parent }, 'Parent profile created successfully'));
  } catch (error) {
    next(error);
  }
};

const getMyProfile = async (req, res, next) => {
  try {
    const parent = await Parent.findOne({ user: req.user._id })
      .populate('user', 'email status profileImage')
      .populate({
        path: 'students',
        select: 'rollNumber personalDetails.fullName course department semester',
        populate: [
          { path: 'course', select: 'name code' },
          { path: 'department', select: 'name code' },
          { path: 'semester', select: 'name' }
        ]
      })
      .populate('collegeId', 'name code');

    if (!parent) {
      throw new ApiError(404, 'Parent profile not found');
    }

    return res.status(200).json(new ApiResponse(200, { parent }, 'Profile fetched successfully'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getParents,
  getParentById,
  createParent,
  getMyProfile
};
