const mongoose = require('mongoose');
const {
  ORGANIZATION_TYPE_VALUES,
  VERIFICATION_STATUS,
  VERIFICATION_STATUS_VALUES,
  MEMBER_ROLE_VALUES,
  DOCUMENT_TYPE_VALUES,
  DOCUMENT_STATUS,
  DOCUMENT_STATUS_VALUES,
} = require('./constants');

/**
 * Organization Schema
 * Business entity profile for tender portal vendors and partners
 */
const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Organization name is required'],
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
    type: {
      type: String,
      enum: ORGANIZATION_TYPE_VALUES,
      default: 'vendor',
      index: true,
    },
    registrationNumber: {
      type: String,
      trim: true,
      index: true,
    },
    gstNumber: {
      type: String,
      trim: true,
      uppercase: true,
    },
    panNumber: {
      type: String,
      trim: true,
      uppercase: true,
    },
    gemSellerId: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: {
        type: String,
        default: 'India',
      },
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    logoUrl: {
      type: String,
      default: null,
    },
    verificationStatus: {
      type: String,
      enum: VERIFICATION_STATUS_VALUES,
      default: VERIFICATION_STATUS.PENDING,
      index: true,
    },
    verificationNotes: {
      type: String,
      trim: true,
    },
    verificationDate: {
      type: Date,
      default: null,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    profileCompleteness: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    featuredOrder: {
      type: Number,
      default: 0,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

organizationSchema.index({ verificationStatus: 1, isActive: 1, createdAt: -1 });
organizationSchema.index({ ownerId: 1, type: 1, isActive: 1 });
organizationSchema.index({ gstNumber: 1 }, { sparse: true, unique: true });
organizationSchema.index({ panNumber: 1 }, { sparse: true, unique: true });
organizationSchema.index({ name: 'text', description: 'text' });

/**
 * Organization Member Schema
 * Links users to organizations with roles
 */
const organizationMemberSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: MEMBER_ROLE_VALUES,
      default: 'member',
    },
    designation: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

organizationMemberSchema.index({ organizationId: 1, userId: 1 }, { unique: true });

/**
 * Organization Document Schema
 * Stores organization compliance and registration documents
 */
const organizationDocumentSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
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
    expiryDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: DOCUMENT_STATUS_VALUES,
      default: DOCUMENT_STATUS.PENDING,
    },
    verificationNotes: {
      type: String,
      trim: true,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    verificationDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = {
  Organization: mongoose.model('Organization', organizationSchema),
  OrganizationMember: mongoose.model('OrganizationMember', organizationMemberSchema),
  OrganizationDocument: mongoose.model('OrganizationDocument', organizationDocumentSchema),
};
