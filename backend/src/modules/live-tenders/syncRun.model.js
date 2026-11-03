const mongoose = require('mongoose');

/**
 * Persistent log of every GeM synchronization (tenders or categories).
 * The admin dashboard reads this collection, so its numbers survive restarts
 * and are never hard-coded.
 */
const counterField = { type: Number, default: 0 };

const syncRunSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['tenders', 'categories'], required: true, index: true },
    trigger: { type: String, default: 'scheduled' }, // scheduled | initial | manual | cli
    status: { type: String, enum: ['running', 'success', 'partial', 'failed'], default: 'running', index: true },
    startedAt: { type: Date, default: Date.now, index: true },
    finishedAt: Date,
    durationMs: counterField,

    // Crawl
    gemReportedTotal: counterField,
    pagesDiscovered: counterField,
    pagesProcessed: counterField,
    pagesFailed: counterField,
    reachedFinalPage: { type: Boolean, default: false },

    // Record accounting. "extracted" = raw records received from GeM;
    // "validated" = passed normalization; "inserted"/"updated"/"unchanged"
    // are WRITE results reported by MongoDB, not mapping counts.
    tendersExtracted: counterField,
    tendersValidated: counterField,
    tendersRejected: counterField,
    duplicatesSkipped: counterField, // same bid seen twice during one crawl
    tendersInserted: counterField,
    tendersUpdated: counterField,
    tendersUnchanged: counterField, // already stored, identical content
    tendersArchived: counterField,
    dbWriteFailures: counterField,
    verifiedPersisted: counterField, // distinct bids confirmed in MongoDB afterwards

    rejectionReasons: { type: mongoose.Schema.Types.Mixed, default: {} },
    failedPages: [{ _id: false, page: Number, error: String }],
    errorSamples: [String],
    error: String,

    // Category sync
    categoriesUpserted: counterField,
    categoriesTotal: counterField,
  },
  { timestamps: true, collection: 'gemsyncruns' }
);

syncRunSchema.index({ type: 1, startedAt: -1 });
syncRunSchema.index({ type: 1, status: 1, startedAt: -1 });

module.exports = { GemSyncRun: mongoose.models.GemSyncRun || mongoose.model('GemSyncRun', syncRunSchema) };
