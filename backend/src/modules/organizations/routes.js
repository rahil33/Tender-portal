const express = require('express');
const organizationsController = require('./controller');
const organizationsValidators = require('./validator');
const { protect, authorize } = require('../../middleware/authMiddleware');
const { ROLES } = require('../auth/constants');

const router = express.Router();

/**
 * Public Organization Browsing Routes (no login required)
 */
router.get('/', organizationsValidators.getAllOrganizations, organizationsController.getAllOrganizations);
router.get('/search', organizationsValidators.searchOrganizations, organizationsController.searchOrganizations);
router.get('/featured', organizationsController.getFeaturedOrganizations);
router.get('/:organizationId', organizationsValidators.getOrganizationById, organizationsController.getOrganizationById);
router.get('/:organizationId/statistics', organizationsValidators.getOrganizationById, organizationsController.getOrganizationStatistics);

/**
 * Organization Member Routes (login required)
 */
router.get('/:organizationId/members', protect, organizationsValidators.getMembers, organizationsController.getMembers);
router.get('/:organizationId/documents', protect, organizationsValidators.getDocuments, organizationsController.getDocuments);

/**
 * Organization CRUD Routes (login required)
 */
router.post('/', protect, authorize(ROLES.VENDOR, ROLES.BUYER, ROLES.ADMIN), organizationsValidators.createOrganization, organizationsController.createOrganization);
router.get('/user/:userId', protect, organizationsValidators.getUserOrganizations, organizationsController.getUserOrganizations);
router.put('/:organizationId', protect, authorize(ROLES.VENDOR, ROLES.BUYER, ROLES.ADMIN), organizationsValidators.updateOrganization, organizationsController.updateOrganization);
router.delete('/:organizationId', protect, authorize(ROLES.VENDOR, ROLES.BUYER, ROLES.ADMIN), organizationsValidators.getOrganizationById, organizationsController.deleteOrganization);

/**
 * Organization Verification Routes (admin only)
 */
router.put('/:organizationId/verify', protect, authorize(ROLES.ADMIN), organizationsValidators.verifyOrganization, organizationsController.verifyOrganization);

/**
 * Organization Member Routes (login required)
 */
router.post('/members', protect, authorize(ROLES.VENDOR, ROLES.BUYER, ROLES.ADMIN), organizationsValidators.addMember, organizationsController.addMember);
router.put('/members/:memberId', protect, authorize(ROLES.VENDOR, ROLES.BUYER, ROLES.ADMIN), organizationsValidators.updateMember, organizationsController.updateMember);
router.delete('/members/:memberId', protect, authorize(ROLES.VENDOR, ROLES.BUYER, ROLES.ADMIN), organizationsValidators.removeMember, organizationsController.removeMember);

/**
 * Organization Document Routes (login required)
 */
router.post('/documents', protect, authorize(ROLES.VENDOR, ROLES.BUYER, ROLES.ADMIN), organizationsValidators.uploadDocument, organizationsController.uploadDocument);
router.delete('/documents/:documentId', protect, authorize(ROLES.VENDOR, ROLES.BUYER, ROLES.ADMIN), organizationsValidators.deleteDocument, organizationsController.deleteDocument);
router.put('/documents/:documentId/verify', protect, authorize(ROLES.ADMIN), organizationsValidators.updateDocumentVerification, organizationsController.updateDocumentVerification);

module.exports = router;