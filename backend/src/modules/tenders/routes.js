const express = require('express');
const tendersController = require('./controller');
const tendersValidators = require('./validator');
const { protect } = require('../../middleware/authMiddleware');

const router = express.Router();

/**
 * Public Tender Browsing Routes (no login required)
 */
router.get('/', tendersValidators.getAllTenders, tendersController.getAllTenders);
router.get('/search', tendersValidators.searchTenders, tendersController.searchTenders);
router.get('/statistics', tendersController.getTenderStatistics);
router.get('/:tenderId', tendersValidators.getTenderById, tendersController.getTenderById);
/**
 * Tender CRUD Routes (login required)
 */
router.post('/', protect, tendersValidators.createTender, tendersController.createTender);
router.put('/:tenderId', protect, tendersValidators.updateTender, tendersController.updateTender);
router.delete('/:tenderId', protect, tendersValidators.deleteTender, tendersController.deleteTender);

/**
 * Tender Status Management Routes (login required)
 */
router.put('/:tenderId/publish', protect, tendersValidators.publishTender, tendersController.publishTender);
router.put('/:tenderId/unpublish', protect, tendersValidators.unpublishTender, tendersController.unpublishTender);
router.put('/:tenderId/close', protect, tendersValidators.closeTender, tendersController.closeTender);
router.put('/:tenderId/cancel', protect, tendersValidators.cancelTender, tendersController.cancelTender);

/**
 * Tender Archive Routes (login required)
 */
router.put('/:tenderId/archive', protect, tendersValidators.archiveTender, tendersController.archiveTender);
router.put('/:tenderId/unarchive', protect, tendersValidators.unarchiveTender, tendersController.unarchiveTender);

/**
 * Tender Document Routes (login required)
 */
router.post('/:tenderId/documents', protect, tendersValidators.addDocument, tendersController.addDocument);
router.delete('/:tenderId/documents/:documentId', protect, tendersValidators.removeDocument, tendersController.removeDocument);

module.exports = router;