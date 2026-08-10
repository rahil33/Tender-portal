const liveTenderSyncService = require('./service');
const { LiveTender } = require('./model');
const { SOURCE_PORTALS, DEFAULT_PAGE, DEFAULT_LIMIT, MAX_LIMIT } = require('./constants');

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Safely parses a positive integer query value.
 * - Malformed/NaN input falls back to `fallback` (never crashes the query).
 * - Values are clamped to `max` when provided (no unbounded limit/page).
 */
function toPositiveInt(value, fallback, max) {
  const parsed = parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }
  return max ? Math.min(parsed, max) : parsed;
}

/**
 * Normalizes a free-text search parameter: trims and caps its length so a
 * huge malicious string cannot be turned into an expensive regex.
 */
function cleanText(value, maxLength) {
  return String(value || '').trim().slice(0, maxLength);
}

const SEARCHABLE_FIELDS = [
  'title',
  'tenderNumber',
  'description',
  'issuingOrganization',
  'department',
  'location',
  'contactInfo.organisation',
  'metadata.state',
  'metadata.city',
  'metadata.ministry',
  'metadata.gemBidId',
  'metadata.productCategory',
  'tags',
];

class LiveTenderController {
  async getLiveTenders(req, res) {
    try {
      const {
        page,
        limit,
        search,
        q,
        category,
        location,
        state,
        department,
        organization,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = req.query;

      // Safe pagination: malformed input falls back, limits are capped.
      const safePage = toPositiveInt(page, DEFAULT_PAGE);
      const safeLimit = toPositiveInt(limit, DEFAULT_LIMIT, MAX_LIMIT);
      const skip = (safePage - 1) * safeLimit;

      // `search` and `q` are interchangeable; the main search box uses `search`
      // while `q` is supported as a short alias.
      const searchTerm = cleanText(search || q, 200);
      const categoryValue = cleanText(category, 100).toLowerCase();
      const locationValue = cleanText(location, 100);
      const stateValue = cleanText(state, 100);
      const departmentValue = cleanText(department || organization, 100);

      // GeM-only, live-only base filter. The frontend has no way to request a
      // different source portal.
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

      if (searchTerm) {
        const searchRegex = escapeRegex(searchTerm);
        andConditions.push({
          $or: SEARCHABLE_FIELDS.map((field) => ({
            [field]: { $regex: searchRegex, $options: 'i' },
          })),
        });
      }

      if (categoryValue) query.category = categoryValue;
      if (locationValue) query.location = { $regex: escapeRegex(locationValue), $options: 'i' };
      if (stateValue) query['metadata.state'] = { $regex: escapeRegex(stateValue), $options: 'i' };

      if (departmentValue) {
        const departmentRegex = escapeRegex(departmentValue);
        andConditions.push({
          $or: [
            { department: { $regex: departmentRegex, $options: 'i' } },
            { issuingOrganization: { $regex: departmentRegex, $options: 'i' } },
            { 'contactInfo.organisation': { $regex: departmentRegex, $options: 'i' } },
          ],
        });
      }

      query.$and = andConditions;

      const sortField = sortBy === 'submissionDeadline' ? 'submissionDeadline' : 'createdAt';
      const sortValue = sortOrder === 'asc' ? 1 : -1;

      const [tenders, total] = await Promise.all([
        LiveTender.find(query)
          .sort({ [sortField]: sortValue })
          .skip(skip)
          .limit(safeLimit)
          .lean(),
        LiveTender.countDocuments(query),
      ]);

      res.status(200).json({
        success: true,
        message: 'Live tenders retrieved successfully',
        data: {
          data: tenders,
          pagination: {
            page: safePage,
            limit: safeLimit,
            total,
            pages: Math.ceil(total / safeLimit),
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