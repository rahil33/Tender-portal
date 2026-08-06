const express = require('express');
const notificationsController = require('./controller');
const { protect, authorize } = require('../../middleware/authMiddleware');
const { ROLES } = require('../auth/constants');

const router = express.Router();

router.use(protect);

router.get('/preferences', protect, notificationsController.getPreferences);
router.put('/preferences', protect, authorize(ROLES.VENDOR, ROLES.BUYER, ROLES.ADMIN), notificationsController.updatePreferences);
router.post('/test', protect, notificationsController.testNotification);

module.exports = router;