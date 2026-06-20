const User = require('../models/User.model');
const Referral = require('../models/Referral.model');
const { sendSuccess, sendError } = require('../utils/response.util');

/**
 * GET /api/referrals/my
 * Get current user's referral info and list of referrals
 */
const getMyReferrals = async (req, res) => {
  const user = await User.findById(req.user._id).select('referralCode referralCount points');

  const referrals = await Referral.find({ referrer: req.user._id })
    .populate('referred', 'name email avatar createdAt')
    .sort({ createdAt: -1 });

  const rewardPoints = parseInt(process.env.REFERRAL_REWARD_POINTS) || 50;

  return sendSuccess(res, {
    referralCode: user.referralCode,
    referralCount: user.referralCount,
    totalEarned: referrals.filter(r => r.rewardCredited).length * rewardPoints,
    rewardPerReferral: rewardPoints,
    referrals,
  }, 'Referral info fetched');
};

/**
 * GET /api/referrals/validate/:code
 * Validate a referral code before registration (public)
 */
const validateReferralCode = async (req, res) => {
  const { code } = req.params;

  const user = await User.findOne({
    referralCode: code.toUpperCase(),
    isActive: true,
  }).select('name referralCode');

  if (!user) {
    return sendError(res, 'Invalid or expired referral code', 404);
  }

  return sendSuccess(res, {
    valid: true,
    referrerName: user.name,
    referralCode: user.referralCode,
    bonusPoints: parseInt(process.env.REFERRAL_REWARD_POINTS) || 50,
  }, 'Referral code is valid');
};

/**
 * GET /api/referrals (admin)
 * All referrals in the system
 */
const getAllReferrals = async (req, res) => {
  const referrals = await Referral.find()
    .populate('referrer', 'name email')
    .populate('referred', 'name email createdAt')
    .sort({ createdAt: -1 });

  const totalRewards = referrals.filter(r => r.rewardCredited).length *
    (parseInt(process.env.REFERRAL_REWARD_POINTS) || 50);

  return sendSuccess(res, {
    referrals,
    totalReferrals: referrals.length,
    totalRewardPointsIssued: totalRewards,
  }, 'All referrals fetched');
};

module.exports = { getMyReferrals, validateReferralCode, getAllReferrals };
