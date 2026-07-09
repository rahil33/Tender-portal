const { body, param, query, validationResult } = require('express-validator');
const {
  ADMIN_ROLES_VALUES,
  PERMISSIONS_VALUES,
  AUDIT_ACTION_TYPES_VALUES,
  AUDIT_RESOURCE_TYPES_VALUES,
  MODERATION_STATUS_VALUES,
  REPORT_TYPES_VALUES,
  REPORT_STATUS_VALUES,
  SYSTEM_HEALTH_STATUS_VALUES,
  MAX_LIMIT,
  SORT_FIELDS_VALUES,
  SORT_ORDER_VALUES,
} = require('./constants');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((err) => ({
        field: err.param,
        message: err.msg,
      })),
    });
  }
  next();
};

const adminValidators = {
  createRole: [
    body('name')
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Role name is required')
      .isLength({ max: 50 })
      .withMessage('Role name must be max 50 characters'),
    body('description')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description must be max 500 characters'),
    body('permissions')
      .optional()
      .isArray()
      .withMessage('Permissions must be an array'),
    body('permissions.*')
      .optional()
      .isIn(PERMISSIONS_VALUES)
      .withMessage('Invalid permission'),
    body('isSystemRole')
      .optional()
      .isBoolean()
      .withMessage('isSystemRole must be a boolean'),
    handleValidationErrors,
  ],

  updateRole: [
    param('roleId')
      .isMongoId()
      .withMessage('Role ID must be valid'),
    body('name')
      .optional()
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Role name cannot be empty')
      .isLength({ max: 50 })
      .withMessage('Role name must be max 50 characters'),
    body('description')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description must be max 500 characters'),
    body('permissions')
      .optional()
      .isArray()
      .withMessage('Permissions must be an array'),
    body('permissions.*')
      .optional()
      .isIn(PERMISSIONS_VALUES)
      .withMessage('Invalid permission'),
    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be a boolean'),
    handleValidationErrors,
  ],

  assignRoleToUser: [
    body('userId')
      .isMongoId()
      .withMessage('User ID must be valid'),
    body('role')
      .isIn(ADMIN_ROLES_VALUES)
      .withMessage('Invalid admin role'),
    body('permissions')
      .optional()
      .isArray()
      .withMessage('Permissions must be an array'),
    body('permissions.*')
      .optional()
      .isIn(PERMISSIONS_VALUES)
      .withMessage('Invalid permission'),
    handleValidationErrors,
  ],

  updateUserRole: [
    param('adminUserId')
      .isMongoId()
      .withMessage('Admin user ID must be valid'),
    body('role')
      .optional()
      .isIn(ADMIN_ROLES_VALUES)
      .withMessage('Invalid admin role'),
    body('permissions')
      .optional()
      .isArray()
      .withMessage('Permissions must be an array'),
    body('permissions.*')
      .optional()
      .isIn(PERMISSIONS_VALUES)
      .withMessage('Invalid permission'),
    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be a boolean'),
    body('isSuperAdmin')
      .optional()
      .isBoolean()
      .withMessage('isSuperAdmin must be a boolean'),
    handleValidationErrors,
  ],

  getAuditLogs: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be positive'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: MAX_LIMIT })
      .withMessage(`Limit must be between 1 and ${MAX_LIMIT}`),
    query('action')
      .optional()
      .isIn(AUDIT_ACTION_TYPES_VALUES)
      .withMessage('Invalid action type'),
    query('resourceType')
      .optional()
      .isIn(AUDIT_RESOURCE_TYPES_VALUES)
      .withMessage('Invalid resource type'),
    query('resourceId')
      .optional()
      .isMongoId()
      .withMessage('Resource ID must be valid'),
    query('performedBy')
      .optional()
      .isMongoId()
      .withMessage('User ID must be valid'),
    query('status')
      .optional()
      .isIn(['success', 'failure'])
      .withMessage('Status must be success or failure'),
    query('sortBy')
      .optional()
      .isIn(SORT_FIELDS_VALUES)
      .withMessage('Invalid sort field'),
    query('sortOrder')
      .optional()
      .isIn(SORT_ORDER_VALUES)
      .withMessage('Sort order must be asc or desc'),
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Start date must be a valid date'),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('End date must be a valid date'),
    handleValidationErrors,
  ],

  getModerationLogs: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be positive'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: MAX_LIMIT })
      .withMessage(`Limit must be between 1 and ${MAX_LIMIT}`),
    query('resourceType')
      .optional()
      .isIn(['tender', 'bid', 'organization', 'user', 'report'])
      .withMessage('Invalid resource type'),
    query('resourceId')
      .optional()
      .isMongoId()
      .withMessage('Resource ID must be valid'),
    query('status')
      .optional()
      .isIn(MODERATION_STATUS_VALUES)
      .withMessage('Invalid moderation status'),
    query('moderatedBy')
      .optional()
      .isMongoId()
      .withMessage('User ID must be valid'),
    query('sortBy')
      .optional()
      .isIn(SORT_FIELDS_VALUES)
      .withMessage('Invalid sort field'),
    query('sortOrder')
      .optional()
      .isIn(SORT_ORDER_VALUES)
      .withMessage('Sort order must be asc or desc'),
    handleValidationErrors,
  ],

  moderateResource: [
    param('resourceType')
      .isIn(['tender', 'bid', 'organization', 'user', 'report'])
      .withMessage('Invalid resource type'),
    param('resourceId')
      .isMongoId()
      .withMessage('Resource ID must be valid'),
    body('status')
      .isIn(MODERATION_STATUS_VALUES)
      .withMessage('Invalid moderation status'),
    body('moderationNotes')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 2000 })
      .withMessage('Moderation notes must be max 2000 characters'),
    body('rejectionReason')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Rejection reason must be max 1000 characters'),
    handleValidationErrors,
  ],

  getReports: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be positive'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: MAX_LIMIT })
      .withMessage(`Limit must be between 1 and ${MAX_LIMIT}`),
    query('reportType')
      .optional()
      .isIn(REPORT_TYPES_VALUES)
      .withMessage('Invalid report type'),
    query('status')
      .optional()
      .isIn(REPORT_STATUS_VALUES)
      .withMessage('Invalid report status'),
    query('priority')
      .optional()
      .isIn(['low', 'medium', 'high', 'critical'])
      .withMessage('Invalid priority'),
    query('assignedTo')
      .optional()
      .isMongoId()
      .withMessage('User ID must be valid'),
    query('sortBy')
      .optional()
      .isIn(SORT_FIELDS_VALUES)
      .withMessage('Invalid sort field'),
    query('sortOrder')
      .optional()
      .isIn(SORT_ORDER_VALUES)
      .withMessage('Sort order must be asc or desc'),
    handleValidationErrors,
  ],

  createReport: [
    body('reportType')
      .isIn(REPORT_TYPES_VALUES)
      .withMessage('Invalid report type'),
    body('description')
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Report description is required')
      .isLength({ max: 5000 })
      .withMessage('Description must be max 5000 characters'),
    body('reportedUser')
      .optional()
      .isMongoId()
      .withMessage('Reported user ID must be valid'),
    body('reportedTender')
      .optional()
      .isMongoId()
      .withMessage('Reported tender ID must be valid'),
    body('reportedBid')
      .optional()
      .isMongoId()
      .withMessage('Reported bid ID must be valid'),
    body('evidence')
      .optional()
      .isArray()
      .withMessage('Evidence must be an array'),
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high', 'critical'])
      .withMessage('Invalid priority'),
    handleValidationErrors,
  ],

  updateReport: [
    param('reportId')
      .isMongoId()
      .withMessage('Report ID must be valid'),
    body('status')
      .optional()
      .isIn(REPORT_STATUS_VALUES)
      .withMessage('Invalid report status'),
    body('assignedTo')
      .optional()
      .isMongoId()
      .withMessage('Assigned user ID must be valid'),
    body('resolutionNotes')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 2000 })
      .withMessage('Resolution notes must be max 2000 characters'),
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high', 'critical'])
      .withMessage('Invalid priority'),
    handleValidationErrors,
  ],

  getSystemSettings: [
    query('category')
      .optional()
      .isString()
      .trim()
      .withMessage('Category must be a string'),
    query('isPublic')
      .optional()
      .isIn(['true', 'false'])
      .withMessage('isPublic must be true or false'),
    handleValidationErrors,
  ],

  createSystemSetting: [
    body('key')
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Setting key is required')
      .isLength({ max: 100 })
      .withMessage('Key must be max 100 characters'),
    body('value')
      .notEmpty()
      .withMessage('Setting value is required'),
    body('description')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description must be max 500 characters'),
    body('category')
      .optional()
      .isString()
      .trim()
      .withMessage('Category must be a string'),
    body('isPublic')
      .optional()
      .isBoolean()
      .withMessage('isPublic must be a boolean'),
    body('isEditable')
      .optional()
      .isBoolean()
      .withMessage('isEditable must be a boolean'),
    body('valueType')
      .optional()
      .isIn(['string', 'number', 'boolean', 'object', 'array'])
      .withMessage('Invalid value type'),
    handleValidationErrors,
  ],

  updateSystemSetting: [
    param('settingId')
      .isMongoId()
      .withMessage('Setting ID must be valid'),
    body('value')
      .optional()
      .notEmpty()
      .withMessage('Value cannot be empty'),
    body('description')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description must be max 500 characters'),
    body('category')
      .optional()
      .isString()
      .trim()
      .withMessage('Category must be a string'),
    body('isPublic')
      .optional()
      .isBoolean()
      .withMessage('isPublic must be a boolean'),
    handleValidationErrors,
  ],

  getSystemHealth: [
    query('component')
      .optional()
      .isString()
      .trim()
      .withMessage('Component must be a string'),
    query('status')
      .optional()
      .isIn(SYSTEM_HEALTH_STATUS_VALUES)
      .withMessage('Invalid health status'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: MAX_LIMIT })
      .withMessage(`Limit must be between 1 and ${MAX_LIMIT}`),
    handleValidationErrors,
  ],

  getPlatformStatistics: [
    query('period')
      .optional()
      .isIn(['daily', 'weekly', 'monthly', 'yearly'])
      .withMessage('Invalid period'),
    query('metricName')
      .optional()
      .isString()
      .trim()
      .withMessage('Metric name must be a string'),
    handleValidationErrors,
  ],

  searchAdmin: [
    query('q')
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Search term is required'),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be positive'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: MAX_LIMIT })
      .withMessage(`Limit must be between 1 and ${MAX_LIMIT}`),
    query('type')
      .optional()
      .isIn(['user', 'organization', 'tender', 'bid'])
      .withMessage('Invalid search type'),
    handleValidationErrors,
  ],

  getAllUsers: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be positive'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: MAX_LIMIT })
      .withMessage(`Limit must be between 1 and ${MAX_LIMIT}`),
    query('search')
      .optional()
      .isString()
      .trim()
      .withMessage('Search term must be a string'),
    query('role')
      .optional()
      .isIn(['admin', 'vendor', 'evaluator'])
      .withMessage('Invalid role'),
    query('isActive')
      .optional()
      .isIn(['true', 'false'])
      .withMessage('isActive must be true or false'),
    query('sortBy')
      .optional()
      .isIn(SORT_FIELDS_VALUES)
      .withMessage('Invalid sort field'),
    query('sortOrder')
      .optional()
      .isIn(SORT_ORDER_VALUES)
      .withMessage('Sort order must be asc or desc'),
    handleValidationErrors,
  ],

  getOrganizations: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be positive'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: MAX_LIMIT })
      .withMessage(`Limit must be between 1 and ${MAX_LIMIT}`),
    query('search')
      .optional()
      .isString()
      .trim()
      .withMessage('Search term must be a string'),
    query('isVerified')
      .optional()
      .isIn(['true', 'false'])
      .withMessage('isVerified must be true or false'),
    query('isActive')
      .optional()
      .isIn(['true', 'false'])
      .withMessage('isActive must be true or false'),
    query('sortBy')
      .optional()
      .isIn(SORT_FIELDS_VALUES)
      .withMessage('Invalid sort field'),
    query('sortOrder')
      .optional()
      .isIn(SORT_ORDER_VALUES)
      .withMessage('Sort order must be asc or desc'),
    handleValidationErrors,
  ],

  verifyOrganization: [
    param('organizationId')
      .isMongoId()
      .withMessage('Organization ID must be valid'),
    body('isVerified')
      .isBoolean()
      .withMessage('isVerified must be a boolean'),
    body('verificationNotes')
      .optional()
      .isString()
      .trim()
      .withMessage('Verification notes must be a string'),
    handleValidationErrors,
  ],

  getTenders: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be positive'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: MAX_LIMIT })
      .withMessage(`Limit must be between 1 and ${MAX_LIMIT}`),
    query('status')
      .optional()
      .isString()
      .trim()
      .withMessage('Status must be a string'),
    query('category')
      .optional()
      .isString()
      .trim()
      .withMessage('Category must be a string'),
    query('search')
      .optional()
      .isString()
      .trim()
      .withMessage('Search term must be a string'),
    query('sortBy')
      .optional()
      .isIn(SORT_FIELDS_VALUES)
      .withMessage('Invalid sort field'),
    query('sortOrder')
      .optional()
      .isIn(SORT_ORDER_VALUES)
      .withMessage('Sort order must be asc or desc'),
    handleValidationErrors,
  ],

  getBids: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be positive'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: MAX_LIMIT })
      .withMessage(`Limit must be between 1 and ${MAX_LIMIT}`),
    query('status')
      .optional()
      .isString()
      .trim()
      .withMessage('Status must be a string'),
    query('tenderId')
      .optional()
      .isMongoId()
      .withMessage('Tender ID must be valid'),
    query('search')
      .optional()
      .isString()
      .trim()
      .withMessage('Search term must be a string'),
    query('sortBy')
      .optional()
      .isIn(SORT_FIELDS_VALUES)
      .withMessage('Invalid sort field'),
    query('sortOrder')
      .optional()
      .isIn(SORT_ORDER_VALUES)
      .withMessage('Sort order must be asc or desc'),
    handleValidationErrors,
  ],

  getCategories: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be positive'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: MAX_LIMIT })
      .withMessage(`Limit must be between 1 and ${MAX_LIMIT}`),
    query('search')
      .optional()
      .isString()
      .trim()
      .withMessage('Search term must be a string'),
    query('isActive')
      .optional()
      .isIn(['true', 'false'])
      .withMessage('isActive must be true or false'),
    query('sortBy')
      .optional()
      .isIn(SORT_FIELDS_VALUES)
      .withMessage('Invalid sort field'),
    query('sortOrder')
      .optional()
      .isIn(SORT_ORDER_VALUES)
      .withMessage('Sort order must be asc or desc'),
    handleValidationErrors,
  ],

  createCategory: [
    body('name')
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Category name is required')
      .isLength({ max: 100 })
      .withMessage('Category name must be max 100 characters'),
    body('description')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description must be max 500 characters'),
    body('code')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 50 })
      .withMessage('Category code must be max 50 characters'),
    body('parentId')
      .optional()
      .isMongoId()
      .withMessage('Parent category ID must be valid'),
    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be a boolean'),
    handleValidationErrors,
  ],

  updateCategory: [
    param('categoryId')
      .isMongoId()
      .withMessage('Category ID must be valid'),
    body('name')
      .optional()
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Category name cannot be empty')
      .isLength({ max: 100 })
      .withMessage('Category name must be max 100 characters'),
    body('description')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description must be max 500 characters'),
    body('code')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 50 })
      .withMessage('Category code must be max 50 characters'),
    body('parentId')
      .optional()
      .isMongoId()
      .withMessage('Parent category ID must be valid'),
    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be a boolean'),
    handleValidationErrors,
  ],
};

module.exports = adminValidators;