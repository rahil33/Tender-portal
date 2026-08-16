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

const STATE_ALIASES = {
  'tamilnadu': 'Tamil Nadu',
  'orissa': 'Odisha',
  'tamil_nadu': 'Tamil Nadu',
};

function normalizeState(state) {
  if (!state) return state;
  const lower = state.trim().toLowerCase().replace(/_/g, ' ');
  if (STATE_ALIASES[lower]) {
    return STATE_ALIASES[lower];
  }
  return state
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Builds a case-insensitive regex that matches a state name while tolerating
 * whitespace differences (e.g. "Tamil Nadu" also matches "TamilNadu" and
 * "Tamil Nadu"). This makes the state filter robust to the normalization
 * variations seen across scraped GeM records.
 */
function toFlexibleStateRegex(state) {
  const normalized = normalizeState(state);
  if (!normalized) return null;
  const parts = normalized.toLowerCase().split(/\s+/).map(escapeRegex);
  return new RegExp(`^\\s*${parts.join('\\s*')}\\s*$`, 'i');
}

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
        authority,
        bidType,
        minValue,
        maxValue,
        deadlineFrom,
        deadlineTo,
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
      const authorityValue = cleanText(authority, 100);
      const bidTypeValue = cleanText(bidType, 10);
      const minValueNum = parseFloat(minValue);
      const maxValueNum = parseFloat(maxValue);
      const deadlineFromDate = deadlineFrom ? new Date(deadlineFrom) : null;
      const deadlineToDate = deadlineTo ? new Date(deadlineTo) : null;

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
      if (stateValue) {
        const stateRegex = toFlexibleStateRegex(stateValue);
        if (stateRegex) {
          query['metadata.state'] = stateRegex;
        }
      }

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

      // Authority / Organization filter matches the real GeM buyer/department
      // field (not inferred from the tender title).
      if (authorityValue) {
        const authorityRegex = escapeRegex(authorityValue);
        andConditions.push({
          $or: [
            { issuingOrganization: { $regex: authorityRegex, $options: 'i' } },
            { department: { $regex: authorityRegex, $options: 'i' } },
            { 'contactInfo.organisation': { $regex: authorityRegex, $options: 'i' } },
            { 'metadata.ministry': { $regex: authorityRegex, $options: 'i' } },
          ],
        });
      }

      // GeM bid type filter (numeric GeM bid-type value).
      if (bidTypeValue && /^\d+$/.test(bidTypeValue)) {
        query['metadata.bidType'] = Number(bidTypeValue);
      }

      // Bid value range filter (range/RA bids may expose an estimated value).
      if (Number.isFinite(minValueNum) || Number.isFinite(maxValueNum)) {
        const valueRange = {};
        if (Number.isFinite(minValueNum)) valueRange.$gte = minValueNum;
        if (Number.isFinite(maxValueNum)) valueRange.$lte = maxValueNum;
        query['budget.estimated'] = valueRange;
      }

      // Deadline range filter on the GeM bid end date.
      if (deadlineFromDate && !isNaN(deadlineFromDate.getTime())) {
        andConditions.push({ submissionDeadline: { $gte: deadlineFromDate } });
      }
      if (deadlineToDate && !isNaN(deadlineToDate.getTime())) {
        andConditions.push({ submissionDeadline: { $lte: deadlineToDate } });
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
        isActive: true,
        $or: [
          { 'metadata.gemBidId': tenderId },
          { tenderNumber: tenderId },
        ],
      }).lean();

      if (!tender || (tender.submissionDeadline && tender.submissionDeadline < new Date())) {
        return res.status(404).json({
          success: false,
          message: 'Tender not found or no longer active',
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
      const matchStage = {
        isActive: true,
        sourcePortal: SOURCE_PORTALS.GEM,
      };

      const statesWithCounts = await LiveTender.aggregate([
        { $match: matchStage },
        { $unwind: '$metadata.state' },
        { $group: {
          _id: '$metadata.state',
          count: { $sum: 1 },
        } },
      ]);

      // Normalize each raw state name (handles aliases + casing), merging the
      // counts of equivalent spellings so the dynamic dropdown never shows
      // duplicates of the same state.
      const countsByNormalized = {};
      for (const item of statesWithCounts) {
        if (!item._id || typeof item._id !== 'string' || item._id.trim().length === 0) {
          continue;
        }
        const normalized = normalizeState(item._id);
        if (normalized) {
          countsByNormalized[normalized] = (countsByNormalized[normalized] || 0) + item.count;
        }
      }

      const allStateNames = Object.keys(countsByNormalized).sort();

      res.status(200).json({
        success: true,
        data: {
          states: allStateNames,
          counts: countsByNormalized,
        },
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

  async getAuthorities(req, res) {
    try {
      const authorities = await LiveTender.distinct('issuingOrganization', { isActive: true, sourcePortal: SOURCE_PORTALS.GEM });
      
      res.status(200).json({
        success: true,
        data: authorities.filter(Boolean).sort(),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch authorities',
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