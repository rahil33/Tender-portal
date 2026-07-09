/**
 * Dashboard Module Test Suite
 * 
 * This file provides test examples for the Dashboard module.
 * Run tests with: npm test
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../../server');
const { Activity, Stats, Preferences } = require('./dashboard.model');
const User = require('../users/users.model');
const { Session } = require('../auth/model');
const jwt = require('jsonwebtoken');

describe('Dashboard Module', () => {
  let testUserId;
  let testToken;
  let testUser;

  // ─── SETUP ─────────────────────────────────────────────────────
  beforeAll(async () => {
    // Create test user
    testUser = await User.create({
      fullName: 'Test User',
      companyName: 'Test Company',
      phone: '+91-9876543210',
      email: `test-${Date.now()}@company.com`,
      password: 'test123',
      role: 'vendor',
    });
    testUserId = testUser._id.toString();

    // Generate JWT token
    testToken = jwt.sign(
      { id: testUserId, role: 'vendor' },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '7d' }
    );

    // Create session
    await Session.create({
      userId: testUserId,
      token: testToken,
      isActive: true,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    // Create initial stats
    await Stats.create({
      userId: testUserId,
      savedTendersCount: 5,
      applicationsCount: 2,
    });
  });

  // ─── TEARDOWN ────────────────────────────────────────────────────
  afterAll(async () => {
    // Cleanup
    await User.deleteOne({ _id: testUserId });
    await Activity.deleteMany({ userId: testUserId });
    await Stats.deleteOne({ userId: testUserId });
    await Preferences.deleteOne({ userId: testUserId });
    await Session.deleteOne({ userId: testUserId });
  });

  // ─── TESTS: OVERVIEW & SUMMARY ─────────────────────────────────
  describe('GET /api/dashboard/overview', () => {
    test('Should return dashboard overview for authenticated user', async () => {
      const response = await request(app)
        .get('/api/dashboard/overview')
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('userInfo');
      expect(response.body.data).toHaveProperty('statistics');
      expect(response.body.data).toHaveProperty('recentActivities');
      expect(response.body.data.userInfo.id).toBe(testUserId);
    });

    test('Should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/dashboard/overview');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/dashboard/summary', () => {
    test('Should return dashboard summary', async () => {
      const response = await request(app)
        .get('/api/dashboard/summary')
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('savedTendersCount');
      expect(response.body.data).toHaveProperty('applicationsCount');
    });
  });

  // ─── TESTS: ACTIVITIES ────────────────────────────────────────
  describe('POST /api/dashboard/activities', () => {
    test('Should log new activity', async () => {
      const response = await request(app)
        .post('/api/dashboard/activities')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          userId: testUserId,
          activityType: 'tender_saved',
          description: 'Saved test tender',
          relatedId: new mongoose.Types.ObjectId(),
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.activityType).toBe('tender_saved');
      expect(response.body.data.isRead).toBe(false);
    });

    test('Should validate activity type', async () => {
      const response = await request(app)
        .post('/api/dashboard/activities')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          userId: testUserId,
          activityType: 'invalid_type',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/dashboard/activities', () => {
    test('Should return paginated activities', async () => {
      const response = await request(app)
        .get('/api/dashboard/activities?page=1&limit=10')
        .set('Authorization', `Bearer ${testToken}`)
        .query({ userId: testUserId });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data.data)).toBe(true);
    });

    test('Should filter activities by type', async () => {
      const response = await request(app)
        .get('/api/dashboard/activities?type=tender_saved')
        .set('Authorization', `Bearer ${testToken}`)
        .query({ userId: testUserId });

      expect(response.status).toBe(200);
      const activities = response.body.data.data;
      activities.forEach(activity => {
        expect(activity.activityType).toBe('tender_saved');
      });
    });
  });

  describe('POST /api/dashboard/activities/mark-as-read', () => {
    test('Should mark activities as read', async () => {
      // First create an activity
      const activity = await Activity.create({
        userId: testUserId,
        activityType: 'tender_saved',
        description: 'Test activity',
        isRead: false,
      });

      const response = await request(app)
        .post('/api/dashboard/activities/mark-as-read')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          activityIds: [activity._id.toString()],
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify activity is marked as read
      const updatedActivity = await Activity.findById(activity._id);
      expect(updatedActivity.isRead).toBe(true);
    });
  });

  // ─── TESTS: STATISTICS ────────────────────────────────────────
  describe('GET /api/dashboard/statistics/:userId', () => {
    test('Should return user statistics', async () => {
      const response = await request(app)
        .get(`/api/dashboard/statistics/${testUserId}`)
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.userId).toBe(testUserId);
      expect(response.body.data).toHaveProperty('savedTendersCount');
      expect(response.body.data).toHaveProperty('applicationsCount');
    });

    test('Should return 400 for invalid userId', async () => {
      const response = await request(app)
        .get('/api/dashboard/statistics/invalid-id')
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/dashboard/statistics', () => {
    test('Should update statistics', async () => {
      const response = await request(app)
        .put('/api/dashboard/statistics')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          userId: testUserId,
          savedTendersCount: 10,
          applicationsCount: 5,
          profileCompletionPercentage: 85,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.savedTendersCount).toBe(10);
      expect(response.body.data.applicationsCount).toBe(5);
    });

    test('Should validate percentage range', async () => {
      const response = await request(app)
        .put('/api/dashboard/statistics')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          userId: testUserId,
          profileCompletionPercentage: 150, // Invalid: > 100
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/dashboard/statistics/increment', () => {
    test('Should increment statistic', async () => {
      const response = await request(app)
        .post('/api/dashboard/statistics/increment')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          userId: testUserId,
          field: 'savedTendersCount',
          amount: 1,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.savedTendersCount).toBe(11); // 10 + 1
    });
  });

  // ─── TESTS: PREFERENCES ───────────────────────────────────────
  describe('GET /api/dashboard/preferences/:userId', () => {
    test('Should return user preferences', async () => {
      const response = await request(app)
        .get(`/api/dashboard/preferences/${testUserId}`)
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.userId).toBe(testUserId);
      expect(response.body.data).toHaveProperty('emailNotifications');
      expect(response.body.data).toHaveProperty('dashboard_view');
    });
  });

  describe('PUT /api/dashboard/preferences', () => {
    test('Should update preferences', async () => {
      const response = await request(app)
        .put('/api/dashboard/preferences')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          userId: testUserId,
          emailNotifications: false,
          tenderAlerts: true,
          dashboard_view: 'list',
          itemsPerPage: 20,
          preferredCategories: ['IT Services', 'Construction'],
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.emailNotifications).toBe(false);
      expect(response.body.data.dashboard_view).toBe('list');
      expect(response.body.data.itemsPerPage).toBe(20);
    });

    test('Should validate dashboard_view enum', async () => {
      const response = await request(app)
        .put('/api/dashboard/preferences')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          userId: testUserId,
          dashboard_view: 'invalid', // Invalid enum
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  // ─── INTEGRATION TESTS ────────────────────────────────────────
  describe('Integration Tests', () => {
    test('Complete dashboard workflow', async () => {
      const userId = testUserId;

      // 1. Get overview
      const overviewRes = await request(app)
        .get('/api/dashboard/overview')
        .set('Authorization', `Bearer ${testToken}`);
      expect(overviewRes.status).toBe(200);

      // 2. Log activity
      const activityRes = await request(app)
        .post('/api/dashboard/activities')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          userId,
          activityType: 'application_submitted',
          description: 'Test application',
        });
      expect(activityRes.status).toBe(201);

      // 3. Get statistics
      const statsRes = await request(app)
        .get(`/api/dashboard/statistics/${userId}`)
        .set('Authorization', `Bearer ${testToken}`);
      expect(statsRes.status).toBe(200);

      // 4. Update preferences
      const prefRes = await request(app)
        .put('/api/dashboard/preferences')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          userId,
          emailNotifications: true,
          tenderAlerts: true,
        });
      expect(prefRes.status).toBe(200);
    });
  });
});

/**
 * To run these tests:
 * 1. Install Jest: npm install --save-dev jest
 * 2. Configure Jest in package.json
 * 3. Run: npm test
 */
