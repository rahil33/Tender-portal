const mongoose = require('mongoose');
const {
  NOTIFICATION_TYPE_VALUES,
  NOTIFICATION_CATEGORY_VALUES,
  NOTIFICATION_PRIORITY_VALUES,
  NOTIFICATION_STATUS_VALUES,
  NOTIFICATION_CHANNEL_VALUES,
  TENDER_NOTIFICATION_EVENT_VALUES,
  BID_NOTIFICATION_EVENT_VALUES,
  ORGANIZATION_NOTIFICATION_EVENT_VALUES,
  USER_NOTIFICATION_EVENT_VALUES,
  SCHEDULE_TYPE_VALUES,
} = require('./constants');

const notificationRecipientSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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
    deliveredAt: {
      type: Date,
      default: null,
    },
    failedAt: {
      type: Date,
      default: null,
    },
    failureReason: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const notificationChannelStatusSchema = new mongoose.Schema(
  {
    channel: {
      type: String,
      enum: NOTIFICATION_CHANNEL_VALUES,
      required: true,
    },
    status: {
      type: String,
      enum: NOTIFICATION_STATUS_VALUES,
      default: 'pending',
    },
    sentAt: {
      type: Date,
      default: null,
    },
    deliveredAt: {
      type: Date,
      default: null,
    },
    failedAt: {
      type: Date,
      default: null,
    },
    failureReason: {
      type: String,
      trim: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { _id: false }
);

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
      index: true,
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true,
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
    event: {
      type: String,
      index: true,
    },
    eventType: {
      type: String,
      enum: [
        ...TENDER_NOTIFICATION_EVENT_VALUES,
        ...BID_NOTIFICATION_EVENT_VALUES,
        ...ORGANIZATION_NOTIFICATION_EVENT_VALUES,
        ...USER_NOTIFICATION_EVENT_VALUES,
      ],
    },
    recipientType: {
      type: String,
      enum: ['user', 'organization', 'tender', 'bid', 'broadcast'],
      required: true,
      index: true,
    },
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true,
    },
    targetUsers: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'User',
      default: null,
    },
    targetOrganizations: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Organization',
      default: null,
    },
    recipients: [notificationRecipientSchema],
    channels: [notificationChannelStatusSchema],
    relatedEntity: {
      entityType: {
        type: String,
        enum: ['tender', 'bid', 'organization', 'user', 'document', 'other'],
      },
      entityId: {
        type: mongoose.Schema.Types.ObjectId,
      },
    },
    actionUrl: {
      type: String,
      trim: true,
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    scheduledAt: {
      type: Date,
      default: null,
      index: true,
    },
    sentAt: {
      type: Date,
      default: null,
      index: true,
    },
    deliveredAt: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date,
      default: null,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    auditLog: [
      {
        action: { type: String, required: true },
        performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        timestamp: { type: Date, default: Date.now },
        details: { type: String },
        ipAddress: { type: String, trim: true },
      },
    ],
  },
  { timestamps: true }
);

