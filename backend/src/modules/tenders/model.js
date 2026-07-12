const mongoose = require('mongoose');
const {
  TENDER_STATUS,
  TENDER_STATUS_VALUES,
  TENDER_CATEGORY_VALUES,
  TENDER_VISIBILITY,
  TENDER_VISIBILITY_VALUES,
  DOCUMENT_TYPE_VALUES,
  VALID_TRANSITIONS,
} = require('./constants');

const tenderDocumentSchema = new mongoose.Schema(
  {
    documentType: {
      type: String,
      enum: DOCUMENT_TYPE_VALUES,
      required: true,
    },
    documentName: {
      type: String,
      trim: true,
      required: true,
    },
    documentUrl: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      default: null,
    },
    mimeType: {
      type: String,
      default: null,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

const evaluationCriteriaSchema = new mongoose.Schema(
  {
    criteriaType: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      trim: true,
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    weightage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    isMandatory: {
      type: Boolean,
      default: false,
    },
    passingScore: {
      type: Number,
      default: null,
      min: 0,
      max: 100,
    },
  },
  { _id: false }
);

const tenderSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Tender title is required'],
      trim: true,
      index: true,
    },
    tenderNumber: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
      index: true,
    },
    slug: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 5000,
    },
    category: {
      type: String,
      enum: TENDER_CATEGORY_VALUES,
      required: [true, 'Tender category is required'],
      index: true,
    },
    status: {
      type: String,
      enum: TENDER_STATUS_VALUES,
      default: TENDER_STATUS.DRAFT,
      index: true,
    },
    visibility: {
      type: String,
      enum: TENDER_VISIBILITY_VALUES,
      default: TENDER_VISIBILITY.PUBLIC,
      index: true,
    },
    budget: {
      estimated: {
        type: Number,
        min: 0,
      },
      currency: {
        type: String,
        default: 'INR',
        uppercase: true,
        trim: true,
      },
      budgetType: {
        type: String,
        enum: ['fixed', 'range'],
        default: 'fixed',
      },
      minBudget: {
        type: Number,
        min: 0,
        default: null,
      },
      maxBudget: {
        type: Number,
        min: 0,
        default: null,
      },
    },
    submissionDeadline: {
      type: Date,
      required: [true, 'Submission deadline is required'],
      index: true,
    },
    openingDate: {
      type: Date,
      default: null,
      index: true,
    },
    evaluationCriteria: [evaluationCriteriaSchema],
    documents: [tenderDocumentSchema],
    issuingOrganization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      default: null,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
    publishedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    closedAt: {
      type: Date,
      default: null,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    cancellationReason: {
      type: String,
      trim: true,
      default: null,
    },
    awardedAt: {
      type: Date,
      default: null,
    },
    awardedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bid',
      default: null,
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
    archivedAt: {
      type: Date,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    tags: [{
      type: String,
      trim: true,
      lowercase: true,
    }],
    location: {
      type: String,
      trim: true,
    },
    department: {
      type: String,
      trim: true,
    },
    tenderType: {
      type: String,
      enum: ['domestic', 'international', 'government', 'private'],
      default: 'government',
    },
    gstRate: {
      type: Number,
      min: 0,
      max: 100,
      default: 18,
    },
    contactPerson: {
      name: { type: String, trim: true },
      email: { type: String, trim: true, lowercase: true },
      phone: { type: String, trim: true },
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    views: {
      type: Number,
      default: 0,
    },
    auditTrail: [{
      action: { type: String, required: true },
      performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      performedByEmail: { type: String },
      timestamp: { type: Date, default: Date.now },
      details: { type: String },
      changes: { type: mongoose.Schema.Types.Mixed },
    }],
  },
  { timestamps: true }
);

tenderSchema.index({ title: 'text', description: 'text', tenderNumber: 'text' });
tenderSchema.index({ status: 1, isArchived: 1, isDeleted: 0 });
tenderSchema.index({ submissionDeadline: 1, status: 1 });
tenderSchema.index({ createdBy: 1, isDeleted: 0 });
tenderSchema.index({ category: 1, status: 1 });
tenderSchema.index({ location: 1, isDeleted: 0 });
tenderSchema.index({ 'budget.estimated': 1, isDeleted: 0 });

tenderSchema.methods.addAuditTrail = function(action, performedBy, performedByEmail, details = null, changes = null) {
  this.auditTrail.push({
    action,
    performedBy,
    performedByEmail,
    timestamp: new Date(),
    details,
    changes,
  });
};

tenderSchema.methods.canTransitionTo = function(newStatus) {
  const currentStatus = this.status;
  const validTransitions = VALID_TRANSITIONS[currentStatus] || [];
  return validTransitions.includes(newStatus);
};

module.exports = {
  Tender: mongoose.model('Tender', tenderSchema),
};
