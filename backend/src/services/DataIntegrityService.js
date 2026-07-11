/**
 * Data Integrity Verification Service
 * Ensures data consistency across MongoDB collections
 */

const mongoose = require('mongoose');
const logger = require('../config/logger');

class DataIntegrityService {
  async verifyForeignReferences() {
    logger.info('Verifying foreign references...');
    const db = mongoose.connection.db;
    const issues = [];

    // Verify bids reference valid tenders
    const bids = await db.collection('bids').find({}).toArray();
    const tenderIds = new Set((await db.collection('tenders').find({}).project({ _id: 1 }).toArray()).map(t => t._id.toString()));
    
    let invalidTenderRefs = 0;
    for (const bid of bids) {
      if (!tenderIds.has(bid.tenderId?.toString())) {
        invalidTenderRefs++;
        issues.push({
          collection: 'bids',
          document: bid._id,
          issue: 'invalid_tender_reference',
          value: bid.tenderId?.toString(),
        });
      }
    }
    logger.info(`Found ${invalidTenderRefs} bids with invalid tender references`);

    // Verify bids reference valid organizations
    const orgIds = new Set((await db.collection('organizations').find({}).project({ _id: 1 }).toArray()).map(o => o._id.toString()));
    
    let invalidOrgRefs = 0;
    for (const bid of bids) {
      if (!orgIds.has(bid.organizationId?.toString())) {
        invalidOrgRefs++;
        issues.push({
          collection: 'bids',
          document: bid._id,
          issue: 'invalid_organization_reference',
          value: bid.organizationId?.toString(),
        });
      }
    }
    logger.info(`Found ${invalidOrgRefs} bids with invalid organization references`);

    // Verify tenders reference valid organizations
    const tenders = await db.collection('tenders').find({}).toArray();
    let invalidTenderOrgRefs = 0;
    for (const tender of tenders) {
      if (tender.issuingOrganization && !orgIds.has(tender.issuingOrganization.toString())) {
        invalidTenderOrgRefs++;
        issues.push({
          collection: 'tenders',
          document: tender._id,
          issue: 'invalid_organization_reference',
          value: tender.issuingOrganization.toString(),
        });
      }
    }
    logger.info(`Found ${invalidTenderOrgRefs} tenders with invalid organization references`);

    return {
      totalIssues: issues.length,
      issues,
      summary: {
        invalidTenderRefs,
        invalidOrgRefs,
        invalidTenderOrgRefs,
      },
    };
  }

  async findDuplicateRecords() {
    logger.info('Finding duplicate records...');
    const db = mongoose.connection.db;
    const duplicates = [];

    // Check for duplicate emails in users
    const duplicateEmails = await db.collection('users').aggregate([
      { $group: { _id: '$email', count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } },
    ]).toArray();

    if (duplicateEmails.length > 0) {
      duplicates.push({
        collection: 'users',
        field: 'email',
        count: duplicateEmails.length,
      });
    }

    // Check for duplicate tender numbers
    const duplicateTenderNumbers = await db.collection('tenders').aggregate([
      { $group: { _id: '$tenderNumber', count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } },
    ]).toArray();

    if (duplicateTenderNumbers.length > 0) {
      duplicates.push({
        collection: 'tenders',
        field: 'tenderNumber',
        count: duplicateTenderNumbers.length,
      });
    }

    // Check for duplicate bid numbers
    const duplicateBidNumbers = await db.collection('bids').aggregate([
      { $group: { _id: '$bidNumber', count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } },
    ]).toArray();

    if (duplicateBidNumbers.length > 0) {
      duplicates.push({
        collection: 'bids',
        field: 'bidNumber',
        count: duplicateBidNumbers.length,
      });
    }

    return { duplicates };
  }

  async findOrphanDocuments() {
    logger.info('Finding orphan documents...');
    const db = mongoose.connection.db;
    const orphans = [];

    // Find documents without associated tender or bid
    const orphanDocs = await db.collection('documents').find({
      tenderId: null,
      bidId: null,
      organizationId: null,
    }).toArray();

    if (orphanDocs.length > 0) {
      orphans.push({
        collection: 'documents',
        count: orphanDocs.length,
        ids: orphanDocs.map(d => d._id),
      });
    }

    return { orphans };
  }

