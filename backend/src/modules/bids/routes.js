const express = require('express');
const bidsController = require('./controller');
const bidsValidators = require('./validator');
const { protect } = require('../../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

/**
 * Bid CRUD Routes
 */
router.post('/', bidsValidators.createBid, bidsController.createBid);
router.get('/', bidsValidators.getAllBids, bidsController.getAllBids);
router.get('/search', bidsValidators.searchBids, bidsController.searchBids);
router.get('/statistics', bidsController.getBidStatistics);
router.get('/vendor/:vendorId', bidsController.getVendorBids);
router.get('/tender/:tenderId', bidsController.getTenderBids);
router.get('/:bidId', bidsValidators.getBidById, bidsController.getBidById);
router.put('/:bidId', bidsValidators.updateBid, bidsController.updateBid);
router.delete('/:bidId', bidsValidators.deleteBid, bidsController.deleteBid);

/**
 * Bid Status Management Routes
 */
router.put('/:bidId/submit', bidsValidators.submitBid, bidsController.submitBid);
router.put('/:bidId/withdraw', bidsValidators.withdrawBid, bidsController.withdrawBid);
router.put('/:bidId/status', bidsValidators.updateBidStatus, bidsController.updateBidStatus);

/**
 * Bid Evaluation Routes
 */
router.put('/:bidId/evaluate', bidsValidators.evaluateBid, bidsController.evaluateBid);

/**
 * Bid Document Routes
 */
router.post('/:bidId/documents', bidsValidators.addDocument, bidsController.addDocument);
router.delete('/:bidId/documents/:documentId', bidsValidators.removeDocument, bidsController.removeDocument);

module.exports = router;