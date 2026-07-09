/**
 * Health Check Tests
 */

const request = require('supertest');
const app = require('../../server');

describe('Health Check Endpoints', () => {
  describe('GET /health', () => {
    it('should return healthy status', async () => {
      const response = await request(app)
        .get('/health')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.status).toBe('healthy');
      expect(response.body.version).toBeDefined();
      expect(response.body.database).toBeDefined();
      expect(response.body.database.status).toBe('connected');
    });
  });

  describe('GET /health/ready', () => {
    it('should return ready status', async () => {
      const response = await request(app)
        .get('/health/ready')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.status).toBe('ready');
    });
  });

  describe('GET /health/live', () => {
    it('should return alive status', async () => {
      const response = await request(app)
        .get('/health/live')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.status).toBe('alive');
    });
  });

  describe('GET /health/detailed', () => {
    it('should return detailed health information', async () => {
      const response = await request(app)
        .get('/health/detailed')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.status).toBeDefined();
      expect(response.body.checks).toBeDefined();
      expect(response.body.checks.database).toBeDefined();
      expect(response.body.checks.memory).toBeDefined();
      expect(response.body.checks.disk).toBeDefined();
    });
  });
});