/**
 * FAQ Module
 * Handles frequently asked questions and answers
 */

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../../middleware/authMiddleware');
const { ROLES } = require('../auth/constants');
const { validationMiddleware } = require('../../middleware/validationMiddleware');
const { body, param, query } = require('express-validator');
const mongoose = require('mongoose');

// FAQ Schema
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
  relatedFAQs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FAQ',
  }],
}, { timestamps: true });

// Indexes
faqSchema.index({ category: 1, isPublished: 1 });
faqSchema.index({ tags: 1 });
faqSchema.index({ isFeatured: 1 });
faqSchema.index({ question: 'text', answer: 'text' });

const FAQ = mongoose.models.FAQ || mongoose.model('FAQ', faqSchema);

// Validators
const createFAQValidator = [
  body('question').trim().notEmpty().withMessage('Question is required').isLength({ max: 500 }),
  body('answer').trim().notEmpty().withMessage('Answer is required').isLength({ max: 2000 }),
  body('category').optional().isIn(['general', 'tenders', 'bids', 'registration', 'payment', 'technical', 'other']),
  body('tags').optional().isArray(),
  body('isPublished').optional().isBoolean(),
  body('isFeatured').optional().isBoolean(),
  body('order').optional().isInt(),
  validationMiddleware,
];

const updateFAQValidator = [
  param('id').isMongoId().withMessage('Invalid FAQ ID'),
  body('question').optional().trim().isLength({ max: 500 }),
  body('answer').optional().trim().isLength({ max: 2000 }),
  body('category').optional().isIn(['general', 'tenders', 'bids', 'registration', 'payment', 'technical', 'other']),
  validationMiddleware,
];

// Public Routes
router.get('/', async (req, res) => {
  try {
    const { category, search, page = 1, limit = 20 } = req.query;
    const query = { isPublished: true };
    
    if (category) query.category = category;
    
    if (search) {
      query.$text = { $search: search };
    }
    
    const faqs = await FAQ.find(query)
      .sort({ order: 1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const count = await FAQ.countDocuments(query);
    
    res.json({
      success: true,
      data: faqs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch FAQs',
      error: error.message,
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const faq = await FAQ.findOne({ _id: req.params.id, isPublished: true });
    
    if (!faq) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found',
      });
    }
    
    // Increment views
    faq.views += 1;
    await faq.save();
    
    res.json({
      success: true,
      data: faq,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch FAQ',
      error: error.message,
    });
  }
});

// Admin Routes
router.get('/admin/all', protect, authorize(ROLES.ADMIN), async (req, res) => {
  try {
    const { category, isPublished, search } = req.query;
    const query = {};
    
    if (category) query.category = category;
    if (isPublished !== undefined) query.isPublished = isPublished === 'true';
    
    if (search) {
      query.$text = { $search: search };
    }
    
    const faqs = await FAQ.find(query)
      .sort({ order: 1, createdAt: -1 });
    
    res.json({
      success: true,
      data: faqs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch FAQs',
      error: error.message,
    });
  }
});

router.post('/', protect, authorize(ROLES.ADMIN), createFAQValidator, async (req, res) => {
  try {
    const faq = await FAQ.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'FAQ created successfully',
      data: faq,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to create FAQ',
      error: error.message,
    });
  }
});

router.put('/:id', protect, authorize(ROLES.ADMIN), updateFAQValidator, async (req, res) => {
  try {
    const faq = await FAQ.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!faq) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found',
      });
    }
    
    res.json({
      success: true,
      message: 'FAQ updated successfully',
      data: faq,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to update FAQ',
      error: error.message,
    });
  }
});

router.patch('/:id/toggle-publish', protect, authorize(ROLES.ADMIN), async (req, res) => {
  try {
    const faq = await FAQ.findById(req.params.id);
    
    if (!faq) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found',
      });
    }
    
    faq.isPublished = !faq.isPublished;
    await faq.save();
    
    res.json({
      success: true,
      message: `FAQ ${faq.isPublished ? 'published' : 'unpublished'}`,
      data: faq,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to toggle publish status',
      error: error.message,
    });
  }
});

router.post('/:id/vote', async (req, res) => {
  try {
    const { helpful } = req.body;
    const faq = await FAQ.findById(req.params.id);
    
    if (!faq) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found',
      });
    }
    
    if (helpful) {
      faq.helpful += 1;
    } else {
      faq.notHelpful += 1;
    }
    
    await faq.save();
    
    res.json({
      success: true,
      message: 'Vote recorded',
      data: { helpful: faq.helpful, notHelpful: faq.notHelpful },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to vote',
      error: error.message,
    });
  }
});

router.delete('/:id', protect, authorize(ROLES.ADMIN), async (req, res) => {
  try {
    await FAQ.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'FAQ deleted successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to delete FAQ',
      error: error.message,
    });
  }
});

module.exports = router;