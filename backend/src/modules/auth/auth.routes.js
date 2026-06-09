const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const { protect } = require('../../middleware/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/refresh-token', authController.refresh);

router.post('/send-otp', authController.sendOtp);
router.post('/verify-otp', authController.verifyOtp);

router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Sample route to verify authentication is working
router.get('/me', protect, (req, res) => {
  const user = req.user.toObject();
  delete user.password;
  delete user.refreshToken;

  res.json({
    success: true,
    data: {
      user: {
        ...user,
        role: req.user.role?.name || user.role
      }
    }
  });
});

module.exports = router;
