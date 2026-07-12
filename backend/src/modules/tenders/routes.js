const express = require('express');
const tendersController = require('./controller');
const tendersValidators = require('./validator');
const { protect, authorize } = require('../../middleware/authMiddleware');
const { ROLES } = require('../auth/constants');

const router = express.Router();

/**
 * Public Tender Browsing Routes (no login required)
 */
router.get('/', tendersValidators.getAllTenders, tendersController.getAllTenders);
router.get('/search', tendersValidators.searchTenders, tendersController.searchTenders);
router.get('/statistics', tendersController.getTenderStatistics);
router.get('/:tenderId', tendersValidators.getTenderById, tendersController.getTenderById);

/**
 * Tender CRUD Routes (vendor/admin only)
 */
router.post('/', protect, authorize(ROLES.VENDOR, ROLES.ADMIN), tendersValidators.createTender, tendersController.createTender);
router.put('/:tenderId', protect, authorize(ROLES.VENDOR, ROLES.ADMIN), tendersValidators.updateTender, tendersController.updateTender);
router.delete('/:tenderId', protect, authorize(ROLES.VENDOR, ROLES.ADMIN), tendersValidators.deleteTender, tendersController.deleteTender);

/**
 * Tender Status Management Routes (vendor/admin only)
 */
router.put('/:tenderId/publish', protect, authorize(ROLES.VENDOR, ROLES.ADMIN), tendersValidators.publishTender, tendersController.publishTender);
router.put('/:tenderId/unpublish', protect, authorize(ROLES.VENDOR, ROLES.ADMIN), tendersValidators.unpublishTender, tendersController.unpublishTender);
router.put('/:tenderId/close', protect, authorize(ROLES.VENDOR, ROLES.ADMIN), tendersValidators.closeTender, tendersController.closeTender);
router.put('/:tenderId/cancel', protect, authorize(ROLES.VENDOR, ROLES.ADMIN), tendersValidators.cancelTender, tendersController.cancelTender);

/**
 * Tender Archive Routes (vendor/admin only)
 */
router.put('/:tenderId/archive', protect, authorize(ROLES.VENDOR, ROLES.ADMIN), tendersValidators.archiveTender, tendersController.archiveTender);
router.put('/:tenderId/unarchive', protect, authorize(ROLES.VENDOR, ROLES.ADMIN), tendersValidators.unarchiveTender, tendersController.unarchiveTender);

/**
 * Tender Document Routes (vendor/admin only)
 */
router.post('/:tenderId/documents', protect, authorize(ROLES.VENDOR, ROLES.ADMIN), tendersValidators.addDocument, tendersController.addDocument);
router.delete('/:tenderId/documents/:documentId', protect, authorize(ROLES.VENDOR, ROLES.ADMIN), tendersValidators.removeDocument, tendersController.removeDocument);

module.exports = router;