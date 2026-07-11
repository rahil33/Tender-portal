/**
 * Supabase to MongoDB Synchronization Middleware
 * Automatically syncs data from Supabase (primary) to MongoDB Atlas
 */

const SyncService = require('../services/SyncService');
const AnalyticsService = require('../services/AnalyticsService');
const AuditService = require('../services/AuditService');
const logger = require('../config/logger');

let syncServiceInstance = null;

const getSyncService = () => {
  if (!syncServiceInstance) {
    syncServiceInstance = new SyncService(process.env.MONGO_URI);
    syncServiceInstance.connect();
  }
  return syncServiceInstance;
};

/**
 * Middleware to synchronize CREATE operations
 */
const syncOnCreate = (collectionName) => {
  return async (req, res, next) => {
    const originalJson = res.json.bind(res);
    
    res.json = async (data) => {
      try {
        // Call original res.json
        const result = originalJson(data);
        
        // Get created document ID from response
        const docId = data.data?._id || data.data?.id || data._id || data.id;
        const sourceTable = collectionName;
        
        if (docId) {
          const syncService = getSyncService();
          await syncService.addToQueue({
            sourceTable,
            sourceId: docId.toString(),
            action: 'INSERT',
            data: data.data || data,
          });
          
          logger.info(`Sync queued for CREATE: ${sourceTable}:${docId}`);
        }
        
        return result;
      } catch (error) {
        logger.error('Sync onCreate middleware error', { error: error.message });
        // Don't fail the request if sync fails
      }
      
      return originalJson(data);
    };
    
    next();
  };
};

/**
 * Middleware to synchronize UPDATE operations
 */
const syncOnUpdate = (collectionName) => {
  return async (req, res, next) => {
    const originalJson = res.json.bind(res);
    
    res.json = async (data) => {
      try {
        const result = originalJson(data);
        
        const docId = data.data?._id || data.data?.id || data._id || data.id;
        
        if (docId && req.body) {
          const syncService = getSyncService();
          await syncService.addToQueue({
            sourceTable: collectionName,
            sourceId: docId.toString(),
            action: 'UPDATE',
            data: { ...req.body, updated_at: new Date() },
          });
          
          logger.info(`Sync queued for UPDATE: ${collectionName}:${docId}`);
        }
        
        return result;
      } catch (error) {
        logger.error('Sync onUpdate middleware error', { error: error.message });
      }
      
      return originalJson(data);
    };
    
    next();
  };
};

/**
 * Middleware to synchronize DELETE operations (soft delete)
 */
const syncOnDelete = (collectionName) => {
  return async (req, res, next) => {
    const originalJson = res.json.bind(res);
    
    res.json = async (data) => {
      try {
        const result = originalJson(data);
        
        const docId = req.params.id || req.body.id;
        
        if (docId) {
          const syncService = getSyncService();
          await syncService.addToQueue({
            sourceTable: collectionName,
            sourceId: docId.toString(),
            action: 'DELETE',
          });
          
          logger.info(`Sync queued for DELETE: ${collectionName}:${docId}`);
        }
        
        return result;
      } catch (error) {
        logger.error('Sync onDelete middleware error', { error: error.message });
      }
      
      return originalJson(data);
    };
    
    next();
  };
};

/**
 * Middleware to synchronize document uploads
 */
const syncOnDocumentUpload = () => {
  return async (req, res, next) => {
    const originalJson = res.json.bind(res);
    
    res.json = async (data) => {
      try {
        const result = originalJson(data);
        
        const docId = data.data?._id || data.data?.id || data._id || data.id;
        
        if (docId && req.file) {
          const syncService = getSyncService();
          await syncService.addToQueue({
            sourceTable: 'documents',
            sourceId: docId.toString(),
            action: 'INSERT',
            data: {
              fileName: req.file.originalname,
              fileUrl: data.data?.fileUrl || data.data?.url,
              fileSize: req.file.size,
              mimeType: req.file.mimetype,
              uploadedBy: req.user?.id || req.user?.userId,
            },
          });
          
          logger.info(`Document sync queued: ${docId}`);
        }
        
        return result;
      } catch (error) {
        logger.error('Document sync middleware error', { error: error.message });
      }
      
      return originalJson(data);
    };
    
    next();
  };
};

