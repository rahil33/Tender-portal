const express = require('express');
const swaggerUi = require('swagger-ui-express');
const { swaggerDocument, generateSwaggerSpec } = require('../../config/swagger');

const router = express.Router();

// Serve Swagger UI
router.use('/', swaggerUi.serve);

// Swagger setup
router.get('/', swaggerUi.setup(swaggerDocument, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customfavIcon: '/favicon.ico',
  customSiteTitle: 'Phoenix Tender API Docs',
}));

// Swagger JSON endpoint
router.get('/json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerDocument);
});

// Swagger YAML endpoint (if yaml plugin is installed)
router.get('/yaml', (req, res) => {
  res.setHeader('Content-Type', 'text/yaml');
  const yaml = require('js-yaml');
  res.send(yaml.dump(swaggerDocument));
});

module.exports = router;