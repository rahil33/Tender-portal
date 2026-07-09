const { Tender } = require('./model');
const {
  TenderDTO,
  TenderSummaryDTO,
  TenderDocumentDTO,
} = require('./dto');
const {
  TENDER_STATUS,
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
  SORT_FIELDS,
  SORT_ORDER,
} = require('./constants');

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
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}-${year}-${random}`;
  }

  async createTender(createdBy, tenderData) {
    try {
      const slug = tenderData.slug || this._generateSlug(tenderData.title);
      const tenderNumber = this._generateTenderNumber();

      const tender = await Tender.create({
        ...tenderData,
        tenderNumber,
        slug,
        createdBy,
        status: TENDER_STATUS.DRAFT,
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
      const tender = await Tender.findById(tenderId).lean();

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

  async updateTender(tenderId, updates) {
    try {
      const existing = await Tender.findById(tenderId);

      if (!existing) {
        throw new Error('Tender not found');
      }

      if (existing.status === TENDER_STATUS.PUBLISHED) {
        throw new Error('Cannot update a published tender. Unpublish first.');
      }

      if (existing.status === TENDER_STATUS.CLOSED || existing.status === TENDER_STATUS.CANCELLED) {
        throw new Error('Cannot update a closed or cancelled tender');
      }

      if (updates.title && !updates.slug) {
        updates.slug = this._generateSlug(updates.title);
      }

      const tender = await Tender.findByIdAndUpdate(
        tenderId,
        updates,
        { new: true, runValidators: true }
      );

      return {
        success: true,
        data: new TenderDTO(tender),
        message: 'Tender updated successfully',
      };
    } catch (error) {
      throw new Error(`Failed to update tender: ${error.message}`);
    }
  }

  async deleteTender(tenderId) {
    try {
      const tender = await Tender.findById(tenderId);

      if (!tender) {
        throw new Error('Tender not found');
      }

      if (tender.status === TENDER_STATUS.PUBLISHED) {
        throw new Error('Cannot delete a published tender. Cancel it first.');
      }

      await Tender.findByIdAndDelete(tenderId);

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
      const query = {};

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

      if (filters.search) {
        query.$or = [
          { title: { $regex: filters.search, $options: 'i' } },
          { tenderNumber: { $regex: filters.search, $options: 'i' } },
          { description: { $regex: filters.search, $options: 'i' } },
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

  async publishTender(tenderId, publishedBy) {
    try {
      const tender = await Tender.findById(tenderId);

      if (!tender) {
        throw new Error('Tender not found');
      }

      if (tender.status !== TENDER_STATUS.DRAFT) {
        throw new Error('Only draft tenders can be published');
      }

      if (!tender.submissionDeadline) {
        throw new Error('Submission deadline is required to publish');
      }

      if (!tender.category) {
        throw new Error('Category is required to publish');
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

      return {
        success: true,
        data: new TenderDTO(updated),
        message: 'Tender published successfully',
      };
    } catch (error) {
      throw new Error(`Failed to publish tender: ${error.message}`);
    }
  }

  async unpublishTender(tenderId) {
    try {
      const tender = await Tender.findById(tenderId);

      if (!tender) {
        throw new Error('Tender not found');
      }

      if (tender.status !== TENDER_STATUS.PUBLISHED) {
        throw new Error('Only published tenders can be unpublished');
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

      return {
        success: true,
        data: new TenderDTO(updated),
        message: 'Tender unpublished successfully',
      };
    } catch (error) {
      throw new Error(`Failed to unpublish tender: ${error.message}`);
    }
  }

  async closeTender(tenderId) {
    try {
      const tender = await Tender.findById(tenderId);

      if (!tender) {
        throw new Error('Tender not found');
      }

      if (tender.status !== TENDER_STATUS.PUBLISHED) {
        throw new Error('Only published tenders can be closed');
      }

      const updated = await Tender.findByIdAndUpdate(
        tenderId,
        {
          status: TENDER_STATUS.CLOSED,
          closedAt: new Date(),
        },
        { new: true, runValidators: true }
      );

      return {
        success: true,
        data: new TenderDTO(updated),
        message: 'Tender closed successfully',
      };
    } catch (error) {
      throw new Error(`Failed to close tender: ${error.message}`);
    }
  }

  async cancelTender(tenderId, cancellationReason = null) {
    try {
      const tender = await Tender.findById(tenderId);

      if (!tender) {
        throw new Error('Tender not found');
      }

      if (tender.status === TENDER_STATUS.CANCELLED) {
        throw new Error('Tender is already cancelled');
      }

      if (tender.status === TENDER_STATUS.CLOSED) {
        throw new Error('Cannot cancel a closed tender');
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

      return {
        success: true,
        data: new TenderDTO(updated),
        message: 'Tender cancelled successfully',
      };
    } catch (error) {
      throw new Error(`Failed to cancel tender: ${error.message}`);
    }
  }

  async archiveTender(tenderId) {
    try {
      const tender = await Tender.findById(tenderId);

      if (!tender) {
        throw new Error('Tender not found');
      }

      if (tender.isArchived) {
        throw new Error('Tender is already archived');
      }

      const updated = await Tender.findByIdAndUpdate(
        tenderId,
        {
          isArchived: true,
          archivedAt: new Date(),
        },
        { new: true }
      );

      return {
        success: true,
        data: new TenderDTO(updated),
        message: 'Tender archived successfully',
      };
    } catch (error) {
      throw new Error(`Failed to archive tender: ${error.message}`);
    }
  }

  async unarchiveTender(tenderId) {
    try {
      const tender = await Tender.findById(tenderId);

      if (!tender) {
        throw new Error('Tender not found');
      }

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
