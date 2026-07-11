/**
 * Supabase to MongoDB Atlas Synchronization Service
 * Enterprise-grade bidirectional sync with conflict resolution
 */

const { MongoClient, ObjectId } = require('mongodb');
const crypto = require('crypto');
const logger = require('../config/logger');

class SyncService {
  constructor(mongoUri) {
    this.mongoUri = mongoUri;
    this.client = null;
    this.db = null;
    this.syncQueue = [];
    this.isProcessing = false;
    this.maxRetries = 3;
    this.retryDelay = 5000; // 5 seconds
  }

  async connect() {
    this.client = new MongoClient(this.mongoUri, {
      maxPoolSize: 50,
      minPoolSize: 20,
      serverSelectionTimeoutMS: 10000,
    });
    await this.client.connect();
    this.db = this.client.db();
    logger.info('SyncService connected to MongoDB Atlas');
  }

  async disconnect() {
    if (this.client) {
      await this.client.close();
      logger.info('SyncService disconnected from MongoDB Atlas');
    }
  }

  /**
   * Generate checksum for data integrity
   */
  generateChecksum(data) {
    const sorted = JSON.stringify(data, Object.keys(data).sort());
    return crypto.createHash('sha256').update(sorted).digest('hex');
  }

  /**
   * Add item to sync queue
   */
  async addToQueue(syncItem) {
    const { sourceTable, sourceId, action, data } = syncItem;
    
    const queueItem = {
      source_table: sourceTable,
      source_id: new ObjectId(sourceId),
      action, // INSERT, UPDATE, DELETE, RESTORE
      status: 'pending',
      data: data || null,
      retry_count: 0,
      max_retries: this.maxRetries,
      next_retry_at: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
    };

    try {
      // Check if already in queue
      const existing = await this.db.collection('sync_queue').findOne({
        source_table: sourceTable,
        source_id: new ObjectId(sourceId),
        status: { $in: ['pending', 'processing'] },
      });

      if (existing) {
        // Update existing queue item
        await this.db.collection('sync_queue').updateOne(
          { _id: existing._id },
          {
            $set: {
              action,
              data: data || null,
              updated_at: new Date(),
              next_retry_at: new Date(),
            },
          }
        );
        logger.info(`Sync queue updated for ${sourceTable}:${sourceId}`);
      } else {
        await this.db.collection('sync_queue').insertOne(queueItem);
        logger.info(`Sync queue item created for ${sourceTable}:${sourceId}`);
      }

      // Trigger processing
      this.processQueue();
    } catch (error) {
      logger.error('Failed to add to sync queue', { error: error.message, sourceTable, sourceId });
      throw error;
    }
  }

  /**
   * Process sync queue with exponential backoff
   */
  async processQueue() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      const pendingItems = await this.db
        .collection('sync_queue')
        .find({
          status: 'pending',
          next_retry_at: { $lte: new Date() },
        })
        .sort({ created_at: 1 })
        .limit(100)
        .toArray();

