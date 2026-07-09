/**
 * DTOs - Data Transfer Objects for Documents Module
 */

class DocumentDTO {
  constructor(data) {
    this.id = data._id;
    this.fileName = data.fileName;
    this.fileUrl = data.fileUrl;
    this.originalFileName = data.originalFileName || null;
    this.fileSize = data.fileSize;
    this.mimeType = data.mimeType;
    this.fileHash = data.fileHash || null;
    this.documentType = data.documentType;
    this.title = data.title || null;
    this.description = data.description || '';
    this.tags = data.tags || [];
    this.tenderId = data.tenderId || null;
    this.bidId = data.bidId || null;
    this.organizationId = data.organizationId || null;
    this.uploadedBy = data.uploadedBy;
    this.versionHistory = (data.versionHistory || []).map((v) => new DocumentVersionDTO(v));
    this.currentVersion = data.currentVersion || 1;
    this.status = data.status;
    this.isPublic = data.isPublic || false;
    this.downloadCount = data.downloadCount || 0;
    this.metadata = data.metadata || {};
    this.isDeleted = data.isDeleted || false;
    this.deletedAt = data.deletedAt || null;
    this.deletedBy = data.deletedBy || null;
    this.auditLog = (data.auditLog || []).map((log) => new AuditLogDTO(log));
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

class DocumentSummaryDTO {
  constructor(data) {
    this.id = data._id;
    this.fileName = data.fileName;
    this.fileUrl = data.fileUrl;
    this.originalFileName = data.originalFileName || null;
    this.fileSize = data.fileSize;
    this.mimeType = data.mimeType;
    this.documentType = data.documentType;
    this.title = data.title || null;
    this.tenderId = data.tenderId || null;
    this.bidId = data.bidId || null;
    this.organizationId = data.organizationId || null;
    this.uploadedBy = data.uploadedBy;
    this.currentVersion = data.currentVersion || 1;
    this.status = data.status;
    this.isPublic = data.isPublic || false;
    this.downloadCount = data.downloadCount || 0;
    this.isDeleted = data.isDeleted || false;
    this.createdAt = data.createdAt;
  }
}

class DocumentVersionDTO {
  constructor(data) {
    this.versionNumber = data.versionNumber;
    this.fileUrl = data.fileUrl;
    this.fileName = data.fileName;
    this.fileSize = data.fileSize;
    this.mimeType = data.mimeType;
    this.uploadedBy = data.uploadedBy;
    this.uploadedAt = data.uploadedAt;
    this.changes = data.changes || '';
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

class PaginatedDocumentsDTO {
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

class DocumentsResponseDTO {
  constructor(success, message, data = null, errors = null) {
    this.success = success;
    this.message = message;
    if (data) this.data = data;
    if (errors) this.errors = errors;
    this.timestamp = new Date();
  }
}

module.exports = {
  DocumentDTO,
  DocumentSummaryDTO,
  DocumentVersionDTO,
  AuditLogDTO,
  PaginatedDocumentsDTO,
  DocumentsResponseDTO,
};