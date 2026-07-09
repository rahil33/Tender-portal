/**
 * Auth Module Constants
 */

const ROLES = {
  ADMIN: 'admin',
  VENDOR: 'vendor',
  EVALUATOR: 'evaluator',
};

const ROLES_VALUES = Object.values(ROLES);

const JWT_EXPIRES_IN = '7d';
const SESSION_EXPIRES_IN_DAYS = 7;

const AUTH_ERRORS = {
  INVALID_CREDENTIALS: 'Invalid email or password.',
  EMAIL_EXISTS: 'Email is already registered.',
  ACCOUNT_DEACTIVATED: 'Account is deactivated. Contact support.',
  SESSION_EXPIRED: 'Session expired or revoked. Please login again.',
  INVALID_TOKEN: 'Invalid token. Please login again.',
  NO_TOKEN: 'No token provided. Access denied.',
};

module.exports = {
  ROLES,
  ROLES_VALUES,
  JWT_EXPIRES_IN,
  SESSION_EXPIRES_IN_DAYS,
  AUTH_ERRORS,
};