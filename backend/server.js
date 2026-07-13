require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const connectDB = require('./src/config/db');
const { apiVersion } = require('./src/middleware/apiVersion');
const authRoutes = require('./src/modules/auth/routes');
const dashboardRoutes = require('./src/modules/dashboard/dashboard.routes');
const usersRoutes = require('./src/modules/users/users.routes');
const organizationsRoutes = require('./src/modules/organizations/routes');
const tendersRoutes = require('./src/modules/tenders/routes');
const liveTendersRoutes = require('./src/modules/live-tenders/routes');
const bidsRoutes = require('./src/modules/bids/routes');
const categoriesRoutes = require('./src/modules/categories/routes');
const documentsRoutes = require('./src/modules/documents/routes');
const notificationsRoutes = require('./src/modules/notifications/routes');
const adminRoutes = require('./src/modules/admin/routes');
const contactRoutes = require('./src/modules/contact/routes');
const reviewsRoutes = require('./src/modules/reviews/routes');
const faqRoutes = require('./src/modules/faq/routes');
const healthRoutes = require('./src/modules/health/routes');
const docsRoutes = require('./src/modules/docs/routes');
const servicesRoutes = require('./src/modules/services/routes');
const blogRoutes = require('./src/modules/blog/routes');
const bookmarksRoutes = require('./src/modules/bookmarks/routes');
const requestLogger = require('./src/middleware/requestLogger');
const notFoundHandler = require('./src/middleware/notFoundHandler');
const { errorHandler } = require('./src/middleware/errorHandler');
const { generalLimiter } = require('./src/middleware/rateLimiter');
const logger = require('./src/config/logger');

const app = express();

let server;

// ─── DATABASE ─────────────────────────────────────────────────────────
// Connect MongoDB
connectDB();

// ─── MIDDLEWARE ───────────────────────────────────────────────────────
// Security Headers with Enhanced Configuration
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'http://localhost:*', 'https://*'],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: { policy: "same-site" },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: 'deny' },
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: { permittedPolicies: "none" },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  xssFilter: true,
}));

// CORS Configuration with Enhanced Security
const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : [];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like Postman, curl)
    if (!origin) return callback(null, true);

    // In development, allow localhost with explicit port validation
    if (process.env.NODE_ENV !== 'production') {
      if (/^http:\/\/localhost:\d+$/.test(origin)) {
        return callback(null, true);
      }
    }

    // Production: strict whitelist
    if (corsOrigins.includes(origin)) {
      return callback(null, true);
    }

    logger.warn('CORS rejected origin', { origin, path: req.path });
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Request-ID'],
  exposedHeaders: ['X-Request-ID', 'X-RateLimit-Limit', 'X-RateLimit-Remaining'],
  maxAge: 86400, // 24 hours
}));

// Compression
app.use(compression());

// API Versioning
app.use('/api', apiVersion);

// Body Parser with Size Limits and Content-Type Validation
app.use(express.json({ 
  limit: '10mb',
  type: ['application/json', 'application/*+json'],
  strict: true,
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb',
  parameterLimit: 100,
}));

// Request ID for tracing
const { generateSecureToken } = require('./src/utils/security');
app.use((req, res, next) => {
  const requestId = req.headers['x-request-id'] || generateSecureToken(16);
  req.requestId = requestId;
  res.setHeader('X-Request-ID', requestId);
  next();
});

// Request Logging
app.use(requestLogger);

// Rate Limiting (applied after logging)
app.use(generalLimiter);

// ─── ROUTES ───────────────────────────────────────────────────────────
/**
 * Health Check & System Endpoints (No authentication required)
 */
app.use('/health', healthRoutes);
app.use('/api/docs', docsRoutes);
/**
 * Health Check Endpoint
 */
app.get('/', (req, res) => {
  res.json({
    message: 'Phoenix Tender Tech Backend API',
    status: 'running',
    version: '1.0.0',
    apiVersion: 'v1',
    endpoints: {
      health: '/health',
      docs: '/api/docs',
      auth: '/api/auth',
      dashboard: '/api/dashboard',
      users: '/api/users',
      organizations: '/api/organizations',
      tenders: '/api/tenders',
      bids: '/api/bids',
      categories: '/api/categories',
      documents: '/api/documents',
      notifications: '/api/notifications',
      admin: '/api/admin',
      contact: '/api/contact',
      reviews: '/api/reviews',
      faq: '/api/faq',
      services: '/api/services',
      blog: '/api/blog',
      bookmarks: '/api/bookmarks',
    },
    documentation: '/api/docs',
  });
});

/**
 * Auth Module Routes
 * All routes are prefixed with /api/auth
 */
app.use('/api/auth', authRoutes);

/**
 * Dashboard Module Routes
 * All routes are prefixed with /api/dashboard
 */
