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

const { buildUserPayload } = require('../../utils/userPayload.util');

router.get('/me', protect, async (req, res, next) => {
  try {
    const user = await buildUserPayload(req.user);
    res.json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
