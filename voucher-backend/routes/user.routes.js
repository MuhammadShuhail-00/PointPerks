const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth.middleware');
const { asyncHandler } = require('../middleware/error.middleware');
const {
  getProfile, updateProfile, getPointsHistory,
  getAllUsers, getUserById, updateUserRole, toggleUserStatus, adjustUserPoints,
} = require('../controllers/user.controller');

// User routes (own profile)
router.get('/profile', protect, asyncHandler(getProfile));
router.put('/profile', protect, asyncHandler(updateProfile));
router.get('/points-history', protect, asyncHandler(getPointsHistory));

// Admin routes
router.get('/', protect, adminOnly, asyncHandler(getAllUsers));
router.get('/:id', protect, adminOnly, asyncHandler(getUserById));
router.patch('/:id/role', protect, adminOnly, asyncHandler(updateUserRole));
router.patch('/:id/toggle', protect, adminOnly, asyncHandler(toggleUserStatus));
router.patch('/:id/points', protect, adminOnly, asyncHandler(adjustUserPoints));

module.exports = router;
