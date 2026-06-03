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
  res.json({
    success: true,
    data: {
      user: {
        id: req.user._id,
        email: req.user.email,
        role: req.user.role.name,
        isVerified: req.user.isVerified,
        status: req.user.status
      }
    }
  });
});

module.exports = router;
