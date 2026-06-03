const User = require('../users/user.model');
const Role = require('../roles/role.model');
const College = require('../colleges/college.model');
const ApiError = require('../../utils/apiError');
const ApiResponse = require('../../utils/apiResponse');
const tokenService = require('../../services/token.service');
const notificationService = require('../../services/notification.service');

const register = async (req, res, next) => {
  try {
    const { email, password, roleName, collegeCode } = req.body;

    if (!email || !password || !roleName) {
      throw new ApiError(400, 'Email, password and role are required');
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ApiError(400, 'User with this email already exists');
    }

    // Find requested role
    const role = await Role.findOne({ name: roleName });
    if (!role) {
      throw new ApiError(400, `Requested role '${roleName}' does not exist`);
    }

    if (['Super Admin', 'College Admin'].includes(role.name)) {
      throw new ApiError(403, `Cannot register as ${role.name} via public registration`);
    }

    // Find or default college
    let collegeId = null;
    if (collegeCode) {
      const college = await College.findOne({ code: collegeCode });
      if (!college) {
        throw new ApiError(400, `College with code '${collegeCode}' not found`);
      }
      collegeId = college._id;
    } else {
      // Find first available college as default
      const defaultCol = await College.findOne();
      if (defaultCol) {
        collegeId = defaultCol._id;
      }
    }

    // Create user
    const newUser = await User.create({
      email,
      password,
      role: role._id,
      collegeId,
      isVerified: false
    });

    const userResponse = await User.findById(newUser._id).populate('role').select('-password');

    return res.status(201).json(
      new ApiResponse(201, { user: userResponse }, 'User registered successfully')
    );
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ApiError(400, 'Email and password are required');
    }

    const user = await User.findOne({ email }).select('+password').populate('role');
    if (!user) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new ApiError(401, 'Invalid email or password');
    }

    if (user.status !== 'Active') {
      throw new ApiError(403, `Account status is ${user.status}`);
    }

    // Generate tokens
    const accessToken = tokenService.generateAccessToken(user);
    const refreshToken = tokenService.generateRefreshToken(user);

    // Save refresh token
    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save();

    // Set cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Strip password
    const userPayload = user.toObject();
    delete userPayload.password;
    delete userPayload.refreshToken;

    return res.status(200).json(
      new ApiResponse(200, { user: userPayload, accessToken }, 'Login successful')
    );
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    if (refreshToken) {
      const user = await User.findOne({ refreshToken });
      if (user) {
        user.refreshToken = undefined;
        await user.save();
      }
    }

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    return res.status(200).json(
      new ApiResponse(200, null, 'Logged out successfully')
    );
  } catch (error) {
    next(error);
  }
};

const refresh = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!refreshToken) {
      throw new ApiError(401, 'Refresh token is required');
    }

    const decoded = tokenService.verifyRefreshToken(refreshToken);
    const user = await User.findOne({ _id: decoded.id, refreshToken }).populate('role');

    if (!user) {
      throw new ApiError(401, 'Invalid refresh token or session expired');
    }

    const accessToken = tokenService.generateAccessToken(user);
    const newRefreshToken = tokenService.generateRefreshToken(user);

    user.refreshToken = newRefreshToken;
    await user.save();

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(200).json(
      new ApiResponse(200, { accessToken }, 'Access token refreshed successfully')
    );
  } catch (error) {
    next(new ApiError(401, 'Session expired or refresh token invalid'));
  }
};

const sendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      throw new ApiError(400, 'Email is required');
    }

    const user = await User.findOne({ email });
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = {
      code: otpCode,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    };
    await user.save();

    await notificationService.sendEmail({
      to: email,
      subject: 'OTP Verification - College ERP',
      html: `<h3>Your OTP for College ERP is: <b>${otpCode}</b></h3><p>Valid for 10 minutes.</p>`
    });

    return res.status(200).json(
      new ApiResponse(200, null, 'OTP sent successfully')
    );
  } catch (error) {
    next(error);
  }
};

const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      throw new ApiError(400, 'Email and OTP are required');
    }

    const user = await User.findOne({ email });
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    if (!user.otp || user.otp.code !== otp || user.otp.expiresAt < new Date()) {
      throw new ApiError(400, 'Invalid or expired OTP');
    }

    user.isVerified = true;
    user.otp = undefined; // clear otp
    await user.save();

    return res.status(200).json(
      new ApiResponse(200, null, 'OTP verified successfully')
    );
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      throw new ApiError(400, 'Email is required');
    }

    const user = await User.findOne({ email });
    if (!user) {
      throw new ApiError(404, 'No account found with this email');
    }

    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = {
      code: resetToken,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 mins
    };
    await user.save();

    await notificationService.sendEmail({
      to: email,
      subject: 'Reset Password Code - College ERP',
      html: `<h3>Your Reset Password Code is: <b>${resetToken}</b></h3><p>Use this code to set a new password.</p>`
    });

    return res.status(200).json(
      new ApiResponse(200, null, 'Reset code sent successfully')
    );
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      throw new ApiError(400, 'All fields are required');
    }

    const user = await User.findOne({ email });
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    if (!user.otp || user.otp.code !== otp || user.otp.expiresAt < new Date()) {
      throw new ApiError(400, 'Invalid or expired reset code');
    }

    user.password = newPassword;
    user.otp = undefined;
    await user.save();

    return res.status(200).json(
      new ApiResponse(200, null, 'Password reset successfully')
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  refresh,
  sendOtp,
  verifyOtp,
  forgotPassword,
  resetPassword
};
