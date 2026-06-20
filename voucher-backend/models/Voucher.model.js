const mongoose = require('mongoose');

const voucherSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 150 },
  description: { type: String, required: true, maxlength: 1000 },
  category: {
    type: String,
    required: true,
    enum: ['food', 'shopping', 'travel', 'entertainment', 'health'],
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true,
  },
  discountValue: { type: Number, required: true, min: 0 },
  originalPrice: { type: Number, min: 0 },
  pointsCost: { type: Number, required: true, default: 0, min: 0 },
  merchant: { type: String, required: true, trim: true },
  merchantLogo: { type: String },
  image: { type: String },
  terms: { type: String, maxlength: 2000 },

  // Availability
  totalLimit: { type: Number, default: null }, // null = unlimited
  redeemedCount: { type: Number, default: 0, min: 0 },
  perUserLimit: { type: Number, default: 1, min: 1 },

  // Date validity
  startDate: { type: Date, default: Date.now },
  expiryDate: { type: Date, required: true },

  // Status
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },

  // Tags for filtering
  tags: [{ type: String, lowercase: true, trim: true }],

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Virtual: is expired
voucherSchema.virtual('isExpired').get(function () {
  return this.expiryDate < new Date();
});

// Virtual: is available (not expired, active, has remaining slots)
voucherSchema.virtual('isAvailable').get(function () {
  const notExpired = this.expiryDate >= new Date();
  const started = this.startDate <= new Date();
  const hasSlots = this.totalLimit === null || this.redeemedCount < this.totalLimit;
  return this.isActive && notExpired && started && hasSlots;
});

// Virtual: remaining count
voucherSchema.virtual('remainingCount').get(function () {
  if (this.totalLimit === null) return null; // unlimited
  return Math.max(0, this.totalLimit - this.redeemedCount);
});

// Virtual: redemption rate (%)
voucherSchema.virtual('redemptionRate').get(function () {
  if (!this.totalLimit) return null;
  return Math.round((this.redeemedCount / this.totalLimit) * 100);
});

// Indexes
voucherSchema.index({ category: 1 });
voucherSchema.index({ isActive: 1 });
voucherSchema.index({ expiryDate: 1 });
voucherSchema.index({ pointsCost: 1 });
voucherSchema.index({ redeemedCount: -1 });
voucherSchema.index({ isFeatured: -1, createdAt: -1 });

module.exports = mongoose.model('Voucher', voucherSchema);
