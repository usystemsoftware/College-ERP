const ApiError = require('../utils/apiError');

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return next(new ApiError(401, 'Unauthorized access, user data missing'));
    }

    const userRole = req.user.role.name;

    if (!allowedRoles.includes(userRole)) {
      return next(
        new ApiError(
          403, 
          `Role '${userRole}' is not authorized to access this resource`
        )
      );
    }

    next();
  };
};

module.exports = { authorize };
