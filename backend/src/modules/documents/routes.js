const express = require('express');
const documentsController = require('./controller');
const documentsValidators = require('./validator');
const { protect, authorize } = require('../../middleware/authMiddleware');
const { ROLES } = require('../auth/constants');

const router = express.Router();

router.use(protect);

/**
 * Document CRUD Routes
 */
router.post('/', protect, authorize(ROLES.VENDOR, ROLES.BUYER, ROLES.ADMIN), documentsValidators.uploadDocument, documentsController.uploadDocument);
router.get('/', protect, authorize(ROLES.VENDOR, ROLES.BUYER, ROLES.ADMIN), documentsValidators.getAllDocuments, documentsController.getAllDocuments);
router.get('/search', protect, authorize(ROLES.VENDOR, ROLES.BUYER, ROLES.ADMIN), documentsValidators.searchDocuments, documentsController.searchDocuments);
router.get('/statistics', protect, authorize(ROLES.ADMIN), documentsController.getDocumentStatistics);
router.get('/tender/:tenderId', protect, authorize(ROLES.VENDOR, ROLES.BUYER, ROLES.ADMIN), documentsController.getTenderDocuments);
router.get('/bid/:bidId', protect, authorize(ROLES.VENDOR, ROLES.BUYER, ROLES.ADMIN), documentsController.getBidDocuments);
router.get('/organization/:organizationId', protect, authorize(ROLES.VENDOR, ROLES.BUYER, ROLES.ADMIN), documentsController.getOrganizationDocuments);
router.get('/:documentId', protect, authorize(ROLES.VENDOR, ROLES.BUYER, ROLES.ADMIN), documentsValidators.getDocumentById, documentsController.getDocumentById);
router.put('/:documentId', protect, authorize(ROLES.VENDOR, ROLES.BUYER, ROLES.ADMIN), documentsValidators.updateDocument, documentsController.updateDocument);
router.delete('/:documentId', protect, authorize(ROLES.VENDOR, ROLES.BUYER, ROLES.ADMIN), documentsValidators.deleteDocument, documentsController.deleteDocument);

/**
 * Document Management Routes
 */
router.put('/:documentId/restore', protect, authorize(ROLES.VENDOR, ROLES.BUYER, ROLES.ADMIN), documentsValidators.restoreDocument, documentsController.restoreDocument);
router.get('/:documentId/download', protect, authorize(ROLES.VENDOR, ROLES.BUYER, ROLES.ADMIN), documentsValidators.downloadDocument, documentsController.downloadDocument);
router.get('/:documentId/preview', protect, authorize(ROLES.VENDOR, ROLES.BUYER, ROLES.ADMIN), documentsValidators.downloadDocument, documentsController.previewDocument);
router.post('/:documentId/versions', protect, authorize(ROLES.VENDOR, ROLES.BUYER, ROLES.ADMIN), documentsValidators.uploadNewVersion, documentsController.uploadNewVersion);
router.put('/:documentId/replace', protect, authorize(ROLES.VENDOR, ROLES.BUYER, ROLES.ADMIN), documentsValidators.uploadDocument, documentsController.replaceDocument);

module.exports = router;