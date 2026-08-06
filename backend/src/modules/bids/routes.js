const express = require('express');
const bidsController = require('./controller');
const bidsValidators = require('./validator');
const { protect, authorize } = require('../../middleware/authMiddleware');
const { validateBidOwnership, validateBidDeadline } = require('../../middleware/ownershipMiddleware');
const { ROLES } = require('../auth/constants');

const router = express.Router();

/**
 * Bid Routes - All require authentication
 * Buyers: can create bids, view own bids
 * Vendors: can view bids on their tenders
 * Admin/Evaluator: can view all bids, evaluate bids
 */
router.use(protect);

/**
 * Bid CRUD Routes
 */
router.post('/', protect, authorize(ROLES.BUYER, ROLES.VENDOR), bidsValidators.createBid, bidsController.createBid);
router.get('/', protect, authorize(ROLES.ADMIN, ROLES.EVALUATOR, ROLES.VENDOR, ROLES.BUYER), bidsValidators.getAllBids, bidsController.getAllBids);
router.get('/search', protect, authorize(ROLES.ADMIN, ROLES.EVALUATOR, ROLES.VENDOR, ROLES.BUYER), bidsValidators.searchBids, bidsController.searchBids);
/**
 * Bid Statistics & Analytics Routes
 */
router.get('/statistics', protect, authorize(ROLES.ADMIN, ROLES.EVALUATOR), bidsController.getBidStatistics);
router.get('/analytics', protect, authorize(ROLES.BUYER, ROLES.VENDOR), bidsController.getBuyerAnalytics);
router.get('/vendor/:vendorId', protect, authorize(ROLES.ADMIN, ROLES.EVALUATOR, ROLES.VENDOR), bidsController.getVendorBids);
router.get('/tender/:tenderId', protect, authorize(ROLES.ADMIN, ROLES.EVALUATOR, ROLES.VENDOR), bidsController.getTenderBids);
router.get('/:bidId', protect, authorize(ROLES.ADMIN, ROLES.EVALUATOR, ROLES.VENDOR, ROLES.BUYER), bidsValidators.getBidById, bidsController.getBidById);
router.put('/:bidId', protect, authorize(ROLES.BUYER, ROLES.VENDOR), validateBidOwnership, validateBidDeadline, bidsValidators.updateBid, bidsController.updateBid);
router.delete('/:bidId', protect, authorize(ROLES.BUYER, ROLES.VENDOR), validateBidOwnership, bidsValidators.deleteBid, bidsController.deleteBid);

/**
 * Bid Status Management Routes (buyer/vendor own bids)
 * Ownership validation ensures only bid owner can modify
 */
router.put('/:bidId/submit', protect, authorize(ROLES.BUYER, ROLES.VENDOR), validateBidOwnership, validateBidDeadline, bidsValidators.submitBid, bidsController.submitBid);
router.put('/:bidId/withdraw', protect, authorize(ROLES.BUYER, ROLES.VENDOR), validateBidOwnership, bidsValidators.withdrawBid, bidsController.withdrawBid);
router.put('/:bidId/status', protect, authorize(ROLES.ADMIN, ROLES.EVALUATOR), bidsValidators.updateBidStatus, bidsController.updateBidStatus);

/**
 * Bid Evaluation Routes (admin/evaluator only)
 */
router.put('/:bidId/evaluate', protect, authorize(ROLES.ADMIN, ROLES.EVALUATOR), bidsValidators.evaluateBid, bidsController.evaluateBid);

/**
 * Bid Document Routes
 * Only bid owner can add/remove documents
 */
router.post('/:bidId/documents', protect, authorize(ROLES.BUYER, ROLES.VENDOR), validateBidOwnership, validateBidDeadline, bidsValidators.addDocument, bidsController.addDocument);
router.delete('/:bidId/documents/:documentId', protect, authorize(ROLES.BUYER, ROLES.VENDOR), validateBidOwnership, validateBidDeadline, bidsValidators.removeDocument, bidsController.removeDocument);

module.exports = router;