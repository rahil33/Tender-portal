const { Bid } = require('../modules/bids/model');
const { Tender } = require('../modules/tenders/model');
const User = require('../models/User');
const { Organization } = require('../modules/organizations/model');
const logger = require('../config/logger');

/**
 * Validate that the user owns the bid
 * Only bid owner (vendorId) can modify/delete the bid
 */
const validateBidOwnership = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?.userId;
    const bidId = req.params?.bidId;

    if (!userId) {
      logger.warn('User ID not available for ownership check');
      return res.status(401).json({
        success: false,
        message: 'User authentication required',
      });
    }

    if (!bidId) {
      logger.warn('Bid ID not available for ownership check');
      return res.status(400).json({
        success: false,
        message: 'Bid ID required',
      });
    }

    const bid = await Bid.findById(bidId).populate('tenderId');

    if (!bid || bid.isDeleted) {
      logger.warn(`Bid not found or deleted: ${bidId}`);
      return res.status(404).json({
        success: false,
        message: 'Bid not found',
      });
    }

    // Check if user is the bid owner
    if (bid.vendorId.toString() !== userId) {
      logger.warn(`Ownership validation failed: User ${userId} is not owner of bid ${bidId}`);
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only modify your own bids',
      });
    }

    // Attach bid to request for downstream use
    req.bid = bid;
    next();
  } catch (error) {
    logger.error('Ownership validation error', { error: error.message });
    return res.status(500).json({
      success: false,
      message: 'Failed to validate ownership',
    });
  }
};

/**
 * Validate tender ownership for sellers
 * Only tender creator can modify/delete the tender
 */
const validateTenderOwnership = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?.userId;
    const tenderId = req.params?.tenderId;

    if (!userId) {
      logger.warn('User ID not available for tender ownership check');
      return res.status(401).json({
        success: false,
        message: 'User authentication required',
      });
    }

    if (!tenderId) {
      logger.warn('Tender ID not available for ownership check');
      return res.status(400).json({
        success: false,
        message: 'Tender ID required',
      });
    }

    const tender = await Tender.findById(tenderId);

    if (!tender || tender.isDeleted) {
      logger.warn(`Tender not found or deleted: ${tenderId}`);
      return res.status(404).json({
        success: false,
        message: 'Tender not found',
      });
    }

    // Check if user is the tender creator
    if (tender.createdBy.toString() !== userId) {
      logger.warn(`Tender ownership validation failed: User ${userId} is not creator of tender ${tenderId}`);
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only modify tenders you created',
      });
    }

    req.tender = tender;
    next();
  } catch (error) {
    logger.error('Tender ownership validation error', { error: error.message });
    return res.status(500).json({
      success: false,
      message: 'Failed to validate tender ownership',
    });
  }
};

/**
 * Validate bid deadline has not passed
 * Prevents bid submission/editing after deadline
 */
const validateBidDeadline = async (req, res, next) => {
  try {
    const bidId = req.params?.bidId;
    
    if (!bidId) {
      return next();
    }

    const bid = await Bid.findById(bidId).populate('tenderId');

    if (!bid || bid.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Bid not found',
      });
    }

    const tender = bid.tenderId;
    if (!tender) {
      return res.status(404).json({
        success: false,
        message: 'Associated tender not found',
      });
    }

    const deadline = tender.submissionDeadline;
    if (!deadline) {
      return next();
    }

    if (new Date(deadline) < new Date()) {
      logger.info(`Bid deadline passed for bid ${bidId}, tender ${tender._id}`);
      return res.status(400).json({
        success: false,
        message: 'Cannot modify bid after submission deadline',
        deadline: deadline,
      });
    }

    req.deadlineValidated = true;
    next();
  } catch (error) {
    logger.error('Deadline validation error', { error: error.message });
    return res.status(500).json({
      success: false,
      message: 'Failed to validate deadline',
    });
  }
};

/**
 * Validate tender status allows bid operations
 * Only published tenders can accept bids
 */
const validateTenderStatus = async (req, res, next) => {
  try {
    const tenderId = req.body?.tenderId || req.params?.tenderId;

    if (!tenderId) {
      return next();
    }

    const tender = await Tender.findById(tenderId);

    if (!tender || tender.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Tender not found',
      });
    }

    if (tender.status !== 'published') {
      logger.info(`Cannot submit bid to tender ${tenderId} with status ${tender.status}`);
      return res.status(400).json({
        success: false,
        message: `Cannot submit bids to tender with status: ${tender.status}`,
      });
    }

    req.tenderStatusValidated = true;
    next();
  } catch (error) {
    logger.error('Tender status validation error', { error: error.message });
    return res.status(500).json({
      success: false,
      message: 'Failed to validate tender status',
    });
  }
};

