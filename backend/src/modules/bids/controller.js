const bidsService = require('./service');
const { BidsResponseDTO } = require('./dto');
const logger = require('../../config/logger');

class BidsController {
  async createBid(req, res) {
    try {
      const vendorId = req.user?.id || req.user?.userId;
      const { organizationId, ...bidData } = req.body;

      const result = await bidsService.createBid(vendorId, organizationId, bidData);

      logger.info('Bid created', { 
        bidId: result.data?._id, 
        userId: vendorId,
        tenderId: bidData.tenderId 
      });

      return res.status(201).json(
        new BidsResponseDTO(result.success, result.message, result.data)
      );
    } catch (error) {
      logger.error('Create bid failed', { error: error.message, userId: req.user?.id });
      return res.status(400).json(
        new BidsResponseDTO(false, 'Failed to create bid', null, [error.message])
      );
    }
  }

  async getBidById(req, res) {
    try {
      const { bidId } = req.params;
      const userId = req.user?.id;
      const userRole = req.user?.role;

      // SECURITY: Get bid first to check permissions
      const bid = await bidsService.getBidById(bidId);
      
      if (!bid || !bid.data) {
        return res.status(404).json(
          new BidsResponseDTO(false, 'Bid not found', null, ['Bid not found'])
        );
      }

      // SECURITY: Authorization check - only allow access if:
      // 1. User is admin/evaluator
      // 2. User is the bid owner (vendor)
      // 3. User is associated with the tender
      const allowedRoles = ['admin', 'evaluator'];
      
      if (!allowedRoles.includes(userRole)) {
        // Check if user is bid owner
        if (bid.data.vendorId?._id?.toString() !== userId && 
            bid.data.vendorId?.toString() !== userId) {
          // Check if user is associated with the tender
          const tenderService = require('../tenders/service');
          const tender = await tenderService.getTenderById(bid.data.tenderId?._id || bid.data.tenderId);
          
          if (!tender || !tender.data || 
              tender.data.createdBy?.toString() !== userId) {
            logger.warn('Unauthorized bid access attempt', { 
              bidId, 
              userId, 
              userRole 
            });
            return res.status(403).json(
              new BidsResponseDTO(false, 'Access denied', null, ['You do not have permission to view this bid'])
            );
          }
        }
      }

      return res.status(200).json(
        new BidsResponseDTO(true, 'Bid retrieved', bid.data)
      );
    } catch (error) {
      if (error.message === 'Bid not found') {
        return res.status(404).json(
          new BidsResponseDTO(false, 'Bid not found', null, [error.message])
        );
      }
      logger.error('Get bid failed', { error: error.message, userId: req.user?.id });
      return res.status(404).json(
        new BidsResponseDTO(false, 'Failed to get bid', null, [error.message])
      );
    }
  }

  async updateBid(req, res) {
    try {
      const { bidId } = req.params;
      const userId = req.user?.id || req.user?.userId;
      const { changes } = req.body;
      const updates = { ...req.body };
      delete updates.changes;

      const result = await bidsService.updateBid(bidId, userId, updates, changes);

      return res.status(200).json(
        new BidsResponseDTO(result.success, result.message, result.data)
      );
    } catch (error) {
      return res.status(400).json(
        new BidsResponseDTO(false, 'Failed to update bid', null, [error.message])
      );
    }
  }

  async deleteBid(req, res) {
    try {
      const { bidId } = req.params;
      const userId = req.user?.id || req.user?.userId;
      const result = await bidsService.deleteBid(bidId, userId);

      return res.status(200).json(
        new BidsResponseDTO(result.success, result.message)
      );
    } catch (error) {
      return res.status(400).json(
        new BidsResponseDTO(false, 'Failed to delete bid', null, [error.message])
      );
    }
  }

  async submitBid(req, res) {
    try {
      const { bidId } = req.params;
      const userId = req.user?.id || req.user?.userId;
      const result = await bidsService.submitBid(bidId, userId);

      return res.status(200).json(
        new BidsResponseDTO(result.success, result.message, result.data)
      );
    } catch (error) {
      return res.status(400).json(
        new BidsResponseDTO(false, 'Failed to submit bid', null, [error.message])
      );
    }
  }

  async withdrawBid(req, res) {
    try {
      const { bidId } = req.params;
      const { withdrawalReason } = req.body;
      const userId = req.user?.id || req.user?.userId;
      const result = await bidsService.withdrawBid(bidId, userId, withdrawalReason);

      return res.status(200).json(
        new BidsResponseDTO(result.success, result.message, result.data)
      );
    } catch (error) {
      return res.status(400).json(
        new BidsResponseDTO(false, 'Failed to withdraw bid', null, [error.message])
      );
    }
  }

  async getAllBids(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        bidType,
        evaluationStatus,
        tenderId,
        vendorId,
        organizationId,
        sortBy,
        sortOrder,
      } = req.query;

      const result = await bidsService.getAllBids(
        parseInt(page),
        parseInt(limit),
        { status, bidType, evaluationStatus, tenderId, vendorId, organizationId, sortBy, sortOrder }
      );

