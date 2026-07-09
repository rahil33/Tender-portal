const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');

/**
 * User Profile Schema
 * Enhanced user information and profile details
 */
const userProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    companyName: {
      type: String,
      trim: true,
    },
    companyRegistration: {
      type: String,
      trim: true,
    },
    designation: {
      type: String,
      trim: true,
    },
    profileCompleteness: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    profileImage: {
      type: String,
      default: null,
    },
    documentVerification: {
      type: Boolean,
      default: false,
    },
    verificationDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

/**
 * User Settings Schema
 * User preferences and settings
 */
const userSettingsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    emailNotifications: {
      type: Boolean,
      default: true,
    },
    smsNotifications: {
      type: Boolean,
      default: false,
    },
    pushNotifications: {
      type: Boolean,
      default: true,
    },
    tenderAlerts: {
      type: Boolean,
      default: true,
    },
    applicationReminders: {
      type: Boolean,
      default: true,
    },
    preferredCategories: [String],
    preferredLanguage: {
      type: String,
      default: 'en',
    },
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light',
    },
    timezone: {
      type: String,
      default: 'UTC',
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

/**
 * User Document Schema
 * Stores user uploaded documents
 */
const userDocumentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    documentType: {
      type: String,
      enum: ['aadhar', 'pan', 'gst', 'certificate', 'license', 'incorporation', 'other'],
      required: true,
    },
    documentName: {
      type: String,
      trim: true,
      required: true,
    },
    documentUrl: {
      type: String,
      required: true,
    },
    expiryDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'verified', 'rejected', 'expired'],
      default: 'pending',
    },
    verificationNotes: {
      type: String,
      trim: true,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    verificationDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

/**
 * User Activity Log Schema
 * Tracks user activities and actions
 */
const userActivitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    action: {
      type: String,
      trim: true,
      required: true,
    },
    actionType: {
      type: String,
      enum: ['login', 'logout', 'profile_update', 'document_upload', 'tender_applied', 'bid_placed', 'settings_changed', 'password_changed', 'other'],
      required: true,
    },
    ipAddress: {
      type: String,
      trim: true,
    },
    userAgent: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['success', 'failure'],
      default: 'success',
    },
  },
  { timestamps: true }
);

// Add TTL index for automatic deletion of old activities (1 year)
userActivitySchema.index({ createdAt: 1 }, { expireAfterSeconds: 31536000 });

/**
 * User Verification Schema
 * Stores verification tokens and data
 */
const userVerificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    verificationType: {
      type: String,
      enum: ['email', 'phone', 'document', 'identity'],
      required: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ['pending', 'verified', 'expired'],
      default: 'pending',
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 },
    },
    attemptCount: {
      type: Number,
      default: 0,
    },
    verificationData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

module.exports = {
  UserProfile: mongoose.model('UserProfile', userProfileSchema),
  UserSettings: mongoose.models.UserSettings || mongoose.model('UserSettings', userSettingsSchema),
  UserDocument: mongoose.model('UserDocument', userDocumentSchema),
  UserActivity: mongoose.model('UserActivity', userActivitySchema),
  UserVerification: mongoose.model('UserVerification', userVerificationSchema),
};
