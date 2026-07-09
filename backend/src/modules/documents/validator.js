const { body, param, query, validationResult } = require('express-validator');
const {
  DOCUMENT_STATUS_VALUES,
  DOCUMENT_TYPE_VALUES,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE,
  MIN_FILE_SIZE,
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

const documentsValidators = {
  uploadDocument: [
    body('fileName')
      .isString()
      .trim()
      .notEmpty()
      .withMessage('File name is required')
      .isLength({ max: 300 })
      .withMessage('File name must be max 300 characters'),
    body('fileUrl')
      .isString()
      .trim()
      .notEmpty()
      .withMessage('File URL is required'),
    body('fileSize')
      .isInt({ min: MIN_FILE_SIZE, max: MAX_FILE_SIZE })
      .withMessage(`File size must be between ${MIN_FILE_SIZE} and ${MAX_FILE_SIZE} bytes`),
    body('mimeType')
      .isIn(ALLOWED_MIME_TYPES)
      .withMessage('Invalid MIME type'),
    body('documentType')
      .isIn(DOCUMENT_TYPE_VALUES)
      .withMessage('Invalid document type'),
    body('title')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 300 })
      .withMessage('Title must be max 300 characters'),
    body('description')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Description must be max 1000 characters'),
    body('tenderId')
      .optional()
      .isMongoId()
      .withMessage('Tender ID must be valid'),
    body('bidId')
      .optional()
      .isMongoId()
      .withMessage('Bid ID must be valid'),
    body('organizationId')
      .optional()
      .isMongoId()
      .withMessage('Organization ID must be valid'),
    body('isPublic')
      .optional()
      .isBoolean()
      .withMessage('isPublic must be boolean'),
    body('tags')
      .optional()
      .isArray()
      .withMessage('Tags must be an array'),
    body('tags.*')
      .optional()
      .isString()
      .trim()
      .toLowerCase()
      .withMessage('Each tag must be a string'),
    handleValidationErrors,
  ],

  getDocumentById: [
    param('documentId')
      .isMongoId()
      .withMessage('Document ID must be valid'),
    handleValidationErrors,
  ],

  updateDocument: [
    param('documentId')
      .isMongoId()
      .withMessage('Document ID must be valid'),
    body('title')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 300 })
      .withMessage('Title must be max 300 characters'),
    body('description')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Description must be max 1000 characters'),
    body('documentType')
      .optional()
      .isIn(DOCUMENT_TYPE_VALUES)
      .withMessage('Invalid document type'),
    body('isPublic')
      .optional()
      .isBoolean()
      .withMessage('isPublic must be boolean'),
    body('tags')
      .optional()
      .isArray()
      .withMessage('Tags must be an array'),
    handleValidationErrors,
  ],

  deleteDocument: [
    param('documentId')
      .isMongoId()
      .withMessage('Document ID must be valid'),
    handleValidationErrors,
  ],

  restoreDocument: [
    param('documentId')
      .isMongoId()
      .withMessage('Document ID must be valid'),
    handleValidationErrors,
  ],

  downloadDocument: [
    param('documentId')
      .isMongoId()
      .withMessage('Document ID must be valid'),
    handleValidationErrors,
  ],

  getAllDocuments: [
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
      .isIn(DOCUMENT_STATUS_VALUES)
      .withMessage('Invalid document status'),
    query('documentType')
      .optional()
      .isIn(DOCUMENT_TYPE_VALUES)
      .withMessage('Invalid document type'),
    query('tenderId')
      .optional()
      .isMongoId()
      .withMessage('Tender ID must be valid'),
    query('bidId')
      .optional()
      .isMongoId()
      .withMessage('Bid ID must be valid'),
    query('organizationId')
      .optional()
      .isMongoId()
      .withMessage('Organization ID must be valid'),
    query('isPublic')
      .optional()
      .isIn(['true', 'false'])
      .withMessage('isPublic must be true or false'),
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

  searchDocuments: [
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

  uploadNewVersion: [
    param('documentId')
      .isMongoId()
      .withMessage('Document ID must be valid'),
    body('fileUrl')
      .isString()
      .trim()
      .notEmpty()
      .withMessage('File URL is required'),
    body('fileName')
      .isString()
      .trim()
      .notEmpty()
      .withMessage('File name is required'),
    body('fileSize')
      .isInt({ min: MIN_FILE_SIZE, max: MAX_FILE_SIZE })
      .withMessage(`File size must be between ${MIN_FILE_SIZE} and ${MAX_FILE_SIZE} bytes`),
    body('mimeType')
      .isIn(ALLOWED_MIME_TYPES)
      .withMessage('Invalid MIME type'),
    body('changes')
      .optional()
      .isString()
      .trim()
      .withMessage('Changes description must be a string'),
    handleValidationErrors,
  ],
};

module.exports = documentsValidators;