const jwtUtils = require('../config/jwt');

const generateAuthToken = (payload) => {
  return jwtUtils.generateToken(payload);
};

const verifyAuthToken = (token) => {
  return jwtUtils.verifyToken(token);
};

const decodeAuthToken = (token) => {
  return jwtUtils.decodeToken(token);
};

const refreshAuthToken = (oldToken) => {
  return jwtUtils.refreshToken(oldToken);
};

const getTokenExpiry = (token) => {
  const decoded = decodeAuthToken(token);
  if (decoded && decoded.exp) {
    return new Date(decoded.exp * 1000);
  }
  return null;
};

const isTokenExpired = (token) => {
  try {
    verifyAuthToken(token);
    return false;
  } catch (error) {
    return true;
  }
};

const getTokenPayload = (token) => {
  return decodeAuthToken(token);
};

module.exports = {
  generateAuthToken,
  verifyAuthToken,
  decodeAuthToken,
  refreshAuthToken,
  getTokenExpiry,
  isTokenExpired,
  getTokenPayload,
};