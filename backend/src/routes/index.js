const express = require('express');
const router = express.Router();
const authRoutes = require('../modules/auth/auth.routes');

// Mount routes
router.use('/auth', authRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date()
  });
});

module.exports = router;
