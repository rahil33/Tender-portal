# Shared Validators
# Common validation rules used across multiple modules

const { body, param, query, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((err) => ({
        field: err.param,
        message: err.msg,
        value: err.value,
      })),
    });
  }
  next();
};

const paginationValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors,
];

const searchValidator = [
  query('q')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Search query must be max 200 characters'),
  handleValidationErrors,
];

const dateRangeValidator = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date'),
  handleValidationErrors,
];

const sortByValidator = [
  query('sortBy')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Sort field must be max 50 characters'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be either asc or desc'),
  handleValidationErrors,
];

const idValidator = (paramName = 'id') => [
  param(paramName)
    .isMongoId()
    .withMessage(`${paramName} must be a valid MongoDB ObjectId`),
  handleValidationErrors,
];

const emailValidator = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email must be valid'),
  handleValidationErrors,
];

const stringValidator = (fieldName, options = {}) => {
  const { required = false, min = 1, max = 200, trim = true } = options;
  
  let chain = body(fieldName);
  
  if (required) {
    chain = chain.notEmpty().withMessage(`${fieldName} is required`);
  } else {
    chain = chain.optional();
  }
  
  chain = chain.isString().withMessage(`${fieldName} must be a string`);
  
  if (trim) {
    chain = chain.trim();
  }
  
  chain = chain.isLength({ min, max }).withMessage(`${fieldName} must be between ${min} and ${max} characters`);
  
  return [chain, handleValidationErrors];
};

const numberValidator = (fieldName, options = {}) => {
  const { required = false, min, max } = options;
  
  let chain = body(fieldName);
  
  if (required) {
    chain = chain.notEmpty().withMessage(`${fieldName} is required`);
  } else {
    chain = chain.optional();
  }
  
  chain = chain.isNumeric().withMessage(`${fieldName} must be a number`);
  
  if (min !== undefined) {
    chain = chain.isFloat({ min }).withMessage(`${fieldName} must be at least ${min}`);
  }
  
  if (max !== undefined) {
    chain = chain.isFloat({ max }).withMessage(`${fieldName} must be at most ${max}`);
  }
  
  return [chain, handleValidationErrors];
};

const enumValidator = (fieldName, values, options = {}) => {
  const { required = false } = options;
  
  let chain = body(fieldName);
  
  if (required) {
    chain = chain.notEmpty().withMessage(`${fieldName} is required`);
  } else {
    chain = chain.optional();
  }
  
  chain = chain.isIn(values).withMessage(`${fieldName} must be one of: ${values.join(', ')}`);
  
  return [chain, handleValidationErrors];
};

module.exports = {
  handleValidationErrors,
  paginationValidator,
  searchValidator,
  dateRangeValidator,
  sortByValidator,
  idValidator,
  emailValidator,
  stringValidator,
  numberValidator,
  enumValidator,
};