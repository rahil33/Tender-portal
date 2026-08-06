/**
 * Auth Module Constants
 * SECURITY HARDENED VERSION
 */

const ROLES = {
  ADMIN: 'admin',
  VENDOR: 'vendor',
  EVALUATOR: 'evaluator',
  BUYER: 'buyer',
};

const ROLES_VALUES = Object.values(ROLES);

// SECURITY: Reduced token expiration for better security
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
const SESSION_EXPIRES_IN_DAYS = parseInt(process.env.SESSION_TIMEOUT_MS) / (1000 * 60 * 60 * 24) || 1;

// Account lockout configuration
const ACCOUNT_LOCKOUT_THRESHOLD = parseInt(process.env.ACCOUNT_LOCKOUT_THRESHOLD) || 5;
const ACCOUNT_LOCKOUT_DURATION_MS = parseInt(process.env.ACCOUNT_LOCKOUT_DURATION_MS) || 15 * 60 * 1000; // 15 minutes

// Session configuration
const MAX_CONCURRENT_SESSIONS = parseInt(process.env.MAX_CONCURRENT_SESSIONS) || 5;

const AUTH_ERRORS = {
  INVALID_CREDENTIALS: 'Invalid email or password.',
  EMAIL_EXISTS: 'Email is already registered.',
  ACCOUNT_DEACTIVATED: 'Account is deactivated. Contact support.',
  ACCOUNT_LOCKED: 'Account temporarily locked due to too many failed attempts. Please try again later.',
  SESSION_EXPIRED: 'Session expired or revoked. Please login again.',
  INVALID_TOKEN: 'Invalid token. Please login again.',
  NO_TOKEN: 'No token provided. Access denied.',
  MAX_SESSIONS_EXCEEDED: 'Maximum concurrent session limit exceeded. Please logout from another device.',
  EMAIL_NOT_VERIFIED: 'Email address not verified. Please check your inbox.',
  PASSWORD_TOO_WEAK: 'Password does not meet security requirements.',
};

module.exports = {
  ROLES,
  ROLES_VALUES,
  JWT_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN,
  SESSION_EXPIRES_IN_DAYS,
  ACCOUNT_LOCKOUT_THRESHOLD,
  ACCOUNT_LOCKOUT_DURATION_MS,
  MAX_CONCURRENT_SESSIONS,
  AUTH_ERRORS,
};