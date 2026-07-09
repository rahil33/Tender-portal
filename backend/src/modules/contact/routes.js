/**
 * Contact/Enquiry Module
 * Handles contact forms, enquiries, and support tickets
 */

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../../middleware/authMiddleware');
const { ROLES } = require('../auth/constants');
const { validationMiddleware } = require('../../middleware/validationMiddleware');
const { body } = require('express-validator');
const mongoose = require('mongoose');

// Contact Schema
const contactSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, trim: true },
  subject: { type: String, required: true, trim: true },
  message: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'in_progress', 'resolved', 'closed'], 
    default: 'pending' 
  },
  category: {
    type: String,
    enum: ['general', 'support', 'sales', 'technical', 'complaint', 'other'],
    default: 'general',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  response: {
    type: String,
  },
  respondedAt: {
    type: Date,
  },
  respondedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, { timestamps: true });

const Contact = mongoose.model('Contact', contactSchema);

// Validators
const createContactValidator = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 200 }),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone').optional().trim(),
  body('subject').trim().notEmpty().withMessage('Subject is required').isLength({ max: 200 }),
  body('message').trim().notEmpty().withMessage('Message is required').isLength({ max: 2000 }),
  body('category').optional().isIn(['general', 'support', 'sales', 'technical', 'complaint', 'other']),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  validationMiddleware,
];

const respondToContactValidator = [
  body('response').trim().notEmpty().withMessage('Response is required').isLength({ max: 2000 }),
  validationMiddleware,
];

// Routes
router.post('/', createContactValidator, async (req, res) => {
  try {
    const contact = await Contact.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Contact enquiry submitted successfully',
      data: contact,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to submit enquiry',
      error: error.message,
    });
  }
});

router.get('/', protect, authorize(ROLES.ADMIN), async (req, res) => {
  try {
    const { page = 1, limit = 20, status, category, priority } = req.query;
    const query = {};
    
    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;
    
    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const count = await Contact.countDocuments(query);
    
    res.json({
      success: true,
      data: contacts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contacts',
      error: error.message,
    });
  }
});

router.get('/:id', protect, authorize(ROLES.ADMIN), async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id).populate('assignedTo respondedBy', 'name email');
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact enquiry not found',
      });
    }
    
    res.json({
      success: true,
      data: contact,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact',
      error: error.message,
    });
  }
});

router.patch('/:id/respond', protect, authorize(ROLES.ADMIN), respondToContactValidator, async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact enquiry not found',
      });
    }
    
    contact.response = req.body.response;
    contact.respondedAt = new Date();
    contact.respondedBy = req.user.id;
    contact.status = 'resolved';
    
    await contact.save();
    
    res.json({
      success: true,
      message: 'Response submitted successfully',
      data: contact,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to respond to enquiry',
      error: error.message,
    });
  }
});

router.patch('/:id/status', protect, authorize(ROLES.ADMIN), async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status || !['pending', 'in_progress', 'resolved', 'closed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
      });
    }
    
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact enquiry not found',
      });
    }
    
    res.json({
      success: true,
      message: 'Status updated successfully',
      data: contact,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to update status',
      error: error.message,
    });
  }
});

router.delete('/:id', protect, authorize(ROLES.ADMIN), async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Contact enquiry deleted successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to delete enquiry',
      error: error.message,
    });
  }
});

module.exports = router;