      return res.status(200).json(
        new BidsResponseDTO(result.success, 'Bids retrieved', result.data)
      );
    } catch (error) {
      return res.status(500).json(
        new BidsResponseDTO(false, 'Failed to get bids', null, [error.message])
      );
    }
  }

  async searchBids(req, res) {
    try {
      const { q, page = 1, limit = 10 } = req.query;

      if (!q) {
        return res.status(400).json(
          new BidsResponseDTO(false, 'Search term is required', null, ['q parameter is missing'])
        );
      }

      const result = await bidsService.searchBids(
        q,
        parseInt(page),
        parseInt(limit)
      );

      return res.status(200).json(
        new BidsResponseDTO(result.success, 'Search results', result.data)
      );
    } catch (error) {
      return res.status(500).json(
        new BidsResponseDTO(false, 'Failed to search bids', null, [error.message])
      );
    }
  }

  async addDocument(req, res) {
    try {
      const { bidId } = req.params;
      const uploadedBy = req.user?.id || req.user?.userId;
      const { documentType, documentName, documentUrl, fileSize, mimeType } = req.body;

      const result = await bidsService.addDocument(bidId, uploadedBy, {
        documentType,
        documentName,
        documentUrl,
        fileSize,
        mimeType,
      });

      return res.status(201).json(
        new BidsResponseDTO(result.success, result.message, result.data)
      );
    } catch (error) {
      return res.status(400).json(
        new BidsResponseDTO(false, 'Failed to add document', null, [error.message])
      );
    }
  }

  async removeDocument(req, res) {
    try {
      const { bidId, documentId } = req.params;
      const userId = req.user?.id || req.user?.userId;
      const result = await bidsService.removeDocument(bidId, documentId, userId);

      return res.status(200).json(
        new BidsResponseDTO(result.success, result.message)
      );
    } catch (error) {
      return res.status(400).json(
        new BidsResponseDTO(false, 'Failed to remove document', null, [error.message])
      );
    }
  }

  async evaluateBid(req, res) {
    try {
      const { bidId } = req.params;
      const evaluatorId = req.user?.id || req.user?.userId;
      const {
        technicalScore,
        financialScore,
        technicalRemarks,
        financialRemarks,
        overallRemarks,
        isRecommended,
      } = req.body;

      const result = await bidsService.evaluateBid(bidId, evaluatorId, {
        technicalScore,
        financialScore,
        technicalRemarks,
        financialRemarks,
        overallRemarks,
        isRecommended,
      });

      return res.status(200).json(
        new BidsResponseDTO(result.success, result.message, result.data)
      );
    } catch (error) {
      return res.status(400).json(
        new BidsResponseDTO(false, 'Failed to evaluate bid', null, [error.message])
      );
    }
  }

  async updateBidStatus(req, res) {
    try {
      const { bidId } = req.params;
      const { status } = req.body;
      const userId = req.user?.id || req.user?.userId;
      const result = await bidsService.updateBidStatus(bidId, status, userId);

      return res.status(200).json(
        new BidsResponseDTO(result.success, result.message, result.data)
      );
    } catch (error) {
      return res.status(400).json(
        new BidsResponseDTO(false, 'Failed to update bid status', null, [error.message])
      );
    }
  }

  async getVendorBids(req, res) {
    try {
      const { vendorId } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const result = await bidsService.getVendorBids(
        vendorId,
        parseInt(page),
        parseInt(limit)
      );

      return res.status(200).json(
        new BidsResponseDTO(result.success, 'Vendor bids retrieved', result.data)
      );
    } catch (error) {
      return res.status(500).json(
        new BidsResponseDTO(false, 'Failed to get vendor bids', null, [error.message])
      );
    }
  }

  async getTenderBids(req, res) {
    try {
      const { tenderId } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const result = await bidsService.getTenderBids(
        tenderId,
        parseInt(page),
        parseInt(limit)
      );

      return res.status(200).json(
        new BidsResponseDTO(result.success, 'Tender bids retrieved', result.data)
      );
    } catch (error) {
      return res.status(500).json(
        new BidsResponseDTO(false, 'Failed to get tender bids', null, [error.message])
      );
    }
  }

  async getBidStatistics(req, res) {
    try {
      const result = await bidsService.getBidStatistics();

      return res.status(200).json(
        new BidsResponseDTO(result.success, 'Bid statistics retrieved', result.data)
      );
    } catch (error) {
      return res.status(500).json(
        new BidsResponseDTO(false, 'Failed to get bid statistics', null, [error.message])
      );
    }
  }

  async getBuyerAnalytics(req, res) {
    try {
      const vendorId = req.user?.id || req.user?.userId;
      const result = await bidsService.getBuyerAnalytics(vendorId);

      return res.status(200).json(
        new BidsResponseDTO(result.success, 'Buyer analytics retrieved', result.data)
      );
    } catch (error) {
      return res.status(500).json(
        new BidsResponseDTO(false, 'Failed to get buyer analytics', null, [error.message])
      );
    }
  }
}

module.exports = new BidsController();