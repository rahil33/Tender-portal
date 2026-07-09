const express = require('express');
const router = express.Router();
const dashboardController = require('./dashboard.controller');
const dashboardValidators = require('./dashboard.validators');
const { protect } = require('../../middleware/authMiddleware');

/**
 * Dashboard Routes
 * All routes require authentication
 */

// ─── OVERVIEW & SUMMARY ───────────────────────────────────────────────
/**
 * GET /api/dashboard/overview
 * Get complete dashboard overview including stats, activities, and profile
 */
router.get(
  '/overview',
  protect,
  dashboardValidators.getDashboardOverview,
  dashboardController.getDashboardOverview.bind(dashboardController)
);

/**
 * GET /api/dashboard/summary
 * Get quick dashboard summary with key metrics
 */
router.get(
  '/summary',
  protect,
  dashboardController.getDashboardSummary.bind(dashboardController)
);

// ─── ACTIVITIES ───────────────────────────────────────────────────────
/**
 * GET /api/dashboard/activities
 * Get paginated activities for user
 * Query params: page, limit, type (optional)
 */
router.get(
  '/activities',
  protect,
  dashboardValidators.getActivities,
  dashboardController.getActivities.bind(dashboardController)
);

/**
 * POST /api/dashboard/activities
 * Log a new activity
 * Body: { userId, activityType, description, relatedId, metadata }
 */
router.post(
  '/activities',
  protect,
  dashboardValidators.logActivity,
  dashboardController.logActivity.bind(dashboardController)
);

/**
 * POST /api/dashboard/activities/mark-as-read
 * Mark specific activities as read
 * Body: { activityIds: [id1, id2, ...] }
 */
router.post(
  '/activities/mark-as-read',
  protect,
  dashboardValidators.markActivitiesAsRead,
  dashboardController.markActivitiesAsRead.bind(dashboardController)
);

/**
 * POST /api/dashboard/activities/mark-all-as-read
 * Mark all activities as read for a user
 * Body: { userId }
 */
router.post(
  '/activities/mark-all-as-read',
  protect,
  dashboardController.markAllActivitiesAsRead.bind(dashboardController)
);

/**
 * DELETE /api/dashboard/activities
 * Clear all activities for a user
 * Body: { userId }
 */
router.delete(
  '/activities',
  protect,
  dashboardController.clearActivities.bind(dashboardController)
);

// ─── STATISTICS ───────────────────────────────────────────────────────
/**
 * GET /api/dashboard/statistics/:userId
 * Get user statistics
 */
router.get(
  '/statistics/:userId',
  protect,
  dashboardValidators.getStatistics,
  dashboardController.getStatistics.bind(dashboardController)
);

/**
 * PUT /api/dashboard/statistics
 * Update user statistics
 * Body: { userId, savedTendersCount?, applicationsCount?, profileCompletionPercentage?, ... }
 */
router.put(
  '/statistics',
  protect,
  dashboardValidators.updateStatistics,
  dashboardController.updateStatistics.bind(dashboardController)
);

/**
 * POST /api/dashboard/statistics/increment
 * Increment a specific statistic counter
 * Body: { userId, field, amount? }
 */
router.post(
  '/statistics/increment',
  protect,
  dashboardController.incrementStatistic.bind(dashboardController)
);

// ─── PREFERENCES ───────────────────────────────────────────────────────
/**
 * GET /api/dashboard/preferences/:userId
 * Get user preferences
 */
router.get(
  '/preferences/:userId',
  protect,
  dashboardValidators.getPreferences,
  dashboardController.getPreferences.bind(dashboardController)
);

/**
 * PUT /api/dashboard/preferences
 * Update user preferences
 * Body: { userId, emailNotifications?, tenderAlerts?, applicationReminders?, dashboard_view?, itemsPerPage?, preferredCategories? }
 */
router.put(
  '/preferences',
  protect,
  dashboardValidators.updatePreferences,
  dashboardController.updatePreferences.bind(dashboardController)
);

module.exports = router;
