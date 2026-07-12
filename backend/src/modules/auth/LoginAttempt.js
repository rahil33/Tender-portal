const mongoose = require('mongoose');

/**
 * Login Attempt Tracking Model
 * Used for account lockout and brute-force protection
 */
const loginAttemptSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    ipAddress: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
    },
    success: {
      type: Boolean,
      required: true,
      default: false,
    },
    failureReason: {
      type: String,
      enum: ['INVALID_PASSWORD', 'ACCOUNT_LOCKED', 'ACCOUNT_INACTIVE', 'EMAIL_NOT_VERIFIED', 'OTHER'],
    },
    lockedUntil: {
      type: Date,
      index: { expireAfterSeconds: 0 }, // Auto-expire for cleanup
    },
  },
  { timestamps: true }
);

// Index for efficient queries
loginAttemptSchema.index({ email: 1, createdAt: -1 });
loginAttemptSchema.index({ lockedUntil: 1 }, { expireAfterSeconds: 0 });

/**
 * Static method to check if account is locked
 */
loginAttemptSchema.statics.isAccountLocked = async function(email) {
  const lockedAttempt = await this.findOne({
    email: email.toLowerCase(),
    lockedUntil: { $gt: new Date() },
  }).sort({ createdAt: -1 });

  return !!lockedAttempt;
};

/**
 * Static method to record failed login attempt
 * Returns lock status
 */
loginAttemptSchema.statics.recordFailedAttempt = async function(email, ipAddress, userAgent, reason = 'INVALID_PASSWORD') {
  const { ACCOUNT_LOCKOUT_THRESHOLD, ACCOUNT_LOCKOUT_DURATION_MS } = require('./constants');

  // Count recent failed attempts
  const recentFailures = await this.countDocuments({
    email: email.toLowerCase(),
    success: false,
    createdAt: { $gte: new Date(Date.now() - ACCOUNT_LOCKOUT_DURATION_MS) },
  });

  const newAttempt = await this.create({
    email: email.toLowerCase(),
    ipAddress,
    userAgent,
    success: false,
    failureReason: reason,
  });

  // Check if threshold exceeded
  if (recentFailures + 1 >= ACCOUNT_LOCKOUT_THRESHOLD) {
    // Lock the account
    const lockedUntil = new Date(Date.now() + ACCOUNT_LOCKOUT_DURATION_MS);
    await this.updateOne(
      { _id: newAttempt._id },
      { lockedUntil }
    );
    return { locked: true, lockedUntil };
  }

  return { 
    locked: false, 
    attemptsRemaining: ACCOUNT_LOCKOUT_THRESHOLD - (recentFailures + 1) 
  };
};

/**
 * Static method to record successful login
 * Clears lockout status
 */
loginAttemptSchema.statics.recordSuccessfulLogin = async function(email, ipAddress, userAgent) {
  const { ACCOUNT_LOCKOUT_DURATION_MS } = require('./constants');

  // Clear any existing lockouts
  await this.updateMany(
    { 
      email: email.toLowerCase(),
      lockedUntil: { $gt: new Date() },
    },
    { lockedUntil: null }
  );

  // Record successful login
  await this.create({
    email: email.toLowerCase(),
    ipAddress,
    userAgent,
    success: true,
  });
};

/**
 * Static method to get login history
 */
loginAttemptSchema.statics.getLoginHistory = async function(email, limit = 20) {
  return await this.find({
    email: email.toLowerCase(),
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('-__v');
};

/**
 * Static method to clear old attempts (cleanup)
 */
loginAttemptSchema.statics.clearOldAttempts = async function() {
  const { ACCOUNT_LOCKOUT_DURATION_MS } = require('./constants');
  const cutoffDate = new Date(Date.now() - ACCOUNT_LOCKOUT_DURATION_MS);

  const result = await this.deleteMany({
    createdAt: { $lt: cutoffDate },
    lockedUntil: { $lte: new Date() },
  });

  return result.deletedCount;
};

const LoginAttempt = mongoose.model('LoginAttempt', loginAttemptSchema);

module.exports = {
  LoginAttempt,
};