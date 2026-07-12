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

const app = express();

// ─── DATABASE ─────────────────────────────────────────────────────────
// Connect MongoDB
connectDB();

// ─── MIDDLEWARE ───────────────────────────────────────────────────────
// Security Headers
app.use(helmet());

// CORS Configuration
const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : [];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like Postman, curl)
    if (!origin) return callback(null, true);

    // In development, allow any localhost port automatically
    if (process.env.NODE_ENV !== 'production' && /^http:\/\/localhost:\d+$/.test(origin)) {
      return callback(null, true);
    }

    // Otherwise check the explicit allow-list
    if (corsOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// Compression
app.use(compression());

// API Versioning
app.use('/api', apiVersion);

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request Logging
app.use(requestLogger);

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

app.listen(PORT, () => {
  console.log(`
  ╔════════════════════════════════════════════════╗
  ║  Phoenix Tender Tech Backend API               ║
  ║  Server running on http://localhost:${PORT}      ║
  ║  Environment: ${process.env.NODE_ENV || 'development'}           ║
  ╚════════════════════════════════════════════════╝
  `);
});

module.exports = app;
