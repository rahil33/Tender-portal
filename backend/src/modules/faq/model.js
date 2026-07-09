const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500,
  },
  answer: {
    type: String,
    required: true,
    maxlength: 2000,
  },
  category: {
    type: String,
    enum: ['general', 'tenders', 'bids', 'registration', 'payment', 'technical', 'other'],
    default: 'general',
  },
  tags: [{
    type: String,
    trim: true,
  }],
  isPublished: {
    type: Boolean,
    default: true,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  order: {
    type: Number,
    default: 0,
  },
  views: {
    type: Number,
    default: 0,
  },
  helpful: {
    type: Number,
    default: 0,
  },
  notHelpful: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

faqSchema.index({ category: 1, isPublished: 1 });
faqSchema.index({ tags: 1 });
faqSchema.index({ isFeatured: 1 });
faqSchema.index({ question: 'text', answer: 'text' });

module.exports = mongoose.models.FAQ || mongoose.model('FAQ', faqSchema);