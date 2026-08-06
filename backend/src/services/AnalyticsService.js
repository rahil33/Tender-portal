/**
 * MongoDB Atlas Analytics Service
 * Real-time analytics and metrics collection
 */

const mongoose = require('mongoose');
const logger = require('../config/logger');

class AnalyticsService {
  constructor() {
    this.analyticsCollections = [
      'daily_statistics',
      'weekly_statistics',
      'monthly_statistics',
      'organization_statistics',
      'tender_statistics',
      'bid_statistics',
      'revenue_statistics',
      'activity_heatmaps',
      'user_activity',
      'search_analytics',
      'dashboard_analytics',
    ];
  }

  async initializeCollections() {
    const db = mongoose.connection.db;
    const existingCollections = await db.listCollections().toArray();
    const collectionNames = existingCollections.map(c => c.name);

    for (const collection of this.analyticsCollections) {
      if (!collectionNames.includes(collection)) {
        await db.createCollection(collection);
        logger.info(`Created analytics collection: ${collection}`);
      }
    }

    await this.createAnalyticsIndexes();
  }

  async createAnalyticsIndexes() {
    const indexes = [
      { collection: 'daily_statistics', index: { date: -1, metric_type: 1 } },
      { collection: 'weekly_statistics', index: { week_start: -1, metric_type: 1 } },
      { collection: 'monthly_statistics', index: { month: -1, year: -1, metric_type: 1 } },
      { collection: 'organization_statistics', index: { organization_id: 1, date: -1 } },
      { collection: 'tender_statistics', index: { tender_id: 1, date: -1 } },
      { collection: 'bid_statistics', index: { tender_id: 1, date: -1 } },
      { collection: 'revenue_statistics', index: { period: -1, currency: 1 } },
      { collection: 'activity_heatmaps', index: { date: -1, hour: 1 } },
      { collection: 'user_activity', index: { user_id: 1, activity_type: 1, timestamp: -1 } },
      { collection: 'search_analytics', index: { query: 1, timestamp: -1 } },
      { collection: 'dashboard_analytics', index: { dashboard_id: 1, viewed_at: -1 } },
    ];

    const db = mongoose.connection.db;

    for (const { collection, index } of indexes) {
      try {
        await db.collection(collection).createIndex(index);
      } catch (error) {
        logger.warn(`Index creation failed for ${collection}`, { error: error.message });
      }
    }
  }

  async recordTenderCreated(tender) {
    const doc = {
      metric_type: 'tender_created',
      entity_type: 'tender',
      entity_id: tender._id,
      category: tender.category,
      status: tender.status,
      budget: tender.budget?.estimated || 0,
      currency: tender.budget?.currency || 'INR',
      created_by: tender.createdBy,
      organization: tender.issuingOrganization,
      date: new Date(),
      timestamp: Date.now(),
    };

    await mongoose.connection.db.collection('analytics').insertOne(doc);
    await this.updateDailyStatistics('tenders_created', 1);
  }

  async recordBidSubmitted(bid) {
    const doc = {
      metric_type: 'bid_submitted',
      entity_type: 'bid',
      entity_id: bid._id,
      tender_id: bid.tenderId,
      vendor_id: bid.vendorId,
      amount: bid.bidAmount,
      currency: bid.currency || 'INR',
      status: bid.status,
      date: new Date(),
      timestamp: Date.now(),
    };

    await mongoose.connection.db.collection('analytics').insertOne(doc);
    await this.updateDailyStatistics('bids_submitted', 1);
    await this.updateBidStatistics(bid);
  }

  async recordOrganizationActivity(organizationId, activity) {
    const doc = {
      metric_type: 'organization_activity',
      entity_type: 'organization',
      entity_id: organizationId,
      activity_type: activity.type,
      details: activity.details,
      date: new Date(),
      timestamp: Date.now(),
    };

    await mongoose.connection.db.collection('analytics').insertOne(doc);
    await this.updateOrganizationStatistics(organizationId, activity);
  }

  async recordUserActivity(userId, activity) {
    const doc = {
      metric_type: 'user_activity',
      user_id: userId,
      activity_type: activity.type,
      resource_type: activity.resourceType,
      resource_id: activity.resourceId,
      ip_address: activity.ipAddress,
      user_agent: activity.userAgent,
      timestamp: new Date(),
    };

    await mongoose.connection.db.collection('user_activity').insertOne(doc);
  }

  async recordSearch(query, results, userId) {
    const doc = {
      metric_type: 'search',
      query: query.toLowerCase(),
      results_count: results,
      user_id: userId || null,
      timestamp: new Date(),
    };

    await mongoose.connection.db.collection('search_analytics').insertOne(doc);
  }

