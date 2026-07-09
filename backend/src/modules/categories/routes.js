const express = require('express');
const categoriesController = require('./controller');
const categoriesValidators = require('./validator');
const { protect } = require('../../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

/**
 * Category CRUD Routes
 */
router.post('/', categoriesValidators.createCategory, categoriesController.createCategory);
router.get('/', categoriesValidators.getAllCategories, categoriesController.getAllCategories);
router.get('/search', categoriesValidators.searchCategories, categoriesController.searchCategories);
router.get('/tree', categoriesValidators.getCategoryTree, categoriesController.getCategoryTree);
router.get('/featured', categoriesController.getFeaturedCategories);
router.get('/statistics', categoriesController.getCategoryStatistics);
router.get('/:categoryId', categoriesValidators.getCategoryById, categoriesController.getCategoryById);
router.put('/:categoryId', categoriesValidators.updateCategory, categoriesController.updateCategory);
router.delete('/:categoryId', categoriesValidators.deleteCategory, categoriesController.deleteCategory);

/**
 * Category Restore Route
 */
router.put('/:categoryId/restore', categoriesValidators.restoreCategory, categoriesController.restoreCategory);

module.exports = router;