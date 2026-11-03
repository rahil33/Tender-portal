const mongoose = require('mongoose');

/**
 * Registry of the GeM categories seen on real GeM bid records.
 *
 * Everything here comes from GeM's own bid data (category name, and an id /
 * parent id ONLY when the source record carries one). Nothing is hand-written.
 * `source` documents where the entry came from so a stricter official taxonomy
 * import can later supersede it.
 */
const gemCategorySchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    gemCategoryId: String,
    parentId: String,
    parentName: String,
    classification: { type: String, enum: ['product', 'service', 'unclassified'], default: 'unclassified', index: true },
    classificationSource: String,
    source: { type: String, default: 'gem-bid-listing' },
    activeCount: { type: Number, default: 0 },
    totalCount: { type: Number, default: 0 },
    firstSeenAt: Date,
    lastSeenAt: Date,
    lastSyncedAt: Date,
  },
  { timestamps: true, collection: 'gemcategories' }
);

module.exports = { GemCategory: mongoose.models.GemCategory || mongoose.model('GemCategory', gemCategorySchema) };
