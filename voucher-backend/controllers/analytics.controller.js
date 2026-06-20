const Voucher = require('../models/Voucher.model');
const Redemption = require('../models/Redemption.model');
const User = require('../models/User.model');
const { sendSuccess } = require('../utils/response.util');

/**
 * GET /api/analytics/dashboard
 * Admin dashboard overview stats
 */
const getDashboard = async (req, res) => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

  const [
    totalUsers, newUsersThisMonth, totalVouchers,
    activeVouchers, expiredVouchers, totalRedemptions,
    redemptionsThisMonth, redemptionsThisWeek,
    totalPointsInCirculation,
  ] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    User.countDocuments({ role: 'user', createdAt: { $gte: thirtyDaysAgo } }),
    Voucher.countDocuments(),
    Voucher.countDocuments({ isActive: true, expiryDate: { $gte: now } }),
    Voucher.countDocuments({ expiryDate: { $lt: now } }),
    Redemption.countDocuments(),
    Redemption.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
    Redemption.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
    User.aggregate([{ $group: { _id: null, total: { $sum: '$points' } } }]),
  ]);

  return sendSuccess(res, {
    stats: {
      users: { total: totalUsers, newThisMonth: newUsersThisMonth },
      vouchers: { total: totalVouchers, active: activeVouchers, expired: expiredVouchers },
      redemptions: { total: totalRedemptions, thisMonth: redemptionsThisMonth, thisWeek: redemptionsThisWeek },
      points: { totalInCirculation: totalPointsInCirculation[0]?.total || 0 },
    },
  }, 'Dashboard stats fetched');
};

/**
 * GET /api/analytics/top-vouchers
 * Top redeemed vouchers
 */
const getTopVouchers = async (req, res) => {
  const { limit = 10 } = req.query;

  const topVouchers = await Voucher.find()
    .sort({ redeemedCount: -1 })
    .limit(parseInt(limit))
    .select('title merchant category redeemedCount totalLimit isActive expiryDate discountType discountValue')
    .lean({ virtuals: true });

  return sendSuccess(res, { vouchers: topVouchers }, 'Top vouchers fetched');
};

/**
 * GET /api/analytics/low-vouchers
 * Least redeemed / expiring soon
 */
const getLowVouchers = async (req, res) => {
  const { limit = 10 } = req.query;
  const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const [leastRedeemed, expiringSoon] = await Promise.all([
    Voucher.find({ isActive: true, expiryDate: { $gte: new Date() } })
      .sort({ redeemedCount: 1 })
      .limit(parseInt(limit))
      .select('title merchant category redeemedCount totalLimit expiryDate')
      .lean({ virtuals: true }),
    Voucher.find({
      isActive: true,
      expiryDate: { $gte: new Date(), $lte: sevenDaysFromNow },
    })
      .sort({ expiryDate: 1 })
      .limit(parseInt(limit))
      .select('title merchant category redeemedCount expiryDate')
      .lean({ virtuals: true }),
  ]);

  return sendSuccess(res, { leastRedeemed, expiringSoon }, 'Low-performance vouchers fetched');
};

/**
 * GET /api/analytics/redemptions-over-time
 * Redemptions grouped by day/week/month
 */
const getRedemptionsOverTime = async (req, res) => {
  const { period = 'daily', days = 30 } = req.query;
  const startDate = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000);

  let groupFormat;
  if (period === 'monthly') groupFormat = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
  else if (period === 'weekly') groupFormat = { $week: '$createdAt' };
  else groupFormat = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };

  const data = await Redemption.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: groupFormat,
        count: { $sum: 1 },
        pointsUsed: { $sum: '$pointsUsed' },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return sendSuccess(res, { data, period }, 'Redemptions over time fetched');
};

/**
 * GET /api/analytics/category-breakdown
 * Redemptions by category
 */
const getCategoryBreakdown = async (req, res) => {
  const data = await Redemption.aggregate([
    {
      $lookup: {
        from: 'vouchers',
        localField: 'voucher',
        foreignField: '_id',
        as: 'voucher',
      },
    },
    { $unwind: '$voucher' },
    {
      $group: {
        _id: '$voucher.category',
        redemptions: { $sum: 1 },
        uniqueUsers: { $addToSet: '$user' },
      },
    },
    {
      $project: {
        category: '$_id',
        redemptions: 1,
        uniqueUsers: { $size: '$uniqueUsers' },
      },
    },
    { $sort: { redemptions: -1 } },
  ]);

  return sendSuccess(res, { data }, 'Category breakdown fetched');
};

/**
 * GET /api/analytics/user-activity
 * Top users by redemption count
 */
const getUserActivity = async (req, res) => {
  const { limit = 10 } = req.query;

  const topUsers = await Redemption.aggregate([
    { $match: { status: { $in: ['active', 'used'] } } },
    { $group: { _id: '$user', redemptionCount: { $sum: 1 } } },
    { $sort: { redemptionCount: -1 } },
    { $limit: parseInt(limit) },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user',
      },
    },
    { $unwind: '$user' },
    {
      $project: {
        name: '$user.name',
        email: '$user.email',
        avatar: '$user.avatar',
        points: '$user.points',
        referralCount: '$user.referralCount',
        redemptionCount: 1,
      },
    },
  ]);

  return sendSuccess(res, { users: topUsers }, 'User activity fetched');
};

module.exports = {
  getDashboard, getTopVouchers, getLowVouchers,
  getRedemptionsOverTime, getCategoryBreakdown, getUserActivity,
};