/**
 * Middleware to log all API requests for audit
 */
const auditRequest = () => {
  return async (req, res, next) => {
    const startTime = Date.now();
    
    res.on('finish', async () => {
      try {
        const duration = Date.now() - startTime;
        const action = getActionFromMethod(req.method);
        
        // Create audit log
        await AuditService.createAuditLog({
          action,
          resourceType: getResourceTypeFromPath(req.path),
          resourceId: req.params.id,
          user: req.user,
          req: {
            ip: req.ip,
            'user-agent': req.get('user-agent'),
          },
          status: res.statusCode < 400 ? 'SUCCESS' : 'FAILURE',
          metadata: {
            method: req.method,
            path: req.path,
            query: req.query,
            duration: `${duration}ms`,
          },
          duration,
        });
      } catch (error) {
        logger.error('Audit logging failed', { error: error.message });
      }
    });
    
    next();
  };
};

/**
 * Middleware to record analytics for specific endpoints
 */
const recordAnalytics = (eventType) => {
  return async (req, res, next) => {
    const originalJson = res.json.bind(res);
    
    res.json = async (data) => {
      try {
        const result = originalJson(data);
        
        // Record analytics based on event type
        switch (eventType) {
          case 'tender_created':
            await AnalyticsService.recordTenderCreated(data.data || data);
            break;
          case 'bid_submitted':
            await AnalyticsService.recordBidSubmitted(data.data || data);
            break;
          case 'search':
            await AnalyticsService.recordSearch(
              req.query.q,
              data.data?.length || 0,
              req.user?.id
            );
            break;
        }
        
        // Record user activity
        if (req.user?.id) {
          await AnalyticsService.recordUserActivity(req.user.id, {
            type: eventType,
            resourceType: getResourceTypeFromPath(req.path),
            resourceId: req.params.id,
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
          });
        }
      } catch (error) {
        logger.error('Analytics recording failed', { error: error.message });
      }
      
      return originalJson(data);
    };
    
    next();
  };
};

/**
 * Helper function to get action from HTTP method
 */
function getActionFromMethod(method) {
  const mapping = {
    GET: 'READ',
    POST: 'CREATE',
    PUT: 'UPDATE',
    PATCH: 'UPDATE',
    DELETE: 'DELETE',
  };
  return mapping[method] || 'OTHER';
}

/**
 * Helper function to get resource type from path
 */
function getResourceTypeFromPath(path) {
  const mapping = {
    '/users': 'User',
    '/organizations': 'Organization',
    '/tenders': 'Tender',
    '/bids': 'Bid',
    '/documents': 'Document',
    '/notifications': 'Notification',
    '/categories': 'Category',
    '/auth': 'Auth',
  };
  
  for (const [key, value] of Object.entries(mapping)) {
    if (path.startsWith(key)) {
      return value;
    }
  }
  
  return 'Other';
}

/**
 * Initialize sync service on application startup
 */
const initializeSyncService = async () => {
  try {
    const syncService = getSyncService();
    logger.info('Sync service initialized successfully');
    
    // Process any pending sync items
    setTimeout(async () => {
      await syncService.processQueue();
    }, 5000);
    
    // Schedule periodic queue processing
    setInterval(async () => {
      await syncService.processQueue();
    }, 30000); // Every 30 seconds
    
    return syncService;
  } catch (error) {
    logger.error('Failed to initialize sync service', { error: error.message });
    throw error;
  }
};

/**
 * Get sync statistics endpoint handler
 */
const getSyncStats = async (req, res) => {
  try {
    const syncService = getSyncService();
    const stats = await syncService.getSyncStats();
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Retry dead letter queue items endpoint handler
 */
const retryDeadLetterQueue = async (req, res) => {
  try {
    const syncService = getSyncService();
    const result = await syncService.retryDeadLetterQueue(req.body.limit || 10);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  syncOnCreate,
  syncOnUpdate,
  syncOnDelete,
  syncOnDocumentUpload,
  auditRequest,
  recordAnalytics,
  initializeSyncService,
  getSyncStats,
  retryDeadLetterQueue,
};