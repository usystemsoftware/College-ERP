const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/authMiddleware');
const aiController = require('./ai.controller');

// All AI routes require a logged-in user
router.use(protect);

router.post('/chat', aiController.chat);

module.exports = router;
