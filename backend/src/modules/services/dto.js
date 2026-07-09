const { Service } = require('./model');

class ServicesResponseDTO {
  constructor(success, message, data = null, errors = []) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.errors = errors;
  }
}

class ServiceDTO {
  constructor(service) {
    this.id = service._id || service.id;
    this.name = service.name;
    this.slug = service.slug;
    this.description = service.description;
    this.shortDescription = service.shortDescription;
    this.category = service.category;
    this.pricing = service.pricing;
    this.features = service.features || [];
    this.deliverables = service.deliverables || [];
    this.timeline = service.timeline;
    this.isPopular = service.isPopular;
    this.order = service.order;
    this.isPublished = service.isPublished;
    this.thumbnail = service.thumbnail;
    this.images = service.images || [];
    this.faqs = service.faqs || [];
    this.createdAt = service.createdAt;
    this.updatedAt = service.updatedAt;
  }
}

class ServiceSummaryDTO {
  constructor(service) {
    this.id = service._id || service.id;
    this.name = service.name;
    this.slug = service.slug;
    this.shortDescription = service.shortDescription;
    this.category = service.category;
    this.pricing = service.pricing;
    this.isPopular = service.isPopular;
    this.thumbnail = service.thumbnail;
  }
}

module.exports = {
  ServicesResponseDTO,
  ServiceDTO,
  ServiceSummaryDTO,
};