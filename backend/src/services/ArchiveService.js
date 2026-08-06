/**
 * MongoDB Atlas Archive Service
 * Automatically archives old/expired data
 */

const mongoose = require('mongoose');
const logger = require('../config/logger');

class ArchiveService {
  constructor() {
    this.archiveRules = [
      {
        collection: 'tenders',
        targetCollection: 'archived_tenders',
        condition: {
          $or: [
            { status: 'closed' },
            { status: 'cancelled' },
            { submissionDeadline: { $lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) } },
          ],
        },
        fields: ['title', 'description', 'category', 'status', 'budget', 'createdBy', 'metadata'],
      },
      {
        collection: 'bids',
        targetCollection: 'archived_bids',
        condition: {
          $or: [
            { status: 'rejected' },
            { status: 'withdrawn' },
            { isDeleted: true },
          ],
        },
        fields: ['bidAmount', 'status', 'tenderId', 'vendorId', 'evaluation', 'metadata'],
      },
      {
        collection: 'documents',
        targetCollection: 'archived_documents',
        condition: {
          $or: [
            { isDeleted: true },
            { status: 'expired' },
          ],
        },
        fields: ['fileName', 'fileUrl', 'documentType', 'tenderId', 'bidId', 'metadata'],
      },
      {
        collection: 'notifications',
        targetCollection: 'archived_notifications',
        condition: {
          $or: [
            { expiresAt: { $lt: new Date() } },
            { status: 'expired' },
          ],
        },
        fields: ['title', 'message', 'type', 'category', 'recipientType', 'metadata'],
      },
    ];
  }

  async archiveExpiredData() {
    logger.info('Starting archive process...');
    const results = [];

    for (const rule of this.archiveRules) {
      try {
        const collection = mongoose.connection.db.collection(rule.collection);
        const targetCollection = mongoose.connection.db.collection(rule.targetCollection);

        // Find documents to archive
        const docsToArchive = await collection.find(rule.condition).toArray();

        if (docsToArchive.length === 0) {
          logger.info(`No documents to archive in ${rule.collection}`);
          continue;
        }

        // Prepare archive documents
        const archiveDocs = docsToArchive.map(doc => ({
          ...doc,
          original_id: doc._id,
          source_collection: rule.collection,
          archived_at: new Date(),
          archive_reason: this.getArchiveReason(doc, rule),
        }));

        // Remove _id for insertion
        archiveDocs.forEach(doc => delete doc._id);

        // Insert to archive collection
        if (archiveDocs.length > 0) {
          await targetCollection.insertMany(archiveDocs);

          // Mark as archived in original collection
          const ids = docsToArchive.map(doc => doc._id);
          await collection.updateMany(
            { _id: { $in: ids } },
            {
              $set: {
                isArchived: true,
                archivedAt: new Date(),
              },
            }
          );

          results.push({
            collection: rule.collection,
            archived: archiveDocs.length,
          });

          logger.info(`Archived ${archiveDocs.length} documents from ${rule.collection}`);
        }
      } catch (error) {
        logger.error(`Archive failed for ${rule.collection}`, { error: error.message });
        results.push({
          collection: rule.collection,
          error: error.message,
        });
      }
    }

    logger.info('Archive process completed', { results });
    return results;
  }

  getArchiveReason(doc, rule) {
    if (doc.status === 'closed' || doc.status === 'cancelled') {
      return `status_${doc.status}`;
    }
    if (doc.isDeleted) {
      return 'deleted';
    }
    if (doc.submissionDeadline && doc.submissionDeadline < new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)) {
      return 'expired_90_days';
    }
    return 'automatic_archive';
  }

  async getArchiveStats() {
    const stats = {};
    const archiveCollections = [
      'archived_tenders',
      'archived_bids',
      'archived_documents',
      'archived_notifications',
      'archived_users',
    ];

    for (const collection of archiveCollections) {
      try {
        const count = await mongoose.connection.db.collection(collection).countDocuments();
        stats[collection] = count;
      } catch (error) {
        stats[collection] = 0;
      }
    }

    return stats;
  }

  async restoreFromArchive(archiveCollection, documentId) {
    const archiveCollectionRef = mongoose.connection.db.collection(archiveCollection);
    const originalCollection = archiveCollection.replace('archived_', '');
    const originalCollectionRef = mongoose.connection.db.collection(originalCollection);

    const archivedDoc = await archiveCollectionRef.findOne({ original_id: new mongoose.Types.ObjectId(documentId) });

    if (!archivedDoc) {
      throw new Error('Document not found in archive');
    }

    // Restore to original collection
    const restoreDoc = { ...archivedDoc };
    delete restoreDoc.original_id;
    delete restoreDoc.source_collection;
    delete restoreDoc.archived_at;
    delete restoreDoc.archive_reason;
    restoreDoc.isArchived = false;
    restoreDoc.archivedAt = null;
    restoreDoc.restoredAt = new Date();

    await originalCollectionRef.insertOne(restoreDoc);

    // Remove from archive
    await archiveCollectionRef.deleteOne({ original_id: new mongoose.Types.ObjectId(documentId) });

    logger.info(`Document restored from ${archiveCollection}`);
    return restoreDoc;
  }

  async cleanupOldArchives(retentionDays = 365) {
    const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
    const archiveCollections = [
      'archived_tenders',
      'archived_bids',
      'archived_documents',
      'archived_notifications',
    ];

    let totalDeleted = 0;

    for (const collection of archiveCollections) {
      const result = await mongoose.connection.db
        .collection(collection)
        .deleteMany({ archived_at: { $lt: cutoffDate } });

      totalDeleted += result.deletedCount;
      logger.info(`Cleaned up ${result.deletedCount} old archives from ${collection}`);
    }

    return { totalDeleted };
  }
}

module.exports = new ArchiveService();