const { Bookmark } = require('./model');
const { Tender } = require('../tenders/model');

class BookmarkService {
  async addBookmark(userId, tenderId, notes = null, tags = []) {
    try {
      const tender = await Tender.findById(tenderId);
      if (!tender || tender.isDeleted) {
        throw new Error('Tender not found');
      }

      const existing = await Bookmark.findOne({ userId, tenderId, isDeleted: false });
      if (existing) {
        existing.notes = notes || existing.notes;
        existing.tags = tags.length > 0 ? tags : existing.tags;
        await existing.save();
        return { success: true, data: existing, message: 'Bookmark updated' };
      }

      const bookmark = await Bookmark.create({ userId, tenderId, notes, tags });
      return { success: true, data: bookmark, message: 'Bookmark added' };
    } catch (error) {
      throw new Error(`Failed to add bookmark: ${error.message}`);
    }
  }

  async removeBookmark(userId, tenderId) {
    try {
      const result = await Bookmark.findOneAndDelete({ userId, tenderId, isDeleted: false });
      if (!result) {
        throw new Error('Bookmark not found');
      }
      return { success: true, message: 'Bookmark removed' };
    } catch (error) {
      throw new Error(`Failed to remove bookmark: ${error.message}`);
    }
  }

  async getUserBookmarks(userId, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;
      const bookmarks = await Bookmark.find({ userId, isDeleted: false })
        .populate('tenderId', 'title category status budget submissionDeadline createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Bookmark.countDocuments({ userId, isDeleted: false });

      return {
        success: true,
        data: {
          data: bookmarks,
          pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        },
      };
    } catch (error) {
      throw new Error(`Failed to get bookmarks: ${error.message}`);
    }
  }

  async isBookmarked(userId, tenderId) {
    try {
      const bookmark = await Bookmark.findOne({ userId, tenderId, isDeleted: false });
      return { success: true, data: { isBookmarked: !!bookmark } };
    } catch (error) {
      throw new Error(`Failed to check bookmark: ${error.message}`);
    }
  }
}

module.exports = new BookmarkService();