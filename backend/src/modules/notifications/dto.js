/**
 * DTOs - Data Transfer Objects for Notifications Module
 */

class NotificationDTO {
  constructor(data) {
    this.id = data._id;
    this.title = data.title;
    this.message = data.message;
    this.type = data.type;
    this.category = data.category;
    this.priority = data.priority;
    this.status = data.status;
    this.event = data.event || null;
    this.eventType = data.eventType || null;
    this.recipientType = data.recipientType;
    this.recipientId = data.recipientId || null;
    this.targetUsers = data.targetUsers || null;
    this.targetOrganizations = data.targetOrganizations || null;
    this.recipients = (data.recipients || []).map((r) => new NotificationRecipientDTO(r));
    this.channels = (data.channels || []).map((c) => new NotificationChannelStatusDTO(c));
    this.relatedEntity = data.relatedEntity || null;
    this.actionUrl = data.actionUrl || null;
    this.metadata = data.metadata || {};
    this.scheduledAt = data.scheduledAt || null;
    this.sentAt = data.sentAt || null;
    this.deliveredAt = data.deliveredAt || null;
    this.expiresAt = data.expiresAt || null;
    this.createdBy = data.createdBy;
    this.auditLog = (data.auditLog || []).map((log) => new AuditLogDTO(log));
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

class NotificationSummaryDTO {
  constructor(data) {
    this.id = data._id;
    this.title = data.title;
    this.message = data.message;
    this.type = data.type;
    this.category = data.category;
    this.priority = data.priority;
    this.status = data.status;
    this.event = data.event || null;
    this.isRead = data.isRead || false;
    this.scheduledAt = data.scheduledAt || null;
    this.sentAt = data.sentAt || null;
    this.createdAt = data.createdAt;
  }
}

class NotificationRecipientDTO {
  constructor(data) {
    this.userId = data.userId;
    this.isRead = data.isRead || false;
    this.readAt = data.readAt || null;
    this.deliveredAt = data.deliveredAt || null;
    this.failedAt = data.failedAt || null;
    this.failureReason = data.failureReason || null;
  }
}

class NotificationChannelStatusDTO {
  constructor(data) {
    this.channel = data.channel;
    this.status = data.status;
    this.sentAt = data.sentAt || null;
    this.deliveredAt = data.deliveredAt || null;
    this.failedAt = data.failedAt || null;
    this.failureReason = data.failureReason || null;
    this.metadata = data.metadata || {};
  }
}

class AuditLogDTO {
  constructor(data) {
    this.action = data.action;
    this.performedBy = data.performedBy;
    this.timestamp = data.timestamp;
    this.details = data.details || null;
    this.ipAddress = data.ipAddress || null;
  }
}

class NotificationPreferenceDTO {
  constructor(data) {
    this.id = data._id;
    this.userId = data.userId;
    this.emailNotifications = data.emailNotifications;
    this.smsNotifications = data.smsNotifications;
    this.pushNotifications = data.pushNotifications;
    this.inAppNotifications = data.inAppNotifications;
    this.whatsappNotifications = data.whatsappNotifications;
    this.categoryPreferences = data.categoryPreferences || {};
    this.eventPreferences = data.eventPreferences || {};
    this.quietHours = data.quietHours || {};
    this.digestFrequency = data.digestFrequency;
    this.immediateNotifications = data.immediateNotifications;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

class BroadcastNotificationDTO {
  constructor(data) {
    this.id = data._id;
    this.title = data.title;
    this.message = data.message;
    this.channels = data.channels;
    this.priority = data.priority;
    this.targetAudience = data.targetAudience;
    this.targetUsers = data.targetUsers || null;
    this.targetOrganizations = data.targetOrganizations || null;
    this.filters = data.filters || {};
    this.scheduledAt = data.scheduledAt || null;
    this.status = data.status;
    this.totalRecipients = data.totalRecipients || 0;
    this.sentCount = data.sentCount || 0;
    this.deliveredCount = data.deliveredCount || 0;
    this.failedCount = data.failedCount || 0;
    this.readCount = data.readCount || 0;
    this.actionUrl = data.actionUrl || null;
    this.metadata = data.metadata || {};
    this.createdBy = data.createdBy;
    this.sentAt = data.sentAt || null;
    this.completedAt = data.completedAt || null;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

class BroadcastNotificationSummaryDTO {
  constructor(data) {
    this.id = data._id;
    this.title = data.title;
    this.message = data.message;
    this.channels = data.channels;
    this.priority = data.priority;
    this.targetAudience = data.targetAudience;
    this.status = data.status;
    this.totalRecipients = data.totalRecipients || 0;
    this.sentCount = data.sentCount || 0;
    this.deliveredCount = data.deliveredCount || 0;
    this.failedCount = data.failedCount || 0;
    this.scheduledAt = data.scheduledAt || null;
    this.sentAt = data.sentAt || null;
    this.createdAt = data.createdAt;
  }
}

class ScheduledNotificationDTO {
  constructor(data) {
    this.id = data._id;
    this.title = data.title;
    this.message = data.message;
    this.scheduleType = data.scheduleType;
    this.scheduledAt = data.scheduledAt;
    this.recurrence = data.recurrence || {};
    this.isActive = data.isActive;
    this.channels = data.channels;
    this.priority = data.priority;
    this.category = data.category;
    this.targetAudience = data.targetAudience;
    this.targetUsers = data.targetUsers || null;
    this.targetOrganizations = data.targetOrganizations || null;
    this.filters = data.filters || {};
    this.actionUrl = data.actionUrl || null;
    this.metadata = data.metadata || {};
    this.lastExecutedAt = data.lastExecutedAt || null;
    this.nextExecutionAt = data.nextExecutionAt || null;
    this.executionCount = data.executionCount || 0;
    this.maxExecutions = data.maxExecutions || null;
    this.expiresAt = data.expiresAt || null;
    this.createdBy = data.createdBy;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

class ScheduledNotificationSummaryDTO {
  constructor(data) {
    this.id = data._id;
    this.title = data.title;
    this.scheduleType = data.scheduleType;
    this.scheduledAt = data.scheduledAt;
    this.isActive = data.isActive;
    this.nextExecutionAt = data.nextExecutionAt || null;
    this.executionCount = data.executionCount || 0;
    this.createdAt = data.createdAt;
  }
}

class PaginatedNotificationsDTO {
  constructor(data, page, limit, total) {
    this.data = data;
    this.pagination = {
      page: page || 1,
      limit: limit || 20,
      total: total || 0,
      pages: Math.ceil((total || 0) / (limit || 20)),
    };
  }
}

class NotificationsResponseDTO {
  constructor(success, message, data = null, errors = null) {
    this.success = success;
    this.message = message;
    if (data) this.data = data;
    if (errors) this.errors = errors;
    this.timestamp = new Date();
  }
}

class NotificationStatsDTO {
  constructor(data) {
    this.totalNotifications = data.totalNotifications || 0;
    this.unreadCount = data.unreadCount || 0;
    this.readCount = data.readCount || 0;
    this.pendingCount = data.pendingCount || 0;
    this.sentCount = data.sentCount || 0;
    this.failedCount = data.failedCount || 0;
    this.scheduledCount = data.scheduledCount || 0;
    this.byCategory = data.byCategory || {};
    this.byPriority = data.byPriority || {};
    this.byType = data.byType || {};
  }
}

module.exports = {
  NotificationDTO,
  NotificationSummaryDTO,
  NotificationRecipientDTO,
  NotificationChannelStatusDTO,
  AuditLogDTO,
  NotificationPreferenceDTO,
  BroadcastNotificationDTO,
  BroadcastNotificationSummaryDTO,
  ScheduledNotificationDTO,
  ScheduledNotificationSummaryDTO,
  PaginatedNotificationsDTO,
  NotificationsResponseDTO,
  NotificationStatsDTO,
};