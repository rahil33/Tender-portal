const { LiveTender } = require('./model');
const cpppScraperService = require('./services/cpppScraper.service');
const logger = require('../../config/logger');
const mongoose = require('mongoose');

class LiveTenderSyncService {
  constructor() {
    this.syncStats = {
      lastSyncAt: null,
      lastSyncStatus: null,
      totalSynced: 0,
      totalUpdated: 0,
      totalSkipped: 0,
      totalFailed: 0,
      syncDuration: 0,
      lastError: null,
      isSyncing: false,
    };
  }

  async waitForConnection() {
    if (mongoose.connection.readyState === 1) {
      return true;
    }
    
    logger.info('Waiting for MongoDB connection...');
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('MongoDB connection timeout'));
      }, 15000);
      
      mongoose.connection.once('connected', () => {
        clearTimeout(timeout);
        resolve();
      });
      
      mongoose.connection.once('error', (err) => {
        clearTimeout(timeout);
        reject(err);
      });
    });
    
    return true;
  }

  async synchronizeTenders() {
    if (this.syncStats.isSyncing) {
      logger.warn('Sync already in progress, skipping...');
      return { success: false, message: 'Sync already in progress' };
    }

    const startTime = Date.now();
    this.syncStats.isSyncing = true;
    this.syncStats.lastSyncStatus = 'in_progress';

    try {
      await this.waitForConnection();
      
      logger.info('Starting tender synchronization...');
      
      const tenders = await cpppScraperService.fetchActiveTenders();
      
      if (!tenders || tenders.length === 0) {
        logger.warn('No tenders fetched from sources, keeping existing data');
        this.syncStats = {
          ...this.syncStats,
          lastSyncAt: new Date(),
          lastSyncStatus: 'success',
          totalSynced: 0,
          syncDuration: Date.now() - startTime,
          isSyncing: false,
        };
        return {
          success: true,
          message: 'No new tenders available, serving existing cached data',
          stats: this.syncStats,
        };
      }
      
      logger.info(`Processing ${tenders.length} tenders...`);
      
      let inserted = 0;
      let updated = 0;
      let skipped = 0;
      let failed = 0;

      for (const tenderData of tenders) {
        try {
          const result = await this.upsertTender(tenderData);
          if (result.inserted) inserted++;
          else if (result.updated) updated++;
          else skipped++;
        } catch (error) {
          failed++;
          logger.error('Failed to sync tender', { tenderNumber: tenderData.tenderNumber, error: error.message });
        }
      }

      await this.markExpiredTenders();

      const duration = Date.now() - startTime;
      
      this.syncStats = {
        ...this.syncStats,
        lastSyncAt: new Date(),
        lastSyncStatus: 'success',
        totalSynced: inserted + updated,
        totalUpdated: updated,
        totalSkipped: skipped,
        totalFailed: failed,
        syncDuration: duration,
        isSyncing: false,
      };

      logger.info('Tender synchronization completed', {
        inserted,
        updated,
        skipped,
        failed,
        duration,
      });

      return {
        success: true,
        message: 'Synchronization completed successfully',
        stats: this.syncStats,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.syncStats = {
        ...this.syncStats,
        lastSyncAt: new Date(),
        lastSyncStatus: 'failed',
        lastError: error.message,
        syncDuration: duration,
        isSyncing: false,
      };

      logger.error('Tender synchronization failed', { error: error.message });
      
      return {
        success: false,
        message: `Synchronization failed: ${error.message}`,
        stats: this.syncStats,
      };
    }
  }

  async upsertTender(tenderData) {
    const existingTender = await LiveTender.findOne({
      $or: [
        { tenderNumber: tenderData.tenderNumber },
        { 'metadata.cpppId': tenderData.cpppId },
      ],
    });

    if (existingTender) {
      const updates = {
        title: tenderData.title,
        description: tenderData.description,
        category: tenderData.category,
        budget: tenderData.budget,
        submissionDeadline: tenderData.submissionDeadline,
        openingDate: tenderData.openingDate,
        location: tenderData.location,
        department: tenderData.department,
        issuingOrganization: tenderData.issuingOrganization,
        documents: tenderData.documents,
        contactInfo: tenderData.contactInfo,
        metadata: {
          ...existingTender.metadata,
          corrigendumCount: tenderData.metadata?.corrigendumCount || existingTender.metadata.corrigendumCount,
        },
        lastSyncedAt: new Date(),
        isActive: true,
      };

      await LiveTender.findByIdAndUpdate(existingTender._id, updates);
      return { updated: true, inserted: false };
    } else {
      const newTender = {
        tenderNumber: tenderData.tenderNumber,
        title: tenderData.title,
        description: tenderData.description || 'No description available',
        category: tenderData.category || 'goods',
        status: 'published',
        visibility: 'public',
        budget: tenderData.budget || {},
        submissionDeadline: tenderData.submissionDeadline,
        openingDate: tenderData.openingDate,
        issuingOrganization: tenderData.issuingOrganization,
        location: tenderData.location,
        department: tenderData.department,
        tenderType: 'government',
        tags: this.generateTags(tenderData),
        metadata: {
          source: 'CPPP',
          originalUrl: tenderData.originalUrl,
          cpppId: tenderData.cpppId,
          state: tenderData.state,
          ministry: tenderData.ministry,
          city: tenderData.city,
          corrigendumCount: 0,
          boqUrl: tenderData.metadata?.boqUrl,
          corrigendumUrl: tenderData.metadata?.corrigendumUrl,
          tenderPdfUrl: tenderData.metadata?.tenderPdfUrl,
        },
        documents: tenderData.documents || [],
        contactInfo: tenderData.contactInfo || {},
        sourcePortal: 'CPPP',
        lastSyncedAt: new Date(),
        isActive: true,
      };

      await LiveTender.create(newTender);
      return { inserted: true, updated: false };
    }
  }

  async markExpiredTenders() {
    const now = new Date();
    const result = await LiveTender.updateMany(
      {
        submissionDeadline: { $lt: now },
        isActive: true,
        status: { $in: ['published', 'open'] },
      },
      {
        $set: {
          status: 'closed',
          isActive: false,
        },
      }
    );
    
    logger.info(`Marked ${result.modifiedCount} expired tenders as closed`);
    return result.modifiedCount;
  }

  generateTags(tenderData) {
    const tags = new Set();
    
    if (tenderData.category) tags.add(tenderData.category.toLowerCase());
    if (tenderData.state) tags.add(tenderData.state.toLowerCase());
    if (tenderData.department) {
      tenderData.department.toLowerCase().split(/\s+/).forEach(word => {
        if (word.length > 3) tags.add(word);
      });
    }
    if (tenderData.title) {
      const keywords = ['construction', 'supply', 'service', 'work', 'maintenance', 'repair', 'installation'];
      keywords.forEach(keyword => {
        if (tenderData.title.toLowerCase().includes(keyword)) {
          tags.add(keyword);
        }
      });
    }
    
    return Array.from(tags);
  }

  getSyncStatus() {
    return {
      ...this.syncStats,
      lastSyncAt: this.syncStats.lastSyncAt?.toISOString(),
    };
  }

  async getStatistics() {
    const total = await LiveTender.countDocuments({});
    const active = await LiveTender.countDocuments({ isActive: true, status: { $in: ['published', 'open'] } });
    const closed = await LiveTender.countDocuments({ status: 'closed' });
    const cancelled = await LiveTender.countDocuments({ status: 'cancelled' });
    
    const byCategory = await LiveTender.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const byState = await LiveTender.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$metadata.state', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 },
    ]);

    const byDepartment = await LiveTender.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 },
    ]);

    return {
      total,
      active,
      closed,
      cancelled,
      byCategory: byCategory.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      byState: byState.reduce((acc, item) => {
        acc[item._id || 'Unknown'] = item.count;
        return acc;
      }, {}),
      byDepartment: byDepartment.reduce((acc, item) => {
        acc[item._id || 'Unknown'] = item.count;
        return acc;
      }, {}),
      syncStatus: this.syncStats,
    };
  }

  async clearCache() {
    await LiveTender.deleteMany({ isActive: false });
    return { success: true, message: 'Cache cleared successfully' };
  }
}

module.exports = new LiveTenderSyncService();