  async updateDailyStatistics(metricName, increment) {
    const today = new Date().toISOString().split('T')[0];

    await mongoose.connection.db.collection('daily_statistics').findOneAndUpdate(
      { date: today, metric_name: metricName },
      {
        $inc: { value: increment },
        $set: {
          updated_at: new Date(),
        },
      },
      { upsert: true }
    );
  }

  async updateBidStatistics(bid) {
    const stats = await mongoose.connection.db.collection('bids').aggregate([
      { $match: { tenderId: bid.tenderId } },
      {
        $group: {
          _id: '$tenderId',
          totalBids: { $sum: 1 },
          avgBidAmount: { $avg: '$bidAmount' },
          minBidAmount: { $min: '$bidAmount' },
          maxBidAmount: { $max: '$bidAmount' },
        },
      },
    ]).toArray();

    if (stats.length > 0) {
      await mongoose.connection.db.collection('bid_statistics').findOneAndUpdate(
        { tender_id: bid.tenderId },
        {
          $set: {
            ...stats[0],
            updated_at: new Date(),
          },
        },
        { upsert: true }
      );
    }
  }

  async updateOrganizationStatistics(organizationId, activity) {
    const stats = await mongoose.connection.db.collection('tenders').aggregate([
      { $match: { issuingOrganization: new mongoose.Types.ObjectId(organizationId) } },
      {
        $group: {
          _id: '$issuingOrganization',
          totalTenders: { $sum: 1 },
          activeTenders: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          closedTenders: { $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] } },
        },
      },
    ]).toArray();

    if (stats.length > 0) {
      await mongoose.connection.db.collection('organization_statistics').findOneAndUpdate(
        { organization_id: organizationId },
        {
          $set: {
            ...stats[0],
            last_activity: new Date(),
            updated_at: new Date(),
          },
        },
        { upsert: true }
      );
    }
  }

  async generateDashboardAnalytics() {
    const db = mongoose.connection.db;

    const [
      totalUsers,
      totalOrganizations,
      totalTenders,
      activeTenders,
      totalBids,
      pendingBids,
    ] = await Promise.all([
      db.collection('users').countDocuments(),
      db.collection('organizations').countDocuments(),
      db.collection('tenders').countDocuments(),
      db.collection('tenders').countDocuments({ status: 'active' }),
      db.collection('bids').countDocuments(),
      db.collection('bids').countDocuments({ status: 'submitted' }),
    ]);

    const recentActivity = await db
      .collection('analytics')
      .find({})
      .sort({ timestamp: -1 })
      .limit(100)
      .toArray();

    const dashboardData = {
      summary: {
        totalUsers,
        totalOrganizations,
        totalTenders,
        activeTenders,
        totalBids,
        pendingBids,
      },
      recentActivity,
      generatedAt: new Date(),
    };

    await db.collection('dashboard_analytics').findOneAndUpdate(
      { dashboard_id: 'main' },
      { $set: dashboardData },
      { upsert: true }
    );

    return dashboardData;
  }

  async getActivityHeatmap() {
    const heatmap = await mongoose.connection.db.collection('analytics').aggregate([
      {
        $match: {
          timestamp: { $gte: Date.now() - 7 * 24 * 60 * 60 * 1000 },
        },
      },
      {
        $group: {
          _id: {
            day: { $dayOfWeek: '$timestamp' },
            hour: { $hour: '$timestamp' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.day': 1, '_id.hour': 1 },
      },
    ]).toArray();

    return heatmap;
  }

  async getAnalyticsByPeriod(period, startDate, endDate) {
    const query = {
      timestamp: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    };

    if (period === 'daily') {
      query.metric_type = { $exists: true };
    }

    const analytics = await mongoose.connection.db
      .collection('analytics')
      .find(query)
      .sort({ timestamp: -1 })
      .toArray();

    const summary = await mongoose.connection.db.collection('analytics').aggregate([
      { $match: query },
      {
        $group: {
          _id: '$metric_type',
          count: { $sum: 1 },
          total_value: { $sum: '$budget' },
        },
      },
    ]).toArray();

    return { analytics, summary };
  }

  async cleanupOldAnalytics(retentionDays = 90) {
    const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);

    const result = await mongoose.connection.db
      .collection('analytics')
      .deleteMany({ timestamp: { $lt: cutoffDate } });

    logger.info(`Cleaned up ${result.deletedCount} old analytics records`);
    return result.deletedCount;
  }
}

module.exports = new AnalyticsService();