const express = require('express');
const liveTenderService = require('../../services/LiveTenderService');

const router = express.Router();

/**
 * GET /api/live-tenders
 * Fetch live tenders from CPPP with optional filters
 */
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      location,
      state,
    } = req.query;

    const result = await liveTenderService.getLiveTenders({
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      category,
      location,
      state,
    });

    res.json({
      success: true,
      message: 'Live tenders fetched successfully',
      data: result.data,
    });
  } catch (error) {
    console.error('Live tenders API error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch live tenders',
      error: error.message,
    });
  }
});

/**
 * GET /api/live-tenders/states
 * Get list of available states
 */
router.get('/states', async (req, res) => {
  try {
    const states = await liveTenderService.getStates();
    res.json({
      success: true,
      data: states,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch states',
      error: error.message,
    });
  }
});

/**
 * GET /api/live-tenders/departments
 * Get list of available departments/ministries
 */
router.get('/departments', async (req, res) => {
  try {
    const departments = await liveTenderService.getDepartments();
    res.json({
      success: true,
      data: departments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch departments',
      error: error.message,
    });
  }
});

/**
 * GET /api/live-tenders/:cpppId
 * Get details of a specific tender
 */
router.get('/:cpppId', async (req, res) => {
  try {
    const { cpppId } = req.params;
    const result = await liveTenderService.getTenderDetails(cpppId);
    
    res.json({
      success: true,
      message: 'Tender details fetched successfully',
      data: result.data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tender details',
      error: error.message,
    });
  }
});

/**
 * POST /api/live-tenders/:cpppId/download
 * Download tender document
 */
router.post('/:cpppId/download', async (req, res) => {
  try {
    const { documentUrl } = req.body;
    
    if (!documentUrl) {
      return res.status(400).json({
        success: false,
        message: 'documentUrl is required',
      });
    }

    const result = await liveTenderService.downloadDocument(documentUrl);
    
    res.setHeader('Content-Type', result.data.contentType);
    res.setHeader('Content-Disposition', 'attachment; filename="tender-document.pdf"');
    res.send(result.data.content);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to download document',
      error: error.message,
    });
  }
});

/**
 * DELETE /api/live-tenders/cache
 * Clear service cache
 */
router.delete('/cache', async (req, res) => {
  try {
    liveTenderService.clearCache();
    res.json({
      success: true,
      message: 'Cache cleared successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to clear cache',
      error: error.message,
    });
  }
});

module.exports = router;