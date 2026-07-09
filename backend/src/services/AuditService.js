const AuditLog = require('../models/AuditLog');
const logger = require('../config/logger');

const createAuditLog = async (options) => {
  const {
    action,
    resourceType,
    resourceId,
    user,
    req,
    status = 'SUCCESS',
    changes,
    metadata,
    duration,
  } = options;
  
  try {
    const auditLog = await AuditLog.create({
      action,
      resourceType,
      resourceId,
      performedBy: user?.id || user?.userId,
      performedByEmail: user?.email,
      ipAddress: req?.ip,
      userAgent: req?.get('user-agent'),
      status,
      changes,
      metadata,
      duration,
    });
    
    logger.audit(action, user?.id, resourceType, resourceId, { status });
    
    return auditLog;
  } catch (error) {
    logger.error('Failed to create audit log', { error: error.message });
    throw error;
  }
};

const getAuditLogs = async (filters, page = 1, limit = 50) => {
  const query = {};
  
  if (filters.action) query.action = filters.action;
  if (filters.resourceType) query.resourceType = filters.resourceType;
  if (filters.performedBy) query.performedBy = filters.performedBy;
  if (filters.status) query.status = filters.status;
  if (filters.startDate || filters.endDate) {
    query.createdAt = {};
    if (filters.startDate) query.createdAt.$gte = new Date(filters.startDate);
    if (filters.endDate) query.createdAt.$lte = new Date(filters.endDate);
  }
  
  const logs = await AuditLog.find(query)
    .populate('performedBy', 'fullName email role')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip((page - 1) * limit);
  
  const total = await AuditLog.countDocuments(query);
  
  return {
    logs,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
    },
  };
};

const getAuditLogsByResource = async (resourceType, resourceId) => {
  return await AuditLog.find({ resourceType, resourceId })
    .sort({ createdAt: -1 })
    .limit(100);
};

const getAuditLogsByUser = async (userId, limit = 100) => {
  return await AuditLog.find({ performedBy: userId })
    .sort({ createdAt: -1 })
    .limit(limit);
};

const getAuditStatistics = async (startDate, endDate) => {
  const query = {};
  
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }
  
  const stats = await AuditLog.aggregate([
    { $match: query },
    {
      $group: {
        _id: '$action',
        count: { $sum: 1 },
      },
    },
  ]);
  
  const total = await AuditLog.countDocuments(query);
  const failures = await AuditLog.countDocuments({ ...query, status: 'FAILURE' });
  
  return {
    total,
    failures,
    successRate: total > 0 ? ((total - failures) / total) * 100 : 0,
    byAction: stats,
  };
};

const exportAuditLogs = async (filters, format = 'json') => {
  const logs = await AuditLog.find(filters)
    .populate('performedBy', 'fullName email role')
    .sort({ createdAt: -1 })
    .lean();
  
  if (format === 'csv') {
    // Simple CSV conversion
    const headers = ['Timestamp', 'Action', 'Resource', 'User', 'Email', 'IP', 'Status'];
    const rows = logs.map(log => [
      log.createdAt,
      log.action,
      log.resourceType,
      log.performedBy?.fullName || 'N/A',
      log.performedByEmail || 'N/A',
      log.ipAddress || 'N/A',
      log.status,
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }
  
  return JSON.stringify(logs, null, 2);
};

module.exports = {
  createAuditLog,
  getAuditLogs,
  getAuditLogsByResource,
  getAuditLogsByUser,
  getAuditStatistics,
  exportAuditLogs,
};