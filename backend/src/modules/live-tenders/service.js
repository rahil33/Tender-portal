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
      isSyncing: false,
      // GeM crawl metrics
      gemReportedTotal: 0,
      pagesProcessed: 0,
      pagesExpected: 0,
      reachedFinalPage: false,
      // Document-level write metrics
      totalSynced: 0,
      totalUpdated: 0,
      totalInserted: 0,
      totalSkipped: 0,
      totalFailed: 0,
      totalExpired: 0,
      totalRemoved: 0,
      syncDuration: 0,
      // The last sync that completed a FULL crawl (final GeM page reached).
      lastSuccessfulFullSyncAt: null,
      lastError: null,
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

      const result = await gemScraperService.fetchActiveTenders();
      const tenders = Array.isArray(result) ? result : (result.tenders || []);
      const numFound = result.numFound || 0;
      const pagesProcessed = result.pagesProcessed || 0;
      const pagesExpected = result.pagesExpected || 0;
      const reachedFinalPage = result.reachedFinalPage === true;

      if (tenders.length === 0) {
        logger.warn('No GeM tenders fetched, keeping existing data');
        this.syncStats = {
          ...this.syncStats,
          lastSyncAt: new Date(),
          lastSyncStatus: 'success',
          totalSynced: 0,
          gemReportedTotal: numFound,
          pagesProcessed,
          pagesExpected,
          reachedFinalPage,
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

      const { inserted, updated, skipped, failed } = await this.bulkUpsertTenders(tenders);

      // Mark tenders whose GeM bid end date has passed as closed + inactive so
      // they never reappear in Live Tenders / search / filters.
      const expired = await this.markExpiredTenders();

      // Reconciliation safety: only reconcile tenders missing from GeM as
      // removed/inactive when the FULL crawl completed (final page reached).
      // On a partial/failed crawl we keep existing records untouched so the
      // live feed is never wiped by an incomplete fetch.
      let removed = 0;
      if (reachedFinalPage) {
        removed = await this.markRemovedTenders(tenders);
      } else {
        logger.warn(
          'GeM crawl did not reach the final page - skipping removed/cancelled reconciliation to protect live data'
        );
      }

      const duration = Date.now() - startTime;

      const successfulFullSync = reachedFinalPage && failed === 0;
      this.syncStats = {
        ...this.syncStats,
        lastSyncAt: new Date(),
        lastSyncStatus: successfulFullSync ? 'success' : 'partial',
        gemReportedTotal: numFound,
        pagesProcessed,
        pagesExpected,
        reachedFinalPage,
        totalSynced: inserted + updated,
        totalInserted: inserted,
        totalUpdated: updated,
        totalSkipped: skipped,
        totalFailed: failed,
        totalExpired: expired,
        totalRemoved: removed,
        syncDuration: duration,
        lastSuccessfulFullSyncAt: successfulFullSync ? new Date() : this.syncStats.lastSuccessfulFullSyncAt,
        isSyncing: false,
      };

      logger.info('GeM tender synchronization completed', {
        fetched: tenders.length,
        inserted,
        updated,
        skipped,
        expired,
        removed,
        failed,
        duration,
        reachedFinalPage,
      });

      return {
        success: true,
        message: successfulFullSync
          ? 'Synchronization completed successfully'
          : 'Synchronization completed with warnings (partial crawl)',
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

  /**
   * Bulk upserts the mapped GeM tenders in chunks.
   *
   * Matching is performed on metadata.gemBidId (falling back to tenderNumber)
   * so repeated syncs update existing records and a single batch can never
   * create duplicates. Writes are processed unordered so an isolated failure
   * does not block the remaining tenders; failed records are counted and
   * logged instead of being silently dropped.
   *
   * @param {Array<object>} tenders Mapped GeM tender payloads.
   * @returns {Promise<{ inserted: number, updated: number, skipped: number, failed: number }>}
   */
  async bulkUpsertTenders(tenders) {
    const chunkSize = 500;
    let inserted = 0;
    let updated = 0;
    let failed = 0;

    for (let i = 0; i < tenders.length; i += chunkSize) {
      const chunk = tenders.slice(i, i + chunkSize);
      const operations = chunk.map((tenderData) => {
        const sourcePortal = tenderData.sourcePortal || SOURCE_PORTALS.GEM;
        const filter = tenderData.metadata?.gemBidId
          ? { 'metadata.gemBidId': tenderData.metadata.gemBidId }
          : { tenderNumber: tenderData.tenderNumber };

        const set = {
          tenderNumber: tenderData.tenderNumber,
          title: tenderData.title,
          description: tenderData.description || 'No description available',
          category: tenderData.category || 'goods',
          status: 'published',
          visibility: 'public',
          budget: tenderData.budget || {},
          submissionDeadline: tenderData.submissionDeadline,
          openingDate: tenderData.openingDate || undefined,
          issuingOrganization: tenderData.issuingOrganization,
          location: tenderData.location || 'India',
          department: tenderData.department || '',
          tenderType: 'government',
          tags: this.generateTags(tenderData),
          metadata: {
            source: tenderData.metadata?.source || sourcePortal,
            originalUrl: tenderData.originalUrl,
            gemBidId: tenderData.metadata?.gemBidId,
            ministry: tenderData.metadata?.ministry,
            state: tenderData.metadata?.state,
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
            bidDownloadUrl: tenderData.metadata?.bidDownloadUrl,
          },
          documents: tenderData.documents || [],
          contactInfo: tenderData.contactInfo || {},
          sourcePortal,
          lastSyncedAt: new Date(),
          isActive: true,
        };

        return {
          updateOne: {
            filter,
            update: { $set: set, $setOnInsert: { status: 'published', visibility: 'public', tenderType: 'government' } },
            upsert: true,
          },
        };
      });

      try {
        const bulkResult = await LiveTender.bulkWrite(operations, { ordered: false });
        inserted += (bulkResult.upsertedCount || 0) + (bulkResult.insertedCount || 0);
        updated += bulkResult.modifiedCount || 0;
        if (bulkResult.writeErrors && bulkResult.writeErrors.length) {
          failed += bulkResult.writeErrors.length;
          for (const writeError of bulkResult.writeErrors) {
            logger.error(
              `Failed to sync GeM tender (bulk write error)`,
              {
                index: writeError.index,
                gemBidId: chunk[writeError.index]?.metadata?.gemBidId,
                error: writeError.errmsg,
                code: writeError.code,
              }
            );
          }
        }
      } catch (error) {
        failed += chunk.length;
        logger.error('GeM tender bulk upsert failed', {
          chunkStart: i,
          error: error.message,
          code: error.code,
          keyPattern: error.keyPattern,
          keyValue: error.keyValue,
        });
      }
    }

    logger.info(`Bulk upsert complete: ${inserted} inserted, ${updated} updated, ${failed} failed`);
    return { inserted, updated, skipped: 0, failed };
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
          state: tenderData.metadata?.state || existingTender.metadata.state,
          city: tenderData.metadata?.city || existingTender.metadata.city,
          tenderPdfUrl: tenderData.metadata?.tenderPdfUrl || existingTender.metadata.tenderPdfUrl,
          corrigendumCount: tenderData.metadata?.corrigendumCount || existingTender.metadata.corrigendumCount,
          productCategory: tenderData.metadata?.productCategory || existingTender.metadata.productCategory,
          bidType: tenderData.metadata?.bidType || existingTender.metadata.bidType,
          isHighValue: tenderData.metadata?.isHighValue || existingTender.metadata.isHighValue,
          isRateContract: tenderData.metadata?.isRateContract || existingTender.metadata.isRateContract,
          isGlobalTendering: tenderData.metadata?.isGlobalTendering || existingTender.metadata.isGlobalTendering,
          bidDownloadUrl: tenderData.metadata?.bidDownloadUrl || existingTender.metadata.bidDownloadUrl || undefined,
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
          bidDownloadUrl: tenderData.metadata?.bidDownloadUrl,
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

  /**
   * Marks as removed/inactive the previously-synced GeM tenders that GeM no
   * longer reports in a COMPLETE crawl. This keeps the live feed in sync with
   * the real GeM portal (bids can be withdrawn, merged or end).
   *
   * Safety: callers must invoke this ONLY after a full crawl reached GeM's
   * final page. Records that have no gemBidId are never touched here.
   *
   * @param {Array<object>} tenders The tenders present in the current crawl.
   * @returns {Promise<number>} Number of records marked removed.
   */
  async markRemovedTenders(tenders) {
    const presentBidIds = tenders
      .map((tender) => tender.metadata && tender.metadata.gemBidId)
      .filter((id) => typeof id === 'string' && id.length > 0);

    if (presentBidIds.length === 0) {
      logger.warn('markRemovedTenders: no gemBidId values present in crawl, skipping reconciliation');
      return 0;
    }

    const result = await LiveTender.updateMany(
      {
        sourcePortal: SOURCE_PORTALS.GEM,
        isActive: true,
        'metadata.gemBidId': { $nin: presentBidIds },
      },
      {
        $set: {
          status: 'closed',
          isActive: false,
          lastSyncedAt: new Date(),
        },
      }
    );

    logger.info(`Marked ${result.modifiedCount} GeM tenders as removed (no longer on GeM portal)`);
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