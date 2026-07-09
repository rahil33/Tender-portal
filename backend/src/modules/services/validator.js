const { body, param, query } = require('express-validator');
const { validationMiddleware } = require('../../middleware/validationMiddleware');

const createServiceValidator = [
  body('name').trim().notEmpty().withMessage('Service name is required').isLength({ max: 200 }),
  body('slug').trim().notEmpty().withMessage('Service slug is required').isLength({ max: 200 }),
  body('description').trim().notEmpty().withMessage('Service description is required').isLength({ max: 2000 }),
  body('shortDescription').optional().trim().isLength({ max: 500 }),
  body('category').notEmpty().withMessage('Service category is required')
    .isIn(['gem-registration', 'tender-bidding', 'consulting', 'training', 'certification', 'oem-panel', 'other']),
  body('pricing.basePrice').optional().isFloat({ min: 0 }),
  body('pricing.currency').optional().trim(),
  body('pricing.pricingType').optional().isIn(['fixed', 'starting_at', 'custom', 'range']),
  body('pricing.minPrice').optional().isFloat({ min: 0 }),
  body('pricing.maxBudget').optional().isFloat({ min: 0 }),
  body('features').optional().isArray(),
  body('features.*').trim(),
  body('deliverables').optional().isArray(),
  body('deliverables.*').trim(),
  body('timeline').optional().trim().isLength({ max: 200 }),
  body('isPopular').optional().isBoolean(),
  body('order').optional().isInt(),
  body('isPublished').optional().isBoolean(),
  body('thumbnail').optional().trim(),
  body('images').optional().isArray(),
  body('faqs').optional().isArray(),
  validationMiddleware,
];

const updateServiceValidator = [
  param('id').isMongoId().withMessage('Invalid service ID'),
  body('name').optional().trim().isLength({ max: 200 }),
  body('slug').optional().trim().isLength({ max: 200 }),
  body('description').optional().trim().isLength({ max: 2000 }),
  body('shortDescription').optional().trim().isLength({ max: 500 }),
  body('category').optional().isIn(['gem-registration', 'tender-bidding', 'consulting', 'training', 'certification', 'oem-panel', 'other']),
  body('pricing.basePrice').optional().isFloat({ min: 0 }),
  body('pricing.currency').optional().trim(),
  body('pricing.pricingType').optional().isIn(['fixed', 'starting_at', 'custom', 'range']),
  body('pricing.minPrice').optional().isFloat({ min: 0 }),
  body('pricing.maxBudget').optional().isFloat({ min: 0 }),
  body('features').optional().isArray(),
  body('features.*').trim(),
  body('deliverables').optional().isArray(),
  body('deliverables.*').trim(),
  body('timeline').optional().trim().isLength({ max: 200 }),
  body('isPopular').optional().isBoolean(),
  body('order').optional().isInt(),
  body('isPublished').optional().isBoolean(),
  body('thumbnail').optional().trim(),
  body('images').optional().isArray(),
  body('faqs').optional().isArray(),
  validationMiddleware,
];

const getServiceValidator = [
  param('slug').trim().notEmpty().withMessage('Service slug is required'),
  validationMiddleware,
];

const getServiceByIdValidator = [
  param('id').isMongoId().withMessage('Invalid service ID'),
  validationMiddleware,
];

const getAllServicesValidator = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('category').optional().isIn(['gem-registration', 'tender-bidding', 'consulting', 'training', 'certification', 'oem-panel', 'other']),
  query('isPopular').optional().isBoolean(),
  query('sortBy').optional().isIn(['name', 'order', 'createdAt', 'updatedAt']),
  query('sortOrder').optional().isIn(['asc', 'desc']),
  validationMiddleware,
];

const searchServicesValidator = [
  query('q').trim().notEmpty().withMessage('Search term is required'),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  validationMiddleware,
];

module.exports = {
  createServiceValidator,
  updateServiceValidator,
  getServiceValidator,
  getServiceByIdValidator,
  getAllServicesValidator,
  searchServicesValidator,
};