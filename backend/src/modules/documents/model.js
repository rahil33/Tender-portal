const mongoose = require('mongoose');
const {
  DOCUMENT_STATUS,
  DOCUMENT_STATUS_VALUES,
  DOCUMENT_TYPE_VALUES,
} = require('./constants');

const documentVersionSchema = new mongoose.Schema(
  {
    versionNumber: {
      type: Number,
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    uploadedAt: {
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

const documentSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      required: [true, 'File name is required'],
      trim: true,
      index: true,
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL is required'],
      index: true,
    },
    originalFileName: {
      type: String,
      trim: true,
    },
    fileSize: {
      type: Number,
      required: true,
      min: 0,
      index: true,
    },
    mimeType: {
      type: String,
      required: true,
      index: true,
    },
    fileHash: {
      type: String,
      trim: true,
      index: true,
    },
    documentType: {
      type: String,
      enum: DOCUMENT_TYPE_VALUES,
      required: true,
      index: true,
    },
    title: {
      type: String,
      trim: true,
      maxlength: 300,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    tags: [{
      type: String,
      trim: true,
      lowercase: true,
    }],
    tenderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tender',
      default: null,
      index: true,
    },
    bidId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bid',
      default: null,
      index: true,
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      default: null,
      index: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    versionHistory: [documentVersionSchema],
    currentVersion: {
      type: Number,
      default: 1,
    },
    status: {
      type: String,
      enum: DOCUMENT_STATUS_VALUES,
      default: DOCUMENT_STATUS.ACTIVE,
      index: true,
    },
    isPublic: {
      type: Boolean,
      default: false,
      index: true,
    },
    downloadCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
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
  },
  { timestamps: true }
);

documentSchema.index({ tenderId: 1, isDeleted: 1 });
documentSchema.index({ bidId: 1, isDeleted: 1 });
documentSchema.index({ organizationId: 1, isDeleted: 1 });
documentSchema.index({ status: 1, isDeleted: 1 });
documentSchema.index({ uploadedBy: 1, isDeleted: 1 });

module.exports = {
  Document: mongoose.model('Document', documentSchema),
};