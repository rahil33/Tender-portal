/**
 * DTOs - Data Transfer Objects for Organizations Module
 */

class OrganizationDTO {
  constructor(data) {
    this.id = data._id;
    this.name = data.name;
    this.slug = data.slug || null;
    this.type = data.type;
    this.registrationNumber = data.registrationNumber || '';
    this.gstNumber = data.gstNumber || '';
    this.panNumber = data.panNumber || '';
    this.gemSellerId = data.gemSellerId || '';
    this.email = data.email || '';
    this.phone = data.phone || '';
    this.website = data.website || '';
    this.address = data.address || {};
    this.description = data.description || '';
    this.logoUrl = data.logoUrl || null;
    this.verificationStatus = data.verificationStatus;
    this.verificationNotes = data.verificationNotes || null;
    this.verificationDate = data.verificationDate || null;
    this.verifiedBy = data.verifiedBy || null;
    this.ownerId = data.ownerId;
    this.profileCompleteness = data.profileCompleteness || 0;
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.isFeatured = data.isFeatured || false;
    this.featuredOrder = data.featuredOrder || 0;
    this.metadata = data.metadata || {};
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

class OrganizationSummaryDTO {
  constructor(data) {
    this.id = data._id;
    this.name = data.name;
    this.type = data.type;
    this.gstNumber = data.gstNumber || '';
    this.city = data.address?.city || '';
    this.state = data.address?.state || '';
    this.verificationStatus = data.verificationStatus;
    this.logoUrl = data.logoUrl || null;
    this.isFeatured = data.isFeatured || false;
    this.profileCompleteness = data.profileCompleteness || 0;
    this.createdAt = data.createdAt;
  }
}

class OrganizationMemberDTO {
  constructor(data) {
    this.id = data._id;
    this.organizationId = data.organizationId;
    this.userId = data.userId;
    this.role = data.role;
    this.designation = data.designation || '';
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.joinedAt = data.joinedAt;
    this.createdAt = data.createdAt;
  }
}

class OrganizationDocumentDTO {
  constructor(data) {
    this.id = data._id;
    this.organizationId = data.organizationId;
    this.uploadedBy = data.uploadedBy;
    this.documentType = data.documentType;
    this.documentName = data.documentName;
    this.documentUrl = data.documentUrl;
    this.expiryDate = data.expiryDate || null;
    this.status = data.status;
    this.verificationNotes = data.verificationNotes || null;
    this.verifiedBy = data.verifiedBy || null;
    this.verificationDate = data.verificationDate || null;
    this.createdAt = data.createdAt;
  }
}

class FeaturedOrganizationDTO {
  constructor(data) {
    this.id = data._id;
    this.name = data.name;
    this.logoUrl = data.logoUrl || null;
    this.website = data.website || '';
    this.featuredOrder = data.featuredOrder || 0;
  }
}

class PaginatedOrganizationsDTO {
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

class OrganizationsResponseDTO {
  constructor(success, message, data = null, errors = null) {
    this.success = success;
    this.message = message;
    if (data) this.data = data;
    if (errors) this.errors = errors;
    this.timestamp = new Date();
  }
}

module.exports = {
  OrganizationDTO,
  OrganizationSummaryDTO,
  OrganizationMemberDTO,
  OrganizationDocumentDTO,
  FeaturedOrganizationDTO,
  PaginatedOrganizationsDTO,
  OrganizationsResponseDTO,
};