  async verifySoftDeletes() {
    logger.info('Verifying soft delete consistency...');
    const db = mongoose.connection.db;
    const issues = [];

    // Check documents marked as deleted but missing deletedAt
    const inconsistentDeletes = await db.collection('documents').find({
      isDeleted: true,
      deletedAt: null,
    }).toArray();

    if (inconsistentDeletes.length > 0) {
      issues.push({
        collection: 'documents',
        issue: 'soft_delete_inconsistent',
        count: inconsistentDeletes.length,
      });
    }

    // Check bids marked as withdrawn but missing withdrawnAt
    const inconsistentWithdrawals = await db.collection('bids').find({
      isWithdrawn: true,
      withdrawnAt: null,
    }).toArray();

    if (inconsistentWithdrawals.length > 0) {
      issues.push({
        collection: 'bids',
        issue: 'withdrawal_inconsistent',
        count: inconsistentWithdrawals.length,
      });
    }

    return { issues };
  }

  async verifyVersionHistory() {
    logger.info('Verifying version history...');
    const db = mongoose.connection.db;
    const issues = [];

    // Check documents with version history but incorrect currentVersion
    const docs = await db.collection('documents').find({
      versionHistory: { $exists: true, $ne: [] },
    }).toArray();

    let versionMismatch = 0;
    for (const doc of docs) {
      if (doc.versionHistory.length > 0) {
        const maxVersion = Math.max(...doc.versionHistory.map(v => v.versionNumber));
        if (doc.currentVersion !== maxVersion) {
          versionMismatch++;
          issues.push({
            collection: 'documents',
            document: doc._id,
            issue: 'version_mismatch',
            currentVersion: doc.currentVersion,
            maxVersionInHistory: maxVersion,
          });
        }
      }
    }

    return { versionMismatch, issues };
  }

  async verifyAuditHistory() {
    logger.info('Verifying audit history...');
    const db = mongoose.connection.db;

    // Count audit logs by action
    const auditStats = await db.collection('audit_logs').aggregate([
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 },
        },
      },
    ]).toArray();

    // Count audit logs by resource type
    const resourceStats = await db.collection('audit_logs').aggregate([
      {
        $group: {
          _id: '$resourceType',
          count: { $sum: 1 },
        },
      },
    ]).toArray();

    return {
      byAction: auditStats,
      byResource: resourceStats,
    };
  }

  async runFullIntegrityCheck() {
    logger.info('Running full data integrity check...');
    
    const [
      foreignRefs,
      duplicates,
      orphans,
      softDeletes,
      versionHistory,
      auditHistory,
    ] = await Promise.all([
      this.verifyForeignReferences(),
      this.findDuplicateRecords(),
      this.findOrphanDocuments(),
      this.verifySoftDeletes(),
      this.verifyVersionHistory(),
      this.verifyAuditHistory(),
    ]);

    const report = {
      timestamp: new Date(),
      foreignReferences: foreignRefs,
      duplicates: duplicates,
      orphans: orphans,
      softDeletes: softDeletes,
      versionHistory: versionHistory,
      auditHistory: auditHistory,
      overallStatus: foreignRefs.totalIssues === 0 && 
                     duplicates.duplicates.length === 0 && 
                     softDeletes.issues.length === 0 && 
                     versionHistory.issues.length === 0
        ? 'HEALTHY'
        : 'NEEDS_ATTENTION',
    };

    // Store report
    await mongoose.connection.db.collection('integrity_reports').insertOne(report);

    return report;
  }

  async repairOrphanDocuments() {
    logger.info('Repairing orphan documents...');
    const db = mongoose.connection.db;

    // Mark orphan documents as deleted
    const result = await db.collection('documents').updateMany(
      {
        tenderId: null,
        bidId: null,
        organizationId: null,
        isDeleted: false,
      },
      {
        $set: {
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy: 'integrity_service',
        },
      }
    );

    logger.info(`Repaired ${result.modifiedCount} orphan documents`);
    return { repaired: result.modifiedCount };
  }

  async repairSoftDeleteInconsistencies() {
    logger.info('Repairing soft delete inconsistencies...');
    const db = mongoose.connection.db;

    // Fix documents
    const docResult = await db.collection('documents').updateMany(
      {
        isDeleted: true,
        deletedAt: null,
      },
      {
        $set: {
          deletedAt: new Date(),
        },
      }
    );

    // Fix bids
    const bidResult = await db.collection('bids').updateMany(
      {
        isWithdrawn: true,
        withdrawnAt: null,
      },
      {
        $set: {
          withdrawnAt: new Date(),
        },
      }
    );

    logger.info(`Repaired ${docResult.modifiedCount} documents and ${bidResult.modifiedCount} bids`);
    return {
      documents: docResult.modifiedCount,
      bids: bidResult.modifiedCount,
    };
  }
}

module.exports = new DataIntegrityService();