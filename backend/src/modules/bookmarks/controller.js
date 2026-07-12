const bookmarksService = require('./service');
const { protect } = require('../../middleware/authMiddleware');

class BookmarksController {
  async addBookmark(req, res) {
    try {
      const userId = req.user?.id || req.user?.userId;
      const { tenderId, notes, tags } = req.body;

      if (!tenderId) {
        return res.status(400).json({ success: false, message: 'Tender ID required' });
      }

      const result = await bookmarksService.addBookmark(userId, tenderId, notes, tags);
      return res.status(201).json(result);
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async removeBookmark(req, res) {
    try {
      const userId = req.user?.id || req.user?.userId;
      const { tenderId } = req.params;

      const result = await bookmarksService.removeBookmark(userId, tenderId);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async getUserBookmarks(req, res) {
    try {
      const userId = req.user?.id || req.user?.userId;
      const { page = 1, limit = 20 } = req.query;

      const result = await bookmarksService.getUserBookmarks(userId, parseInt(page), parseInt(limit));
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async isBookmarked(req, res) {
    try {
      const userId = req.user?.id || req.user?.userId;
      const { tenderId } = req.query;

      if (!tenderId) {
        return res.status(400).json({ success: false, message: 'Tender ID required' });
      }

      const result = await bookmarksService.isBookmarked(userId, tenderId);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new BookmarksController();