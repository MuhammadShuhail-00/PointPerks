const jwt = require('jsonwebtoken');

const generateToken = (payload, expiresIn = null) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: expiresIn || process.env.JWT_EXPIRES_IN || '7d',
  });
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

const generateAccessToken = (user) => {
  return generateToken(
    { id: user._id, role: user.role, email: user.email },
    '7d'
  );
};

module.exports = { generateToken, verifyToken, generateAccessToken };
