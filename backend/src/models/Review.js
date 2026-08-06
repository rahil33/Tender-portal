const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    maxlength: [255, 'Email cannot exceed 255 characters'],
  },
  service: {
    type: String,
    required: [true, 'Service is required'],
    trim: true,
    enum: ['GeM Registration', 'Tender Bidding', 'Professional Training', 'Vendor Registration', 'Compliance Services'],
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5'],
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
  },
  text: {
    type: String,
    required: [true, 'Review text is required'],
    trim: true,
    minlength: [50, 'Review must be at least 50 characters'],
    maxlength: [2000, 'Review cannot exceed 2000 characters'],
  },
  location: {
    type: String,
    trim: true,
    default: 'India',
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  helpful: {
    type: Number,
    default: 0,
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, { timestamps: true });

reviewSchema.index({ status: 1, createdAt: -1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ service: 1 });

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;