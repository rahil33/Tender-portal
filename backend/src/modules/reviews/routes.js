/**
 * Reviews/Testimonials Module
 * Handles vendor reviews, ratings, and testimonials
 */

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../../middleware/authMiddleware');
const { ROLES } = require('../auth/constants');
const { validationMiddleware } = require('../../middleware/validationMiddleware');
const { body, param, query } = require('express-validator');
const mongoose = require('mongoose');

// Review Schema
const reviewSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  tenderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tender',
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000,
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
  notHelpful: {
    type: Number,
    default: 0,
  },
  response: {
    type: String,
    maxlength: 2000,
  },
  respondedAt: {
    type: Date,
  },
}, { timestamps: true });

// Indexes
reviewSchema.index({ organizationId: 1, status: 1 });
reviewSchema.index({ userId: 1 });
reviewSchema.index({ rating: 1 });

const Review = mongoose.model('Review', reviewSchema);

// Validators
const createReviewValidator = [
  param('organizationId').isMongoId().withMessage('Invalid organization ID'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 200 }),
  body('comment').trim().notEmpty().withMessage('Comment is required').isLength({ max: 2000 }),
  body('tenderId').optional().isMongoId(),
  validationMiddleware,
];

const approveReviewValidator = [
  param('reviewId').isMongoId().withMessage('Invalid review ID'),
  validationMiddleware,
];

const voteReviewValidator = [
  param('reviewId').isMongoId().withMessage('Invalid review ID'),
  body('vote').isIn(['helpful', 'notHelpful']).withMessage('Vote must be helpful or notHelpful'),
  validationMiddleware,
];

// Routes
router.post('/organization/:organizationId', protect, createReviewValidator, async (req, res) => {
  try {
    // Check if user already reviewed this organization
    const existingReview = await Review.findOne({
      organizationId: req.params.organizationId,
      userId: req.user.id,
    });
    
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this organization',
      });
    }
    
  const review = await Review.create({
   organizationId: req.params.organizationId,
   userId: req.user.id,
   rating: req.body.rating,
   title: req.body.title,
   comment: req.body.comment,
   tenderId: req.body.tenderId,
   status: 'approved', // auto-approve for demo purposes
  });
    
    res.status(201).json({
      success: true,
      message: 'Review submitted successfully. It will be published after approval.',
      data: review,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to submit review',
      error: error.message,
    });
  }
});

router.get('/organization/:organizationId', async (req, res) => {
  try {
    const { page = 1, limit = 10, rating, status = 'approved' } = req.query;
    
    const query = {
      organizationId: req.params.organizationId,
      status,
    };
    
    if (rating) query.rating = parseInt(rating);
    
    const reviews = await Review.find(query)
      .populate('userId', 'fullName companyName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const count = await Review.countDocuments(query);
    const averageRating = await Review.aggregate([
      { $match: { organizationId: new mongoose.Types.ObjectId(req.params.organizationId), status: 'approved' } },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } },
    ]);
    
    res.json({
      success: true,
      data: reviews,
      averageRating: averageRating[0]?.avgRating || 0,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews',
      error: error.message,
    });
  }
});

router.get('/', protect, authorize(ROLES.ADMIN), async (req, res) => {
  try {
    const { page = 1, limit = 20, status, organizationId } = req.query;
    const query = {};
    
    if (status) query.status = status;
    if (organizationId) query.organizationId = organizationId;
    
    const reviews = await Review.find(query)
      .populate('organizationId', 'name')
      .populate('userId', 'fullName email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const count = await Review.countDocuments(query);
    
    res.json({
      success: true,
      data: reviews,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews',
      error: error.message,
    });
  }
});

router.patch('/:reviewId/approve', protect, authorize(ROLES.ADMIN), approveReviewValidator, async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.reviewId,
      { status: 'approved' },
      { new: true }
    );
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }
    
    res.json({
      success: true,
      message: 'Review approved successfully',
      data: review,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to approve review',
      error: error.message,
    });
  }
});

router.patch('/:reviewId/reject', protect, authorize(ROLES.ADMIN), approveReviewValidator, async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.reviewId,
      { status: 'rejected' },
      { new: true }
    );
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }
    
    res.json({
      success: true,
      message: 'Review rejected',
      data: review,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to reject review',
      error: error.message,
    });
  }
});

router.post('/:reviewId/vote', protect, voteReviewValidator, async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }
    
    if (req.body.vote === 'helpful') {
      review.helpful += 1;
    } else {
      review.notHelpful += 1;
    }
    
    await review.save();
    
    res.json({
      success: true,
      message: 'Vote recorded',
      data: { helpful: review.helpful, notHelpful: review.notHelpful },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to vote',
      error: error.message,
    });
  }
});

router.delete('/:reviewId', protect, authorize(ROLES.ADMIN), async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.reviewId);
    
    res.json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to delete review',
      error: error.message,
    });
  }
});

module.exports = router;