const liveTenderSyncService = require('./service');
const { LiveTender } = require('./model');
const { SOURCE_PORTALS } = require('./constants');

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

class LiveTenderController {
  async getLiveTenders(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        category,
        location,
        state,
        department,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = req.query;

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const query = {
        isActive: true,
        status: { $in: ['published', 'open'] },
        sourcePortal: SOURCE_PORTALS.GEM,
      };

      const andConditions = [
        // Active-only: submission deadline not passed. Tenders without a
        // deadline are kept visible to avoid hiding unparseable data.
        {
          $or: [
            { submissionDeadline: { $gte: new Date() } },
            { submissionDeadline: { $exists: false } },
          ],
        },
      ];

      if (search) {
        const searchTerm = escapeRegex(search);
        andConditions.push({
          $or: [
            { title: { $regex: searchTerm, $options: 'i' } },
            { tenderNumber: { $regex: searchTerm, $options: 'i' } },
            { description: { $regex: searchTerm, $options: 'i' } },
            { issuingOrganization: { $regex: searchTerm, $options: 'i' } },
            { 'metadata.state': { $regex: searchTerm, $options: 'i' } },
          ],
        });
      }

      if (category) query.category = category;
      if (location) query.location = { $regex: escapeRegex(location), $options: 'i' };
      if (state) query['metadata.state'] = { $regex: escapeRegex(state), $options: 'i' };
      if (department) query.department = { $regex: escapeRegex(department), $options: 'i' };

      if (andConditions.length > 1) {
        query.$and = andConditions;
      }

      const sortField = sortBy === 'submissionDeadline' ? 'submissionDeadline' : 'createdAt';
      const sortValue = sortOrder === 'asc' ? 1 : -1;

      const [tenders, total] = await Promise.all([
        LiveTender.find(query)
          .sort({ [sortField]: sortValue })
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        LiveTender.countDocuments(query),
      ]);

      res.status(200).json({
        success: true,
        message: 'Live tenders retrieved successfully',
        data: {
          data: tenders,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit)),
          },
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch live tenders',
        errors: [error.message],
      });
    }
  }

  async getTenderById(req, res) {
    try {
      const { tenderId } = req.params;

      const tender = await LiveTender.findOne({
        sourcePortal: SOURCE_PORTALS.GEM,
        $or: [
          { 'metadata.gemBidId': tenderId },
          { tenderNumber: tenderId },
        ],
      }).lean();

      if (!tender) {
        return res.status(404).json({
          success: false,
          message: 'Tender not found',
        });
      }

      res.status(200).json({
        success: true,
        message: 'Tender retrieved successfully',
        data: tender,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch tender details',
        errors: [error.message],
      });
    }
  }

  async getStates(req, res) {
    try {
      const states = await LiveTender.distinct('metadata.state', { isActive: true, sourcePortal: SOURCE_PORTALS.GEM });
      
      res.status(200).json({
        success: true,
        data: states.filter(Boolean).sort(),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch states',
        errors: [error.message],
      });
    }
  }

  async getDepartments(req, res) {
    try {
      const departments = await LiveTender.distinct('department', { isActive: true, sourcePortal: SOURCE_PORTALS.GEM });
      
      res.status(200).json({
        success: true,
        data: departments.filter(Boolean).sort(),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch departments',
        errors: [error.message],
      });
    }
  }

  async getCategories(req, res) {
    try {
      const categories = await LiveTender.distinct('category', { isActive: true, sourcePortal: SOURCE_PORTALS.GEM });
      
      res.status(200).json({
        success: true,
        data: categories.sort(),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch categories',
        errors: [error.message],
      });
    }
  }

  async getSyncStatus(req, res) {
    try {
      const status = liveTenderSyncService.getSyncStatus();
      const statistics = await liveTenderSyncService.getStatistics();

      res.status(200).json({
        success: true,
        message: 'Sync status retrieved successfully',
        data: {
          sync: status,
          statistics,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch sync status',
        errors: [error.message],
      });
    }
  }

  async manualSync(req, res) {
    try {
      const result = await liveTenderSyncService.synchronizeTenders();

      if (result.success) {
        res.status(200).json({
          success: true,
          message: result.message,
          data: result.stats,
        });
      } else {
        res.status(500).json({
          success: false,
          message: result.message,
          data: result.stats,
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Manual sync failed',
        errors: [error.message],
      });
    }
  }

  async clearCache(req, res) {
    try {
      const result = await liveTenderSyncService.clearCache();
      
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to clear cache',
        errors: [error.message],
      });
    }
  }

  async getStatistics(req, res) {
    try {
      const statistics = await liveTenderSyncService.getStatistics();
      
      res.status(200).json({
        success: true,
        message: 'Statistics retrieved successfully',
        data: statistics,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch statistics',
        errors: [error.message],
      });
    }
  }
}

module.exports = new LiveTenderController();