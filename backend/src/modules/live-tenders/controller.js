const liveTenderSyncService = require('./service');
const { LiveTender } = require('./model');

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
      const query = { isActive: true, status: { $in: ['published', 'open'] } };

      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { tenderNumber: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ];
      }

      if (category) query.category = category;
      if (location) query.location = { $regex: location, $options: 'i' };
      if (state) query['metadata.state'] = { $regex: state, $options: 'i' };
      if (department) query.department = { $regex: department, $options: 'i' };

      const sortField = sortBy === 'submissionDeadline' ? 'submissionDeadline' : 'createdAt';
      const sortValue = sortOrder === 'asc' ? 1 : -1;

      const tenders = await LiveTender.find(query)
        .sort({ [sortField]: sortValue })
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      const total = await LiveTender.countDocuments(query);

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
      const { cpppId } = req.params;
      
      const tender = await LiveTender.findOne({
        $or: [
          { 'metadata.cpppId': cpppId },
          { tenderNumber: cpppId },
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
      const states = await LiveTender.distinct('metadata.state', { isActive: true });
      
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
      const departments = await LiveTender.distinct('department', { isActive: true });
      
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
      const categories = await LiveTender.distinct('category', { isActive: true });
      
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