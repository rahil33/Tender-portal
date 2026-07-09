/**
 * Test Configuration
 * Sets up test environment for Jest
 */

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-for-testing';
process.env.MONGO_URI = 'mongodb://localhost:27017/tender_portal_test';

// Global test setup
global.testConfig = {
  validUser: {
    fullName: 'Test User',
    email: 'test@example.com',
    password: 'Test@123',
    companyName: 'Test Corp',
    phone: '+1-555-0100',
  },
  invalidEmail: 'invalid-email',
  weakPassword: '123',
};

// Global teardown
afterAll(async () => {
  // Clean up any open connections
  if (global.mongodb) {
    await global.mongodb.connection.close();
  }
});