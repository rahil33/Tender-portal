const mongoose = require('mongoose');

const NOTIFICATION_TYPE_VALUES = ['in_app', 'email', 'sms', 'push'];
const NOTIFICATION_CATEGORY_VALUES = ['tender', 'bid', 'document', 'system', 'organization'];
const NOTIFICATION_STATUS_VALUES = ['pending', 'sent', 'delivered', 'read', 'failed'];
const NOTIFICATION_PRIORITY_VALUES = ['low', 'normal', 'high', 'urgent'];

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: NOTIFICATION_TYPE_VALUES,
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: NOTIFICATION_CATEGORY_VALUES,
      required: true,
      index: true,
    },
    priority: {
      type: String,
      enum: NOTIFICATION_PRIORITY_VALUES,
      default: 'normal',
      index: true,
    },
    status: {
      type: String,
      enum: NOTIFICATION_STATUS_VALUES,
      default: 'pending',
      index: true,
    },
    title: {
      type: String,
      trim: true,
      required: true,
    },
    message: {
      type: String,
      trim: true,
      required: true,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
      default: null,
    },
    sentAt: {
      type: Date,
      default: null,
    },
    deliveredAt: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date,
      default: null,
      index: -1,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ status: 1, priority: 1, createdAt: -1 });
notificationSchema.index({ category: 1, createdAt: -1 });
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

const notificationPreferenceSchema = new mongoose.Schema(
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
    pushNotifications: {
      type: Boolean,
      default: true,
    },
    smsNotifications: {
      type: Boolean,
      default: false,
    },
    tenderEvents: {
      published: { type: Boolean, default: true },
      closed: { type: Boolean, default: true },
      cancelled: { type: Boolean, default: true },
      awarded: { type: Boolean, default: true },
      archived: { type: Boolean, default: false },
      deadlineReminder: { type: Boolean, default: true },
    },
    bidEvents: {
      newBid: { type: Boolean, default: true },
      bidAccepted: { type: Boolean, default: true },
      bidRejected: { type: Boolean, default: true },
    },
    documentEvents: {
      uploaded: { type: Boolean, default: true },
      updated: { type: Boolean, default: false },
      deleted: { type: Boolean, default: false },
    },
    frequency: {
      type: String,
      enum: ['instant', 'hourly', 'daily', 'weekly'],
      default: 'instant',
    },
    quietHours: {
      enabled: { type: Boolean, default: false },
      startTime: { type: String, default: '22:00' },
      endTime: { type: String, default: '08:00' },
    },
  },
  { timestamps: true }
);

module.exports = {
  Notification: mongoose.model('Notification', notificationSchema),
  NotificationPreference: mongoose.model('NotificationPreference', notificationPreferenceSchema),
};