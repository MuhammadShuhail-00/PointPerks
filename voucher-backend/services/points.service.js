const User = require('../models/User.model');
const Referral = require('../models/Referral.model');

const SIGNUP_BONUS = parseInt(process.env.SIGNUP_BONUS_POINTS) || 100;
const REFERRAL_REWARD = parseInt(process.env.REFERRAL_REWARD_POINTS) || 50;
const REFERRAL_BONUS = parseInt(process.env.REFERRAL_BONUS_POINTS) || 100;

/**
 * Award signup bonus to a new user
 */
const awardSignupBonus = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');
  return user.addPoints(SIGNUP_BONUS, 'Welcome signup bonus', 'bonus', 'SIGNUP_BONUS');
};

/**
 * Process referral: award reward to referrer
 */
const processReferral = async (referrerId, referredUserId, referralCode) => {
  const referrer = await User.findById(referrerId);
  if (!referrer) return;

  // Check not already rewarded for this user
  const existing = await Referral.findOne({ referred: referredUserId });
  if (existing) return;

  // Create referral record
  await Referral.create({
    referrer: referrerId,
    referred: referredUserId,
    referralCode,
    rewardPoints: REFERRAL_REWARD,
    rewardCredited: true,
  });

  // Add points to referrer
  await referrer.addPoints(
    REFERRAL_REWARD,
    `Referral reward for inviting a friend`,
    'bonus',
    referralCode
  );

  // Add points to referred user
  const referredUser = await User.findById(referredUserId);
  if (referredUser) {
    await referredUser.addPoints(
      REFERRAL_BONUS,
      `Bonus for signing up with a referral code`,
      'bonus',
      referralCode
    );
  }

  // Increment referral count
  await User.findByIdAndUpdate(referrerId, { $inc: { referralCount: 1 } });
};

/**
 * Deduct points for redemption
 */
const deductPointsForRedemption = async (userId, pointsCost, voucherTitle, redemptionCode) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');
  if (user.points < pointsCost) throw new Error(`Insufficient points. You have ${user.points} pts, need ${pointsCost} pts.`);
  return user.spendPoints(pointsCost, `Redeemed: ${voucherTitle}`, redemptionCode);
};

/**
 * Refund points on cancelled redemption
 */
const refundPoints = async (userId, points, voucherTitle, redemptionCode) => {
  const user = await User.findById(userId);
  if (!user) return;
  return user.addPoints(points, `Refund: ${voucherTitle}`, 'refunded', redemptionCode);
};

module.exports = { awardSignupBonus, processReferral, deductPointsForRedemption, refundPoints };
