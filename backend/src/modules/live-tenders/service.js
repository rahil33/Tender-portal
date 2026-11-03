const mongoose = require('mongoose');
const { LiveTender } = require('./model');
const { GemSyncRun } = require('./syncRun.model');
const { SOURCE_PORTALS, ARCHIVE_REASON } = require('./constants');
const { liveTenderQuery } = require('./queries');
const { buildUpsertOperation } = require('./services/upsertBuilder');
const gemScraperService = require('./services/gemScraper.service');
const logger = require('../../config/logger');

const FLUSH_SIZE = 500;
const MAX_CONSECUTIVE_FLUSH_FAILURES = 3;
const MIN_COVERAGE_FOR_RECONCILIATION = 0.9;

const freshCounters = () => ({
  tendersExtracted: 0,
  tendersValidated: 0,
  tendersRejected: 0,
  duplicatesSkipped: 0,
  tendersInserted: 0,
  tendersUpdated: 0,
  tendersUnchanged: 0,
  tendersArchived: 0,
  dbWriteFailures: 0,
});

class LiveTenderSyncService {
  constructor() {
    this.syncStats = {
      lastSyncAt: null,
      lastSyncStatus: null,
      isSyncing: false,
      lastRunId: null,
      gemReportedTotal: 0,
      pagesDiscovered: 0,
      pagesProcessed: 0,
      pagesExpected: 0,
      pagesFailed: 0,
      reachedFinalPage: false,
      ...freshCounters(),
      // legacy field names (kept for existing consumers / dashboard)
      totalSynced: 0,
      totalUpdated: 0,
      totalInserted: 0,
      totalSkipped: 0,
      totalFailed: 0,
      totalExpired: 0,
      totalRemoved: 0,
      verifiedPersisted: 0,
      rejectionReasons: {},
      syncDuration: 0,
      lastSuccessfulFullSyncAt: null,
      lastError: null,
    };
  }

