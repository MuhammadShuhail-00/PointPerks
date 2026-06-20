const User = require('../models/User.model');
const Redemption = require('../models/Redemption.model');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response.util');

/**
 * GET /api/users/profile
 * Get own profile
 */
const getProfile = async (req, res) => {
  const user = await User.findById(req.user._id)
    .select('-password')
    .populate('referredBy', 'name email');

  return sendSuccess(res, { user }, 'Profile fetched');
};

/**
 * PUT /api/users/profile
 * Update own profile (name, avatar only - not role/points)
 */
const updateProfile = async (req, res) => {
  const { name, avatar } = req.body;
  const allowedUpdates = {};
  if (name) allowedUpdates.name = name;
  if (avatar) allowedUpdates.avatar = avatar;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    allowedUpdates,
    { new: true, runValidators: true }
  ).select('-password');

  return sendSuccess(res, { user }, 'Profile updated');
};

/**
 * GET /api/users/points-history
 * Get own points transaction history
 */
const getPointsHistory = async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const user = await User.findById(req.user._id).select('points pointsHistory');

  const history = user.pointsHistory || [];
  const sorted = [...history].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const start = (page - 1) * limit;
  const paginated = sorted.slice(start, start + parseInt(limit));

  return sendSuccess(res, {
    currentPoints: user.points,
    history: paginated,
    pagination: {
      total: history.length,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(history.length / limit),
    },
  }, 'Points history fetched');
};

// ── Admin endpoints ───────────────────────────────────────────────────────────

/**
 * GET /api/users (admin)
 */
const getAllUsers = async (req, res) => {
  const { page = 1, limit = 20, role, search, isActive } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (isActive !== undefined) filter.isActive = isActive === 'true';
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [users, total] = await Promise.all([
    User.find(filter)
      .select('-password -pointsHistory')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    User.countDocuments(filter),
  ]);

  return sendPaginated(res, users, total, page, limit, 'Users fetched');
};

/**
 * GET /api/users/:id (admin)
 */
const getUserById = async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) return sendError(res, 'User not found', 404);

  const redemptionCount = await Redemption.countDocuments({ user: req.params.id });
  return sendSuccess(res, { user, redemptionCount }, 'User fetched');
};

/**
 * PATCH /api/users/:id/role (admin)
 */
const updateUserRole = async (req, res) => {
  const { role } = req.body;
  if (!['user', 'admin'].includes(role)) {
    return sendError(res, 'Invalid role', 400);
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true }
  ).select('-password');

  if (!user) return sendError(res, 'User not found', 404);
  return sendSuccess(res, { user }, `User role updated to ${role}`);
};

/**
 * PATCH /api/users/:id/toggle (admin)
 * Activate/deactivate user
 */
const toggleUserStatus = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return sendError(res, 'User not found', 404);

  if (user._id.toString() === req.user._id.toString()) {
    return sendError(res, 'Cannot deactivate your own account', 400);
  }

  user.isActive = !user.isActive;
  await user.save();

  return sendSuccess(res, { isActive: user.isActive }, `User ${user.isActive ? 'activated' : 'deactivated'}`);
};

/**
 * PATCH /api/users/:id/points (admin)
 * Manually adjust user points
 */
const adjustUserPoints = async (req, res) => {
  const { points, description } = req.body;
  if (!points || !description) {
    return sendError(res, 'points and description are required', 400);
  }

  const user = await User.findById(req.params.id);
  if (!user) return sendError(res, 'User not found', 404);

  const type = points > 0 ? 'bonus' : 'spent';
  const absPoints = Math.abs(points);

  if (points < 0 && user.points < absPoints) {
    return sendError(res, 'User has insufficient points for this deduction', 400);
  }

  user.points += points;
  user.pointsHistory.push({ type, points, description, reference: 'ADMIN_ADJUSTMENT' });
  await user.save();

  return sendSuccess(res, { newBalance: user.points }, `Points adjusted: ${points > 0 ? '+' : ''}${points}`);
};

module.exports = {
  getProfile, updateProfile, getPointsHistory,
  getAllUsers, getUserById, updateUserRole, toggleUserStatus, adjustUserPoints,
};
