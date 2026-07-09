const express = require('express');
const usersController = require('./users.controller');
const usersValidators = require('./users.validators');
const { protect } = require('../../middleware/authMiddleware');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

/**
 * User Profile Routes
 */
router.get('/profile/:userId', usersValidators.getUserProfile, usersController.getUserProfile);
router.post('/profile', usersValidators.createUserProfile, usersController.createUserProfile);
router.put('/profile/:userId', usersValidators.updateUserProfile, usersController.updateUserProfile);

/**
 * User Settings Routes
 */
router.get('/settings/:userId', usersValidators.getUserSettings, usersController.getUserSettings);
router.put('/settings/:userId', usersValidators.updateUserSettings, usersController.updateUserSettings);

/**
 * User Documents Routes
 */
router.post('/documents', usersValidators.uploadUserDocument, usersController.uploadUserDocument);
router.get('/:userId/documents', usersValidators.getUserDocuments, usersController.getUserDocuments);
router.delete('/documents/:documentId', usersValidators.deleteUserDocument, usersController.deleteUserDocument);
router.put('/documents/:documentId/verify', usersValidators.uploadUserDocument, usersController.updateDocumentVerification);

/**
 * User Activity Routes
 */
router.get('/:userId/activity', usersValidators.getUserActivity, usersController.getUserActivity);
router.post('/activity/log', usersValidators.logUserActivity, usersController.logUserActivity);

/**
 * User Statistics Routes
 */
router.get('/:userId/statistics', usersValidators.getUserProfile, usersController.getUserStatistics);

/**
 * User Management Routes
 */
router.get('/', usersValidators.getAllUsers, usersController.getAllUsers);
router.get('/search', usersValidators.getAllUsers, usersController.searchUsers);

/**
 * Account Management Routes
 */
router.post('/:userId/deactivate', usersValidators.getUserProfile, usersController.deactivateUserAccount);

module.exports = router;
