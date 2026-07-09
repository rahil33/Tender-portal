/**
 * DTOs - Data Transfer Objects for Bids Module
 */

class BidDTO {
  constructor(data) {
    this.id = data._id;
    this.bidNumber = data.bidNumber || null;
    this.tenderId = data.tenderId;
    this.vendorId = data.vendorId;
    this.organizationId = data.organizationId;
    this.status = data.status;
    this.bidType = data.bidType;
    this.bidAmount = data.bidAmount;
    this.currency = data.currency;
    this.technicalProposal = data.technicalProposal || '';
    this.financialProposal = data.financialProposal || '';
    this.documents = (data.documents || []).map((d) => new BidDocumentDTO(d));
    this.versionHistory = (data.versionHistory || []).map((v) => new BidVersionDTO(v));
    this.currentVersion = data.currentVersion || 1;
    this.evaluation = data.evaluation || null;
    this.evaluationStatus = data.evaluationStatus;
    this.submittedAt = data.submittedAt || null;
    this.withdrawnAt = data.withdrawnAt || null;
    this.withdrawalReason = data.withdrawalReason || null;
    this.isWithdrawn = data.isWithdrawn || false;
    this.isDeleted = data.isDeleted || false;
    this.deletedAt = data.deletedAt || null;
    this.deletedBy = data.deletedBy || null;
    this.auditLog = (data.auditLog || []).map((log) => new AuditLogDTO(log));
    this.metadata = data.metadata || {};
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

class BidSummaryDTO {
  constructor(data) {
    this.id = data._id;
    this.bidNumber = data.bidNumber || null;
    this.tenderId = data.tenderId;
    this.vendorId = data.vendorId;
    this.organizationId = data.organizationId;
    this.status = data.status;
    this.bidType = data.bidType;
    this.bidAmount = data.bidAmount;
    this.currency = data.currency;
    this.evaluationStatus = data.evaluationStatus;
    this.submittedAt = data.submittedAt || null;
    this.isWithdrawn = data.isWithdrawn || false;
    this.currentVersion = data.currentVersion || 1;
    this.createdAt = data.createdAt;
  }
}

class BidDocumentDTO {
  constructor(data) {
    this.id = data._id;
    this.documentType = data.documentType;
    this.documentName = data.documentName;
    this.documentUrl = data.documentUrl;
    this.fileSize = data.fileSize || null;
    this.mimeType = data.mimeType || null;
    this.uploadedBy = data.uploadedBy;
    this.createdAt = data.createdAt;
  }
}

class BidVersionDTO {
  constructor(data) {
    this.versionNumber = data.versionNumber;
    this.bidAmount = data.bidAmount;
    this.technicalProposal = data.technicalProposal || '';
    this.financialProposal = data.financialProposal || '';
    this.documents = (data.documents || []).map((d) => new BidDocumentDTO(d));
    this.submittedBy = data.submittedBy;
    this.submittedAt = data.submittedAt;
    this.changes = data.changes || '';
  }
}

class EvaluationDTO {
  constructor(data) {
    this.evaluatorId = data.evaluatorId;
    this.technicalScore = data.technicalScore || null;
    this.financialScore = data.financialScore || null;
    this.totalScore = data.totalScore || null;
    this.technicalRemarks = data.technicalRemarks || '';
    this.financialRemarks = data.financialRemarks || '';
    this.overallRemarks = data.overallRemarks || '';
    this.isRecommended = data.isRecommended || false;
    this.evaluatedAt = data.evaluatedAt || null;
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

class PaginatedBidsDTO {
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

class BidsResponseDTO {
  constructor(success, message, data = null, errors = null) {
    this.success = success;
    this.message = message;
    if (data) this.data = data;
    if (errors) this.errors = errors;
    this.timestamp = new Date();
  }
}

module.exports = {
  BidDTO,
  BidSummaryDTO,
  BidDocumentDTO,
  BidVersionDTO,
  EvaluationDTO,
  AuditLogDTO,
  PaginatedBidsDTO,
  BidsResponseDTO,
};