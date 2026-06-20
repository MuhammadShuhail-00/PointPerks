const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth.middleware');
const { asyncHandler } = require('../middleware/error.middleware');
const { getMyReferrals, validateReferralCode, getAllReferrals } = require('../controllers/referral.controller');

// Public
router.get('/validate/:code', asyncHandler(validateReferralCode));

// User
router.get('/my', protect, asyncHandler(getMyReferrals));

// Admin
router.get('/', protect, adminOnly, asyncHandler(getAllReferrals));

module.exports = router;
