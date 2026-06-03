const ApiError = require('../utils/apiError');
const { verifyAccessToken } = require('../services/token.service');
const User = require('../modules/users/user.model');

const protect = async (req, res, next) => {
  try {
    let token = '';

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      throw new ApiError(401, 'Not authorized, access token missing');
    }

    try {
      const decoded = verifyAccessToken(token);
      
      const user = await User.findById(decoded.id).populate('role');
      if (!user) {
        throw new ApiError(401, 'User associated with token no longer exists');
      }

      if (user.status !== 'Active') {
        throw new ApiError(403, `User account is ${user.status}`);
      }

      req.user = user;
      next();
    } catch (jwtError) {
      throw new ApiError(401, 'Token expired or invalid');
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { protect };
