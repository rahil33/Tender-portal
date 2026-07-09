const express = require('express');
const blogService = require('./service');
const blogValidators = require('./validator');
const { protect } = require('../../middleware/authMiddleware');
const { authorize } = require('../../middleware/authMiddleware');
const { ROLES } = require('../auth/constants');

const router = express.Router();

/**
 * Public Blog Routes
 */
router.get('/posts', blogValidators.getAllPostsValidator, async (req, res) => {
  try {
    const { page, limit, category, tag, sortBy, sortOrder } = req.query;
    
    const result = await blogService.getAllPosts(
      parseInt(page) || 1,
      parseInt(limit) || 10,
      { category, tag, sortBy, sortOrder }
    );
    
    res.json({
      success: true,
      message: 'Blog posts retrieved successfully',
      data: result.data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blog posts',
      error: error.message,
    });
  }
});

router.get('/posts/search', blogValidators.searchPostsValidator, async (req, res) => {
  try {
    const { q, page, limit } = req.query;
    
    const result = await blogService.searchPosts(
      q,
      parseInt(page) || 1,
      parseInt(limit) || 10
    );
    
    res.json({
      success: true,
      message: 'Search results',
      data: result.data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to search blog posts',
      error: error.message,
    });
  }
});

router.get('/posts/:slug', blogValidators.getPostBySlugValidator, async (req, res) => {
  try {
    const { slug } = req.params;
    
    const result = await blogService.getPostBySlug(slug);
    
    res.json({
      success: true,
      message: 'Blog post retrieved successfully',
      data: result.data,
    });
  } catch (error) {
    const status = error.message === 'Blog post not found' ? 404 : 500;
    res.status(status).json({
      success: false,
      message: error.message,
    });
  }
});

router.get('/categories', async (req, res) => {
  try {
    const result = await blogService.getCategories();
    
    res.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message,
    });
  }
});

router.get('/tags', async (req, res) => {
  try {
    const result = await blogService.getTags();
    
    res.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tags',
      error: error.message,
    });
  }
});

router.post('/newsletter/subscribe', blogValidators.newsletterSubscribeValidator, async (req, res) => {
  try {
    const { email, source } = req.body;
    
    const result = await blogService.subscribeToNewsletter(email, source);
    
    res.status(201).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

router.post('/newsletter/unsubscribe', blogValidators.newsletterUnsubscribeValidator, async (req, res) => {
  try {
    const { email } = req.body;
    
    const result = await blogService.unsubscribeFromNewsletter(email);
    
    res.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * Admin Blog Management Routes
 */
router.post('/admin/posts', protect, authorize(ROLES.ADMIN), blogValidators.createPostValidator, async (req, res) => {
  try {
    const result = await blogService.createPost(req.body);
    
    res.status(201).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

router.put('/admin/posts/:id', protect, authorize(ROLES.ADMIN), blogValidators.updatePostValidator, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await blogService.updatePost(id, req.body);
    
    res.json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

router.delete('/admin/posts/:id', protect, authorize(ROLES.ADMIN), async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await blogService.deletePost(id);
    
    res.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

router.get('/admin/statistics', protect, authorize(ROLES.ADMIN), async (req, res) => {
  try {
    const result = await blogService.getBlogStatistics();
    
    res.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blog statistics',
      error: error.message,
    });
  }
});

module.exports = router;