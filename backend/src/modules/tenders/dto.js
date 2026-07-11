/**
 * DTOs - Data Transfer Objects for Tenders Module
 */

class TenderDTO {
  constructor(data) {
    this._id = data._id;
    this.title = data.title;
    this.tenderNumber = data.tenderNumber || null;
    this.slug = data.slug || null;
    this.description = data.description || '';
    this.category = data.category;
    this.status = data.status;
    this.visibility = data.visibility;
    this.budget = data.budget || {};
    this.submissionDeadline = data.submissionDeadline;
    this.openingDate = data.openingDate || null;
    this.evaluationCriteria = data.evaluationCriteria || [];
    this.documents = (data.documents || []).map((d) => new TenderDocumentDTO(d));
    this.issuingOrganization = data.issuingOrganization || null;
    this.createdBy = data.createdBy;
    this.publishedAt = data.publishedAt || null;
    this.publishedBy = data.publishedBy || null;
    this.closedAt = data.closedAt || null;
    this.cancelledAt = data.cancelledAt || null;
    this.cancellationReason = data.cancellationReason || null;
    this.isArchived = data.isArchived || false;
    this.archivedAt = data.archivedAt || null;
    this.tags = data.tags || [];
    this.location = data.location || '';
    this.contactPerson = data.contactPerson || {};
    this.metadata = data.metadata || {};
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

class TenderSummaryDTO {
  constructor(data) {
    this._id = data._id;
    this.title = data.title;
    this.tenderNumber = data.tenderNumber || null;
    this.slug = data.slug || null;
    this.category = data.category;
    this.status = data.status;
    this.visibility = data.visibility;
    this.budget = data.budget || {};
    this.submissionDeadline = data.submissionDeadline;
    this.openingDate = data.openingDate || null;
    this.issuingOrganization = data.issuingOrganization || null;
    this.isArchived = data.isArchived || false;
    this.tags = data.tags || [];
    this.location = data.location || '';
    this.createdBy = data.createdBy;
    this.createdAt = data.createdAt;
  }
}

class TenderDocumentDTO {
  constructor(data) {
    this._id = data._id;
    this.documentType = data.documentType;
    this.documentName = data.documentName;
    this.documentUrl = data.documentUrl;
    this.fileSize = data.fileSize || null;
    this.mimeType = data.mimeType || null;
    this.uploadedBy = data.uploadedBy;
    this.createdAt = data.createdAt;
  }
}

class EvaluationCriteriaDTO {
  constructor(data) {
    this.criteriaType = data.criteriaType;
    this.name = data.name;
    this.description = data.description || '';
    this.weightage = data.weightage;
    this.isMandatory = data.isMandatory || false;
    this.passingScore = data.passingScore || null;
  }
}

class PaginatedTendersDTO {
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

class TendersResponseDTO {
  constructor(success, message, data = null, errors = null) {
    this.success = success;
    this.message = message;
    if (data) this.data = data;
    if (errors) this.errors = errors;
    this.timestamp = new Date();
  }
}

module.exports = {
  TenderDTO,
  TenderSummaryDTO,
  TenderDocumentDTO,
  EvaluationCriteriaDTO,
  PaginatedTendersDTO,
  TendersResponseDTO,
};
