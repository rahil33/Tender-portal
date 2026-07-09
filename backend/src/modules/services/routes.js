const express = require('express');
const servicesService = require('./service');
const servicesValidators = require('./validator');
const { protect } = require('../../middleware/authMiddleware');
const { authorize } = require('../../middleware/authMiddleware');
const { ROLES } = require('../auth/constants');

const router = express.Router();

/**
 * Public Service Browsing Routes
 */
router.get('/', servicesValidators.getAllServicesValidator, async (req, res) => {
  try {
    const { page, limit, category, isPopular, sortBy, sortOrder } = req.query;
    
    const result = await servicesService.getAllServices(
      parseInt(page) || 1,
      parseInt(limit) || 10,
      { category, isPopular, sortBy, sortOrder }
    );
    
    res.json({
      success: true,
      message: 'Services retrieved successfully',
      data: result.data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch services',
      error: error.message,
    });
  }
});

router.get('/search', servicesValidators.searchServicesValidator, async (req, res) => {
  try {
    const { q, page, limit } = req.query;
    
    const result = await servicesService.searchServices(
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
      message: 'Failed to search services',
      error: error.message,
    });
  }
});

router.get('/categories', async (req, res) => {
  try {
    const result = await servicesService.getCategories();
    
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

router.get('/popular', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;
    const result = await servicesService.getPopularServices(limit);
    
    res.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch popular services',
      error: error.message,
    });
  }
});

router.get('/statistics', async (req, res) => {
  try {
    const result = await servicesService.getServiceStatistics();
    
    res.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch service statistics',
      error: error.message,
    });
  }
});

router.get('/:slug', servicesValidators.getServiceValidator, async (req, res) => {
  try {
    const { slug } = req.params;
    
    const result = await servicesService.getServiceBySlug(slug);
    
    res.json({
      success: true,
      message: 'Service retrieved successfully',
      data: result.data,
    });
  } catch (error) {
    const status = error.message === 'Service not found' ? 404 : 500;
    res.status(status).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * Admin Service Management Routes
 */
router.post('/', protect, authorize(ROLES.ADMIN), servicesValidators.createServiceValidator, async (req, res) => {
  try {
    const result = await servicesService.createService(req.body);
    
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

router.get('/admin/:id', protect, authorize(ROLES.ADMIN), servicesValidators.getServiceByIdValidator, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await servicesService.getServiceById(id);
    
    res.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    const status = error.message === 'Service not found' ? 404 : 500;
    res.status(status).json({
      success: false,
      message: error.message,
    });
  }
});

router.put('/:id', protect, authorize(ROLES.ADMIN), servicesValidators.updateServiceValidator, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await servicesService.updateService(id, req.body);
    
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

router.delete('/:id', protect, authorize(ROLES.ADMIN), async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await servicesService.deleteService(id);
    
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

module.exports = router;