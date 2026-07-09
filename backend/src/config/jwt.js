const jwt = require('jsonwebtoken');
const env = require('./env');

const generateToken = (payload, expiresIn = env.JWT_EXPIRES_IN) => {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

const decodeToken = (token) => {
  return jwt.decode(token);
};

const refreshToken = (oldToken) => {
  const decoded = verifyToken(oldToken);
  const { id, role, ...rest } = decoded;
  
  delete decoded.iat;
  delete decoded.exp;
  
  return generateToken({ id, role, ...rest });
};

module.exports = {
  generateToken,
  verifyToken,
  decodeToken,
  refreshToken,
};