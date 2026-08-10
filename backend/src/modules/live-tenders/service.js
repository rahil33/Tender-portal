const { LiveTender } = require('./model');
const { SOURCE_PORTALS } = require('./constants');
const gemScraperService = require('./services/gemScraper.service');
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
    if (mongoose.connection.readyState !== 1) {
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
    }

    await this.alignIndexes();
    return true;
  }

  /**
   * Aligns the LiveTender collection indexes with the current schema.
   *
   * A previous schema version defined a legacy unique index (metadata.cpppId_1)
   * in existing databases. Because GeM tenders do not store a cpppId (null),
   * that unique index allows only one GeM record to be inserted and makes every
   * subsequent GeM insert fail with an E11000 duplicate-key error. This drops
   * the legacy unique index so GeM tenders can be synchronized; Mongoose
   * recreates only the indexes defined by the current schema.
   */
  async alignIndexes() {
    try {
      if (mongoose.connection.readyState !== 1) {
        return;
      }
      const collection = LiveTender.collection;
      const indexes = await collection.indexes();
      const legacy = indexes.find((idx) => idx.name === 'metadata.cpppId_1' && idx.unique);
      if (legacy) {
        logger.warn('Dropping legacy unique index metadata.cpppId_1 (blocks GeM sync)');
        await collection.dropIndex('metadata.cpppId_1');
        await LiveTender.init();
        logger.info('Legacy unique index metadata.cpppId_1 dropped; schema indexes aligned');
      }
    } catch (error) {
      logger.error('Failed to align LiveTender indexes', { error: error.message });
    }
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
      
      logger.info('Starting GeM tender synchronization...');

      const sourceResult = await gemScraperService.fetchActiveTenders();
      const tenders = Array.isArray(sourceResult) ? sourceResult : [];

      if (tenders.length === 0) {
        logger.warn('No GeM tenders fetched, keeping existing data');
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
          message: 'No new GeM tenders available, serving existing cached data',
          stats: this.syncStats,
        };
      }
      
      logger.info(`Processing ${tenders.length} GeM tenders...`);
      
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
          logger.error(
            `Failed to sync GeM tender ${tenderData.tenderNumber || '(unknown)'}`,
            {
              gemBidId: tenderData.metadata?.gemBidId,
              source: tenderData.sourcePortal || SOURCE_PORTALS.GEM,
              error: error.message,
              code: error.code,
              keyPattern: error.keyPattern,
              keyValue: error.keyValue,
              validation: error.errors
                ? Object.entries(error.errors).map(([field, e]) => ({ field, message: e.message }))
                : undefined,
            }
          );
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

      logger.info('GeM tender synchronization completed', {
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
    const sourcePortal = tenderData.sourcePortal || SOURCE_PORTALS.GEM;

    const existingTender = await LiveTender.findOne({
      $or: [
        { tenderNumber: tenderData.tenderNumber },
        ...(tenderData.metadata?.gemBidId ? [{ 'metadata.gemBidId': tenderData.metadata.gemBidId }] : []),
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
        sourcePortal,
        metadata: {
          ...existingTender.metadata,
          source: tenderData.metadata?.source || sourcePortal,
          originalUrl: tenderData.originalUrl,
          gemBidId: tenderData.metadata?.gemBidId || existingTender.metadata.gemBidId,
          ministry: tenderData.metadata?.ministry || existingTender.metadata.ministry,
          tenderPdfUrl: tenderData.metadata?.tenderPdfUrl || existingTender.metadata.tenderPdfUrl,
          corrigendumCount: tenderData.metadata?.corrigendumCount || existingTender.metadata.corrigendumCount,
          productCategory: tenderData.metadata?.productCategory || existingTender.metadata.productCategory,
          bidType: tenderData.metadata?.bidType || existingTender.metadata.bidType,
          isHighValue: tenderData.metadata?.isHighValue || existingTender.metadata.isHighValue,
          isRateContract: tenderData.metadata?.isRateContract || existingTender.metadata.isRateContract,
          isGlobalTendering: tenderData.metadata?.isGlobalTendering || existingTender.metadata.isGlobalTendering,
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
          source: tenderData.metadata?.source || sourcePortal,
          originalUrl: tenderData.originalUrl,
          gemBidId: tenderData.metadata?.gemBidId,
          state: tenderData.metadata?.state,
          ministry: tenderData.metadata?.ministry,
          city: tenderData.metadata?.city,
          corrigendumCount: 0,
          boqUrl: tenderData.metadata?.boqUrl,
          corrigendumUrl: tenderData.metadata?.corrigendumUrl,
          tenderPdfUrl: tenderData.metadata?.tenderPdfUrl,
          productCategory: tenderData.metadata?.productCategory,
          bidType: tenderData.metadata?.bidType,
          isHighValue: tenderData.metadata?.isHighValue,
          isRateContract: tenderData.metadata?.isRateContract,
          isGlobalTendering: tenderData.metadata?.isGlobalTendering,
        },
        documents: tenderData.documents || [],
        contactInfo: tenderData.contactInfo || {},
        sourcePortal,
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
    const gemFilter = { sourcePortal: SOURCE_PORTALS.GEM };
    const total = await LiveTender.countDocuments(gemFilter);
    const active = await LiveTender.countDocuments({ ...gemFilter, isActive: true, status: { $in: ['published', 'open'] } });
    const closed = await LiveTender.countDocuments({ ...gemFilter, status: 'closed' });
    const cancelled = await LiveTender.countDocuments({ ...gemFilter, status: 'cancelled' });

    const byCategory = await LiveTender.aggregate([
      { $match: { ...gemFilter, isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const byState = await LiveTender.aggregate([
      { $match: { ...gemFilter, isActive: true } },
      { $group: { _id: '$metadata.state', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 },
    ]);

    const byDepartment = await LiveTender.aggregate([
      { $match: { ...gemFilter, isActive: true } },
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

  /**
   * Migration/cleanup: identifies and (optionally) removes legacy tender
   * records that are not from GeM. Safe to run: by default it only counts
   * matching records. Pass `apply: true` to actually delete them.
   *
   * Legacy records match when:
   *  - sourcePortal is not "GEM", OR
   *  - metadata.cpppId exists (i.e. the tender was sourced from CPPP).
   *
   * GeM records (sourcePortal === "GEM") are never touched.
   */
  async cleanupNonGemTenders({ apply = false } = {}) {
    await this.waitForConnection();

    const legacyQuery = {
      $or: [
        { sourcePortal: { $ne: SOURCE_PORTALS.GEM } },
        { sourcePortal: { $exists: false } },
        { 'metadata.cpppId': { $exists: true } },
      ],
    };

    const legacyCount = await LiveTender.countDocuments(legacyQuery);
    const gemCount = await LiveTender.countDocuments({ sourcePortal: SOURCE_PORTALS.GEM });

    if (!apply) {
      logger.info(`Cleanup dry-run: ${legacyCount} legacy non-GeM tender record(s) found; ${gemCount} GeM record(s) kept.`);
      return { success: true, dryRun: true, legacyCount, gemCount };
    }

    const { deletedCount } = await LiveTender.deleteMany(legacyQuery);
    logger.info(`Cleanup applied: removed ${deletedCount} legacy non-GeM tender record(s); kept ${gemCount} GeM record(s)`);
    return { success: true, dryRun: false, deletedCount, gemCount };
  }
}

module.exports = new LiveTenderSyncService();