/**
 * Validate user profile ownership
 * Only user can modify their own profile
 */
const validateUserOwnership = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?.userId;
    const targetUserId = req.params?.userId;

    if (!userId) {
      logger.warn('User ID not available for ownership check');
      return res.status(401).json({
        success: false,
        message: 'User authentication required',
      });
    }

    if (!targetUserId) {
      logger.warn('User ID not available for ownership check');
      return res.status(400).json({
        success: false,
        message: 'User ID required',
      });
    }

    // Allow admins to access any user profile
    if (req.user?.role === 'admin') {
      return next();
    }

    // Check if user is accessing their own profile
    if (targetUserId !== userId) {
      logger.warn(`Ownership validation failed: User ${userId} tried to access user ${targetUserId}`);
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only modify your own profile',
      });
    }

    req.userProfile = await User.findById(userId).select('-password');
    next();
  } catch (error) {
    logger.error('User ownership validation error', { error: error.message });
    return res.status(500).json({
      success: false,
      message: 'Failed to validate ownership',
    });
  }
};

/**
 * Validate organization membership and ownership
 * Only organization members can access/modify the organization
 */
const validateOrganizationMembership = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?.userId;
    const organizationId = req.params?.organizationId;

    if (!userId) {
      logger.warn('User ID not available for organization membership check');
      return res.status(401).json({
        success: false,
        message: 'User authentication required',
      });
    }

    if (!organizationId) {
      logger.warn('Organization ID not available for membership check');
      return res.status(400).json({
        success: false,
        message: 'Organization ID required',
      });
    }

    // Allow admins to access any organization
    if (req.user?.role === 'admin') {
      return next();
    }

    const organization = await Organization.findById(organizationId);

    if (!organization || organization.isDeleted) {
      logger.warn(`Organization not found or deleted: ${organizationId}`);
      return res.status(404).json({
        success: false,
        message: 'Organization not found',
      });
    }

    // Check if organization is active
    if (!organization.isActive) {
      logger.warn(`Organization is not active: ${organizationId}`);
      return res.status(403).json({
        success: false,
        message: 'Organization is not active',
      });
    }

    // Check if user is a member of the organization
    const isMember = organization.members?.some(
      member => member.userId?.toString() === userId
    );

    // Allow organization creator
    const isCreator = organization.createdBy?.toString() === userId;

    if (!isMember && !isCreator) {
      logger.warn(`User ${userId} is not a member of organization ${organizationId}`);
      return res.status(403).json({
        success: false,
        message: 'Access denied. Organization membership required',
      });
    }

    req.organization = organization;
    next();
  } catch (error) {
    logger.error('Organization membership validation error', { error: error.message });
    return res.status(500).json({
      success: false,
      message: 'Failed to validate organization access',
    });
  }
};

/**
 * Validate organization ownership for modifications
 * Only organization creator or admin can modify/delete the organization
 */
const validateOrganizationOwnership = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?.userId;
    const organizationId = req.params?.organizationId;

    if (!userId) {
      logger.warn('User ID not available for organization ownership check');
      return res.status(401).json({
        success: false,
        message: 'User authentication required',
      });
    }

    if (!organizationId) {
      logger.warn('Organization ID not available for ownership check');
      return res.status(400).json({
        success: false,
        message: 'Organization ID required',
      });
    }

    // Allow admins to modify any organization
    if (req.user?.role === 'admin') {
      return next();
    }

    const organization = await Organization.findById(organizationId);

    if (!organization || organization.isDeleted) {
      logger.warn(`Organization not found or deleted: ${organizationId}`);
      return res.status(404).json({
        success: false,
        message: 'Organization not found',
      });
    }

    // Check if user is the organization creator
    if (organization.createdBy.toString() !== userId) {
      logger.warn(`Organization ownership validation failed: User ${userId} is not creator of organization ${organizationId}`);
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only modify organizations you created',
      });
    }

    req.organization = organization;
    next();
  } catch (error) {
    logger.error('Organization ownership validation error', { error: error.message });
    return res.status(500).json({
      success: false,
      message: 'Failed to validate organization ownership',
    });
  }
};

module.exports = {
  validateBidOwnership,
  validateTenderOwnership,
  validateBidDeadline,
  validateTenderStatus,
  validateUserOwnership,
  validateOrganizationMembership,
  validateOrganizationOwnership,
};