/**
 * MongoDB Atlas Backup Verification Service
 * Ensures backup integrity and recovery readiness
 */

const mongoose = require('mongoose');
const logger = require('../config/logger');

class BackupVerificationService {
  constructor() {
    this.backupCollections = [
      'users_backup',
      'organizations_backup',
      'tenders_backup',
      'bids_backup',
      'documents_backup',
      'notifications_backup',
    ];
  }

  async verifyBackups() {
    const db = mongoose.connection.db;
    const results = {};

    for (const collection of this.backupCollections) {
      try {
        const backupCollection = db.collection(collection);
        const originalCollection = db.collection(collection.replace('_backup', ''));

        const backupCount = await backupCollection.countDocuments();
        const originalCount = await originalCollection.countDocuments();

        // Check for missing backups
        const originalDocs = await originalCollection.find({}).project({ _id: 1 }).toArray();
        const backupDocs = await backupCollection.find({}).project({ source_id: 1 }).toArray();

        const originalIds = new Set(originalDocs.map(doc => doc._id.toString()));
        const backupIds = new Set(backupDocs.map(doc => doc.source_id?.toString()));

        const missingBackups = [...originalIds].filter(id => !backupIds.has(id));
        const orphanedBackups = [...backupIds].filter(id => !originalIds.has(id));

        results[collection] = {
          backupCount,
          originalCount,
          missingBackups: missingBackups.length,
          orphanedBackups: orphanedBackups.length,
          integrity: missingBackups.length === 0 && orphanedBackups.length === 0 ? 'OK' : 'FAILED',
        };

        logger.info(`Backup verification for ${collection}`, results[collection]);
      } catch (error) {
        results[collection] = {
          error: error.message,
          integrity: 'ERROR',
        };
        logger.error(`Backup verification failed for ${collection}`, { error: error.message });
      }
    }

    return results;
  }

  async createSnapshot(collectionName) {
    const db = mongoose.connection.db;
    const originalCollection = db.collection(collectionName);
    const snapshotCollection = `${collectionName}_backup`;

    const docs = await originalCollection.find({}).toArray();
    
    if (docs.length === 0) {
      return { snapshot: collectionName, documents: 0 };
    }

    const backupDocs = docs.map(doc => ({
      ...doc,
      source_id: doc._id,
      source_table: collectionName,
      backup_created_at: new Date(),
      checksum: this.generateChecksum(doc),
    }));

    // Clear existing backup
    await db.collection(snapshotCollection).deleteMany({});
    
    // Insert backup
    await db.collection(snapshotCollection).insertMany(backupDocs);

    logger.info(`Snapshot created for ${collectionName}`, { documents: docs.length });
    return { snapshot: collectionName, documents: docs.length };
  }

  async createAllSnapshots() {
    const collections = ['users', 'organizations', 'tenders', 'bids', 'documents', 'notifications'];
    const results = [];

    for (const collection of collections) {
      const result = await this.createSnapshot(collection);
      results.push(result);
    }

    return results;
  }

  async restoreFromSnapshot(collectionName, snapshotDate) {
    const db = mongoose.connection.db;
    const originalCollection = db.collection(collectionName);
    const backupCollection = db.collection(`${collectionName}_backup`);

    const query = snapshotDate
      ? { backup_created_at: new Date(snapshotDate) }
      : {};

    const backupDocs = await backupCollection.find(query).toArray();

    if (backupDocs.length === 0) {
      throw new Error(`No backup found for ${collectionName}`);
    }

    // Clear original collection
    await originalCollection.deleteMany({});

    // Restore from backup
    const restoreDocs = backupDocs.map(doc => {
      const { source_id, source_table, backup_created_at, checksum, ...originalDoc } = doc;
      originalDoc._id = new mongoose.Types.ObjectId(source_id);
      originalDoc.restored_from_backup = new Date();
      return originalDoc;
    });

    await originalCollection.insertMany(restoreDocs);

    logger.info(`Restored ${restoreDocs.length} documents to ${collectionName}`);
    return { restored: restoreDocs.length };
  }

  async validateBackupIntegrity() {
    const db = mongoose.connection.db;
    const issues = [];

    for (const collection of this.backupCollections) {
      const backupCollection = db.collection(collection);
      
      // Check for documents without checksum
      const missingChecksum = await backupCollection.countDocuments({
        checksum: { $exists: false },
      });

      if (missingChecksum > 0) {
        issues.push({
          collection,
          issue: 'missing_checksum',
          count: missingChecksum,
        });
      }

      // Check for documents without source_id
      const missingSourceId = await backupCollection.countDocuments({
        source_id: { $exists: false },
      });

      if (missingSourceId > 0) {
        issues.push({
          collection,
          issue: 'missing_source_id',
          count: missingSourceId,
        });
      }
    }

    return {
      integrity: issues.length === 0 ? 'OK' : 'FAILED',
      issues,
    };
  }

  generateChecksum(data) {
    const crypto = require('crypto');
    const sorted = JSON.stringify(data, Object.keys(data).sort());
    return crypto.createHash('sha256').update(sorted).digest('hex');
  }

  async generateBackupReport() {
    const verificationResults = await this.verifyBackups();
    const integrityResults = await this.validateBackupIntegrity();

    const report = {
      generated_at: new Date(),
      verification: verificationResults,
      integrity: integrityResults,
      status: integrityResults.integrity === 'OK' ? 'HEALTHY' : 'NEEDS_ATTENTION',
    };

    // Store report
    await mongoose.connection.db.collection('backup_reports').insertOne(report);

    return report;
  }

  async scheduleBackupReport() {
    // This would be called by a scheduler/cron job
    const report = await this.generateBackupReport();
    logger.info('Backup report generated', { status: report.status });
    return report;
  }
}

module.exports = new BackupVerificationService();