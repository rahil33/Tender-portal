const mongoose = require('mongoose');
const {
  TENDER_STATUS,
  TENDER_STATUS_VALUES,
  TENDER_CATEGORY_VALUES,
  TENDER_VISIBILITY,
  TENDER_VISIBILITY_VALUES,
  DOCUMENT_TYPE_VALUES,
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
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
    archivedAt: {
      type: Date,
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
    contactPerson: {
      name: { type: String, trim: true },
      email: { type: String, trim: true, lowercase: true },
      phone: { type: String, trim: true },
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

tenderSchema.index({ title: 'text', description: 'text', tenderNumber: 'text' });
tenderSchema.index({ status: 1, isArchived: 1 });
tenderSchema.index({ submissionDeadline: 1, status: 1 });

module.exports = {
  Tender: mongoose.model('Tender', tenderSchema),
};
