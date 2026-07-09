const { Bid } = require('./model');
const { Tender } = require('../tenders/model');
const {
  BidDTO,
  BidSummaryDTO,
} = require('./dto');
const {
  BID_STATUS,
  EVALUATION_STATUS,
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
  SORT_FIELDS,
  SORT_ORDER,
} = require('./constants');

class BidsService {
  _generateBidNumber() {
    const prefix = 'BID';
    const year = new Date().getFullYear();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}-${year}-${random}`;
  }

  _addAuditLog(bid, action, performedBy, details = null) {
    bid.auditLog.push({
      action,
      performedBy,
      timestamp: new Date(),
      details,
    });
  }

  async createBid(vendorId, organizationId, bidData) {
    try {
      const tender = await Tender.findById(bidData.tenderId);

      if (!tender) {
        throw new Error('Tender not found');
      }

      if (tender.status !== 'published') {
        throw new Error('Can only submit bids for published tenders');
      }

      if (new Date(tender.submissionDeadline) < new Date()) {
        throw new Error('Submission deadline has passed');
      }

      const existingBid = await Bid.findOne({
        tenderId: bidData.tenderId,
        vendorId,
        isDeleted: false,
      });

      if (existingBid) {
        throw new Error('You have already submitted a bid for this tender');
      }

      const bidNumber = this._generateBidNumber();

      const bid = await Bid.create({
        ...bidData,
        bidNumber,
        vendorId,
        organizationId,
        status: BID_STATUS.DRAFT,
      });

      this._addAuditLog(bid, 'BID_CREATED', vendorId, 'Bid created in draft status');

      return {
        success: true,
        data: new BidDTO(bid),
        message: 'Bid created successfully',
      };
    } catch (error) {
      if (error.code === 11000) {
        throw new Error('Bid with this number already exists');
      }
      throw new Error(`Failed to create bid: ${error.message}`);
    }
  }

  async getBidById(bidId) {
    try {
      const bid = await Bid.findById(bidId)
        .populate('tenderId')
        .populate('vendorId')
        .populate('organizationId')
        .lean();

      if (!bid || bid.isDeleted) {
        throw new Error('Bid not found');
      }

      return {
        success: true,
        data: new BidDTO(bid),
      };
    } catch (error) {
      throw new Error(`Failed to get bid: ${error.message}`);
    }
  }

  async updateBid(bidId, userId, updates, changes = null) {
    try {
      const bid = await Bid.findById(bidId);

      if (!bid || bid.isDeleted) {
        throw new Error('Bid not found');
      }

      if (bid.status !== BID_STATUS.DRAFT && bid.status !== BID_STATUS.SUBMITTED) {
        throw new Error('Cannot update bid in current status');
      }

      if (bid.status === BID_STATUS.SUBMITTED) {
        const tender = await Tender.findById(bid.tenderId);
        if (new Date(tender.submissionDeadline) < new Date()) {
          throw new Error('Cannot update submitted bid after deadline');
        }
      }

      if (updates.bidAmount || updates.technicalProposal || updates.financialProposal) {
        bid.versionHistory.push({
          versionNumber: bid.currentVersion,
          bidAmount: bid.bidAmount,
          technicalProposal: bid.technicalProposal,
          financialProposal: bid.financialProposal,
          documents: bid.documents,
          submittedBy: userId,
          submittedAt: new Date(),
          changes: changes || 'Updated bid details',
        });
        bid.currentVersion += 1;
      }

      Object.assign(bid, updates);
      this._addAuditLog(bid, 'BID_UPDATED', userId, changes || 'Bid details updated');

      await bid.save();

      return {
        success: true,
        data: new BidDTO(bid),
        message: 'Bid updated successfully',
      };
    } catch (error) {
      throw new Error(`Failed to update bid: ${error.message}`);
    }
  }

  async deleteBid(bidId, deletedBy) {
    try {
      const bid = await Bid.findById(bidId);

      if (!bid) {
        throw new Error('Bid not found');
      }

      if (bid.status === BID_STATUS.SUBMITTED || bid.status === BID_STATUS.UNDER_REVIEW) {
        throw new Error('Cannot delete submitted or under review bid. Withdraw instead.');
      }

      bid.isDeleted = true;
      bid.deletedAt = new Date();
      bid.deletedBy = deletedBy;
      this._addAuditLog(bid, 'BID_DELETED', deletedBy, 'Bid soft deleted');

      await bid.save();

      return {
        success: true,
        message: 'Bid deleted successfully',
      };
    } catch (error) {
      throw new Error(`Failed to delete bid: ${error.message}`);
    }
  }

  async submitBid(bidId, userId) {
    try {
      const bid = await Bid.findById(bidId);

      if (!bid || bid.isDeleted) {
        throw new Error('Bid not found');
      }

      if (bid.status !== BID_STATUS.DRAFT) {
        throw new Error('Only draft bids can be submitted');
      }

      const tender = await Tender.findById(bid.tenderId);
      if (!tender) {
        throw new Error('Tender not found');
      }

      if (new Date(tender.submissionDeadline) < new Date()) {
        throw new Error('Cannot submit bid after deadline');
      }

      if (!bid.bidAmount) {
        throw new Error('Bid amount is required');
      }

      bid.status = BID_STATUS.SUBMITTED;
      bid.submittedAt = new Date();
      this._addAuditLog(bid, 'BID_SUBMITTED', userId, 'Bid submitted for evaluation');

      await bid.save();

      return {
        success: true,
        data: new BidDTO(bid),
        message: 'Bid submitted successfully',
      };
    } catch (error) {
      throw new Error(`Failed to submit bid: ${error.message}`);
    }
  }

  async withdrawBid(bidId, userId, withdrawalReason = null) {
    try {
      const bid = await Bid.findById(bidId);

      if (!bid || bid.isDeleted) {
        throw new Error('Bid not found');
      }

      if (bid.status === BID_STATUS.WITHDRAWN) {
        throw new Error('Bid is already withdrawn');
      }

      if (bid.status === BID_STATUS.ACCEPTED || bid.status === BID_STATUS.REJECTED) {
        throw new Error('Cannot withdraw evaluated bid');
      }

      bid.status = BID_STATUS.WITHDRAWN;
      bid.isWithdrawn = true;
      bid.withdrawnAt = new Date();
      bid.withdrawalReason = withdrawalReason;
      this._addAuditLog(bid, 'BID_WITHDRAWN', userId, withdrawalReason || 'Bid withdrawn');

      await bid.save();

      return {
        success: true,
        data: new BidDTO(bid),
        message: 'Bid withdrawn successfully',
      };
    } catch (error) {
      throw new Error(`Failed to withdraw bid: ${error.message}`);
    }
  }

  async getAllBids(page = DEFAULT_PAGE, limit = DEFAULT_LIMIT, filters = {}) {
    try {
      const skip = (page - 1) * limit;
      const query = { isDeleted: false };

      if (filters.status) query.status = filters.status;
      if (filters.bidType) query.bidType = filters.bidType;
      if (filters.evaluationStatus) query.evaluationStatus = filters.evaluationStatus;
      if (filters.tenderId) query.tenderId = filters.tenderId;
      if (filters.vendorId) query.vendorId = filters.vendorId;
      if (filters.organizationId) query.organizationId = filters.organizationId;

      const sortField = SORT_FIELDS[filters.sortBy] || SORT_FIELDS.createdAt;
      const sortValue = filters.sortOrder === SORT_ORDER.ASC ? 1 : -1;
      const sort = { [sortField]: sortValue };

      const bids = await Bid.find(query)
        .populate('tenderId', 'title tenderNumber')
        .populate('vendorId', 'fullName email')
        .populate('organizationId', 'name')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await Bid.countDocuments(query);

      return {
        success: true,
        data: {
          data: bids.map((b) => new BidSummaryDTO(b)),
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      throw new Error(`Failed to get bids: ${error.message}`);
    }
  }

  async searchBids(searchTerm, page = DEFAULT_PAGE, limit = DEFAULT_LIMIT) {
    try {
      const skip = (page - 1) * limit;
      const query = {
        isDeleted: false,
        $or: [
          { bidNumber: { $regex: searchTerm, $options: 'i' } },
          { technicalProposal: { $regex: searchTerm, $options: 'i' } },
        ],
      };

      const results = await Bid.find(query)
        .populate('tenderId', 'title tenderNumber')
        .populate('vendorId', 'fullName email')
        .populate('organizationId', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await Bid.countDocuments(query);

      return {
        success: true,
        data: {
          data: results.map((b) => new BidSummaryDTO(b)),
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      throw new Error(`Failed to search bids: ${error.message}`);
    }
  }

  async addDocument(bidId, uploadedBy, documentData) {
    try {
      const bid = await Bid.findById(bidId);

      if (!bid || bid.isDeleted) {
        throw new Error('Bid not found');
      }

      if (bid.status !== BID_STATUS.DRAFT) {
        throw new Error('Can only add documents to draft bids');
      }

      bid.documents.push({
        ...documentData,
        uploadedBy,
      });

      this._addAuditLog(bid, 'DOCUMENT_ADDED', uploadedBy, `Document added: ${documentData.documentName}`);

      await bid.save();

      return {
        success: true,
        data: new BidDTO(bid),
        message: 'Document added successfully',
      };
    } catch (error) {
      throw new Error(`Failed to add document: ${error.message}`);
    }
  }

  async removeDocument(bidId, documentId, userId) {
    try {
      const bid = await Bid.findById(bidId);

      if (!bid || bid.isDeleted) {
        throw new Error('Bid not found');
      }

      if (bid.status !== BID_STATUS.DRAFT) {
        throw new Error('Can only remove documents from draft bids');
      }

      const docIndex = bid.documents.findIndex(
        (d) => d._id.toString() === documentId
      );

      if (docIndex === -1) {
        throw new Error('Document not found');
      }

      const removedDoc = bid.documents[docIndex];
      bid.documents.splice(docIndex, 1);
      this._addAuditLog(bid, 'DOCUMENT_REMOVED', userId, `Document removed: ${removedDoc.documentName}`);

      await bid.save();

      return {
        success: true,
        message: 'Document removed successfully',
      };
    } catch (error) {
      throw new Error(`Failed to remove document: ${error.message}`);
    }
  }

  async evaluateBid(bidId, evaluatorId, evaluationData) {
    try {
      const bid = await Bid.findById(bidId);

      if (!bid || bid.isDeleted) {
        throw new Error('Bid not found');
      }

      if (bid.status !== BID_STATUS.SUBMITTED && bid.status !== BID_STATUS.UNDER_REVIEW) {
        throw new Error('Can only evaluate submitted bids');
      }

      const technicalScore = evaluationData.technicalScore || null;
      const financialScore = evaluationData.financialScore || null;
      const totalScore = technicalScore && financialScore
        ? (technicalScore + financialScore) / 2
        : null;

      bid.evaluation = {
        evaluatorId,
        technicalScore,
        financialScore,
        totalScore,
        technicalRemarks: evaluationData.technicalRemarks || '',
        financialRemarks: evaluationData.financialRemarks || '',
        overallRemarks: evaluationData.overallRemarks || '',
        isRecommended: evaluationData.isRecommended || false,
        evaluatedAt: new Date(),
      };

      bid.evaluationStatus = EVALUATION_STATUS.COMPLETED;
      bid.status = evaluationData.isRecommended ? BID_STATUS.ACCEPTED : BID_STATUS.REJECTED;

      this._addAuditLog(
        bid,
        'BID_EVALUATED',
        evaluatorId,
        `Bid evaluated - Score: ${totalScore}, Recommended: ${evaluationData.isRecommended}`
      );

      await bid.save();

      return {
        success: true,
        data: new BidDTO(bid),
        message: 'Bid evaluated successfully',
      };
    } catch (error) {
      throw new Error(`Failed to evaluate bid: ${error.message}`);
    }
  }

  async updateBidStatus(bidId, status, userId) {
    try {
      const bid = await Bid.findById(bidId);

      if (!bid || bid.isDeleted) {
        throw new Error('Bid not found');
      }

      bid.status = status;
      this._addAuditLog(bid, 'STATUS_UPDATED', userId, `Status changed to ${status}`);

      await bid.save();

      return {
        success: true,
        data: new BidDTO(bid),
        message: 'Bid status updated successfully',
      };
    } catch (error) {
      throw new Error(`Failed to update bid status: ${error.message}`);
    }
  }

  async getVendorBids(vendorId, page = DEFAULT_PAGE, limit = DEFAULT_LIMIT) {
    try {
      const skip = (page - 1) * limit;
      const query = { vendorId, isDeleted: false };

      const bids = await Bid.find(query)
        .populate('tenderId', 'title tenderNumber category')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await Bid.countDocuments(query);

      return {
        success: true,
        data: {
          data: bids.map((b) => new BidSummaryDTO(b)),
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      throw new Error(`Failed to get vendor bids: ${error.message}`);
    }
  }

  async getTenderBids(tenderId, page = DEFAULT_PAGE, limit = DEFAULT_LIMIT) {
    try {
      const skip = (page - 1) * limit;
      const query = { tenderId, isDeleted: false };

      const bids = await Bid.find(query)
        .populate('vendorId', 'fullName email companyName')
        .populate('organizationId', 'name')
        .sort({ bidAmount: 1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await Bid.countDocuments(query);

      return {
        success: true,
        data: {
          data: bids.map((b) => new BidSummaryDTO(b)),
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      throw new Error(`Failed to get tender bids: ${error.message}`);
    }
  }

  async getBidStatistics() {
    try {
      const totalBids = await Bid.countDocuments({ isDeleted: false });
      const draftBids = await Bid.countDocuments({ status: BID_STATUS.DRAFT, isDeleted: false });
      const submittedBids = await Bid.countDocuments({ status: BID_STATUS.SUBMITTED, isDeleted: false });
      const underReviewBids = await Bid.countDocuments({ status: BID_STATUS.UNDER_REVIEW, isDeleted: false });
      const acceptedBids = await Bid.countDocuments({ status: BID_STATUS.ACCEPTED, isDeleted: false });
      const rejectedBids = await Bid.countDocuments({ status: BID_STATUS.REJECTED, isDeleted: false });
      const withdrawnBids = await Bid.countDocuments({ status: BID_STATUS.WITHDRAWN, isDeleted: false });

      const bidsByType = await Bid.aggregate([
        { $match: { isDeleted: false } },
        { $group: { _id: '$bidType', count: { $sum: 1 } } },
      ]);

      return {
        success: true,
        data: {
          totalBids,
          draftBids,
          submittedBids,
          underReviewBids,
          acceptedBids,
          rejectedBids,
          withdrawnBids,
          bidsByType: bidsByType.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {}),
        },
      };
    } catch (error) {
      throw new Error(`Failed to get bid statistics: ${error.message}`);
    }
  }
}

module.exports = new BidsService();