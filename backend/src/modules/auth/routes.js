const express = require('express');
const authController = require('./controller');
const authValidators = require('./validator');
const { protect } = require('../../middleware/authMiddleware');

const router = express.Router();

router.post('/register', authValidators.register, authController.register);
router.post('/login', authValidators.login, authController.login);

router.post('/logout', protect, authController.logout);
router.get('/sessions', protect, authController.getSessions);
router.delete('/sessions/:sessionId', protect, authValidators.revokeSession, authController.revokeSession);

module.exports = router;