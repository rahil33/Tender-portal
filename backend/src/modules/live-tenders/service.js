const { LiveTender } = require('./model');
const { SOURCE_PORTALS } = require('./constants');
const cpppScraperService = require('./services/cpppScraper.service');
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
   * A previous schema version defined metadata.cpppId as `unique: true`,
   * leaving a legacy UNIQUE index in existing databases. Because GEM tenders
   * store no cpppId (null), that unique index allows only ONE GEM record to be
   * inserted and makes every subsequent GEM insert fail with an E11000
   * duplicate-key error. This drops the legacy unique index so both GEM and
   * CPPP tenders can be synchronized; Mongoose recreates the plain (non-unique)
   * index defined by the current schema.
   */
  async alignIndexes() {
    try {
      if (mongoose.connection.readyState !== 1) {
        return;
      }
      const collection = LiveTender.collection;
      const indexes = await collection.indexes();
      const legacyCppp = indexes.find((idx) => idx.name === 'metadata.cpppId_1' && idx.unique);
      if (legacyCppp) {
        logger.warn('Dropping legacy unique index metadata.cpppId_1 (blocks GEM sync)');
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
      
      logger.info('Starting tender synchronization...');
      
      const sourceResults = await Promise.allSettled([
        cpppScraperService.fetchActiveTenders(),
        gemScraperService.fetchActiveTenders(),
      ]);

      const sourceLabels = ['CPPP', 'GEM'];
      const tenders = [];
      sourceResults.forEach((result, index) => {
        if (result.status === 'fulfilled' && Array.isArray(result.value)) {
          tenders.push(...result.value);
        } else {
          const reason = result.status === 'rejected' ? result.reason : new Error('Invalid result from source');
          logger.error(`Source ${sourceLabels[index]} fetch failed`, { error: reason.message });
          this.syncStats.lastError = `Source ${sourceLabels[index]} fetch failed: ${reason.message}`;
        }
      });

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
          const detail = {
            tenderNumber: tenderData.tenderNumber,
            sourcePortal: tenderData.sourcePortal,
            error: error.message,
            code: error.code,
            keyPattern: error.keyPattern,
            keyValue: error.keyValue,
            validation: error.errors
              ? Object.entries(error.errors).map(([field, e]) => ({ field, message: e.message }))
              : undefined,
          };
          logger.error(
            `Failed to sync tender ${tenderData.tenderNumber || '(unknown)'} [${tenderData.sourcePortal || 'unknown'}]`,
            detail
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
    const sourcePortal = tenderData.sourcePortal || SOURCE_PORTALS.CPPP;

    const existingTender = await LiveTender.findOne({
      $or: [
        { tenderNumber: tenderData.tenderNumber },
        ...(tenderData.metadata?.gemBidId ? [{ 'metadata.gemBidId': tenderData.metadata.gemBidId }] : []),
        ...(tenderData.metadata?.cpppId ? [{ 'metadata.cpppId': tenderData.metadata.cpppId }] : []),
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
          cpppId: tenderData.metadata?.cpppId || existingTender.metadata.cpppId,
          ministry: tenderData.metadata?.ministry || existingTender.metadata.ministry,
          tenderPdfUrl: tenderData.metadata?.tenderPdfUrl || existingTender.metadata.tenderPdfUrl,
          corrigendumCount: tenderData.metadata?.corrigendumCount || existingTender.metadata.corrigendumCount,
          contractType: tenderData.metadata?.contractType || existingTender.metadata.contractType,
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
          cpppId: tenderData.metadata?.cpppId,
          state: tenderData.metadata?.state,
          ministry: tenderData.metadata?.ministry,
          city: tenderData.metadata?.city,
          corrigendumCount: 0,
          boqUrl: tenderData.metadata?.boqUrl,
          corrigendumUrl: tenderData.metadata?.corrigendumUrl,
          tenderPdfUrl: tenderData.metadata?.tenderPdfUrl,
          contractType: tenderData.metadata?.contractType,
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