      for (const item of pendingItems) {
        await this.processSyncItem(item);
      }
    } catch (error) {
      logger.error('Sync queue processing failed', { error: error.message });
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Process individual sync item
   */
  async processSyncItem(item) {
    const session = this.client.startSession();
    
    try {
      await session.withTransaction(async () => {
        // Mark as processing
        await this.db.collection('sync_queue').updateOne(
          { _id: item._id },
          {
            $set: {
              status: 'processing',
              updated_at: new Date(),
            },
          }
        );

        const targetCollection = this.getTargetCollection(item.source_table);
        const checksum = item.data ? this.generateChecksum(item.data) : null;

        switch (item.action) {
          case 'INSERT':
            await this.handleInsert(item, targetCollection, checksum, session);
            break;
          case 'UPDATE':
            await this.handleUpdate(item, targetCollection, checksum, session);
            break;
          case 'DELETE':
            await this.handleDelete(item, targetCollection, session);
            break;
          case 'RESTORE':
            await this.handleRestore(item, targetCollection, session);
            break;
        }

        // Mark as completed
        await this.db.collection('sync_queue').updateOne(
          { _id: item._id },
          {
            $set: {
              status: 'completed',
              completed_at: new Date(),
              updated_at: new Date(),
            },
          }
        );

        logger.info(`Sync completed for ${item.source_table}:${item.source_id}`);
      });
    } catch (error) {
      await this.handleSyncError(item, error);
    } finally {
      await session.endSession();
    }
  }

  /**
   * Handle INSERT sync operation
   */
  async handleInsert(item, targetCollection, checksum, session) {
    const existingSync = await this.db
      .collection('sync_metadata')
      .findOne(
        {
          source_table: item.source_table,
          source_id: item.source_id,
        },
        { session }
      );

    if (existingSync) {
      logger.warn(`Document already exists for ${item.source_table}:${item.source_id}`);
      return;
    }

    const syncData = {
      ...item.data,
      source_id: item.source_id,
      source_table: item.source_table,
      sync_version: '1.0',
      sync_status: 'synced',
      checksum,
      last_synced_at: new Date(),
      origin: 'supabase',
      created_at: new Date(),
      updated_at: new Date(),
    };

    await this.db.collection(targetCollection).insertOne(syncData, { session });

    // Update sync metadata
    await this.db.collection('sync_metadata').insertOne(
      {
        source_table: item.source_table,
        source_id: item.source_id,
        sync_version: '1.0',
        checksum,
        sync_status: 'synced',
        last_synced_at: new Date(),
        origin: 'supabase',
        created_at: new Date(),
      },
      { session }
    );

    // Also insert to backup collection
    const backupCollection = `${targetCollection}_backup`;
    await this.db.collection(backupCollection).insertOne(syncData, { session });
  }

  /**
   * Handle UPDATE sync operation
   */
  async handleUpdate(item, targetCollection, checksum, session) {
    const existingSync = await this.db
      .collection('sync_metadata')
      .findOne(
        {
          source_table: item.source_table,
          source_id: item.source_id,
        },
        { session }
      );

    if (!existingSync) {
      logger.warn(`No sync metadata found for ${item.source_table}:${item.source_id}, treating as INSERT`);
      await this.handleInsert(item, targetCollection, checksum, session);
      return;
    }

    // Check if data actually changed
    if (existingSync.checksum === checksum) {
      logger.info(`No changes detected for ${item.source_table}:${item.source_id}`);
      await this.db.collection('sync_queue').updateOne(
        { _id: item._id },
        { $set: { status: 'completed', updated_at: new Date() } }
      );
      return;
    }

    const updateData = {
      ...item.data,
      updated_at: new Date(),
    };
    delete updateData._id; // Don't update MongoDB _id

    await this.db.collection(targetCollection).updateOne(
      {
        source_id: item.source_id,
        source_table: item.source_table,
      },
      {
        $set: updateData,
        $inc: { sync_version: 1 },
      },
      { session }
    );

    // Update sync metadata
    await this.db.collection('sync_metadata').updateOne(
      {
        source_table: item.source_table,
        source_id: item.source_id,
      },
      {
        $set: {
          checksum,
          sync_status: 'synced',
          last_synced_at: new Date(),
          updated_at: new Date(),
        },
        $inc: { sync_version: 1 },
      },
      { session }
    );

    // Update backup
    const backupCollection = `${targetCollection}_backup`;
    await this.db.collection(backupCollection).updateOne(
      {
        source_id: item.source_id,
        source_table: item.source_table,
      },
      {
        $set: updateData,
      },
      { session }
    );
  }

  /**
   * Handle DELETE sync operation (soft delete)
   */
  async handleDelete(item, targetCollection, session) {
    const existingSync = await this.db
      .collection('sync_metadata')
      .findOne(
        {
          source_table: item.source_table,
          source_id: item.source_id,
        },
        { session }
      );

    if (!existingSync) {
      logger.warn(`No sync metadata found for delete ${item.source_table}:${item.source_id}`);
      return;
    }

    // Soft delete - mark as deleted
    await this.db.collection(targetCollection).updateOne(
      {
        source_id: item.source_id,
        source_table: item.source_table,
      },
      {
        $set: {
          is_deleted: true,
          deleted_at: new Date(),
          deleted_by: 'sync_service',
          updated_at: new Date(),
        },
      },
      { session }
    );

    // Update sync metadata
    await this.db.collection('sync_metadata').updateOne(
      {
        source_table: item.source_table,
        source_id: item.source_id,
      },
      {
        $set: {
          sync_status: 'deleted',
          last_synced_at: new Date(),
          updated_at: new Date(),
        },
      },
      { session }
    );

    // Archive the document
    await this.archiveDocument(item.source_table, item.source_id, session);
  }

  /**
   * Handle RESTORE sync operation
   */
  async handleRestore(item, targetCollection, session) {
    await this.db.collection(targetCollection).updateOne(
      {
        source_id: item.source_id,
        source_table: item.source_table,
      },
      {
        $set: {
          is_deleted: false,
          deleted_at: null,
          deleted_by: null,
          restored_at: new Date(),
          updated_at: new Date(),
        },
      },
      { session }
    );

    await this.db.collection('sync_metadata').updateOne(
      {
        source_table: item.source_table,
        source_id: item.source_id,
      },
      {
        $set: {
          sync_status: 'synced',
          last_synced_at: new Date(),
          updated_at: new Date(),
        },
      },
      { session }
    );
  }

  /**
   * Archive document to archive collection
   */
  async archiveDocument(sourceTable, sourceId, session) {
    const targetCollection = this.getTargetCollection(sourceTable);
    const archiveCollection = `archived_${targetCollection}`;

    const doc = await this.db.collection(targetCollection).findOne(
      { source_id: sourceId },
      { session }
    );

    if (doc) {
      const archiveDoc = {
        ...doc,
        original_id: doc._id,
        source_collection: targetCollection,
        archived_at: new Date(),
        archive_reason: 'deleted_from_source',
      };
      delete archiveDoc._id;

      await this.db.collection(archiveCollection).insertOne(archiveDoc, { session });
      logger.info(`Document archived to ${archiveCollection}`);
    }
  }

  /**
   * Handle sync errors with exponential backoff
   */
  async handleSyncError(item, error) {
    const retryCount = item.retry_count + 1;
    const delay = this.retryDelay * Math.pow(2, retryCount); // Exponential backoff

    if (retryCount >= item.max_retries) {
      // Move to dead letter queue
      await this.db.collection('dead_letter_queue').insertOne({
        source_table: item.source_table,
        source_id: item.source_id,
        action: item.action,
        data: item.data,
        error_type: error.name,
        error_message: error.message,
        error_stack: error.stack,
        failed_at: new Date(),
        original_queue_id: item._id,
      });

      await this.db.collection('sync_queue').updateOne(
        { _id: item._id },
        {
          $set: {
            status: 'failed',
            error: error.message,
            updated_at: new Date(),
          },
        }
      );

      logger.error(`Sync failed permanently for ${item.source_table}:${item.source_id}`, {
        error: error.message,
      });
    } else {
      // Schedule retry
      await this.db.collection('sync_queue').updateOne(
        { _id: item._id },
        {
          $set: {
            status: 'pending',
            retry_count: retryCount,
            next_retry_at: new Date(Date.now() + delay),
            error: error.message,
            updated_at: new Date(),
          },
        }
      );

      logger.warn(`Sync retry scheduled for ${item.source_table}:${item.source_id} (attempt ${retryCount})`);
    }
  }

  /**
   * Get target collection name from source table
   */
  getTargetCollection(sourceTable) {
    const mapping = {
      users: 'users',
      organizations: 'organizations',
      tenders: 'tenders',
      bids: 'bids',
      documents: 'documents',
      notifications: 'notifications',
      categories: 'categories',
      audits: 'audit_logs',
    };
    return mapping[sourceTable] || sourceTable;
  }

  /**
   * Get sync statistics
   */
  async getSyncStats() {
    const queueStats = await this.db.collection('sync_queue').aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]).toArray();

    const metadataStats = await this.db.collection('sync_metadata').aggregate([
      {
        $group: {
          _id: '$sync_status',
          count: { $sum: 1 },
        },
      },
    ]).toArray();

    const dlqCount = await this.db.collection('dead_letter_queue').countDocuments();

    return {
      queue: queueStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {}),
      metadata: metadataStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {}),
      deadLetterQueue: dlqCount,
    };
  }

  /**
   * Retry failed items from dead letter queue
   */
  async retryDeadLetterQueue(limit = 10) {
    const failedItems = await this.db
      .collection('dead_letter_queue')
      .find({})
      .sort({ failed_at: 1 })
      .limit(limit)
      .toArray();

    for (const item of failedItems) {
      await this.addToQueue({
        sourceTable: item.source_table,
        sourceId: item.source_id.toString(),
        action: item.action,
        data: item.data,
      });

      await this.db.collection('dead_letter_queue').deleteOne({ _id: item._id });
    }

    return { retried: failedItems.length };
  }
}

module.exports = SyncService;