const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    tenderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tender',
      required: true,
      index: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    tags: [{
      type: String,
      trim: true,
      lowercase: true,
    }],
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

bookmarkSchema.index({ userId: 1, tenderId: 1 }, { unique: true });

module.exports = {
  Bookmark: mongoose.model('Bookmark', bookmarkSchema),
};