const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(100).required(),
  referralCode: Joi.string().optional().allow('', null),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const voucherSchema = Joi.object({
  title: Joi.string().min(3).max(150).required(),
  description: Joi.string().min(10).max(1000).required(),
  category: Joi.string().valid('food', 'shopping', 'travel', 'entertainment', 'health').required(),
  discountType: Joi.string().valid('percentage', 'fixed').required(),
  discountValue: Joi.number().min(0).required(),
  originalPrice: Joi.number().min(0).optional().allow(null),
  pointsCost: Joi.number().min(0).default(0),
  merchant: Joi.string().min(2).max(100).required(),
  merchantLogo: Joi.string().uri().optional().allow('', null),
  image: Joi.string().uri().optional().allow('', null),
  terms: Joi.string().max(2000).optional().allow('', null),
  totalLimit: Joi.number().min(1).optional().allow(null),
  perUserLimit: Joi.number().min(1).default(1),
  startDate: Joi.date().optional(),
  expiryDate: Joi.date().required(),
  isActive: Joi.boolean().default(true),
  isFeatured: Joi.boolean().default(false),
  tags: Joi.array().items(Joi.string()).optional(),
});

const createVoucherSchema = voucherSchema.keys({
  expiryDate: Joi.date().greater('now').required(),
});

const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    const errors = error.details.map(d => d.message);
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }
  req.body = value;
  next();
};

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  voucherSchema,
  createVoucherSchema,
};
