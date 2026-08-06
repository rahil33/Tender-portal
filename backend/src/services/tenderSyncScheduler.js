const cron = require('node-cron');
const liveTenderSyncService = require('../modules/live-tenders/service');
const logger = require('../config/logger');
const mongoose = require('mongoose');

class TenderSyncScheduler {
  constructor() {
    this.syncJob = null;
    this.isRunning = false;
    this.initialSyncDone = false;
  }

  async waitForMongoDB() {
    const maxAttempts = 30;
    const delay = 2000;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      if (mongoose.connection.readyState === 1) {
        logger.info('MongoDB connection ready for sync');
        return true;
      }
      
      if (attempt < maxAttempts) {
        logger.debug(`Waiting for MongoDB connection (attempt ${attempt}/${maxAttempts})...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw new Error('MongoDB connection not ready after maximum attempts');
  }

  start() {
    if (this.syncJob) {
      logger.warn('Sync scheduler already running');
      return;
    }

    logger.info('Tender sync scheduler initializing...');

    const runSync = async (source = 'scheduled') => {
      if (this.isRunning) {
        logger.warn('Previous sync still running, skipping', { source });
        return;
      }

      try {
        await this.waitForMongoDB();
        
        this.isRunning = true;
        logger.info(`Starting ${source} tender sync...`);
        
        const result = await liveTenderSyncService.synchronizeTenders();
        
        if (result.success) {
          logger.info(`${source} sync completed successfully`, {
            synced: result.stats?.totalSynced,
            updated: result.stats?.totalUpdated,
            failed: result.stats?.totalFailed,
            duration: result.stats?.syncDuration,
          });
        } else {
          logger.error(`${source} sync failed`, { 
            error: result.message,
            servingCached: true,
          });
        }
        
        if (source === 'initial') {
          this.initialSyncDone = true;
        }
      } catch (error) {
        logger.error(`${source} sync error`, { 
          error: error.message,
          servingCached: true,
        });
      } finally {
        this.isRunning = false;
      }
    };

    // Schedule sync every 60 minutes (at minute 0)
    this.syncJob = cron.schedule('0 * * * *', () => {
      runSync('scheduled');
    }, {
      scheduled: true,
      timezone: 'Asia/Kolkata',
    });

    logger.info('Tender sync scheduler started - runs every 60 minutes');

    // Run initial sync after 5 seconds
    setTimeout(() => {
      runSync('initial').catch(err => {
        logger.error('Initial sync failed to start', { error: err.message });
      });
    }, 5000);
  }

  stop() {
    if (this.syncJob) {
      this.syncJob.stop();
      this.syncJob = null;
      logger.info('Tender sync scheduler stopped');
    }
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      isScheduled: !!this.syncJob,
      initialSyncDone: this.initialSyncDone,
      nextRun: this.syncJob ? this.syncJob.getNextRun() : null,
    };
  }
}

module.exports = new TenderSyncScheduler();