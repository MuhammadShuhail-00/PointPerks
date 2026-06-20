const express = require('express');
const router = express.Router();
const { protect, adminOnly, optionalAuth } = require('../middleware/auth.middleware');
const { validate, voucherSchema } = require('../utils/validate.util');
const { asyncHandler } = require('../middleware/error.middleware');
const {
  getVouchers, getVoucher, createVoucher, updateVoucher,
  deleteVoucher, getCategorySummary, toggleVoucherStatus,
} = require('../controllers/voucher.controller');

// Public / optional auth
router.get('/', optionalAuth, asyncHandler(getVouchers));
router.get('/categories', asyncHandler(getCategorySummary));
router.get('/:id', optionalAuth, asyncHandler(getVoucher));

// Admin only
router.post('/', protect, adminOnly, validate(voucherSchema), asyncHandler(createVoucher));
router.put('/:id', protect, adminOnly, validate(voucherSchema), asyncHandler(updateVoucher));
router.delete('/:id', protect, adminOnly, asyncHandler(deleteVoucher));
router.patch('/:id/toggle', protect, adminOnly, asyncHandler(toggleVoucherStatus));

module.exports = router;
