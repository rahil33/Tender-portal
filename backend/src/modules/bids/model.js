const mongoose = require('mongoose');
const {
  BID_STATUS,
  BID_STATUS_VALUES,
  BID_TYPE,
  BID_TYPE_VALUES,
  DOCUMENT_TYPE_VALUES,
  EVALUATION_STATUS,
  EVALUATION_STATUS_VALUES,
} = require('./constants');

const bidDocumentSchema = new mongoose.Schema(
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

const bidVersionSchema = new mongoose.Schema(
  {
    versionNumber: {
      type: Number,
      required: true,
    },
    bidAmount: {
      type: Number,
      required: true,
    },
    technicalProposal: {
      type: String,
      trim: true,
    },
    financialProposal: {
      type: String,
      trim: true,
    },
    documents: [bidDocumentSchema],
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    changes: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const evaluationSchema = new mongoose.Schema(
  {
    evaluatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    technicalScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
    financialScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
    totalScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
    technicalRemarks: {
      type: String,
      trim: true,
    },
    financialRemarks: {
      type: String,
      trim: true,
    },
    overallRemarks: {
      type: String,
      trim: true,
    },
    isRecommended: {
      type: Boolean,
      default: false,
    },
    evaluatedAt: {
      type: Date,
      default: null,
    },
  },
  { _id: false }
);

const bidSchema = new mongoose.Schema(
  {
    bidNumber: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
      index: true,
    },
    tenderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tender',
      required: true,
      index: true,
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: BID_STATUS_VALUES,
      default: BID_STATUS.DRAFT,
      index: true,
    },
    bidType: {
      type: String,
      enum: BID_TYPE_VALUES,
      default: BID_TYPE.COMBINED,
    },
    bidAmount: {
      type: Number,
      min: 0,
      required: [true, 'Bid amount is required'],
    },
    currency: {
      type: String,
      default: 'INR',
      uppercase: true,
      trim: true,
    },
    technicalProposal: {
      type: String,
      trim: true,
      maxlength: 10000,
    },
    financialProposal: {
      type: String,
      trim: true,
      maxlength: 5000,
    },
    documents: [bidDocumentSchema],
    versionHistory: [bidVersionSchema],
    currentVersion: {
      type: Number,
      default: 1,
    },
    evaluation: evaluationSchema,
    evaluationStatus: {
      type: String,
      enum: EVALUATION_STATUS_VALUES,
      default: EVALUATION_STATUS.PENDING,
      index: true,
    },
    submittedAt: {
      type: Date,
      default: null,
      index: true,
    },
    withdrawnAt: {
      type: Date,
      default: null,
    },
    withdrawalReason: {
      type: String,
      trim: true,
      default: null,
    },
    isWithdrawn: {
      type: Boolean,
      default: false,
      index: true,
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
    auditLog: [{
      action: { type: String, required: true },
      performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      timestamp: { type: Date, default: Date.now },
      details: { type: String },
    }],
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

bidSchema.index({ tenderId: 1, vendorId: 1, isDeleted: 1 });
bidSchema.index({ status: 1, isDeleted: 1 });
bidSchema.index({ submittedAt: 1, isDeleted: 1 });
bidSchema.index({ bidAmount: 1, isDeleted: 1 });
bidSchema.index({ tenderId: 1, status: 1, isDeleted: 1 });
bidSchema.index({ vendorId: 1, status: 1, submittedAt: -1 });
bidSchema.index({ evaluationStatus: 1, tenderId: 1, isDeleted: 1 });
bidSchema.index({ tenderId: 1, vendorId: 1 }, { unique: true, partialFilterExpression: { isDeleted: false, status: { $ne: 'withdrawn' } } });

module.exports = {
  Bid: mongoose.model('Bid', bidSchema),
};