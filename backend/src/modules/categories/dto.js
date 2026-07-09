/**
 * DTOs - Data Transfer Objects for Categories Module
 */

class CategoryDTO {
  constructor(data) {
    this.id = data._id;
    this.name = data.name;
    this.slug = data.slug || null;
    this.description = data.description || '';
    this.parentCategory = data.parentCategory || null;
    this.level = data.level || 0;
    this.path = data.path || '';
    this.type = data.type;
    this.status = data.status;
    this.icon = data.icon || null;
    this.color = data.color || null;
    this.order = data.order || 0;
    this.isFeatured = data.isFeatured || false;
    this.metadata = data.metadata || {};
    this.createdBy = data.createdBy;
    this.updatedBy = data.updatedBy || null;
    this.isDeleted = data.isDeleted || false;
    this.deletedAt = data.deletedAt || null;
    this.deletedBy = data.deletedBy || null;
    this.auditLog = (data.auditLog || []).map((log) => new AuditLogDTO(log));
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

class CategorySummaryDTO {
  constructor(data) {
    this.id = data._id;
    this.name = data.name;
    this.slug = data.slug || null;
    this.parentCategory = data.parentCategory || null;
    this.level = data.level || 0;
    this.type = data.type;
    this.status = data.status;
    this.icon = data.icon || null;
    this.color = data.color || null;
    this.order = data.order || 0;
    this.isFeatured = data.isFeatured || false;
    this.createdAt = data.createdAt;
  }
}

class CategoryTreeDTO {
  constructor(data) {
    this.id = data._id;
    this.name = data.name;
    this.slug = data.slug || null;
    this.description = data.description || '';
    this.parentCategory = data.parentCategory || null;
    this.level = data.level || 0;
    this.type = data.type;
    this.status = data.status;
    this.icon = data.icon || null;
    this.color = data.color || null;
    this.order = data.order || 0;
    this.isFeatured = data.isFeatured || false;
    this.children = (data.children || []).map((child) => new CategoryTreeDTO(child));
    this.tendersCount = data.tendersCount || 0;
  }
}

class AuditLogDTO {
  constructor(data) {
    this.action = data.action;
    this.performedBy = data.performedBy || null;
    this.timestamp = data.timestamp;
    this.details = data.details || '';
  }
}

class PaginatedCategoriesDTO {
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

class CategoriesResponseDTO {
  constructor(success, message, data = null, errors = null) {
    this.success = success;
    this.message = message;
    if (data) this.data = data;
    if (errors) this.errors = errors;
    this.timestamp = new Date();
  }
}

module.exports = {
  CategoryDTO,
  CategorySummaryDTO,
  CategoryTreeDTO,
  AuditLogDTO,
  PaginatedCategoriesDTO,
  CategoriesResponseDTO,
};