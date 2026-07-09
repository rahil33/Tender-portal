/**
 * DTOs - Data Transfer Objects for Admin Module
 */

const mongoose = require('mongoose');

class AdminRoleDTO {
  constructor(data) {
    this.id = data._id;
    this.name = data.name;
    this.description = data.description || '';
    this.permissions = data.permissions || [];
    this.isSystemRole = data.isSystemRole || false;
    this.isActive = data.isActive || true;
    this.createdBy = data.createdBy || null;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

class AdminUserDTO {
  constructor(data) {
    this.id = data._id;
    this.userId = data.userId;
    this.role = data.role;
    this.permissions = data.permissions || [];
    this.isSuperAdmin = data.isSuperAdmin || false;
    this.isActive = data.isActive || true;
    this.lastLoginAt = data.lastLoginAt || null;
    this.metadata = data.metadata || {};
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

class AdminUserSummaryDTO {
  constructor(data) {
    this.id = data._id;
    this.userId = data.userId;
    this.role = data.role;
    this.isSuperAdmin = data.isSuperAdmin || false;
    this.isActive = data.isActive || true;
    this.lastLoginAt = data.lastLoginAt || null;
  }
}

class AuditLogDTO {
  constructor(data) {
    this.id = data._id;
    this.action = data.action;
    this.resourceType = data.resourceType;
    this.resourceId = data.resourceId || null;
    this.performedBy = data.performedBy;
    this.performedByEmail = data.performedByEmail || null;
    this.actionDetails = data.actionDetails || {};
    this.changes = data.changes || { before: null, after: null };
    this.ipAddress = data.ipAddress || null;
    this.userAgent = data.userAgent || null;
    this.status = data.status;
    this.errorMessage = data.errorMessage || null;
    this.createdAt = data.createdAt;
  }
}

class ModerationLogDTO {
  constructor(data) {
    this.id = data._id;
    this.resourceType = data.resourceType;
    this.resourceId = data.resourceId;
    this.status = data.status;
    this.moderatedBy = data.moderatedBy;
    this.moderationNotes = data.moderationNotes || '';
    this.rejectionReason = data.rejectionReason || null;
    this.reviewedAt = data.reviewedAt || null;
    this.metadata = data.metadata || {};
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

class ReportDTO {
  constructor(data) {
    this.id = data._id;
    this.reportType = data.reportType;
    this.status = data.status;
    this.reportedBy = data.reportedBy;
    this.reportedUser = data.reportedUser || null;
    this.reportedTender = data.reportedTender || null;
    this.reportedBid = data.reportedBid || null;
    this.description = data.description;
    this.evidence = data.evidence || [];
    this.assignedTo = data.assignedTo || null;
    this.reviewedBy = data.reviewedBy || null;
    this.reviewedAt = data.reviewedAt || null;
    this.resolutionNotes = data.resolutionNotes || null;
    this.priority = data.priority;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

class ReportSummaryDTO {
  constructor(data) {
    this.id = data._id;
    this.reportType = data.reportType;
    this.status = data.status;
    this.priority = data.priority;
    this.description = data.description;
    this.assignedTo = data.assignedTo || null;
    this.createdAt = data.createdAt;
  }
}

class SystemSettingDTO {
  constructor(data) {
    this.id = data._id;
    this.key = data.key;
    this.value = data.value;
    this.description = data.description || '';
    this.category = data.category || 'general';
    this.isPublic = data.isPublic || false;
    this.isEditable = data.isEditable || true;
    this.valueType = data.valueType || 'string';
    this.updatedBy = data.updatedBy || null;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

class SystemHealthDTO {
  constructor(data) {
    this.id = data._id;
    this.component = data.component;
    this.status = data.status;
    this.metrics = data.metrics || {};
    this.message = data.message || '';
    this.checkedAt = data.checkedAt;
    this.createdAt = data.createdAt;
  }
}

class PlatformStatisticDTO {
  constructor(data) {
    this.id = data._id;
    this.metricName = data.metricName;
    this.value = data.value;
    this.change = data.change || 0;
    this.changePercentage = data.changePercentage || 0;
    this.period = data.period;
    this.metadata = data.metadata || {};
    this.lastUpdated = data.lastUpdated;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

class AdminResponseDTO {
  constructor(success, message, data = null, errors = null) {
    this.success = success;
    this.message = message;
    if (data) this.data = data;
    if (errors) this.errors = errors;
    this.timestamp = new Date();
  }
}

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

class DashboardStatsDTO {
  constructor(data) {
    this.totalUsers = data.totalUsers || 0;
    this.totalOrganizations = data.totalOrganizations || 0;
    this.totalTenders = data.totalTenders || 0;
    this.totalBids = data.totalBids || 0;
    this.activeTenders = data.activeTenders || 0;
    this.pendingModeration = data.pendingModeration || 0;
    this.openReports = data.openReports || 0;
    this.systemHealth = data.systemHealth || 'healthy';
    this.revenue = data.revenue || 0;
    this.newUsersToday = data.newUsersToday || 0;
    this.newTendersToday = data.newTendersToday || 0;
  }
}

module.exports = {
  AdminRoleDTO,
  AdminUserDTO,
  AdminUserSummaryDTO,
  AuditLogDTO,
  ModerationLogDTO,
  ReportDTO,
  ReportSummaryDTO,
  SystemSettingDTO,
  SystemHealthDTO,
  PlatformStatisticDTO,
  AdminResponseDTO,
  PaginatedResponseDTO,
  DashboardStatsDTO,
};