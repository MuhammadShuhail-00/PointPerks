const crypto = require('crypto');

const generateRedemptionCode = () => {
  const part = () => crypto.randomBytes(2).toString('hex').toUpperCase();
  return `VR-${part()}-${part()}-${part()}`;
};

const generateShortCode = (prefix = 'VC') => {
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `${prefix}-${random}`;
};

module.exports = { generateRedemptionCode, generateShortCode };
