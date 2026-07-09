const express = require('express');
const authRoutes = require('../modules/auth/routes');
const dashboardRoutes = require('../modules/dashboard/dashboard.routes');
const usersRoutes = require('../modules/users/users.routes');
const organizationsRoutes = require('../modules/organizations/routes');
const tendersRoutes = require('../modules/tenders/routes');
const bidsRoutes = require('../modules/bids/routes');
const categoriesRoutes = require('../modules/categories/routes');
const documentsRoutes = require('../modules/documents/routes');
const notificationsRoutes = require('../modules/notifications/routes');
const adminRoutes = require('../modules/admin/routes');
const { protect } = require('../middleware/authMiddleware');
const { apiLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

const routes = [
  {
    path: '/auth',
    routes: authRoutes,
    description: 'Authentication and authorization endpoints',
    public: true,
  },
  {
    path: '/dashboard',
    routes: dashboardRoutes,
    description: 'User dashboard operations and statistics',
    public: false,
  },
  {
    path: '/users',
    routes: usersRoutes,
    description: 'User management endpoints',
    public: false,
  },
  {
    path: '/organizations',
    routes: organizationsRoutes,
    description: 'Organization management endpoints',
    public: false,
  },
  {
    path: '/tenders',
    routes: tendersRoutes,
    description: 'Tender management endpoints',
    public: false,
  },
  {
    path: '/bids',
    routes: bidsRoutes,
    description: 'Bid management endpoints',
    public: false,
  },
  {
    path: '/categories',
    routes: categoriesRoutes,
    description: 'Category management endpoints',
    public: false,
  },
  {
    path: '/documents',
    routes: documentsRoutes,
    description: 'Document management endpoints',
    public: false,
  },
  {
    path: '/notifications',
    routes: notificationsRoutes,
    description: 'Notification management endpoints',
    public: false,
  },
  {
    path: '/admin',
    routes: adminRoutes,
    description: 'Admin and moderation endpoints',
    public: false,
  },
];

routes.forEach(({ path, routes: routeHandler, description, public: isPublic }) => {
  if (!isPublic) {
    router.use(path, apiLimiter, protect, routeHandler);
  } else {
    router.use(path, apiLimiter, routeHandler);
  }
});

const getApiDocumentation = () => {
  return {
    version: '1.0.0',
    baseUrl: '/api',
    endpoints: routes.map(({ path, description, public: isPublic }) => ({
      path: `/api${path}`,
      description,
      authentication: isPublic ? 'Optional' : 'Required',
    })),
  };
};

router.get('/', (req, res) => {
  res.json({
    message: 'Phoenix Tender Tech API',
    version: '1.0.0',
    status: 'running',
    documentation: getApiDocumentation(),
  });
});

module.exports = router;