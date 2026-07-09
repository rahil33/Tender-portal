const { body, param, query, validationResult } = require('express-validator');
const {
  ORGANIZATION_TYPE_VALUES,
  VERIFICATION_STATUS_VALUES,
  MEMBER_ROLE_VALUES,
  DOCUMENT_TYPE_VALUES,
  DOCUMENT_STATUS_VALUES,
  MAX_LIMIT,
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

const organizationsValidators = {
  createOrganization: [
    body('name')
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Organization name is required')
      .isLength({ max: 200 })
      .withMessage('Organization name must be max 200 characters'),
    body('ownerId')
      .optional()
      .isMongoId()
      .withMessage('Owner ID must be valid'),
    body('type')
      .optional()
      .isIn(ORGANIZATION_TYPE_VALUES)
      .withMessage('Invalid organization type'),
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
    body('gstNumber')
      .optional()
      .isString()
      .trim()
      .withMessage('GST number must be a string'),
    body('panNumber')
      .optional()
      .isString()
      .trim()
      .withMessage('PAN number must be a string'),
    body('description')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Description must be max 1000 characters'),
    handleValidationErrors,
  ],

  getOrganizationById: [
    param('organizationId')
      .isMongoId()
      .withMessage('Organization ID must be valid'),
    handleValidationErrors,
  ],

  updateOrganization: [
    param('organizationId')
      .isMongoId()
      .withMessage('Organization ID must be valid'),
    body('name')
      .optional()
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Organization name cannot be empty'),
    body('type')
      .optional()
      .isIn(ORGANIZATION_TYPE_VALUES)
      .withMessage('Invalid organization type'),
    body('isFeatured')
      .optional()
      .isBoolean()
      .withMessage('isFeatured must be boolean'),
    body('featuredOrder')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Featured order must be non-negative'),
    handleValidationErrors,
  ],

  getAllOrganizations: [
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
      .isIn(ORGANIZATION_TYPE_VALUES)
      .withMessage('Invalid organization type'),
    query('verificationStatus')
      .optional()
      .isIn(VERIFICATION_STATUS_VALUES)
      .withMessage('Invalid verification status'),
    handleValidationErrors,
  ],

  searchOrganizations: [
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
    handleValidationErrors,
  ],

  getUserOrganizations: [
    param('userId')
      .isMongoId()
      .withMessage('User ID must be valid'),
    handleValidationErrors,
  ],

  verifyOrganization: [
    param('organizationId')
      .isMongoId()
      .withMessage('Organization ID must be valid'),
    body('status')
      .isIn(VERIFICATION_STATUS_VALUES)
      .withMessage('Invalid verification status'),
    body('verificationNotes')
      .optional()
      .isString()
      .trim()
      .withMessage('Verification notes must be a string'),
    handleValidationErrors,
  ],

  addMember: [
    body('organizationId')
      .isMongoId()
      .withMessage('Organization ID must be valid'),
    body('userId')
      .isMongoId()
      .withMessage('User ID must be valid'),
    body('role')
      .optional()
      .isIn(MEMBER_ROLE_VALUES)
      .withMessage('Invalid member role'),
    handleValidationErrors,
  ],

  getMembers: [
    param('organizationId')
      .isMongoId()
      .withMessage('Organization ID must be valid'),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be positive'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: MAX_LIMIT })
      .withMessage(`Limit must be between 1 and ${MAX_LIMIT}`),
    handleValidationErrors,
  ],

  updateMember: [
    param('memberId')
      .isMongoId()
      .withMessage('Member ID must be valid'),
    body('role')
      .optional()
      .isIn(MEMBER_ROLE_VALUES)
      .withMessage('Invalid member role'),
    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be boolean'),
    handleValidationErrors,
  ],

  removeMember: [
    param('memberId')
      .isMongoId()
      .withMessage('Member ID must be valid'),
    handleValidationErrors,
  ],

  uploadDocument: [
    body('organizationId')
      .isMongoId()
      .withMessage('Organization ID must be valid'),
    body('documentType')
      .isIn(DOCUMENT_TYPE_VALUES)
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

  getDocuments: [
    param('organizationId')
      .isMongoId()
      .withMessage('Organization ID must be valid'),
    query('status')
      .optional()
      .isIn(DOCUMENT_STATUS_VALUES)
      .withMessage('Invalid document status'),
    query('documentType')
      .optional()
      .isIn(DOCUMENT_TYPE_VALUES)
      .withMessage('Invalid document type'),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be positive'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: MAX_LIMIT })
      .withMessage(`Limit must be between 1 and ${MAX_LIMIT}`),
    handleValidationErrors,
  ],

  deleteDocument: [
    param('documentId')
      .isMongoId()
      .withMessage('Document ID must be valid'),
    handleValidationErrors,
  ],

  updateDocumentVerification: [
    param('documentId')
      .isMongoId()
      .withMessage('Document ID must be valid'),
    body('status')
      .isIn(DOCUMENT_STATUS_VALUES)
      .withMessage('Invalid document status'),
    body('verificationNotes')
      .optional()
      .isString()
      .trim()
      .withMessage('Verification notes must be a string'),
    handleValidationErrors,
  ],
};

module.exports = organizationsValidators;
