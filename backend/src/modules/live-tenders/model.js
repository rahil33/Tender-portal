const mongoose = require('mongoose');

const tenderSchema = new mongoose.Schema(
  {
    tenderNumber: {
      type: String,
      required: [true, 'Tender number is required'],
      unique: true,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Tender title is required'],
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    // Human readable OFFICIAL GeM category name (first category reported by
    // GeM for the bid) or "Unclassified". Full detail lives in `categoryInfo`.
    // NOTE: this used to be a closed enum of 11 invented values; GeM's real
    // category names were being collapsed into them (and legacy documents that
    // still hold those values remain readable).
    category: {
      type: String,
      default: 'Unclassified',
      trim: true,
      index: true,
    },
    categoryInfo: {
      // Normalized, search-friendly key of the primary category.
      key: { type: String, default: 'unclassified', index: true },
      // Official identifiers exactly as supplied by GeM (never invented).
      id: String,
      name: String,
      parentId: String,
      parentName: String,
      // 'product' | 'service' | 'unclassified' (see classificationSource)
      classification: {
        type: String,
        enum: ['product', 'service', 'unclassified'],
        default: 'unclassified',
        index: true,
      },
      classificationSource: String,
      // The original GeM value(s) before any normalization.
      raw: String,
      // Every category reported by GeM for this bid (the first one is the
      // primary category used for filtering and counts).
      items: [{ _id: false, key: String, name: String, id: String }],
      // Every category-looking field from the source record, preserved for
      // later correction/re-mapping.
      rawFields: { type: mongoose.Schema.Types.Mixed },
    },
    status: {
      type: String,
      required: true,
      enum: ['published', 'open', 'closed', 'cancelled'],
      default: 'published',
      index: true,
    },
    visibility: {
      type: String,
      default: 'public',
      enum: ['public'],
    },
    budget: {
      estimated: {
        type: Number,
        min: 0,
      },
      currency: {
        type: String,
        default: 'INR',
      },
      budgetType: {
        type: String,
        default: 'fixed',
        enum: ['fixed'],
      },
    },
    submissionDeadline: {
      type: Date,
      index: true,
    },
    openingDate: {
      type: Date,
      index: true,
    },
    issuingOrganization: {
      type: String,
      required: true,
      index: true,
    },
    location: {
      type: String,
      required: true,
      index: true,
    },
    department: {
      type: String,
      default: '',
      index: true,
    },
    tenderType: {
      type: String,
      default: 'government',
      enum: ['government'],
    },
    tags: [{
      type: String,
      lowercase: true,
    }],
    metadata: {
      source: {
        type: String,
        required: true,
        default: 'GEM',
      },
      originalUrl: {
        type: String,
        required: true,
      },
      gemBidId: {
        type: String,
        index: true,
      },
      ministry: {
        type: String,
        index: true,
      },
      state: {
        type: String,
        index: true,
      },
      city: {
        type: String,
      },
      corrigendumCount: {
        type: Number,
        default: 0,
      },
      boqUrl: String,
      corrigendumUrl: String,
      tenderPdfUrl: String,
      productCategory: String,
      bidType: Number,
      isHighValue: Boolean,
      isRateContract: Boolean,
      isGlobalTendering: Boolean,
      bidDownloadUrl: {
        type: String,
      },
      // Status exactly as reported by the GeM listing (e.g. 'ongoing').
      gemStatus: String,
    },
    documents: [{
      documentName: String,
      documentUrl: String,
      documentType: {
        type: String,
        enum: ['tender_notice', 'tender_document', 'corrigendum', 'boq', 'addendum'],
      },
      // Rich, GeM-native document fields (backward compatible with the legacy
      // documentName/documentUrl/documentType fields above).
      name: String,
      url: String,
      // `type` is a reserved keyword in Mongoose schemas. It must be declared
      // as { type: { type: String } } or the whole subdocument is mis-typed.
      type: { type: String },
      source: {
        type: String,
        enum: ['GEM'],
      },
    }],
    contactInfo: {
      organisation: String,
      department: String,
      officer: String,
      email: String,
      phone: String,
      address: String,
    },
    emdAmount: {
      type: Number,
      min: 0,
    },
    sourcePortal: {
      type: String,
      required: true,
      default: 'GEM',
      enum: ['GEM'],
    },
    lastSyncedAt: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    // Archived = no longer a live bid (deadline passed or withdrawn from GeM).
    // Records are archived, never deleted.
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
    archivedAt: Date,
    archiveReason: String,
    // Hash of the normalized content: lets the sync tell "updated" from
    // "unchanged" without rewriting identical documents.
    contentHash: String,
    // Last time this bid was seen in a GeM crawl (separate from content edits).
    lastSeenAt: { type: Date, index: true },
  },
  { timestamps: true }
);

tenderSchema.index({ submissionDeadline: 1, isActive: 1 });
tenderSchema.index({ category: 1, isActive: 1 });
tenderSchema.index({ 'metadata.state': 1, isActive: 1 });
tenderSchema.index({ department: 1, isActive: 1 });
tenderSchema.index({ createdAt: -1 });
tenderSchema.index({ openingDate: -1 });
tenderSchema.index({ 'categoryInfo.key': 1, isActive: 1 });
tenderSchema.index({ 'metadata.bidType': 1, isActive: 1 });
tenderSchema.index({ isArchived: 1, isActive: 1, status: 1 });
// Every list/search query filters on the GeM portal + active status first.
tenderSchema.index({ sourcePortal: 1, isActive: 1, status: 1, submissionDeadline: 1 });

module.exports = {
  LiveTender: mongoose.model('LiveTender', tenderSchema),
};