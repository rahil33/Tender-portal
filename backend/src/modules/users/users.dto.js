/**
 * DTOs - Data Transfer Objects for Users Module
 */

/**
 * User Profile DTO
 */
class UserProfileDTO {
  constructor(data) {
    this.userId = data.userId;
    this.firstName = data.firstName || '';
    this.lastName = data.lastName || '';
    this.email = data.email || '';
    this.phone = data.phone || '';
    this.address = data.address || {};
    this.companyName = data.companyName || '';
    this.companyRegistration = data.companyRegistration || '';
    this.designation = data.designation || '';
    this.profileCompleteness = data.profileCompleteness || 0;
    this.bio = data.bio || '';
    this.profileImage = data.profileImage || null;
    this.documentVerification = data.documentVerification || false;
    this.verificationDate = data.verificationDate || null;
  }
}

/**
 * User Settings DTO
 */
class UserSettingsDTO {
  constructor(data) {
    this.userId = data.userId;
    this.emailNotifications = data.emailNotifications !== undefined ? data.emailNotifications : true;
    this.smsNotifications = data.smsNotifications || false;
    this.pushNotifications = data.pushNotifications !== undefined ? data.pushNotifications : true;
    this.tenderAlerts = data.tenderAlerts !== undefined ? data.tenderAlerts : true;
    this.applicationReminders = data.applicationReminders !== undefined ? data.applicationReminders : true;
    this.preferredCategories = data.preferredCategories || [];
    this.preferredLanguage = data.preferredLanguage || 'en';
    this.theme = data.theme || 'light';
    this.timezone = data.timezone || 'UTC';
    this.twoFactorEnabled = data.twoFactorEnabled || false;
  }
}

/**
 * User Document DTO
 */
class UserDocumentDTO {
  constructor(data) {
    this.id = data._id;
    this.userId = data.userId;
    this.documentType = data.documentType;
    this.documentName = data.documentName;
    this.documentUrl = data.documentUrl;
    this.expiryDate = data.expiryDate;
    this.status = data.status;
    this.verificationNotes = data.verificationNotes;
    this.verifiedBy = data.verifiedBy;
    this.verificationDate = data.verificationDate;
    this.createdAt = data.createdAt;
  }
}

/**
 * User Activity DTO
 */
class UserActivityDTO {
  constructor(data) {
    this.id = data._id;
    this.userId = data.userId;
    this.action = data.action;
    this.actionType = data.actionType;
    this.ipAddress = data.ipAddress;
    this.userAgent = data.userAgent;
    this.status = data.status;
    this.createdAt = data.createdAt;
  }
}

/**
 * User Verification DTO
 */
class UserVerificationDTO {
  constructor(data) {
    this.id = data._id;
    this.userId = data.userId;
    this.verificationType = data.verificationType;
    this.status = data.status;
    this.expiresAt = data.expiresAt;
    this.attemptCount = data.attemptCount;
  }
}

/**
 * User Summary DTO
 */
class UserSummaryDTO {
  constructor(data) {
    this.id = data._id || data.userId;
    this.firstName = data.firstName || '';
    this.lastName = data.lastName || '';
    this.email = data.email || '';
    this.phone = data.phone || '';
    this.role = data.role || 'user';
    this.profileCompleteness = data.profileCompleteness || 0;
    this.documentVerification = data.documentVerification || false;
    this.createdAt = data.createdAt;
  }
}

/**
 * Paginated Response DTO
 */
class PaginatedUsersDTO {
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
class UsersResponseDTO {
  constructor(success, message, data = null, errors = null) {
    this.success = success;
    this.message = message;
    if (data) this.data = data;
    if (errors) this.errors = errors;
    this.timestamp = new Date();
  }
}

module.exports = {
  UserProfileDTO,
  UserSettingsDTO,
  UserDocumentDTO,
  UserActivityDTO,
  UserVerificationDTO,
  UserSummaryDTO,
  PaginatedUsersDTO,
  UsersResponseDTO,
};
