const { Tender } = require('./model');
const {
  TenderDTO,
  TenderSummaryDTO,
  TenderDocumentDTO,
} = require('./dto');
const {
  TENDER_STATUS,
  VALID_TRANSITIONS,
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
  SORT_FIELDS,
  SORT_ORDER,
} = require('./constants');
const AuditService = require('../../services/AuditService');
const NotificationService = require('../../services/NotificationService');

class TendersService {
  _generateSlug(title) {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  _generateTenderNumber() {
    const prefix = 'TND';
    const year = new Date().getFullYear();
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${year}-${timestamp}-${random}`;
  }

  async _checkOwnership(tenderId, userId) {
    const tender = await Tender.findById(tenderId);
    if (!tender) {
      throw new Error('Tender not found');
    }
    if (tender.isDeleted) {
      throw new Error('Tender has been deleted');
    }
    if (tender.createdBy.toString() !== userId.toString()) {
      throw new Error('You do not have permission to modify this tender');
    }
    return tender;
  }

  async _validateDates(data) {
    if (data.openingDate && data.submissionDeadline) {
      const opening = new Date(data.openingDate);
      const deadline = new Date(data.submissionDeadline);
      if (opening >= deadline) {
        throw new Error('Opening date must be before submission deadline');
      }
    }
    if (data.submissionDeadline && new Date(data.submissionDeadline) <= new Date()) {
      throw new Error('Submission deadline must be in the future');
    }
  }

  async _checkDuplicateTenderNumber(tenderNumber) {
    const existing = await Tender.findOne({ tenderNumber, isDeleted: false });
    if (existing) {
      throw new Error('A tender with this number already exists');
    }
  }

  async createTender(createdBy, tenderData) {
    try {
      const slug = tenderData.slug || this._generateSlug(tenderData.title);
      let tenderNumber = this._generateTenderNumber();
      
      await this._checkDuplicateTenderNumber(tenderNumber);
      await this._validateDates(tenderData);

      const tender = await Tender.create({
        ...tenderData,
        tenderNumber,
        slug,
        createdBy,
        status: TENDER_STATUS.DRAFT,
      });

      await AuditService.createAuditLog({
        action: 'CREATE',
        resourceType: 'Tender',
        resourceId: tender._id,
        user: { id: createdBy },
        status: 'SUCCESS',
        metadata: { tenderNumber, title: tenderData.title },
      });

      return {
        success: true,
        data: new TenderDTO(tender),
        message: 'Tender created successfully',
      };
    } catch (error) {
      if (error.code === 11000) {
        throw new Error('Tender with this slug or number already exists');
      }
      throw new Error(`Failed to create tender: ${error.message}`);
    }
  }

  async getTenderById(tenderId) {
    try {
      const tender = await Tender.findOne({ _id: tenderId, isDeleted: false }).lean();

      if (!tender) {
        throw new Error('Tender not found');
      }

      return {
        success: true,
        data: new TenderDTO(tender),
      };
    } catch (error) {
      throw new Error(`Failed to get tender: ${error.message}`);
    }
  }

  async updateTender(tenderId, userId, updates) {
    try {
      const tender = await this._checkOwnership(tenderId, userId);

      if (tender.status === TENDER_STATUS.PUBLISHED) {
        throw new Error('Cannot update a published tender. Unpublish first.');
      }

      if (tender.status === TENDER_STATUS.CLOSED || tender.status === TENDER_STATUS.CANCELLED) {
        throw new Error('Cannot update a closed or cancelled tender');
      }

      if (updates.title && !updates.slug) {
        updates.slug = this._generateSlug(updates.title);
      }

      await this._validateDates(updates);

      const updatedTender = await Tender.findByIdAndUpdate(
        tenderId,
        updates,
        { new: true, runValidators: true }
      );

      await AuditService.createAuditLog({
        action: 'UPDATE',
        resourceType: 'Tender',
        resourceId: tenderId,
        user: { id: userId },
        status: 'SUCCESS',
        changes: { after: updates },
      });

      return {
        success: true,
        data: new TenderDTO(updatedTender),
        message: 'Tender updated successfully',
      };
    } catch (error) {
      throw new Error(`Failed to update tender: ${error.message}`);
    }
  }

  async deleteTender(tenderId, userId) {
    try {
      const tender = await this._checkOwnership(tenderId, userId);

      if (tender.status === TENDER_STATUS.PUBLISHED) {
        throw new Error('Cannot delete a published tender. Cancel it first.');
      }

      tender.isDeleted = true;
      tender.deletedAt = new Date();
      tender.deletedBy = userId;
      await tender.save();

      await AuditService.createAuditLog({
        action: 'DELETE',
        resourceType: 'Tender',
        resourceId: tenderId,
        user: { id: userId },
        status: 'SUCCESS',
        metadata: { reason: 'Soft deleted' },
      });

      return {
        success: true,
        message: 'Tender deleted successfully',
      };
    } catch (error) {
      throw new Error(`Failed to delete tender: ${error.message}`);
    }
  }

  async getAllTenders(page = DEFAULT_PAGE, limit = DEFAULT_LIMIT, filters = {}) {
    try {
      const skip = (page - 1) * limit;
      const query = { isDeleted: false };

      if (filters.status) {
        query.status = filters.status;
      } else {
        query.status = { $ne: TENDER_STATUS.DRAFT };
      }

      if (filters.category) query.category = filters.category;
      if (filters.visibility) query.visibility = filters.visibility;

      if (filters.isArchived !== undefined) {
        query.isArchived = filters.isArchived === 'true' || filters.isArchived === true;
      } else {
        query.isArchived = false;
      }

      if (filters.createdBy) query.createdBy = filters.createdBy;
      if (filters.issuingOrganization) query.issuingOrganization = filters.issuingOrganization;
      if (filters.location) query.location = filters.location;
      
      if (filters.minBudget || filters.maxBudget) {
        query['budget.estimated'] = {};
        if (filters.minBudget) query['budget.estimated'].$gte = parseFloat(filters.minBudget);
        if (filters.maxBudget) query['budget.estimated'].$lte = parseFloat(filters.maxBudget);
      }

      if (filters.closingDateFrom || filters.closingDateTo) {
        query.submissionDeadline = {};
        if (filters.closingDateFrom) query.submissionDeadline.$gte = new Date(filters.closingDateFrom);
        if (filters.closingDateTo) query.submissionDeadline.$lte = new Date(filters.closingDateTo);
      }

      if (filters.search) {
        query.$or = [
          { title: { $regex: filters.search, $options: 'i' } },
          { tenderNumber: { $regex: filters.search, $options: 'i' } },
          { description: { $regex: filters.search, $options: 'i' } },
          { location: { $regex: filters.search, $options: 'i' } },
          { tags: { $in: [new RegExp(filters.search, 'i')] } },
        ];
      }

      const sortField = SORT_FIELDS[filters.sortBy] || SORT_FIELDS.createdAt;
      const sortValue = filters.sortOrder === SORT_ORDER.ASC ? 1 : -1;
      const sort = { [sortField]: sortValue };

      const tenders = await Tender.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await Tender.countDocuments(query);

      return {
        success: true,
        data: {
          data: tenders.map((t) => new TenderSummaryDTO(t)),
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      throw new Error(`Failed to get tenders: ${error.message}`);
    }
  }

  async searchTenders(searchTerm, page = DEFAULT_PAGE, limit = DEFAULT_LIMIT) {
    try {
      const skip = (page - 1) * limit;
      const query = {
        status: TENDER_STATUS.PUBLISHED,
        isArchived: false,
        $or: [
          { title: { $regex: searchTerm, $options: 'i' } },
          { tenderNumber: { $regex: searchTerm, $options: 'i' } },
          { description: { $regex: searchTerm, $options: 'i' } },
          { location: { $regex: searchTerm, $options: 'i' } },
          { tags: { $in: [new RegExp(searchTerm, 'i')] } },
        ],
      };

      const results = await Tender.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await Tender.countDocuments(query);

      return {
        success: true,
        data: {
          data: results.map((t) => new TenderSummaryDTO(t)),
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      throw new Error(`Failed to search tenders: ${error.message}`);
    }
  }

  async publishTender(tenderId, userId, publishedBy) {
    try {
      const tender = await this._checkOwnership(tenderId, userId);

      if (!tender.canTransitionTo(TENDER_STATUS.PUBLISHED)) {
        throw new Error(`Cannot publish tender from ${tender.status} status`);
      }

      if (!tender.submissionDeadline) {
        throw new Error('Submission deadline is required to publish');
      }

      if (!tender.category) {
        throw new Error('Category is required to publish');
      }

      if (!tender.description || tender.description.length < 50) {
        throw new Error('Tender description must be at least 50 characters');
      }

      const updated = await Tender.findByIdAndUpdate(
        tenderId,
        {
          status: TENDER_STATUS.PUBLISHED,
          publishedAt: new Date(),
          publishedBy,
        },
        { new: true, runValidators: true }
      );

      tender.addAuditTrail('PUBLISHED', userId, publishedBy, 'Tender published successfully');
      await tender.save();

      await AuditService.createAuditLog({
        action: 'UPDATE',
        resourceType: 'Tender',
        resourceId: tenderId,
        user: { id: userId },
        status: 'SUCCESS',
        metadata: { action: 'publish', publishedBy },
      });

      await NotificationService.notify('tender:published', {
        tenderId,
        tenderNumber: tender.tenderNumber,
        title: tender.title,
        publishedBy,
      });

      return {
        success: true,
        data: new TenderDTO(updated),
        message: 'Tender published successfully',
      };
    } catch (error) {
      throw new Error(`Failed to publish tender: ${error.message}`);
    }
  }

  async unpublishTender(tenderId, userId) {
    try {
      const tender = await this._checkOwnership(tenderId, userId);

      if (!tender.canTransitionTo(TENDER_STATUS.DRAFT)) {
        throw new Error(`Cannot unpublish tender from ${tender.status} status`);
      }

      const updated = await Tender.findByIdAndUpdate(
        tenderId,
        {
          status: TENDER_STATUS.DRAFT,
          publishedAt: null,
          publishedBy: null,
        },
        { new: true, runValidators: true }
      );

      tender.addAuditTrail('UNPUBLISHED', userId, null, 'Tender unpublished and returned to draft');
      await tender.save();

      await AuditService.createAuditLog({
        action: 'UPDATE',
        resourceType: 'Tender',
        resourceId: tenderId,
        user: { id: userId },
        status: 'SUCCESS',
        metadata: { action: 'unpublish' },
      });

      return {
        success: true,
        data: new TenderDTO(updated),
        message: 'Tender unpublished successfully',
      };
    } catch (error) {
      throw new Error(`Failed to unpublish tender: ${error.message}`);
    }
  }

  async closeTender(tenderId, userId) {
    try {
      const tender = await this._checkOwnership(tenderId, userId);

      if (!tender.canTransitionTo(TENDER_STATUS.CLOSED)) {
        throw new Error(`Cannot close tender from ${tender.status} status`);
      }

      const now = new Date();
      if (tender.submissionDeadline && now < tender.submissionDeadline) {
        throw new Error('Cannot close tender before submission deadline');
      }

      const updated = await Tender.findByIdAndUpdate(
        tenderId,
        {
          status: TENDER_STATUS.CLOSED,
          closedAt: now,
        },
        { new: true, runValidators: true }
      );

      tender.addAuditTrail('CLOSED', userId, null, 'Tender closed successfully');
      await tender.save();

      await AuditService.createAuditLog({
        action: 'UPDATE',
        resourceType: 'Tender',
        resourceId: tenderId,
        user: { id: userId },
        status: 'SUCCESS',
        metadata: { action: 'close' },
      });

      await NotificationService.notify('tender:closed', {
        tenderId,
        tenderNumber: tender.tenderNumber,
        title: tender.title,
      });

      return {
        success: true,
        data: new TenderDTO(updated),
        message: 'Tender closed successfully',
      };
    } catch (error) {
      throw new Error(`Failed to close tender: ${error.message}`);
    }
  }

  async awardTender(tenderId, userId, awardedToBidId) {
    try {
      const tender = await this._checkOwnership(tenderId, userId);

      if (!tender.canTransitionTo(TENDER_STATUS.AWARDED)) {
        throw new Error(`Cannot award tender from ${tender.status} status`);
      }

      if (!awardedToBidId) {
        throw new Error('Bid ID is required to award tender');
      }

      const updated = await Tender.findByIdAndUpdate(
        tenderId,
        {
          status: TENDER_STATUS.AWARDED,
          awardedAt: new Date(),
          awardedTo: awardedToBidId,
        },
        { new: true, runValidators: true }
      );

      tender.addAuditTrail('AWARDED', userId, null, `Tender awarded to bid ${awardedToBidId}`);
      await tender.save();

      await AuditService.createAuditLog({
        action: 'UPDATE',
        resourceType: 'Tender',
        resourceId: tenderId,
        user: { id: userId },
        status: 'SUCCESS',
        metadata: { action: 'award', awardedTo: awardedToBidId },
      });

      await NotificationService.notify('tender:awarded', {
        tenderId,
        tenderNumber: tender.tenderNumber,
        title: tender.title,
        awardedTo: awardedToBidId,
      });

      return {
        success: true,
        data: new TenderDTO(updated),
        message: 'Tender awarded successfully',
      };
    } catch (error) {
      throw new Error(`Failed to award tender: ${error.message}`);
    }
  }

  async cancelTender(tenderId, userId, cancellationReason = null) {
    try {
      const tender = await this._checkOwnership(tenderId, userId);

      if (!tender.canTransitionTo(TENDER_STATUS.CANCELLED)) {
        throw new Error(`Cannot cancel tender from ${tender.status} status`);
      }

      if (tender.status === TENDER_STATUS.CANCELLED) {
        throw new Error('Tender is already cancelled');
      }

      const updated = await Tender.findByIdAndUpdate(
        tenderId,
        {
          status: TENDER_STATUS.CANCELLED,
          cancelledAt: new Date(),
          cancellationReason,
        },
        { new: true, runValidators: true }
      );

      tender.addAuditTrail('CANCELLED', userId, null, `Tender cancelled. Reason: ${cancellationReason || 'Not provided'}`);
      await tender.save();

      await AuditService.createAuditLog({
        action: 'UPDATE',
        resourceType: 'Tender',
        resourceId: tenderId,
        user: { id: userId },
        status: 'SUCCESS',
        metadata: { action: 'cancel', reason: cancellationReason },
      });

      await NotificationService.notify('tender:cancelled', {
        tenderId,
        tenderNumber: tender.tenderNumber,
        title: tender.title,
        reason: cancellationReason,
      });

      return {
        success: true,
        data: new TenderDTO(updated),
        message: 'Tender cancelled successfully',
      };
    } catch (error) {
      throw new Error(`Failed to cancel tender: ${error.message}`);
    }
  }

  async archiveTender(tenderId, userId) {
    try {
      const tender = await this._checkOwnership(tenderId, userId);

      if (tender.isArchived) {
        throw new Error('Tender is already archived');
      }

      if (![TENDER_STATUS.CLOSED, TENDER_STATUS.CANCELLED, TENDER_STATUS.AWARDED].includes(tender.status)) {
        throw new Error('Only closed, cancelled, or awarded tenders can be archived');
      }

      const updated = await Tender.findByIdAndUpdate(
        tenderId,
        {
          isArchived: true,
          archivedAt: new Date(),
        },
        { new: true }
      );

      tender.addAuditTrail('ARCHIVED', userId, null, 'Tender archived');
      await tender.save();

      await AuditService.createAuditLog({
        action: 'UPDATE',
        resourceType: 'Tender',
        resourceId: tenderId,
        user: { id: userId },
        status: 'SUCCESS',
        metadata: { action: 'archive' },
      });

      return {
        success: true,
        data: new TenderDTO(updated),
        message: 'Tender archived successfully',
      };
    } catch (error) {
      throw new Error(`Failed to archive tender: ${error.message}`);
    }
  }

  async unarchiveTender(tenderId, userId) {
    try {
      const tender = await this._checkOwnership(tenderId, userId);

      if (!tender.isArchived) {
        throw new Error('Tender is not archived');
      }

      const updated = await Tender.findByIdAndUpdate(
        tenderId,
        {
          isArchived: false,
          archivedAt: null,
        },
        { new: true }
      );

      tender.addAuditTrail('UNARCHIVED', userId, null, 'Tender unarchived');
      await tender.save();

      await AuditService.createAuditLog({
        action: 'UPDATE',
        resourceType: 'Tender',
        resourceId: tenderId,
        user: { id: userId },
        status: 'SUCCESS',
        metadata: { action: 'unarchive' },
      });

      return {
        success: true,
        data: new TenderDTO(updated),
        message: 'Tender unarchived successfully',
      };
    } catch (error) {
      throw new Error(`Failed to unarchive tender: ${error.message}`);
    }
  }

  async addDocument(tenderId, uploadedBy, documentData) {
    try {
      const tender = await Tender.findById(tenderId);

      if (!tender) {
        throw new Error('Tender not found');
      }

      tender.documents.push({
        ...documentData,
        uploadedBy,
      });

      await tender.save();

      return {
        success: true,
        data: new TenderDTO(tender),
        message: 'Document added successfully',
      };
    } catch (error) {
      throw new Error(`Failed to add document: ${error.message}`);
    }
  }

  async removeDocument(tenderId, documentId) {
    try {
      const tender = await Tender.findById(tenderId);

      if (!tender) {
        throw new Error('Tender not found');
      }

      const docIndex = tender.documents.findIndex(
        (d) => d._id.toString() === documentId
      );

      if (docIndex === -1) {
        throw new Error('Document not found');
      }

      tender.documents.splice(docIndex, 1);
      await tender.save();

      return {
        success: true,
        message: 'Document removed successfully',
      };
    } catch (error) {
      throw new Error(`Failed to remove document: ${error.message}`);
    }
  }

  async getTenderStatistics() {
    try {
      const totalTenders = await Tender.countDocuments({});
      const publishedTenders = await Tender.countDocuments({ status: TENDER_STATUS.PUBLISHED });
      const draftTenders = await Tender.countDocuments({ status: TENDER_STATUS.DRAFT });
      const closedTenders = await Tender.countDocuments({ status: TENDER_STATUS.CLOSED });
      const cancelledTenders = await Tender.countDocuments({ status: TENDER_STATUS.CANCELLED });
      const archivedTenders = await Tender.countDocuments({ isArchived: true });

      const tendersByCategory = await Tender.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]);

      const upcomingDeadlines = await Tender.find({
        status: TENDER_STATUS.PUBLISHED,
        submissionDeadline: { $gte: new Date() },
        isArchived: false,
      })
        .sort({ submissionDeadline: 1 })
        .limit(5)
        .lean();

      return {
        success: true,
        data: {
          totalTenders,
          publishedTenders,
          draftTenders,
          closedTenders,
          cancelledTenders,
          archivedTenders,
          tendersByCategory: tendersByCategory.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {}),
          upcomingDeadlines: upcomingDeadlines.map((t) => new TenderSummaryDTO(t)),
        },
      };
    } catch (error) {
      throw new Error(`Failed to get tender statistics: ${error.message}`);
    }
  }
}

module.exports = new TendersService();
