/**
 * DTOs - Data Transfer Objects
 * Define request and response structures
 */

/**
 * Dashboard Overview Response DTO
 */
class DashboardOverviewDTO {
  constructor(userId, stats, activities, profile) {
    this.userId = userId;
    this.stats = stats;
    this.recentActivities = activities;
    this.profileInfo = profile;
    this.timestamp = new Date();
  }
}

/**
 * Dashboard Statistics DTO
 */
class DashboardStatsDTO {
  constructor(data) {
    this.userId = data.userId;
    this.savedTendersCount = data.savedTendersCount || 0;
    this.applicationsCount = data.applicationsCount || 0;
    this.successfulBidsCount = data.successfulBidsCount || 0;
    this.failedBidsCount = data.failedBidsCount || 0;
    this.profileCompletionPercentage = data.profileCompletionPercentage || 0;
    this.lastActivityDate = data.lastActivityDate || null;
    this.notificationsUnreadCount = data.notificationsUnreadCount || 0;
  }
}

/**
 * Dashboard Activity DTO
 */
class ActivityDTO {
  constructor(activity) {
    this.id = activity._id;
    this.userId = activity.userId;
    this.activityType = activity.activityType;
    this.description = activity.description;
    this.relatedId = activity.relatedId;
    this.isRead = activity.isRead;
    this.createdAt = activity.createdAt;
    this.metadata = activity.metadata;
  }
}

/**
 * Dashboard Preferences DTO
 */
class PreferencesDTO {
  constructor(prefs) {
    this.userId = prefs.userId;
    this.emailNotifications = prefs.emailNotifications;
    this.tenderAlerts = prefs.tenderAlerts;
    this.applicationReminders = prefs.applicationReminders;
    this.preferredCategories = prefs.preferredCategories || [];
    this.dashboard_view = prefs.dashboard_view;
    this.itemsPerPage = prefs.itemsPerPage;
  }
}

/**
 * Activity Log Request DTO
 */
class ActivityLogRequestDTO {
  constructor(data) {
    this.userId = data.userId;
    this.activityType = data.activityType;
    this.description = data.description || '';
    this.relatedId = data.relatedId || null;
    this.metadata = data.metadata || {};
  }
}

/**
 * Paginated Response DTO
 */
class PaginatedResponseDTO {
  constructor(data, page, limit, total) {
    this.data = data;
    this.pagination = {
      page: page || 1,
      limit: limit || 10,
      total: total || 0,
      pages: Math.ceil((total || 0) / (limit || 10)),
    };
  }
}

/**
 * API Response DTO
 */
class APIResponseDTO {
  constructor(success, message, data = null, errors = null) {
    this.success = success;
    this.message = message;
    if (data) this.data = data;
    if (errors) this.errors = errors;
    this.timestamp = new Date();
  }
}

module.exports = {
  DashboardOverviewDTO,
  DashboardStatsDTO,
  ActivityDTO,
  PreferencesDTO,
  ActivityLogRequestDTO,
  PaginatedResponseDTO,
  APIResponseDTO,
};