notificationSchema.index({ category: 1, status: 1, createdAt: -1 });
notificationSchema.index({ recipientType: 1, recipientId: 1, createdAt: -1 });
notificationSchema.index({ event: 1, createdAt: -1 });
notificationSchema.index({ priority: 1, status: 1 });
notificationSchema.index({ scheduledAt: 1, status: 1 });
notificationSchema.index({ title: 'text', message: 'text' });

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
    smsNotifications: {
      type: Boolean,
      default: false,
    },
    pushNotifications: {
      type: Boolean,
      default: true,
    },
    inAppNotifications: {
      type: Boolean,
      default: true,
    },
    whatsappNotifications: {
      type: Boolean,
      default: false,
    },
    categoryPreferences: {
      tender: {
        type: Boolean,
        default: true,
      },
      bid: {
        type: Boolean,
        default: true,
      },
      organization: {
        type: Boolean,
        default: true,
      },
      system: {
        type: Boolean,
        default: true,
      },
      broadcast: {
        type: Boolean,
        default: true,
      },
      reminder: {
        type: Boolean,
        default: true,
      },
      alert: {
        type: Boolean,
        default: true,
      },
    },
    eventPreferences: {
      tender: {
        type: [String],
        default: TENDER_NOTIFICATION_EVENT_VALUES,
      },
      bid: {
        type: [String],
        default: BID_NOTIFICATION_EVENT_VALUES,
      },
      organization: {
        type: [String],
        default: ORGANIZATION_NOTIFICATION_EVENT_VALUES,
      },
      user: {
        type: [String],
        default: USER_NOTIFICATION_EVENT_VALUES,
      },
    },
    quietHours: {
      enabled: {
        type: Boolean,
        default: false,
      },
      startTime: {
        type: String,
        default: '22:00',
      },
      endTime: {
        type: String,
        default: '08:00',
      },
    },
    digestFrequency: {
      type: String,
      enum: ['none', 'daily', 'weekly', 'monthly'],
      default: 'none',
    },
    immediateNotifications: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const broadcastNotificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Broadcast title is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Broadcast message is required'],
      trim: true,
    },
    channels: {
      type: [String],
      enum: NOTIFICATION_CHANNEL_VALUES,
      required: true,
    },
    priority: {
      type: String,
      enum: NOTIFICATION_PRIORITY_VALUES,
      default: 'normal',
    },
    targetAudience: {
      type: String,
      enum: ['all', 'vendors', 'evaluators', 'admins', 'specific_users', 'specific_organizations'],
      required: true,
    },
    targetUsers: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'User',
      default: null,
    },
    targetOrganizations: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Organization',
      default: null,
    },
    filters: {
      category: {
        type: [String],
        default: null,
      },
      location: {
        type: [String],
        default: null,
      },
      role: {
        type: [String],
        default: null,
      },
    },
    scheduledAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: NOTIFICATION_STATUS_VALUES,
      default: 'pending',
    },
    totalRecipients: {
      type: Number,
      default: 0,
    },
    sentCount: {
      type: Number,
      default: 0,
    },
    deliveredCount: {
      type: Number,
      default: 0,
    },
    failedCount: {
      type: Number,
      default: 0,
    },
    readCount: {
      type: Number,
      default: 0,
    },
    actionUrl: {
      type: String,
      trim: true,
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sentAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

broadcastNotificationSchema.index({ status: 1, scheduledAt: -1 });
broadcastNotificationSchema.index({ targetAudience: 1, status: 1 });
broadcastNotificationSchema.index({ createdAt: -1 });

const scheduledNotificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Scheduled notification title is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Scheduled notification message is required'],
      trim: true,
    },
    scheduleType: {
      type: String,
      enum: SCHEDULE_TYPE_VALUES,
      required: true,
    },
    scheduledAt: {
      type: Date,
      required: true,
      index: true,
    },
    recurrence: {
      interval: {
        type: Number,
        default: 1,
      },
      daysOfWeek: {
        type: [Number],
        default: [],
      },
      dayOfMonth: {
        type: Number,
        default: null,
        min: 1,
        max: 31,
      },
      hourOfDay: {
        type: Number,
        default: 9,
        min: 0,
        max: 23,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    channels: {
      type: [String],
      enum: NOTIFICATION_CHANNEL_VALUES,
      default: ['in_app'],
    },
    priority: {
      type: String,
      enum: NOTIFICATION_PRIORITY_VALUES,
      default: 'normal',
    },
    category: {
      type: String,
      enum: NOTIFICATION_CATEGORY_VALUES,
      default: 'system',
    },
    targetAudience: {
      type: String,
      enum: ['all', 'vendors', 'evaluators', 'admins', 'specific_users', 'specific_organizations'],
      default: 'all',
    },
    targetUsers: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'User',
      default: null,
    },
    targetOrganizations: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Organization',
      default: null,
    },
    filters: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    actionUrl: {
      type: String,
      trim: true,
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    lastExecutedAt: {
      type: Date,
      default: null,
    },
    nextExecutionAt: {
      type: Date,
      default: null,
      index: true,
    },
    executionCount: {
      type: Number,
      default: 0,
    },
    maxExecutions: {
      type: Number,
      default: null,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

scheduledNotificationSchema.index({ scheduleType: 1, isActive: 1, nextExecutionAt: 1 });
scheduledNotificationSchema.index({ targetAudience: 1, isActive: 1 });
scheduledNotificationSchema.index({ createdAt: -1 });

module.exports = {
  Notification: mongoose.model('Notification', notificationSchema),
  NotificationPreference: mongoose.model('NotificationPreference', notificationPreferenceSchema),
  BroadcastNotification: mongoose.model('BroadcastNotification', broadcastNotificationSchema),
  ScheduledNotification: mongoose.model('ScheduledNotification', scheduledNotificationSchema),
};