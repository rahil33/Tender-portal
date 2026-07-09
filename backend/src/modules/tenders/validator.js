const { body, param, query, validationResult } = require('express-validator');
const {
  TENDER_STATUS_VALUES,
  TENDER_CATEGORY_VALUES,
  TENDER_VISIBILITY_VALUES,
  DOCUMENT_TYPE_VALUES,
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

const tendersValidators = {
  createTender: [
    body('title')
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Tender title is required')
      .isLength({ max: 300 })
      .withMessage('Tender title must be max 300 characters'),
    body('category')
      .isIn(TENDER_CATEGORY_VALUES)
      .withMessage('Invalid tender category'),
    body('description')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 5000 })
      .withMessage('Description must be max 5000 characters'),
    body('visibility')
      .optional()
      .isIn(TENDER_VISIBILITY_VALUES)
      .withMessage('Invalid tender visibility'),
    body('budget.estimated')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Estimated budget must be non-negative'),
    body('budget.currency')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 3 })
      .withMessage('Currency must be max 3 characters'),
    body('budget.budgetType')
      .optional()
      .isIn(['fixed', 'range'])
      .withMessage('Budget type must be fixed or range'),
    body('budget.minBudget')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Min budget must be non-negative'),
    body('budget.maxBudget')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Max budget must be non-negative'),
    body('submissionDeadline')
      .isISO8601()
      .withMessage('Submission deadline must be a valid date')
      .custom((value) => {
        if (new Date(value) <= new Date()) {
          throw new Error('Submission deadline must be in the future');
        }
        return true;
      }),
    body('openingDate')
      .optional()
      .isISO8601()
      .withMessage('Opening date must be a valid date'),
    body('evaluationCriteria')
      .optional()
      .isArray()
      .withMessage('Evaluation criteria must be an array'),
    body('evaluationCriteria.*.criteriaType')
      .optional()
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Criteria type is required'),
    body('evaluationCriteria.*.name')
      .optional()
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Criteria name is required'),
    body('evaluationCriteria.*.weightage')
      .optional()
      .isFloat({ min: 0, max: 100 })
      .withMessage('Weightage must be between 0 and 100'),
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
    body('location')
      .optional()
      .isString()
      .trim()
      .withMessage('Location must be a string'),
    body('contactPerson.name')
      .optional()
      .isString()
      .trim()
      .withMessage('Contact person name must be a string'),
    body('contactPerson.email')
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage('Contact person email must be valid'),
    body('contactPerson.phone')
      .optional()
      .isString()
      .trim()
      .withMessage('Contact person phone must be a string'),
    handleValidationErrors,
  ],

  getTenderById: [
    param('tenderId')
      .isMongoId()
      .withMessage('Tender ID must be valid'),
    handleValidationErrors,
  ],

  updateTender: [
    param('tenderId')
      .isMongoId()
      .withMessage('Tender ID must be valid'),
    body('title')
      .optional()
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Tender title cannot be empty')
      .isLength({ max: 300 })
      .withMessage('Tender title must be max 300 characters'),
    body('category')
      .optional()
      .isIn(TENDER_CATEGORY_VALUES)
      .withMessage('Invalid tender category'),
    body('description')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 5000 })
      .withMessage('Description must be max 5000 characters'),
    body('visibility')
      .optional()
      .isIn(TENDER_VISIBILITY_VALUES)
      .withMessage('Invalid tender visibility'),
    body('budget.estimated')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Estimated budget must be non-negative'),
    body('budget.currency')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 3 })
      .withMessage('Currency must be max 3 characters'),
    body('budget.budgetType')
      .optional()
      .isIn(['fixed', 'range'])
      .withMessage('Budget type must be fixed or range'),
    body('budget.minBudget')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Min budget must be non-negative'),
    body('budget.maxBudget')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Max budget must be non-negative'),
    body('submissionDeadline')
      .optional()
      .isISO8601()
      .withMessage('Submission deadline must be a valid date'),
    body('openingDate')
      .optional()
      .isISO8601()
      .withMessage('Opening date must be a valid date'),
    body('evaluationCriteria')
      .optional()
      .isArray()
      .withMessage('Evaluation criteria must be an array'),
    body('evaluationCriteria.*.criteriaType')
      .optional()
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Criteria type is required'),
    body('evaluationCriteria.*.name')
      .optional()
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Criteria name is required'),
    body('evaluationCriteria.*.weightage')
      .optional()
      .isFloat({ min: 0, max: 100 })
      .withMessage('Weightage must be between 0 and 100'),
    body('tags')
      .optional()
      .isArray()
      .withMessage('Tags must be an array'),
    body('location')
      .optional()
      .isString()
      .trim()
      .withMessage('Location must be a string'),
    body('contactPerson.name')
      .optional()
      .isString()
      .trim()
      .withMessage('Contact person name must be a string'),
    body('contactPerson.email')
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage('Contact person email must be valid'),
    body('contactPerson.phone')
      .optional()
      .isString()
      .trim()
      .withMessage('Contact person phone must be a string'),
    handleValidationErrors,
  ],

  deleteTender: [
    param('tenderId')
      .isMongoId()
      .withMessage('Tender ID must be valid'),
    handleValidationErrors,
  ],

  getAllTenders: [
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
      .isIn(TENDER_STATUS_VALUES)
      .withMessage('Invalid tender status'),
    query('category')
      .optional()
      .isIn(TENDER_CATEGORY_VALUES)
      .withMessage('Invalid tender category'),
    query('visibility')
      .optional()
      .isIn(TENDER_VISIBILITY_VALUES)
      .withMessage('Invalid tender visibility'),
    query('isArchived')
      .optional()
      .isIn(['true', 'false'])
      .withMessage('isArchived must be true or false'),
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

  searchTenders: [
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

  publishTender: [
    param('tenderId')
      .isMongoId()
      .withMessage('Tender ID must be valid'),
    handleValidationErrors,
  ],

  unpublishTender: [
    param('tenderId')
      .isMongoId()
      .withMessage('Tender ID must be valid'),
    handleValidationErrors,
  ],

  closeTender: [
    param('tenderId')
      .isMongoId()
      .withMessage('Tender ID must be valid'),
    handleValidationErrors,
  ],

  cancelTender: [
    param('tenderId')
      .isMongoId()
      .withMessage('Tender ID must be valid'),
    body('cancellationReason')
      .optional()
      .isString()
      .trim()
      .withMessage('Cancellation reason must be a string'),
    handleValidationErrors,
  ],

  archiveTender: [
    param('tenderId')
      .isMongoId()
      .withMessage('Tender ID must be valid'),
    handleValidationErrors,
  ],

  unarchiveTender: [
    param('tenderId')
      .isMongoId()
      .withMessage('Tender ID must be valid'),
    handleValidationErrors,
  ],

  addDocument: [
    param('tenderId')
      .isMongoId()
      .withMessage('Tender ID must be valid'),
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
    param('tenderId')
      .isMongoId()
      .withMessage('Tender ID must be valid'),
    param('documentId')
      .isMongoId()
      .withMessage('Document ID must be valid'),
    handleValidationErrors,
  ],
};

module.exports = tendersValidators;
