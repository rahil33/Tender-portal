const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Service name is required'],
      trim: true,
      maxlength: 200,
    },
    slug: {
      type: String,
      required: [true, 'Service slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Service description is required'],
      trim: true,
      maxlength: 2000,
    },
    shortDescription: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    category: {
      type: String,
      enum: ['gem-registration', 'tender-bidding', 'consulting', 'training', 'certification', 'oem-panel', 'other'],
      required: [true, 'Service category is required'],
      index: true,
    },
    pricing: {
      basePrice: {
        type: Number,
        min: 0,
        default: 0,
      },
      currency: {
        type: String,
        default: 'INR',
        uppercase: true,
        trim: true,
      },
      pricingType: {
        type: String,
        enum: ['fixed', 'starting_at', 'custom', 'range'],
        default: 'fixed',
      },
      minPrice: {
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
    features: [{
      type: String,
      trim: true,
    }],
    deliverables: [{
      type: String,
      trim: true,
    }],
    timeline: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    isPopular: {
      type: Boolean,
      default: false,
      index: true,
    },
    order: {
      type: Number,
      default: 0,
      index: true,
    },
    isPublished: {
      type: Boolean,
      default: true,
      index: true,
    },
    thumbnail: {
      type: String,
      trim: true,
    },
    images: [{
      url: String,
      caption: String,
    }],
    faqs: [{
      question: String,
      answer: String,
    }],
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

serviceSchema.index({ category: 1, isPublished: 1 });
serviceSchema.index({ isPopular: 1, isPublished: 1 });
serviceSchema.index({ order: 1 });

module.exports = {
  Service: mongoose.model('Service', serviceSchema),
};