app.use('/api/dashboard', dashboardRoutes);

/**
 * Users Module Routes
 * All routes are prefixed with /api/users
 */
app.use('/api/users', usersRoutes);

/**
 * Organizations Module Routes
 * All routes are prefixed with /api/organizations
 */
app.use('/api/organizations', organizationsRoutes);

/**
 * Tenders Module Routes
 * All routes are prefixed with /api/tenders
 */
app.use('/api/tenders', tendersRoutes);

/**
 * Live Tenders Module Routes (CPPP Sync)
 * All routes are prefixed with /api/live-tenders
 */
app.use('/api/live-tenders', liveTendersRoutes);

/**
 * Upload Routes
 * All routes are prefixed with /api/upload
 */
const uploadRoutes = require('./src/routes/upload.routes');
app.use('/api/upload', uploadRoutes);

// Serve uploaded files so URLs like /uploads/documents/xyz.pdf actually work
app.use('/uploads', express.static(require('path').resolve(process.env.UPLOAD_PATH || './src/uploads')));

/**
 * Bids Module Routes
 * All routes are prefixed with /api/bids
 */
app.use('/api/bids', bidsRoutes);

/**
 * Categories Module Routes
 * All routes are prefixed with /api/categories
 */
app.use('/api/categories', categoriesRoutes);

/**
 * Documents Module Routes
 * All routes are prefixed with /api/documents
 */
app.use('/api/documents', documentsRoutes);

/**
 * Notifications Module Routes
 * All routes are prefixed with /api/notifications
 */
app.use('/api/notifications', notificationsRoutes);

/**
 * Admin Module Routes
 * All routes are prefixed with /api/admin
 */
app.use('/api/admin', adminRoutes);

/**
 * Contact Module Routes
 * All routes are prefixed with /api/contact
 */
app.use('/api/contact', contactRoutes);

/**
 * Reviews Module Routes
 * All routes are prefixed with /api/reviews
 */
app.use('/api/reviews', reviewsRoutes);

/**
 * FAQ Module Routes
 * All routes are prefixed with /api/faq
 */
app.use('/api/faq', faqRoutes);

/**
 * Services Module Routes
 * All routes are prefixed with /api/services
 */
app.use('/api/services', servicesRoutes);

/**
 * Blog/Resources Module Routes
 * All routes are prefixed with /api/blog
 */
app.use('/api/blog', blogRoutes);

/**
 * Bookmarks Module Routes
 * All routes are prefixed with /api/bookmarks
 */
app.use('/api/bookmarks', bookmarksRoutes);

// ─── ERROR HANDLING ───────────────────────────────────────────────────
/**
 * 404 Not Found Handler
 */
app.use(notFoundHandler);

/**
 * Global Error Handler
 */
app.use(errorHandler);

// ─── SERVER STARTUP ───────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

// Start Tender Sync Scheduler
const tenderSyncScheduler = require('./src/services/tenderSyncScheduler');
tenderSyncScheduler.start();

server = app.listen(PORT, () => {
  console.log(`
  ╔════════════════════════════════════════════════╗
  ║  Phoenix Tender Tech Backend API               ║
  ║  Server running on http://localhost:${PORT}      ║
  ║  Environment: ${process.env.NODE_ENV || 'development'}           ║
  ║  Live Tender Sync: Enabled (60 min interval)   ║
  ╚════════════════════════════════════════════════╝
  `);
});

// ─── GRACEFUL SHUTDOWN ────────────────────────────────────────────────
const gracefulShutdown = async (signal) => {
  logger.info(`Graceful shutdown initiated (${signal})`);
  
  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed');
      
      try {
        const mongoose = require('mongoose');
        await mongoose.connection.close();
        logger.info('MongoDB connection closed');
      } catch (error) {
        logger.error('Error closing MongoDB connection:', error);
      }
      
      process.exit(0);
    });
    
    setTimeout(() => {
      logger.error('Forced shutdown due to timeout');
      process.exit(1);
    }, 30000);
  }
};

process.on('SIGTERM', () => gracefulShutdownWrapper('SIGTERM'));
process.on('SIGINT', () => gracefulShutdownWrapper('SIGINT'));

process.on('uncaughtException', (error) => {
  console.error("UNCAUGHT EXCEPTION");
    console.error(error);
  logger.error('Uncaught Exception:', error);
  gracefulShutdownWrapper('uncaughtException');
});

// Stop scheduler on shutdown
const originalGracefulShutdown = gracefulShutdown;
const gracefulShutdownWrapper = async (signal) => {
  tenderSyncScheduler.stop();
  await originalGracefulShutdown(signal);
};

process.on('unhandledRejection', (reason, promise) => {
  console.error("UNHANDLED REJECTION");
    console.error(reason);
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdownWrapper('unhandledRejection');
});

module.exports = app;
