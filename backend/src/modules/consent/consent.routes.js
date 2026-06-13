const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/authMiddleware');
const { authorize } = require('../../middleware/roleMiddleware');
const { grantConsent, revokeConsent, getConsentStatus } = require('./consent.controller');

router.use(protect);

// Parent endpoints
router.post('/grant', authorize('Parent'), grantConsent);
router.post('/revoke', authorize('Parent'), revokeConsent);
router.get('/status', authorize('Parent'), getConsentStatus);

module.exports = router;
