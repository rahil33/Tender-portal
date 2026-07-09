const express = require('express');
const organizationsController = require('./controller');
const organizationsValidators = require('./validator');
const { protect } = require('../../middleware/authMiddleware');

const router = express.Router();

/**
 * Public Organization Browsing Routes (no login required)
 */
router.get('/', organizationsValidators.getAllOrganizations, organizationsController.getAllOrganizations);
router.get('/search', organizationsValidators.searchOrganizations, organizationsController.searchOrganizations);
router.get('/featured', organizationsController.getFeaturedOrganizations);
router.get('/:organizationId', organizationsValidators.getOrganizationById, organizationsController.getOrganizationById);
router.get('/:organizationId/statistics', organizationsValidators.getOrganizationById, organizationsController.getOrganizationStatistics);
router.get('/:organizationId/members', protect, organizationsValidators.getMembers, organizationsController.getMembers);
router.get('/:organizationId/documents', protect, organizationsValidators.getDocuments, organizationsController.getDocuments);
/**
 * Organization CRUD Routes (login required)
 */
router.post('/', protect, organizationsValidators.createOrganization, organizationsController.createOrganization);
router.get('/user/:userId', protect, organizationsValidators.getUserOrganizations, organizationsController.getUserOrganizations);
router.put('/:organizationId', protect, organizationsValidators.updateOrganization, organizationsController.updateOrganization);
router.delete('/:organizationId', protect, organizationsValidators.getOrganizationById, organizationsController.deleteOrganization);

/**
 * Organization Verification Routes (login required)
 */
router.put('/:organizationId/verify', protect, organizationsValidators.verifyOrganization, organizationsController.verifyOrganization);

/**
 * Organization Member Routes (login required)
 */
router.post('/members', protect, organizationsValidators.addMember, organizationsController.addMember);
router.put('/members/:memberId', protect, organizationsValidators.updateMember, organizationsController.updateMember);
router.delete('/members/:memberId', protect, organizationsValidators.removeMember, organizationsController.removeMember);

/**
 * Organization Document Routes (login required)
 */
router.post('/documents', protect, organizationsValidators.uploadDocument, organizationsController.uploadDocument);
router.delete('/documents/:documentId', protect, organizationsValidators.deleteDocument, organizationsController.deleteDocument);
router.put('/documents/:documentId/verify', protect, organizationsValidators.updateDocumentVerification, organizationsController.updateDocumentVerification);

module.exports = router;