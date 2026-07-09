/**
 * Swagger/OpenAPI Documentation
 * Auto-generated API documentation for Phoenix Tender Portal
 */

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Phoenix Tender Portal API',
    version: '1.0.0',
    description: 'Comprehensive API documentation for the Phoenix Tender Portal - A complete tender management system',
    contact: {
      name: 'Phoenix Tender Tech',
      email: 'support@phoenixtender.com',
    },
    license: {
      name: 'ISC',
    },
  },
  servers: [
    {
      url: 'http://localhost:5000/api/v1',
      description: 'Development server',
    },
    {
      url: 'https://api.phoenixtender.com/api/v1',
      description: 'Production server',
    },
  ],
  tags: [
    { name: 'Authentication', description: 'User authentication and authorization' },
    { name: 'Users', description: 'User management operations' },
    { name: 'Organizations', description: 'Organization management' },
    { name: 'Tenders', description: 'Tender creation and management' },
    { name: 'Bids', description: 'Bid submission and evaluation' },
    { name: 'Categories', description: 'Category management' },
    { name: 'Documents', description: 'Document upload and management' },
    { name: 'Notifications', description: 'Notification management' },
    { name: 'Reports', description: 'Report generation and analytics' },
    { name: 'Settings', description: 'System and user settings' },
    { name: 'Admin', description: 'Administrative operations' },
    { name: 'Dashboard', description: 'User dashboard and statistics' },
    { name: 'Analytics', description: 'Analytics and insights' },
    { name: 'Contact', description: 'Contact and support enquiries' },
    { name: 'Reviews', description: 'Reviews and ratings' },
    { name: 'FAQ', description: 'Frequently asked questions' },
    { name: 'Health', description: 'System health checks' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          fullName: { type: 'string' },
          email: { type: 'string', format: 'email' },
          role: { type: 'string', enum: ['admin', 'vendor', 'evaluator'] },
          companyName: { type: 'string' },
          phone: { type: 'string' },
          isActive: { type: 'boolean' },
        },
      },
      Tender: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          title: { type: 'string' },
          description: { type: 'string' },
          status: { type: 'string', enum: ['draft', 'published', 'closed', 'cancelled', 'archived'] },
          category: { type: 'string' },
          issuingOrganization: { type: 'string' },
          deadline: { type: 'string', format: 'date-time' },
        },
      },
      Bid: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          tenderId: { type: 'string', format: 'uuid' },
          vendorId: { type: 'string', format: 'uuid' },
          amount: { type: 'number' },
          status: { type: 'string', enum: ['pending', 'submitted', 'evaluated', 'accepted', 'rejected'] },
          submissionDate: { type: 'string', format: 'date-time' },
        },
      },
      Organization: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          type: { type: 'string' },
          verificationStatus: { type: 'string', enum: ['pending', 'verified', 'rejected'] },
        },
      },
      Error: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string' },
          errors: { type: 'array', items: { type: 'string' } },
        },
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

const generateSwaggerSpec = (routes) => {
  const paths = {};
  
  // Add paths for each route
  routes.forEach(route => {
    const pathKey = route.path;
    paths[pathKey] = {
      get: {
        tags: [route.description.split(' ')[0]],
        summary: route.description,
        security: route.public ? [] : [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Successful response',
          },
          '400': {
            description: 'Bad request',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
          },
          '403': {
            description: 'Forbidden',
          },
          '404': {
            description: 'Not found',
          },
          '500': {
            description: 'Internal server error',
          },
        },
      },
    };
  });
  
  swaggerDocument.paths = paths;
  
  return swaggerDocument;
};

module.exports = {
  swaggerDocument,
  generateSwaggerSpec,
};