  async waitForConnection() {
    if (mongoose.connection.readyState !== 1) {
      logger.info('Waiting for MongoDB connection...');
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('MongoDB connection timeout')), 15000);
        mongoose.connection.once('connected', () => { clearTimeout(timeout); resolve(); });
        mongoose.connection.once('error', (err) => { clearTimeout(timeout); reject(err); });
      });
    }
    await this.alignIndexes();
    return true;
  }

  /**
   * A previous schema defined a legacy unique index (metadata.cpppId_1). Because
   * GeM tenders have no cpppId (null) it allows only ONE GeM record and makes
   * every other insert fail with E11000. Drop it, then make sure the current
   * schema indexes exist.
   */
  async alignIndexes() {
    try {
      if (mongoose.connection.readyState !== 1) return;
      const indexes = await LiveTender.collection.indexes().catch(() => []);
      const legacy = indexes.find((idx) => idx.name === 'metadata.cpppId_1' && idx.unique);
      if (legacy) {
        logger.warn('Dropping legacy unique index metadata.cpppId_1 (blocks GeM sync)');
        await LiveTender.collection.dropIndex('metadata.cpppId_1');
      }
      await LiveTender.init();
    } catch (error) {
      logger.error('Failed to align LiveTender indexes', { error: error.message });
    }
  }

  // ─── persistence ────────────────────────────────────────────────────────────
  /**
   * Executes a bulkWrite and returns what MongoDB ACTUALLY did.
   *
   * With `ordered:false` Mongoose does not throw for documents that fail its own
   * casting/validation: it drops them and reports them in
   * `result.mongoose.validationErrors`. The previous code never looked there, so
   * a schema error produced "0 inserted, 0 failed" and a successful-looking
   * sync that wrote nothing. Every outcome is accounted for here.
   *
   * @returns {{inserted:number, updated:number, matchedUnchanged:number, failed:number, errors:string[]}}
   */
  async executeBulk(ops, tenders) {
    if (ops.length === 0) return { inserted: 0, updated: 0, matchedUnchanged: 0, failed: 0, errors: [] };

    let result;
    let thrown = null;
    try {
      result = await LiveTender.bulkWrite(ops, { ordered: false });
    } catch (error) {
      thrown = error;
      result = error.result || {};
    }

    const inserted = result.upsertedCount || 0;
    const modified = result.modifiedCount || 0;
    const matched = result.matchedCount || 0;
    const errors = [];

    const validationErrors = (result.mongoose && result.mongoose.validationErrors) || [];
    validationErrors.forEach((e) => errors.push(`validation: ${String(e && e.message).slice(0, 200)}`));

    let writeErrors = [];
    if (thrown && thrown.writeErrors) writeErrors = Array.isArray(thrown.writeErrors) ? thrown.writeErrors : [thrown.writeErrors];
    else if (Array.isArray(result.writeErrors)) writeErrors = result.writeErrors;
    writeErrors.forEach((we) => {
      const t = tenders[we.index] || {};
      errors.push(`write error ${we.code} on ${t.tenderNumber || `#${we.index}`}: ${String(we.errmsg || we.message).slice(0, 200)}`);
    });
    if (thrown && !writeErrors.length) errors.push(`bulk write failed: ${String(thrown.message).slice(0, 200)}`);

    const failedKnown = validationErrors.length + writeErrors.length;
    const accounted = inserted + matched + failedKnown;
    const unaccounted = Math.max(0, ops.length - accounted);
    if (unaccounted > 0) errors.push(`${unaccounted} write(s) neither succeeded nor reported an error`);
    const failed = failedKnown + unaccounted;

    if (errors.length) {
      logger.error(`GeM bulk write problems (${failed}/${ops.length} failed)`, { sample: errors.slice(0, 3) });
    }
    return { inserted, updated: modified, matchedUnchanged: Math.max(0, matched - modified), failed, errors };
  }

  /**
   * Persists one batch of validated tenders and returns real write results.
   * New bids are inserted, changed bids updated, identical bids only get their
   * `lastSeenAt` refreshed, repeats within one crawl are skipped.
   *
   * @param {object[]} tenders  output of the normalizer
   * @param {object}   run      { seen:Set, counters, errorSamples:[] }
   */
  async persistBatch(tenders, run, now = new Date()) {
    const batch = { attempted: 0, failed: 0 };
    const unique = [];
    for (const t of tenders) {
      if (run.seen.has(t.tenderNumber)) { run.counters.duplicatesSkipped += 1; continue; }
      run.seen.add(t.tenderNumber);
      unique.push(t);
    }
    if (unique.length === 0) return batch;

    const existing = await LiveTender.find({ tenderNumber: { $in: unique.map((t) => t.tenderNumber) } })
      .select('tenderNumber contentHash isActive isArchived status')
      .lean();
    const byNumber = new Map(existing.map((e) => [e.tenderNumber, e]));

    const toWrite = [];
    const unchanged = [];
    for (const t of unique) {
      const e = byNumber.get(t.tenderNumber);
      const needsWrite = !e || e.contentHash !== t.contentHash || e.isActive !== true || e.isArchived === true || !['published', 'open'].includes(e.status);
      (needsWrite ? toWrite : unchanged).push(t);
    }

    const ops = toWrite.map((t) => {
      const { filter, update } = buildUpsertOperation(t, now);
      return { updateOne: { filter, update, upsert: true } };
    });

    const outcome = await this.executeBulk(ops, toWrite);
    run.counters.tendersInserted += outcome.inserted;
    run.counters.tendersUpdated += outcome.updated;
    run.counters.tendersUnchanged += outcome.matchedUnchanged;
    run.counters.dbWriteFailures += outcome.failed;
    outcome.errors.forEach((e) => { if (run.errorSamples.length < 10) run.errorSamples.push(e); });

    if (unchanged.length) {
      // Native driver call: no `updatedAt` bump for records whose content did not change.
      await LiveTender.collection.updateMany(
        { tenderNumber: { $in: unchanged.map((t) => t.tenderNumber) } },
        { $set: { lastSeenAt: now, lastSyncedAt: now } }
      );
      run.counters.tendersUnchanged += unchanged.length;
    }

    batch.attempted = ops.length;
    batch.failed = outcome.failed;
    return batch;
  }

  /** Backwards compatible wrapper (old name/shape). */
  async bulkUpsertTenders(tenders) {
    const run = { seen: new Set(), counters: freshCounters(), errorSamples: [] };
    await this.persistBatch(tenders, run);
    const c = run.counters;
    return { inserted: c.tendersInserted, updated: c.tendersUpdated, skipped: c.tendersUnchanged + c.duplicatesSkipped, failed: c.dbWriteFailures };
  }

  // ─── archive / reconcile ────────────────────────────────────────────────────
  /** Bids whose deadline passed are archived (never deleted). */
  async markExpiredTenders(now = new Date()) {
    const result = await LiveTender.updateMany(
      { sourcePortal: SOURCE_PORTALS.GEM, isActive: true, submissionDeadline: { $lt: now } },
      { $set: { status: 'closed', isActive: false, isArchived: true, archivedAt: now, archiveReason: ARCHIVE_REASON.DEADLINE_PASSED } }
    );
    logger.info(`Archived ${result.modifiedCount} GeM tenders whose deadline passed`);
    return result.modifiedCount;
  }

  /**
   * Archives GeM tenders that a COMPLETE crawl no longer saw. Callers must only
   * invoke this after a verified-complete crawl. "Seen" = lastSeenAt >= syncStart.
   */
  async markRemovedTenders(syncStart, now = new Date()) {
    const result = await LiveTender.updateMany(
      {
        sourcePortal: SOURCE_PORTALS.GEM,
        isActive: true,
        $or: [{ lastSeenAt: { $lt: syncStart } }, { lastSeenAt: { $exists: false } }],
      },
      { $set: { status: 'closed', isActive: false, isArchived: true, archivedAt: now, archiveReason: ARCHIVE_REASON.NOT_LISTED_ON_GEM } }
    );
    logger.info(`Archived ${result.modifiedCount} GeM tenders no longer listed on GeM`);
    return result.modifiedCount;
  }

  // ─── the synchronization ────────────────────────────────────────────────────
  async synchronizeTenders({ trigger = 'manual' } = {}) {
    if (this.syncStats.isSyncing) {
      logger.warn('Sync already in progress, skipping...');
      return { success: false, message: 'Sync already in progress', stats: this.syncStats };
    }

    const startedAt = new Date();
    this.syncStats.isSyncing = true;
    this.syncStats.lastSyncStatus = 'in_progress';

    const run = { seen: new Set(), counters: freshCounters(), errorSamples: [] };
    let runDoc = null;
    let report = null;
    let fatal = null;
    let archivedExpired = 0;
    let archivedRemoved = 0;
    let verifiedPersisted = 0;
    let complete = false;

    try {
      await this.waitForConnection();
      try {
        runDoc = await GemSyncRun.create({ type: 'tenders', trigger, status: 'running', startedAt });
        this.syncStats.lastRunId = String(runDoc._id);
      } catch (e) {
        logger.error(`Could not create sync run record: ${e.message}`);
      }
      logger.info(`GeM tender synchronization started (${trigger})`);

      let buffer = [];
      let consecutiveFlushFailures = 0;
      const flush = async () => {
        if (buffer.length === 0) return;
        const chunk = buffer;
        buffer = [];
        try {
          const batch = await this.persistBatch(chunk, run);
          consecutiveFlushFailures = batch.attempted > 0 && batch.failed === batch.attempted ? consecutiveFlushFailures + 1 : 0;
        } catch (error) {
          run.counters.dbWriteFailures += chunk.length;
          if (run.errorSamples.length < 10) run.errorSamples.push(`persist batch failed: ${error.message}`);
          logger.error(`Persisting GeM batch failed: ${error.message}`);
          consecutiveFlushFailures += 1;
        }
        if (consecutiveFlushFailures >= MAX_CONSECUTIVE_FLUSH_FAILURES) {
          const err = new Error(`Database writes are failing (${consecutiveFlushFailures} consecutive batches); aborting crawl`);
          err.abortCrawl = true;
          throw err;
        }
      };

      report = await gemScraperService.crawl({
        onPage: async ({ tenders }) => {
          buffer.push(...tenders);
          if (buffer.length >= FLUSH_SIZE) await flush();
        },
      });
      await flush().catch((e) => { if (!e.abortCrawl) throw e; report.aborted = true; report.abortReason = e.message; });

      run.counters.tendersExtracted = report.extracted;
      run.counters.tendersValidated = report.validated;
      run.counters.tendersRejected = report.rejected;

      archivedExpired = await this.markExpiredTenders();

      // Independent proof that the records are really in MongoDB.
      verifiedPersisted = await LiveTender.countDocuments({ sourcePortal: SOURCE_PORTALS.GEM, lastSeenAt: { $gte: startedAt } });
      const expectedPersisted = run.counters.tendersInserted + run.counters.tendersUpdated + run.counters.tendersUnchanged;
      if (verifiedPersisted < expectedPersisted) {
        run.errorSamples.push(`persistence verification mismatch: reported ${expectedPersisted}, found ${verifiedPersisted}`);
        logger.error(`Persistence verification mismatch: reported ${expectedPersisted}, found ${verifiedPersisted} in MongoDB`);
      }

      const coverage = report.numFound > 0 ? report.extracted / report.numFound : 0;
      complete =
        report.reachedFinalPage &&
        !report.aborted &&
        report.pagesFailed === 0 &&
        run.counters.dbWriteFailures === 0 &&
        verifiedPersisted >= expectedPersisted &&
        coverage >= MIN_COVERAGE_FOR_RECONCILIATION;

      if (complete) {
        archivedRemoved = await this.markRemovedTenders(startedAt);
      } else {
        logger.warn('GeM crawl was not verified complete - skipping "no longer on GeM" archiving to protect live data', {
          reachedFinalPage: report.reachedFinalPage, aborted: report.aborted, pagesFailed: report.pagesFailed,
          dbWriteFailures: run.counters.dbWriteFailures, coverage: Number(coverage.toFixed(3)),
        });
      }
      run.counters.tendersArchived = archivedExpired + archivedRemoved;
    } catch (error) {
      fatal = error;
      logger.error(`Tender synchronization failed: ${error.message}`);
    }

    const finishedAt = new Date();
    const c = run.counters;
    const persistedAnything = c.tendersInserted + c.tendersUpdated + c.tendersUnchanged > 0;
    let status;
    if (fatal && !persistedAnything) status = 'failed';
    else if (fatal) status = 'partial';
    else if (complete) status = 'success';
    else if (!report || (report.extracted === 0 && report.numFound > 0)) status = 'failed';
    else status = 'partial';

    const summary = {
      type: 'tenders',
      trigger,
      status,
      startedAt,
      finishedAt,
      durationMs: finishedAt - startedAt,
      gemReportedTotal: report ? report.numFound : 0,
      pagesDiscovered: report ? report.pagesDiscovered : 0,
      pagesProcessed: report ? report.pagesProcessed : 0,
      pagesFailed: report ? report.pagesFailed : 0,
      reachedFinalPage: report ? report.reachedFinalPage && !report.aborted : false,
      ...c,
      verifiedPersisted,
      rejectionReasons: report ? report.rejectionReasons : {},
      failedPages: report ? report.failedPages.slice(0, 50) : [],
      errorSamples: run.errorSamples,
      error: fatal ? fatal.message : (report && report.abortReason) || undefined,
    };

    if (runDoc) {
      try { await GemSyncRun.updateOne({ _id: runDoc._id }, { $set: summary }); } catch (e) { logger.error(`Could not save sync run: ${e.message}`); }
    }

    this.syncStats = {
      ...this.syncStats,
      isSyncing: false,
      lastSyncAt: finishedAt,
      lastSyncStatus: status,
      gemReportedTotal: summary.gemReportedTotal,
      pagesDiscovered: summary.pagesDiscovered,
      pagesProcessed: summary.pagesProcessed,
      pagesExpected: summary.pagesDiscovered,
      pagesFailed: summary.pagesFailed,
      reachedFinalPage: summary.reachedFinalPage,
      ...c,
      totalSynced: c.tendersInserted + c.tendersUpdated,
      totalInserted: c.tendersInserted,
      totalUpdated: c.tendersUpdated,
      totalSkipped: c.tendersUnchanged + c.duplicatesSkipped,
      totalFailed: c.dbWriteFailures,
      totalExpired: archivedExpired,
      totalRemoved: archivedRemoved,
      verifiedPersisted,
      rejectionReasons: summary.rejectionReasons,
      syncDuration: summary.durationMs,
      lastSuccessfulFullSyncAt: status === 'success' ? finishedAt : this.syncStats.lastSuccessfulFullSyncAt,
      lastError: summary.error || null,
    };

    logger.info(
      [
        '',
        'GeM Synchronization Summary',
        '---------------------------',
        `Status:            ${status}`,
        `GeM reports:       ${summary.gemReportedTotal} ongoing bids`,
        `Pages processed:   ${summary.pagesProcessed} / ${summary.pagesDiscovered} (failed: ${summary.pagesFailed})`,
        `Tenders extracted: ${c.tendersExtracted}`,
        `Validated:         ${c.tendersValidated}`,
        `Inserted:          ${c.tendersInserted}`,
        `Updated:           ${c.tendersUpdated}`,
        `Unchanged:         ${c.tendersUnchanged}`,
        `Duplicates skipped:${c.duplicatesSkipped}`,
        `Rejected:          ${c.tendersRejected} ${JSON.stringify(summary.rejectionReasons)}`,
        `Archived:          ${c.tendersArchived}`,
        `Database errors:   ${c.dbWriteFailures}`,
        `Verified in DB:    ${verifiedPersisted}`,
        '',
      ].join('\n')
    );

    // Category registry follows every tender sync (and can also run on its own).
    if (status !== 'failed') {
      try {
        const categoryService = require('./categoryService');
        await categoryService.syncCategories({ trigger });
      } catch (e) {
        logger.error(`Category synchronization failed: ${e.message}`);
      }
    }

    const message =
      status === 'success' ? 'Synchronization completed successfully'
        : status === 'partial' ? 'Synchronization completed with warnings (see sync log); not all GeM data could be verified'
          : `Synchronization failed: ${summary.error || 'no tenders could be imported'}`;
    return { success: status !== 'failed', message, stats: this.syncStats };
  }

  // ─── status / statistics ────────────────────────────────────────────────────
  getSyncStatus() {
    return {
      ...this.syncStats,
      lastSyncAt: this.syncStats.lastSyncAt ? new Date(this.syncStats.lastSyncAt).toISOString() : null,
    };
  }

  /** Dashboard data from the persistent run log (survives restarts). */
  async getSyncOverview() {
    const [lastRun, lastSuccess, lastCategoryRun] = await Promise.all([
      GemSyncRun.findOne({ type: 'tenders' }).sort({ startedAt: -1 }).lean(),
      GemSyncRun.findOne({ type: 'tenders', status: 'success' }).sort({ startedAt: -1 }).lean(),
      GemSyncRun.findOne({ type: 'categories' }).sort({ startedAt: -1 }).lean(),
    ]);
    return {
      sync: this.getSyncStatus(),
      lastRun,
      lastSuccessfulRun: lastSuccess,
      categorySync: lastCategoryRun,
    };
  }

  async getStatistics() {
    const now = new Date();
    const gem = { sourcePortal: SOURCE_PORTALS.GEM };
    const live = liveTenderQuery(now);

    const [total, active, archived, closed, cancelled, byCategory, byState, byDepartment] = await Promise.all([
      LiveTender.countDocuments(gem),
      LiveTender.countDocuments(live),
      LiveTender.countDocuments({ ...gem, $or: [{ isArchived: true }, { isActive: false }] }),
      LiveTender.countDocuments({ ...gem, status: 'closed' }),
      LiveTender.countDocuments({ ...gem, status: 'cancelled' }),
      LiveTender.aggregate([{ $match: live }, { $group: { _id: '$category', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 50 }]),
      LiveTender.aggregate([{ $match: live }, { $group: { _id: '$metadata.state', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 20 }]),
      LiveTender.aggregate([{ $match: live }, { $group: { _id: '$department', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 20 }]),
    ]);

    const toMap = (rows, fallback) => rows.reduce((acc, item) => { acc[item._id || fallback] = item.count; return acc; }, {});
    return {
      total,
      active,
      archived,
      closed,
      cancelled,
      byCategory: toMap(byCategory, 'Unclassified'),
      byState: toMap(byState, 'Unknown'),
      byDepartment: toMap(byDepartment, 'Unknown'),
      syncStatus: this.syncStats,
    };
  }

  async clearCache() {
    await LiveTender.deleteMany({ isActive: false });
    return { success: true, message: 'Cache cleared successfully' };
  }

  /**
   * Migration/cleanup for legacy non-GeM records. Dry-run by default; GeM
   * records are never touched.
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
