/**
 * Reviews/Testimonials Module
 * Handles public reviews, ratings, and testimonials
 */

const express = require('express');
const router = express.Router();
const logger = require('../../config/logger');
const Review = require('../../models/Review');
const { body, query } = require('express-validator');
const { validationMiddleware } = require('../../middleware/validationMiddleware');
const mongoose = require('mongoose');

const createReviewValidator = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
  body('email').trim().notEmpty().withMessage('Email is required').isEmail().normalizeEmail(),
  body('service').trim().notEmpty().withMessage('Service is required').isIn(['GeM Registration', 'Tender Bidding', 'Professional Training', 'Vendor Registration', 'Compliance Services']),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 200 }),
  body('text').trim().notEmpty().withMessage('Review text is required').isLength({ min: 50, max: 2000 }),
  body('location').optional().trim(),
  validationMiddleware,
];

const getReviewsValidator = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('rating').optional().isInt({ min: 1, max: 5 }),
  query('service').optional().trim(),
  query('status').optional().isIn(['pending', 'approved', 'rejected']),
  validationMiddleware,
];

const voteReviewValidator = [
  body('vote').isIn(['helpful', 'notHelpful']).withMessage('Vote must be helpful or notHelpful'),
  validationMiddleware,
];

router.post('/', createReviewValidator, async (req, res) => {
  try {
    logger.info('Received review submission', { body: req.body });
    
    const { name, email, service, rating, title, text, location } = req.body;
    
    const review = await Review.create({
      name,
      email,
      service,
      rating,
      title,
      text,
      location: location || 'India',
      status: 'pending',
    });
    
    logger.info('Review saved successfully', { reviewId: review._id, name, service });
    
    res.status(201).json({
      success: true,
      message: 'Thank you! Your review will be published after verification.',
      data: review,
    });
  } catch (error) {
    logger.error('Failed to submit review', { error: error.message, body: req.body });
    res.status(400).json({
      success: false,
      message: 'Failed to submit review',
      error: error.message,
    });
  }
});

router.get('/', getReviewsValidator, async (req, res) => {
  try {
    logger.info('Fetching reviews', { query: req.query });
    
    const { page = 1, limit = 10, rating, service, status = 'approved' } = req.query;
    
    const filterQuery = { status };
    
    if (rating) filterQuery.rating = parseInt(rating);
    if (service) filterQuery.service = service;
    
    const reviews = await Review.find(filterQuery)
      .select('-email -__v')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const count = await Review.countDocuments(filterQuery);
    
    const averageRating = await Review.aggregate([
      { $match: filterQuery },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } },
    ]);
    
    const ratingBreakdown = await Review.aggregate([
      { $match: filterQuery },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: -1 } },
    ]);
    
    logger.info('Reviews fetched successfully', { count, page, limit });
    
    res.json({
      success: true,
      data: reviews,
      averageRating: averageRating[0]?.avgRating || 0,
      ratingBreakdown,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / parseInt(limit)),
        totalItems: count,
      },
    });
  } catch (error) {
    logger.error('Failed to fetch reviews', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews',
      error: error.message,
    });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const totalReviews = await Review.countDocuments({ status: 'approved' });
    
    const averageRating = await Review.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } },
    ]);
    
    const ratingBreakdown = await Review.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: -1 } },
    ]);
    
    const serviceBreakdown = await Review.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: '$service', count: { $sum: 1 } } },
    ]);
    
    res.json({
      success: true,
      data: {
        totalReviews,
        averageRating: averageRating[0]?.avgRating || 0,
        ratingBreakdown,
        serviceBreakdown,
      },
    });
  } catch (error) {
    logger.error('Failed to fetch review stats', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch review stats',
      error: error.message,
    });
  }
});

router.patch('/:reviewId/vote', voteReviewValidator, async (req, res) => {
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
    }
    
    await review.save();
    
    logger.info('Vote recorded', { reviewId: review._id, vote: req.body.vote });
    
    res.json({
      success: true,
      message: 'Vote recorded',
      data: { helpful: review.helpful },
    });
  } catch (error) {
    logger.error('Failed to vote', { error: error.message });
    res.status(400).json({
      success: false,
      message: 'Failed to vote',
      error: error.message,
    });
  }
});

router.get('/admin/all', async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    
    const filterQuery = {};
    if (status) filterQuery.status = status;
    
    const reviews = await Review.find(filterQuery)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const count = await Review.countDocuments(filterQuery);
    
    res.json({
      success: true,
      data: reviews,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / parseInt(limit)),
        totalItems: count,
      },
    });
  } catch (error) {
    logger.error('Failed to fetch reviews for admin', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews',
      error: error.message,
    });
  }
});

router.patch('/:reviewId/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
      });
    }
    
    const review = await Review.findByIdAndUpdate(
      req.params.reviewId,
      { status },
      { new: true }
    );
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }
    
    logger.info('Review status updated', { reviewId: review._id, status });
    
    res.json({
      success: true,
      message: `Review ${status}`,
      data: review,
    });
  } catch (error) {
    logger.error('Failed to update review status', { error: error.message });
    res.status(400).json({
      success: false,
      message: 'Failed to update review status',
      error: error.message,
    });
  }
});

router.delete('/:reviewId', async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.reviewId);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }
    
    logger.info('Review deleted', { reviewId: review._id });
    
    res.json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    logger.error('Failed to delete review', { error: error.message });
    res.status(400).json({
      success: false,
      message: 'Failed to delete review',
      error: error.message,
    });
  }
});

module.exports = router;