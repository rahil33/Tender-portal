const mongoose = require('mongoose');
const {
  ADMIN_ROLES_VALUES,
  AUDIT_ACTION_TYPES_VALUES,
  AUDIT_RESOURCE_TYPES_VALUES,
  MODERATION_STATUS_VALUES,
  REPORT_TYPES_VALUES,
  REPORT_STATUS_VALUES,
  SYSTEM_HEALTH_STATUS_VALUES,
  PERMISSIONS_VALUES,
} = require('./constants');

const adminRoleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Role name is required'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    permissions: [{
      type: String,
      enum: PERMISSIONS_VALUES,
    }],
    isSystemRole: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

const adminUserSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    role: {
      type: String,
      enum: ADMIN_ROLES_VALUES,
      default: 'admin',
      index: true,
    },
    permissions: [{
      type: String,
      enum: PERMISSIONS_VALUES,
    }],
    isSuperAdmin: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      enum: AUDIT_ACTION_TYPES_VALUES,
      required: true,
      index: true,
    },
    resourceType: {
      type: String,
      enum: AUDIT_RESOURCE_TYPES_VALUES,
      required: true,
      index: true,
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    performedByEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    actionDetails: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    changes: {
      before: mongoose.Schema.Types.Mixed,
      after: mongoose.Schema.Types.Mixed,
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
    errorMessage: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ performedBy: 1, createdAt: -1 });
auditLogSchema.index({ resourceType: 1, resourceId: 1 });

const moderationLogSchema = new mongoose.Schema(
  {
    resourceType: {
      type: String,
      enum: ['tender', 'bid', 'organization', 'user', 'report'],
      required: true,
      index: true,
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: MODERATION_STATUS_VALUES,
      default: 'pending',
      index: true,
    },
    moderatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    moderationNotes: {
      type: String,
      trim: true,
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

moderationLogSchema.index({ resourceType: 1, status: 1 });
moderationLogSchema.index({ moderatedBy: 1, createdAt: -1 });

const reportSchema = new mongoose.Schema(
  {
    reportType: {
      type: String,
      enum: REPORT_TYPES_VALUES,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: REPORT_STATUS_VALUES,
      default: 'open',
      index: true,
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reportedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reportedTender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tender',
    },
    reportedBid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bid',
    },
    description: {
      type: String,
      required: [true, 'Report description is required'],
      trim: true,
      maxlength: 5000,
    },
    evidence: [{
      type: String,
      trim: true,
    }],
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    resolutionNotes: {
      type: String,
      trim: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
  },
  { timestamps: true }
);

reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ reportedBy: 1, createdAt: -1 });

const systemSettingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: [true, 'Setting key is required'],
      unique: true,
      trim: true,
      index: true,
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      default: 'general',
      trim: true,
      index: true,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    isEditable: {
      type: Boolean,
      default: true,
    },
    valueType: {
      type: String,
      enum: ['string', 'number', 'boolean', 'object', 'array'],
      default: 'string',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

const systemHealthLogSchema = new mongoose.Schema(
  {
    component: {
      type: String,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: SYSTEM_HEALTH_STATUS_VALUES,
      required: true,
      index: true,
    },
    metrics: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    message: {
      type: String,
      trim: true,
    },
    checkedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

systemHealthLogSchema.index({ component: 1, checkedAt: -1 });

const platformStatisticSchema = new mongoose.Schema(
  {
    metricName: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    value: {
      type: Number,
      default: 0,
    },
    change: {
      type: Number,
      default: 0,
    },
    changePercentage: {
      type: Number,
      default: 0,
    },
    period: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly'],
      default: 'daily',
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = {
  AdminRole: mongoose.models.AdminRole || mongoose.model('AdminRole', adminRoleSchema),
  AdminUser: mongoose.models.AdminUser || mongoose.model('AdminUser', adminUserSchema),
  AuditLog: mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema),
  ModerationLog: mongoose.models.ModerationLog || mongoose.model('ModerationLog', moderationLogSchema),
  Report: mongoose.models.Report || mongoose.model('Report', reportSchema),
  SystemSetting: mongoose.models.SystemSetting || mongoose.model('SystemSetting', systemSettingSchema),
  SystemHealthLog: mongoose.models.SystemHealthLog || mongoose.model('SystemHealthLog', systemHealthLogSchema),
  PlatformStatistic: mongoose.models.PlatformStatistic || mongoose.model('PlatformStatistic', platformStatisticSchema),
};