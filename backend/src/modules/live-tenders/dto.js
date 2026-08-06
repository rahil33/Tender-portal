const { LiveTender } = require('./model');

class LiveTenderDTO {
  constructor(tender) {
    this._id = tender._id;
    this.tenderNumber = tender.tenderNumber;
    this.title = tender.title;
    this.description = tender.description;
    this.category = tender.category;
    this.status = tender.status;
    this.visibility = tender.visibility;
    this.budget = {
      estimated: tender.budget?.estimated,
      currency: tender.budget?.currency || 'INR',
      budgetType: tender.budget?.budgetType || 'fixed',
    };
    this.submissionDeadline = tender.submissionDeadline;
    this.openingDate = tender.openingDate;
    this.issuingOrganization = tender.issuingOrganization;
    this.location = tender.location;
    this.department = tender.department;
    this.tenderType = tender.tenderType;
    this.tags = tender.tags || [];
    this.metadata = tender.metadata;
    this.documents = tender.documents || [];
    this.contactInfo = tender.contactInfo || {};
    this.emdAmount = tender.emdAmount;
    this.sourcePortal = tender.sourcePortal;
    this.lastSyncedAt = tender.lastSyncedAt;
    this.isActive = tender.isActive;
    this.createdAt = tender.createdAt;
    this.updatedAt = tender.updatedAt;
  }
}

class LiveTenderSummaryDTO {
  constructor(tender) {
    this._id = tender._id;
    this.tenderNumber = tender.tenderNumber;
    this.title = tender.title;
    this.category = tender.category;
    this.status = tender.status;
    this.budget = {
      estimated: tender.budget?.estimated,
      currency: tender.budget?.currency,
    };
    this.submissionDeadline = tender.submissionDeadline;
    this.issuingOrganization = tender.issuingOrganization;
    this.location = tender.location;
    this.department = tender.department;
    this.metadata = {
      source: tender.metadata?.source,
      state: tender.metadata?.state,
      originalUrl: tender.metadata?.originalUrl,
    };
    this.createdAt = tender.createdAt;
  }
}

module.exports = {
  LiveTenderDTO,
  LiveTenderSummaryDTO,
};