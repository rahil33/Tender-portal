const { body, param, query, validationResult } = require('express-validator');

/**
 * Validation error middleware
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg,
      })),
    });
  }
  next();
};

/**
 * Validators for Dashboard endpoints
 */
const dashboardValidators = {
  // Get dashboard overview
  getDashboardOverview: [
    query('userId')
      .optional()
      .isMongoId()
      .withMessage('Invalid user ID format'),
    handleValidationErrors,
  ],

  // Get activities
  getActivities: [
    query('userId')
      .isMongoId()
      .withMessage('User ID is required and must be valid'),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('type')
      .optional()
      .isIn(['tender_saved', 'tender_unsaved', 'application_submitted', 'application_viewed', 'bid_placed', 'profile_updated'])
      .withMessage('Invalid activity type'),
    handleValidationErrors,
  ],

  // Log activity
  logActivity: [
    body('userId')
      .isMongoId()
      .withMessage('User ID must be valid'),
    body('activityType')
      .isIn(['tender_saved', 'tender_unsaved', 'application_submitted', 'application_viewed', 'bid_placed', 'profile_updated'])
      .withMessage('Invalid activity type'),
    body('description')
      .optional()
      .isString()
      .trim()
      .isLength({ min: 1, max: 500 })
      .withMessage('Description must be between 1 and 500 characters'),
    body('relatedId')
      .optional()
      .isMongoId()
      .withMessage('Related ID must be a valid MongoDB ID'),
    handleValidationErrors,
  ],

  // Get statistics
  getStatistics: [
    param('userId')
      .isMongoId()
      .withMessage('User ID must be valid'),
    handleValidationErrors,
  ],

  // Update statistics
  updateStatistics: [
    body('userId')
      .isMongoId()
      .withMessage('User ID must be valid'),
    body('savedTendersCount')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Saved tenders count must be non-negative'),
    body('applicationsCount')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Applications count must be non-negative'),
    body('profileCompletionPercentage')
      .optional()
      .isInt({ min: 0, max: 100 })
      .withMessage('Profile completion must be between 0 and 100'),
    handleValidationErrors,
  ],

  // Get preferences
  getPreferences: [
    param('userId')
      .isMongoId()
      .withMessage('User ID must be valid'),
    handleValidationErrors,
  ],

  // Update preferences
  updatePreferences: [
    body('userId')
      .isMongoId()
      .withMessage('User ID must be valid'),
    body('emailNotifications')
      .optional()
      .isBoolean()
      .withMessage('Email notifications must be boolean'),
    body('tenderAlerts')
      .optional()
      .isBoolean()
      .withMessage('Tender alerts must be boolean'),
    body('applicationReminders')
      .optional()
      .isBoolean()
      .withMessage('Application reminders must be boolean'),
    body('dashboard_view')
      .optional()
      .isIn(['grid', 'list'])
      .withMessage('Dashboard view must be "grid" or "list"'),
    body('itemsPerPage')
      .optional()
      .isInt({ min: 5, max: 100 })
      .withMessage('Items per page must be between 5 and 100'),
    body('preferredCategories')
      .optional()
      .isArray()
      .withMessage('Preferred categories must be an array'),
    handleValidationErrors,
  ],

  // Mark activities as read
  markActivitiesAsRead: [
    body('activityIds')
      .isArray()
      .withMessage('Activity IDs must be an array')
      .custom(arr => arr.every(id => typeof id === 'string' && id.match(/^[0-9a-fA-F]{24}$/)))
      .withMessage('All activity IDs must be valid MongoDB IDs'),
    handleValidationErrors,
  ],
};

module.exports = dashboardValidators;
