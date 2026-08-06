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
    category: {
      type: String,
      required: true,
      enum: ['goods', 'services', 'works', 'construction', 'it_software', 'medical', 'transportation', 'agriculture', 'education', 'consultancy', 'other'],
      index: true,
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
      required: true,
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
      required: true,
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
        default: 'CPPP',
      },
      originalUrl: {
        type: String,
        required: true,
      },
      cpppId: {
        type: String,
        required: true,
        unique: true,
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
    },
    documents: [{
      documentName: String,
      documentUrl: String,
      documentType: {
        type: String,
        enum: ['tender_notice', 'tender_document', 'corrigendum', 'boq', 'addendum'],
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
      default: 'CPPP',
      enum: ['CPPP', 'eProcurement', 'ePublish'],
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
  },
  { timestamps: true }
);

tenderSchema.index({ submissionDeadline: 1, isActive: 1 });
tenderSchema.index({ category: 1, isActive: 1 });
tenderSchema.index({ 'metadata.state': 1, isActive: 1 });
tenderSchema.index({ department: 1, isActive: 1 });
tenderSchema.index({ createdAt: -1 });

module.exports = {
  LiveTender: mongoose.model('LiveTender', tenderSchema),
};