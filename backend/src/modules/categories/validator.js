const { body, param, query, validationResult } = require('express-validator');
const {
  CATEGORY_STATUS_VALUES,
  CATEGORY_TYPE_VALUES,
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

const categoriesValidators = {
  createCategory: [
    body('name')
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Category name is required')
      .isLength({ max: 200 })
      .withMessage('Category name must be max 200 characters'),
    body('description')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Description must be max 1000 characters'),
    body('parentCategory')
      .optional()
      .isMongoId()
      .withMessage('Parent category must be valid'),
    body('type')
      .optional()
      .isIn(CATEGORY_TYPE_VALUES)
      .withMessage('Invalid category type'),
    body('status')
      .optional()
      .isIn(CATEGORY_STATUS_VALUES)
      .withMessage('Invalid category status'),
    body('icon')
      .optional()
      .isString()
      .trim()
      .withMessage('Icon must be a string'),
    body('color')
      .optional()
      .isString()
      .trim()
      .withMessage('Color must be a string'),
    body('order')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Order must be non-negative'),
    body('isFeatured')
      .optional()
      .isBoolean()
      .withMessage('isFeatured must be boolean'),
    handleValidationErrors,
  ],

  getCategoryById: [
    param('categoryId')
      .isMongoId()
      .withMessage('Category ID must be valid'),
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
      .isLength({ max: 200 })
      .withMessage('Category name must be max 200 characters'),
    body('description')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Description must be max 1000 characters'),
    body('parentCategory')
      .optional()
      .isMongoId()
      .withMessage('Parent category must be valid'),
    body('type')
      .optional()
      .isIn(CATEGORY_TYPE_VALUES)
      .withMessage('Invalid category type'),
    body('status')
      .optional()
      .isIn(CATEGORY_STATUS_VALUES)
      .withMessage('Invalid category status'),
    body('icon')
      .optional()
      .isString()
      .trim()
      .withMessage('Icon must be a string'),
    body('color')
      .optional()
      .isString()
      .trim()
      .withMessage('Color must be a string'),
    body('order')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Order must be non-negative'),
    body('isFeatured')
      .optional()
      .isBoolean()
      .withMessage('isFeatured must be boolean'),
    handleValidationErrors,
  ],

  deleteCategory: [
    param('categoryId')
      .isMongoId()
      .withMessage('Category ID must be valid'),
    handleValidationErrors,
  ],

  restoreCategory: [
    param('categoryId')
      .isMongoId()
      .withMessage('Category ID must be valid'),
    handleValidationErrors,
  ],

  getAllCategories: [
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
      .isIn(CATEGORY_STATUS_VALUES)
      .withMessage('Invalid category status'),
    query('type')
      .optional()
      .isIn(CATEGORY_TYPE_VALUES)
      .withMessage('Invalid category type'),
    query('parentCategory')
      .optional()
      .isMongoId()
      .withMessage('Parent category must be valid'),
    query('isFeatured')
      .optional()
      .isIn(['true', 'false'])
      .withMessage('isFeatured must be true or false'),
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

  searchCategories: [
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

  getCategoryTree: [
    query('status')
      .optional()
      .isIn(CATEGORY_STATUS_VALUES)
      .withMessage('Invalid category status'),
    handleValidationErrors,
  ],
};

module.exports = categoriesValidators;