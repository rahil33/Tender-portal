const express = require('express');
const documentsController = require('./controller');
const documentsValidators = require('./validator');
const { protect } = require('../../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

/**
 * Document CRUD Routes
 */
router.post('/', documentsValidators.uploadDocument, documentsController.uploadDocument);
router.get('/', documentsValidators.getAllDocuments, documentsController.getAllDocuments);
router.get('/search', documentsValidators.searchDocuments, documentsController.searchDocuments);
router.get('/statistics', documentsController.getDocumentStatistics);
router.get('/tender/:tenderId', documentsController.getTenderDocuments);
router.get('/bid/:bidId', documentsController.getBidDocuments);
router.get('/organization/:organizationId', documentsController.getOrganizationDocuments);
router.get('/:documentId', documentsValidators.getDocumentById, documentsController.getDocumentById);
router.put('/:documentId', documentsValidators.updateDocument, documentsController.updateDocument);
router.delete('/:documentId', documentsValidators.deleteDocument, documentsController.deleteDocument);

/**
 * Document Management Routes
 */
router.put('/:documentId/restore', documentsValidators.restoreDocument, documentsController.restoreDocument);
router.get('/:documentId/download', documentsValidators.downloadDocument, documentsController.downloadDocument);
router.post('/:documentId/versions', documentsValidators.uploadNewVersion, documentsController.uploadNewVersion);

module.exports = router;