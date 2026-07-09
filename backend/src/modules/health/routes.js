const express = require('express');
const mongoose = require('mongoose');
const os = require('os');
const packageJson = require('../../../package.json');
const AuditLog = require('../../models/AuditLog');

const router = express.Router();

// Health check endpoint
router.get('/', async (req, res) => {
  const startTime = Date.now();
  
  try {
    // Check database connection
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    const dbResponseTime = Date.now() - startTime;
    
    // Get system info
    const systemInfo = {
      platform: os.platform(),
      arch: os.arch(),
      cpus: os.cpus().length,
      memory: {
        total: Math.round(os.totalmem() / 1024 / 1024),
        free: Math.round(os.freemem() / 1024 / 1024),
        used: Math.round((os.totalmem() - os.freemem()) / 1024 / 1024),
      },
      uptime: os.uptime(),
    };
    
    // Get process info
    const processInfo = {
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      version: process.version,
    };
    
    // Get basic stats
    const totalUsers = await mongoose.model('User').countDocuments().catch(() => 0);
    const totalTenders = await mongoose.model('Tender').countDocuments().catch(() => 0);
    const totalOrganizations = await mongoose.model('Organization').countDocuments().catch(() => 0);
    const totalAuditLogs = await AuditLog.countDocuments().catch(() => 0);
    
    res.json({
      status: 'healthy',
      version: packageJson.version,
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      responseTime: `${Date.now() - startTime}ms`,
      database: {
        status: dbStatus,
        responseTime: `${dbResponseTime}ms`,
      },
      system: systemInfo,
      process: processInfo,
      statistics: {
        totalUsers,
        totalTenders,
        totalOrganizations,
        totalAuditLogs,
      },
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Readiness check
router.get('/ready', async (req, res) => {
  try {
    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        status: 'not_ready',
        reason: 'Database not connected',
      });
    }
    
    // Check if we can query the database
    await mongoose.model('User').countDocuments();
    
    res.json({
      status: 'ready',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'not_ready',
      reason: error.message,
    });
  }
});

// Liveness check
router.get('/live', (req, res) => {
  res.json({
    status: 'alive',
    timestamp: new Date().toISOString(),
  });
});

// Detailed health check
router.get('/detailed', async (req, res) => {
  try {
    const checks = {
      database: {
        status: 'unknown',
        message: '',
      },
      memory: {
        status: 'unknown',
        message: '',
      },
      disk: {
        status: 'unknown',
        message: '',
      },
    };
    
    // Database check
    try {
      await mongoose.model('User').countDocuments();
      checks.database.status = 'healthy';
      checks.database.message = 'Database connection OK';
    } catch (error) {
      checks.database.status = 'unhealthy';
      checks.database.message = error.message;
    }
    
    // Memory check
    const memoryUsage = process.memoryUsage();
    const memoryPercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
    
    if (memoryPercent < 80) {
      checks.memory.status = 'healthy';
      checks.memory.message = `Memory usage: ${Math.round(memoryPercent)}%`;
    } else if (memoryPercent < 90) {
      checks.memory.status = 'warning';
      checks.memory.message = `Memory usage: ${Math.round(memoryPercent)}% (high)`;
    } else {
      checks.memory.status = 'critical';
      checks.memory.message = `Memory usage: ${Math.round(memoryPercent)}% (critical)`;
    }
    
    // Disk check (basic)
    const diskUsage = 100 - ((os.freemem() / os.totalmem()) * 100);
    
    if (diskUsage < 80) {
      checks.disk.status = 'healthy';
      checks.disk.message = `Disk usage: ${Math.round(diskUsage)}%`;
    } else if (diskUsage < 90) {
      checks.disk.status = 'warning';
      checks.disk.message = `Disk usage: ${Math.round(diskUsage)}% (high)`;
    } else {
      checks.disk.status = 'critical';
      checks.disk.message = `Disk usage: ${Math.round(diskUsage)}% (critical)`;
    }
    
    const overallStatus = Object.values(checks).every(c => c.status === 'healthy')
      ? 'healthy'
      : Object.values(checks).some(c => c.status === 'critical')
      ? 'critical'
      : 'degraded';
    
    res.json({
      status: overallStatus,
      checks,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      error: error.message,
    });
  }
});

module.exports = router;