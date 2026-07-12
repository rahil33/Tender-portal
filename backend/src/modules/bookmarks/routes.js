const express = require('express');
const bookmarksController = require('./controller');
const { protect } = require('../../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/', bookmarksController.addBookmark);
router.get('/', bookmarksController.getUserBookmarks);
router.get('/check', bookmarksController.isBookmarked);
router.delete('/:tenderId', bookmarksController.removeBookmark);

module.exports = router;