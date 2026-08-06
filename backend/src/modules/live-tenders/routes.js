const express = require('express');
const liveTenderController = require('./controller');
const { protect, authorize } = require('../../middleware/authMiddleware');
const { ROLES } = require('../auth/constants');

const router = express.Router();

/**
 * Public Routes - No authentication required
 */
router.get('/', liveTenderController.getLiveTenders);
router.get('/states', liveTenderController.getStates);
router.get('/departments', liveTenderController.getDepartments);
router.get('/categories', liveTenderController.getCategories);
router.get('/statistics', liveTenderController.getStatistics);
router.get('/sync-status', liveTenderController.getSyncStatus);
router.get('/:cpppId', liveTenderController.getTenderById);

/**
 * Admin Only Routes - Authentication required
 */
router.post('/manual-sync', protect, authorize(ROLES.ADMIN), liveTenderController.manualSync);
router.delete('/cache', protect, authorize(ROLES.ADMIN), liveTenderController.clearCache);

module.exports = router;