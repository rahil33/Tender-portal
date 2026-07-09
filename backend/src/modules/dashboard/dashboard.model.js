const mongoose = require('mongoose');

/**
 * Dashboard Activity Schema
 * Tracks user interactions with tenders and applications
 */
const dashboardActivitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    activityType: {
      type: String,
      enum: ['tender_saved', 'tender_unsaved', 'application_submitted', 'application_viewed', 'bid_placed', 'profile_updated'],
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      description: 'Reference to tender or application ID',
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

/**
 * Dashboard Statistics Schema
 * Stores aggregated metrics for quick retrieval
 */
const dashboardStatsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    savedTendersCount: {
      type: Number,
      default: 0,
    },
    applicationsCount: {
      type: Number,
      default: 0,
    },
    successfulBidsCount: {
      type: Number,
      default: 0,
    },
    failedBidsCount: {
      type: Number,
      default: 0,
    },
    profileCompletionPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    lastActivityDate: {
      type: Date,
      default: null,
    },
    notificationsUnreadCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

/**
 * Dashboard Preferences Schema
 * User preferences for dashboard layout and notifications
 */
const dashboardPreferencesSchema = new mongoose.Schema(
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
    tenderAlerts: {
      type: Boolean,
      default: true,
    },
    applicationReminders: {
      type: Boolean,
      default: true,
    },
    preferredCategories: [
      {
        type: String,
        trim: true,
      },
    ],
    dashboard_view: {
      type: String,
      enum: ['grid', 'list'],
      default: 'grid',
    },
    itemsPerPage: {
      type: Number,
      default: 10,
      min: 5,
      max: 100,
    },
  },
  { timestamps: true }
);

module.exports = {
  Activity: mongoose.model('DashboardActivity', dashboardActivitySchema),
  Stats: mongoose.model('DashboardStats', dashboardStatsSchema),
  Preferences: mongoose.model('DashboardPreferences', dashboardPreferencesSchema),
};
