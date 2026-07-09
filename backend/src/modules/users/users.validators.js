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
 * Validators for Users endpoints
 */
const usersValidators = {
  // Get user profile
  getUserProfile: [
    param('userId')
      .isMongoId()
      .withMessage('User ID must be valid'),
    handleValidationErrors,
  ],

  // Create user profile
  createUserProfile: [
    body('userId')
      .isMongoId()
      .withMessage('User ID must be valid'),
    body('firstName')
      .optional()
      .isString()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('First name must be between 1 and 50 characters'),
    body('lastName')
      .optional()
      .isString()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Last name must be between 1 and 50 characters'),
    body('email')
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage('Email must be valid'),
    body('phone')
      .optional()
      .isString()
      .trim()
      .withMessage('Phone must be a string'),
    body('companyName')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Company name must be max 100 characters'),
    body('bio')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Bio must be max 500 characters'),
    handleValidationErrors,
  ],

  // Update user profile
  updateUserProfile: [
    param('userId')
      .isMongoId()
      .withMessage('User ID must be valid'),
    body('firstName')
      .optional()
      .isString()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('First name must be between 1 and 50 characters'),
    body('lastName')
      .optional()
      .isString()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Last name must be between 1 and 50 characters'),
    body('phone')
      .optional()
      .isString()
      .trim()
      .withMessage('Phone must be a string'),
    body('designation')
      .optional()
      .isString()
      .trim()
      .withMessage('Designation must be a string'),
    handleValidationErrors,
  ],

  // Get user settings
  getUserSettings: [
    param('userId')
      .isMongoId()
      .withMessage('User ID must be valid'),
    handleValidationErrors,
  ],

  // Update user settings
  updateUserSettings: [
    param('userId')
      .isMongoId()
      .withMessage('User ID must be valid'),
    body('emailNotifications')
      .optional()
      .isBoolean()
      .withMessage('Email notifications must be boolean'),
    body('smsNotifications')
      .optional()
      .isBoolean()
      .withMessage('SMS notifications must be boolean'),
    body('pushNotifications')
      .optional()
      .isBoolean()
      .withMessage('Push notifications must be boolean'),
    body('tenderAlerts')
      .optional()
      .isBoolean()
      .withMessage('Tender alerts must be boolean'),
    body('theme')
      .optional()
      .isIn(['light', 'dark'])
      .withMessage('Theme must be light or dark'),
    body('preferredLanguage')
      .optional()
      .isString()
      .trim()
      .withMessage('Language must be a string'),
    handleValidationErrors,
  ],

  // Upload user document
  uploadUserDocument: [
    body('userId')
      .isMongoId()
      .withMessage('User ID must be valid'),
    body('documentType')
      .isIn(['aadhar', 'pan', 'gst', 'certificate', 'license', 'incorporation', 'other'])
      .withMessage('Invalid document type'),
    body('documentName')
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Document name is required'),
    body('documentUrl')
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Document URL is required'),
    handleValidationErrors,
  ],

  // Get user documents
  getUserDocuments: [
    param('userId')
      .isMongoId()
      .withMessage('User ID must be valid'),
    query('status')
      .optional()
      .isIn(['pending', 'verified', 'rejected', 'expired'])
      .withMessage('Invalid status'),
    query('documentType')
      .optional()
      .isIn(['aadhar', 'pan', 'gst', 'certificate', 'license', 'incorporation', 'other'])
      .withMessage('Invalid document type'),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be positive'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    handleValidationErrors,
  ],

  // Get user activity
  getUserActivity: [
    param('userId')
      .isMongoId()
      .withMessage('User ID must be valid'),
    query('actionType')
      .optional()
      .isIn(['login', 'logout', 'profile_update', 'document_upload', 'tender_applied', 'bid_placed', 'settings_changed', 'password_changed', 'other'])
      .withMessage('Invalid action type'),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be positive'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    handleValidationErrors,
  ],

  // Log user activity
  logUserActivity: [
    body('userId')
      .isMongoId()
      .withMessage('User ID must be valid'),
    body('action')
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Action is required'),
    body('actionType')
      .isIn(['login', 'logout', 'profile_update', 'document_upload', 'tender_applied', 'bid_placed', 'settings_changed', 'password_changed', 'other'])
      .withMessage('Invalid action type'),
    handleValidationErrors,
  ],

  // Get all users
  getAllUsers: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be positive'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('search')
      .optional()
      .isString()
      .trim()
      .withMessage('Search must be a string'),
    handleValidationErrors,
  ],

  // Delete user document
  deleteUserDocument: [
    param('documentId')
      .isMongoId()
      .withMessage('Document ID must be valid'),
    handleValidationErrors,
  ],
};

module.exports = usersValidators;
