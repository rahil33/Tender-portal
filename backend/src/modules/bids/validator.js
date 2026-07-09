const { body, param, query, validationResult } = require('express-validator');
const {
  BID_STATUS_VALUES,
  BID_TYPE_VALUES,
  DOCUMENT_TYPE_VALUES,
  EVALUATION_STATUS_VALUES,
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

const bidsValidators = {
  createBid: [
    body('tenderId')
      .isMongoId()
      .withMessage('Tender ID must be valid'),
    body('organizationId')
      .isMongoId()
      .withMessage('Organization ID must be valid'),
    body('bidType')
      .optional()
      .isIn(BID_TYPE_VALUES)
      .withMessage('Invalid bid type'),
    body('bidAmount')
      .isFloat({ min: 0 })
      .withMessage('Bid amount must be non-negative'),
    body('currency')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 3 })
      .withMessage('Currency must be max 3 characters'),
    body('technicalProposal')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 10000 })
      .withMessage('Technical proposal must be max 10000 characters'),
    body('financialProposal')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 5000 })
      .withMessage('Financial proposal must be max 5000 characters'),
    handleValidationErrors,
  ],

  getBidById: [
    param('bidId')
      .isMongoId()
      .withMessage('Bid ID must be valid'),
    handleValidationErrors,
  ],

  updateBid: [
    param('bidId')
      .isMongoId()
      .withMessage('Bid ID must be valid'),
    body('bidAmount')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Bid amount must be non-negative'),
    body('currency')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 3 })
      .withMessage('Currency must be max 3 characters'),
    body('technicalProposal')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 10000 })
      .withMessage('Technical proposal must be max 10000 characters'),
    body('financialProposal')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 5000 })
      .withMessage('Financial proposal must be max 5000 characters'),
    body('changes')
      .optional()
      .isString()
      .trim()
      .withMessage('Changes description must be a string'),
    handleValidationErrors,
  ],

  deleteBid: [
    param('bidId')
      .isMongoId()
      .withMessage('Bid ID must be valid'),
    handleValidationErrors,
  ],

  submitBid: [
    param('bidId')
      .isMongoId()
      .withMessage('Bid ID must be valid'),
    handleValidationErrors,
  ],

  withdrawBid: [
    param('bidId')
      .isMongoId()
      .withMessage('Bid ID must be valid'),
    body('withdrawalReason')
      .optional()
      .isString()
      .trim()
      .withMessage('Withdrawal reason must be a string'),
    handleValidationErrors,
  ],

  getAllBids: [
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
      .isIn(BID_STATUS_VALUES)
      .withMessage('Invalid bid status'),
    query('bidType')
      .optional()
      .isIn(BID_TYPE_VALUES)
      .withMessage('Invalid bid type'),
    query('evaluationStatus')
      .optional()
      .isIn(EVALUATION_STATUS_VALUES)
      .withMessage('Invalid evaluation status'),
    query('tenderId')
      .optional()
      .isMongoId()
      .withMessage('Tender ID must be valid'),
    query('vendorId')
      .optional()
      .isMongoId()
      .withMessage('Vendor ID must be valid'),
    query('organizationId')
      .optional()
      .isMongoId()
      .withMessage('Organization ID must be valid'),
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

  searchBids: [
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

  addDocument: [
    param('bidId')
      .isMongoId()
      .withMessage('Bid ID must be valid'),
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
    body('fileSize')
      .optional()
      .isInt({ min: 0 })
      .withMessage('File size must be non-negative'),
    body('mimeType')
      .optional()
      .isString()
      .trim()
      .withMessage('MIME type must be a string'),
    handleValidationErrors,
  ],

  removeDocument: [
    param('bidId')
      .isMongoId()
      .withMessage('Bid ID must be valid'),
    param('documentId')
      .isMongoId()
      .withMessage('Document ID must be valid'),
    handleValidationErrors,
  ],

  evaluateBid: [
    param('bidId')
      .isMongoId()
      .withMessage('Bid ID must be valid'),
    body('technicalScore')
      .optional()
      .isFloat({ min: 0, max: 100 })
      .withMessage('Technical score must be between 0 and 100'),
    body('financialScore')
      .optional()
      .isFloat({ min: 0, max: 100 })
      .withMessage('Financial score must be between 0 and 100'),
    body('technicalRemarks')
      .optional()
      .isString()
      .trim()
      .withMessage('Technical remarks must be a string'),
    body('financialRemarks')
      .optional()
      .isString()
      .trim()
      .withMessage('Financial remarks must be a string'),
    body('overallRemarks')
      .optional()
      .isString()
      .trim()
      .withMessage('Overall remarks must be a string'),
    body('isRecommended')
      .optional()
      .isBoolean()
      .withMessage('isRecommended must be boolean'),
    handleValidationErrors,
  ],

  updateBidStatus: [
    param('bidId')
      .isMongoId()
      .withMessage('Bid ID must be valid'),
    body('status')
      .isIn(BID_STATUS_VALUES)
      .withMessage('Invalid bid status'),
    handleValidationErrors,
  ],
};

module.exports = bidsValidators;