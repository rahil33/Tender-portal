const mongoose = require('mongoose');
const {
  CATEGORY_STATUS,
  CATEGORY_STATUS_VALUES,
  CATEGORY_TYPE_VALUES,
} = require('./constants');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
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
      maxlength: 1000,
    },
    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
      index: true,
    },
    level: {
      type: Number,
      default: 0,
      min: 0,
      index: true,
    },
    path: {
      type: String,
      trim: true,
      index: true,
    },
    type: {
      type: String,
      enum: CATEGORY_TYPE_VALUES,
      default: 'other',
      index: true,
    },
    status: {
      type: String,
      enum: CATEGORY_STATUS_VALUES,
      default: CATEGORY_STATUS.ACTIVE,
      index: true,
    },
    icon: {
      type: String,
      trim: true,
      default: null,
    },
    color: {
      type: String,
      trim: true,
      default: null,
    },
    order: {
      type: Number,
      default: 0,
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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
    auditLog: [{
      action: { type: String, required: true },
      performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      timestamp: { type: Date, default: Date.now },
      details: { type: String },
    }],
  },
  { timestamps: true }
);

categorySchema.index({ parentCategory: 1, isDeleted: 1 });
categorySchema.index({ status: 1, isDeleted: 1 });
categorySchema.index({ level: 1, order: 1 });

module.exports = {
  Category: mongoose.model('Category', categorySchema),
};