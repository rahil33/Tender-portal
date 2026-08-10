const express = require('express');
const { query, validationResult } = require('express-validator');
const liveTenderController = require('./controller');
const { protect, authorize } = require('../../middleware/authMiddleware');
const { ROLES } = require('../auth/constants');
const { MAX_LIMIT } = require('./constants');

const router = express.Router();

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Invalid search query parameters',
      errors: errors.array().map((err) => ({
        field: err.param,
        message: err.msg,
      })),
    });
  }
  next();
};

/**
 * Query validation for the GeM search/list endpoint. Sanitizes every consumer
 * supplied value so malformed input returns a clean 400 and never reaches
 * MongoDB as an invalid/expensive query.
 */
const liveTenderQueryValidator = [
  query('search').optional().isString().trim().isLength({ min: 0, max: 200 }).withMessage('Search must be a string of at most 200 characters'),
  query('q').optional().isString().trim().isLength({ min: 0, max: 200 }).withMessage('Search must be a string of at most 200 characters'),
  query('category').optional().isString().trim().isLength({ min: 0, max: 100 }).withMessage('Category must be a string of at most 100 characters'),
  query('location').optional().isString().trim().isLength({ min: 0, max: 100 }).withMessage('Location must be a string of at most 100 characters'),
  query('state').optional().isString().trim().isLength({ min: 0, max: 100 }).withMessage('State must be a string of at most 100 characters'),
  query('department').optional().isString().trim().isLength({ min: 0, max: 100 }).withMessage('Department must be a string of at most 100 characters'),
  query('organization').optional().isString().trim().isLength({ min: 0, max: 100 }).withMessage('Organization must be a string of at most 100 characters'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: MAX_LIMIT }).withMessage(`Limit must be between 1 and ${MAX_LIMIT}`),
  query('sortBy').optional().isIn(['createdAt', 'submissionDeadline']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Invalid sort order'),
  handleValidationErrors,
];

/**
 * Public Routes - No authentication required
 */
router.get('/', liveTenderQueryValidator, liveTenderController.getLiveTenders);
router.get('/states', liveTenderController.getStates);
router.get('/departments', liveTenderController.getDepartments);
router.get('/categories', liveTenderController.getCategories);
router.get('/statistics', liveTenderController.getStatistics);
router.get('/sync-status', liveTenderController.getSyncStatus);
router.get('/:tenderId', liveTenderController.getTenderById);

/**
 * Admin Only Routes - Authentication required
 */
router.post('/manual-sync', protect, authorize(ROLES.ADMIN), liveTenderController.manualSync);
router.delete('/cache', protect, authorize(ROLES.ADMIN), liveTenderController.clearCache);

module.exports = router;