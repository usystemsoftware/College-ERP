const User = require('./user.model');
const Role = require('../roles/role.model');
const College = require('../colleges/college.model');
const ApiError = require('../../utils/apiError');
const ApiResponse = require('../../utils/apiResponse');

// Get all users (filterable by role, status)
const getUsers = async (req, res, next) => {
  try {
    const { role, status, collegeId } = req.query;
    
    let filter = {};
    if (status) filter.status = status;
    if (collegeId) filter.collegeId = collegeId;

    if (role) {
      const roleDoc = await Role.findOne({ name: role });
      if (roleDoc) {
        filter.role = roleDoc._id;
      }
    }

    // Super Admins can see all. Others might only see users from their own college
    // Assume req.user is set by protect middleware
    if (req.user && req.user.role && req.user.role.name !== 'Super Admin') {
       filter.collegeId = req.user.collegeId;
    }

    const users = await User.find(filter)
      .populate('role', 'name')
      .populate('collegeId', 'name code')
      .select('-password -refreshToken -otp');

    return res.status(200).json(
      new ApiResponse(200, { users }, 'Users fetched successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Get user by ID
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id)
      .populate('role', 'name')
      .populate('collegeId', 'name code')
      .select('-password -refreshToken -otp');

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // RBAC check: Only Super Admin or users from same college
    if (req.user && req.user.role && req.user.role.name !== 'Super Admin') {
      if (user.collegeId.toString() !== req.user.collegeId.toString()) {
        throw new ApiError(403, 'You do not have permission to view this user');
      }
    }

    return res.status(200).json(
      new ApiResponse(200, { user }, 'User fetched successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Update user details
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, isVerified, profileImage } = req.body;

    const user = await User.findById(id);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    if (req.user && req.user.role && req.user.role.name !== 'Super Admin') {
       if (user.collegeId.toString() !== req.user.collegeId.toString()) {
         throw new ApiError(403, 'You do not have permission to update this user');
       }
    }

    if (status) user.status = status;
    if (typeof isVerified === 'boolean') user.isVerified = isVerified;
    if (profileImage) user.profileImage = profileImage;

    await user.save();

    const updatedUser = await User.findById(id)
      .populate('role', 'name')
      .select('-password -refreshToken -otp');

    return res.status(200).json(
      new ApiResponse(200, { user: updatedUser }, 'User updated successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Delete user
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Only Super Admins or College Admins of the same college can delete
    if (req.user && req.user.role && req.user.role.name !== 'Super Admin') {
      throw new ApiError(403, 'Only Super Admins can delete users completely');
    }

    await User.findByIdAndDelete(id);

    return res.status(200).json(
      new ApiResponse(200, null, 'User deleted successfully')
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateUser,
  deleteUser
};
