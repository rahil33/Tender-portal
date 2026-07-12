const mongoose = require('mongoose');

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
  NotificationPreference: mongoose.model('NotificationPreference', notificationPreferenceSchema),
};