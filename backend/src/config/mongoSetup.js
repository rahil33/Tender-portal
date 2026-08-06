/**
 * MongoDB Atlas Enterprise Production Setup
 * Creates and configures all collections, indexes, and infrastructure
 */

require('dotenv').config();
const mongoose = require('mongoose');
const mongoConfig = require('./mongoConfig');

const setupCollections = async (db) => {
  console.log('\n📁 Setting up collections...');
  
  const collections = await db.listCollections().toArray();
  const collectionNames = collections.map(c => c.name);
  
  const requiredCollections = [
    // Backup collections
    'users_backup',
    'organizations_backup',
    'tenders_backup',
    'bids_backup',
    'documents_backup',
    'notifications_backup',
    
    // Archive collections
    'archived_users',
    'archived_tenders',
    'archived_bids',
    'archived_documents',
    
    // Logging collections
    'audit_logs',
    'application_logs',
    'system_events',
    'sync_queue',
    'dead_letter_queue',
    
    // Analytics collections
    'analytics',
    'metrics',
    'sync_metadata',
  ];
  
  for (const collName of requiredCollections) {
    if (!collectionNames.includes(collName)) {
      await db.createCollection(collName);
      console.log(`   ✓ Created collection: ${collName}`);
    } else {
      console.log(`   ✓ Collection exists: ${collName}`);
    }
  }
};

const setupIndexes = async (db) => {
  console.log('\n🔍 Setting up indexes...');
  
  // Users backup indexes
  const usersBackupIndexes = [
    { key: { source_id: 1 }, unique: true },
    { key: { source_table: 1, last_synced_at: -1 } },
    { key: { sync_status: 1 } },
    { key: { checksum: 1 } },
  ];
  await createIndexes(db, 'users_backup', usersBackupIndexes);
  
  // Organizations backup indexes
  const orgBackupIndexes = [
    { key: { source_id: 1 }, unique: true },
    { key: { source_table: 1, last_synced_at: -1 } },
    { key: { sync_status: 1 } },
  ];
  await createIndexes(db, 'organizations_backup', orgBackupIndexes);
  
  // Tenders backup indexes
  const tendersBackupIndexes = [
    { key: { source_id: 1 }, unique: true },
    { key: { source_table: 1, last_synced_at: -1 } },
    { key: { status: 1, sync_status: 1 } },
    { key: { created_at: -1 } },
  ];
  await createIndexes(db, 'tenders_backup', tendersBackupIndexes);
  
  // Bids backup indexes
  const bidsBackupIndexes = [
    { key: { source_id: 1 }, unique: true },
    { key: { source_table: 1, last_synced_at: -1 } },
    { key: { tender_id: 1, sync_status: 1 } },
  ];
  await createIndexes(db, 'bids_backup', bidsBackupIndexes);
  
  // Documents backup indexes
  const docsBackupIndexes = [
    { key: { source_id: 1 }, unique: true },
    { key: { source_table: 1, last_synced_at: -1 } },
    { key: { tender_id: 1, sync_status: 1 } },
  ];
  await createIndexes(db, 'documents_backup', docsBackupIndexes);
  
  // Notifications backup indexes
  const notifBackupIndexes = [
    { key: { source_id: 1 }, unique: true },
    { key: { source_table: 1, last_synced_at: -1 } },
  ];
  await createIndexes(db, 'notifications_backup', notifBackupIndexes);
  
  // Archived collections indexes
  const archivedIndexes = [
    { key: { archived_at: -1 } },
    { key: { original_id: 1 } },
    { key: { source_collection: 1 } },
  ];
  await createIndexes(db, 'archived_users', archivedIndexes);
  await createIndexes(db, 'archived_tenders', archivedIndexes);
  await createIndexes(db, 'archived_bids', archivedIndexes);
  await createIndexes(db, 'archived_documents', archivedIndexes);
  
  // Audit logs indexes
  const auditLogIndexes = [
    { key: { action: 1, timestamp: -1 } },
    { key: { user_id: 1, timestamp: -1 } },
    { key: { resource_type: 1, resource_id: 1 } },
    { key: { timestamp: 1 }, expireAfterSeconds: 63072000 }, // 2 years TTL
  ];
  await createIndexes(db, 'audit_logs', auditLogIndexes);
  
  // Application logs indexes
  const appLogIndexes = [
    { key: { level: 1, timestamp: -1 } },
    { key: { service: 1, timestamp: -1 } },
    { key: { correlation_id: 1 } },
    { key: { timestamp: 1 }, expireAfterSeconds: 7776000 }, // 90 days TTL
  ];
  await createIndexes(db, 'application_logs', appLogIndexes);
  
  // System events indexes
  const systemEventIndexes = [
    { key: { event_type: 1, timestamp: -1 } },
    { key: { severity: 1 } },
    { key: { source: 1 } },
  ];
  await createIndexes(db, 'system_events', systemEventIndexes);
  
  // Sync queue indexes
  const syncQueueIndexes = [
    { key: { status: 1, created_at: 1 } },
    { key: { source_table: 1, source_id: 1 }, unique: true },
    { key: { retry_count: 1 } },
    { key: { next_retry_at: 1 } },
  ];
  await createIndexes(db, 'sync_queue', syncQueueIndexes);
  
  // Dead letter queue indexes
  const dlqIndexes = [
    { key: { source_table: 1, source_id: 1 } },
    { key: { failed_at: -1 } },
    { key: { error_type: 1 } },
  ];
  await createIndexes(db, 'dead_letter_queue', dlqIndexes);
  
  // Analytics indexes
  const analyticsIndexes = [
    { key: { metric_type: 1, date: -1 } },
    { key: { entity_type: 1, entity_id: 1 } },
    { key: { created_at: -1 } },
  ];
  await createIndexes(db, 'analytics', analyticsIndexes);
  
  // Metrics indexes
  const metricsIndexes = [
    { key: { metric_name: 1, timestamp: -1 } },
    { key: { tags: 1 } },
  ];
  await createIndexes(db, 'metrics', metricsIndexes);
  
  // Sync metadata indexes
  const syncMetaIndexes = [
    { key: { source_table: 1, source_id: 1 }, unique: true },
    { key: { last_synced_at: -1 } },
    { key: { sync_status: 1 } },
  ];
  await createIndexes(db, 'sync_metadata', syncMetaIndexes);
  
  console.log('   ✓ All indexes configured');
};

const createIndexes = async (db, collectionName, indexes) => {
  const collection = db.collection(collectionName);
  const existingIndexes = await collection.listIndexes().toArray();
  const existingKeys = existingIndexes.map(idx => JSON.stringify(idx.key));
  
  for (const index of indexes) {
    const keyStr = JSON.stringify(index.key);
    if (!existingKeys.includes(keyStr)) {
      const options = { ...index };
      delete options.key;
      await collection.createIndex(index.key, options);
      console.log(`   ✓ Index created on ${collectionName}: ${keyStr}`);
    }
  }
};

const setupValidators = async (db) => {
  console.log('\n🔒 Setting up validators...');
  
  // Sync queue validator
  await db.command({
    collMod: 'sync_queue',
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['source_table', 'source_id', 'action', 'status'],
        properties: {
          source_table: { bsonType: 'string' },
          source_id: { bsonType: 'objectId' },
          action: { enum: ['INSERT', 'UPDATE', 'DELETE', 'RESTORE'] },
          status: { enum: ['pending', 'processing', 'completed', 'failed'] },
          data: { bsonType: 'object' },
          retry_count: { bsonType: 'int' },
          next_retry_at: { bsonType: 'date' },
          error: { bsonType: 'string' },
          created_at: { bsonType: 'date' },
          updated_at: { bsonType: 'date' },
        },
      },
    },
    validationLevel: 'moderate',
  });
  console.log('   ✓ Validator set on sync_queue');
  
  // Sync metadata validator
  await db.command({
    collMod: 'sync_metadata',
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['source_table', 'source_id', 'sync_version', 'checksum'],
        properties: {
          source_table: { bsonType: 'string' },
          source_id: { bsonType: 'objectId' },
          sync_version: { bsonType: 'string' },
          checksum: { bsonType: 'string' },
          sync_status: { enum: ['synced', 'pending', 'failed'] },
          last_synced_at: { bsonType: 'date' },
          origin: { bsonType: 'string' },
        },
      },
    },
    validationLevel: 'moderate',
  });
  console.log('   ✓ Validator set on sync_metadata');
};

const setupTTLIndexes = async (db) => {
  console.log('\n⏰ Setting up TTL indexes...');
  
  const ttlConfigs = [
    { collection: 'application_logs', field: 'timestamp', expireAfterSeconds: 7776000 }, // 90 days
    { collection: 'audit_logs', field: 'timestamp', expireAfterSeconds: 63072000 }, // 2 years
    { collection: 'system_events', field: 'timestamp', expireAfterSeconds: 7776000 },
    { collection: 'dead_letter_queue', field: 'created_at', expireAfterSeconds: 2592000 }, // 30 days
    { collection: 'notifications', field: 'expires_at', expireAfterSeconds: 0 },
    { collection: 'sessions', field: 'expiresAt', expireAfterSeconds: 0 },
  ];
  
  for (const config of ttlConfigs) {
    const collection = db.collection(config.collection);
    const indexes = await collection.listIndexes().toArray();
    const hasTTL = indexes.some(idx => 
      idx.key && idx.key[config.field] && idx.expireAfterSeconds !== undefined
    );
    
    if (!hasTTL) {
      await collection.createIndex(
        { [config.field]: 1 },
        { expireAfterSeconds: config.expireAfterSeconds }
      );
      console.log(`   ✓ TTL index created on ${config.collection}.${config.field}`);
    } else {
      console.log(`   ✓ TTL index exists on ${config.collection}.${config.field}`);
    }
  }
};

const setupTextIndexes = async (db) => {
  console.log('\n🔎 Setting up text indexes...');
  
  const textIndexes = [
    { collection: 'users_backup', fields: { email: 'text', companyName: 'text' } },
    { collection: 'organizations_backup', fields: { name: 'text', description: 'text' } },
    { collection: 'tenders_backup', fields: { title: 'text', description: 'text' } },
    { collection: 'archived_tenders', fields: { title: 'text', description: 'text' } },
  ];
  
  for (const config of textIndexes) {
    const collection = db.collection(config.collection);
    const indexes = await collection.listIndexes().toArray();
    const hasTextIndex = indexes.some(idx => 
      idx.key && (idx.key._fts || Object.values(idx.key).includes('text'))
    );
    
    if (!hasTextIndex) {
      await collection.createIndex(config.fields);
      console.log(`   ✓ Text index created on ${config.collection}`);
    } else {
      console.log(`   ✓ Text index exists on ${config.collection}`);
    }
  }
};

const setupCompoundIndexes = async (db) => {
  console.log('\n📊 Setting up compound indexes...');
  
  const compoundIndexes = [
    {
      collection: 'analytics',
      index: { metric_type: 1, entity_type: 1, date: -1, value: 1 },
    },
    {
      collection: 'tenders',
      index: { status: 1, category: 1, created_at: -1 },
    },
    {
      collection: 'bids',
      index: { tender_id: 1, status: 1, bid_amount: -1 },
    },
    {
      collection: 'organizations',
      index: { type: 1, verification_status: 1, is_active: 1 },
    },
  ];
  
  for (const config of compoundIndexes) {
    const collection = db.collection(config.collection);
    const indexes = await collection.listIndexes().toArray();
    const keyStr = JSON.stringify(config.index);
    const exists = indexes.some(idx => JSON.stringify(idx.key) === keyStr);
    
    if (!exists) {
      await collection.createIndex(config.index);
      console.log(`   ✓ Compound index created on ${config.collection}`);
    } else {
      console.log(`   ✓ Compound index exists on ${config.collection}`);
    }
  }
};

const optimizeExistingIndexes = async (db) => {
  console.log('\n⚡ Optimizing existing indexes...');
  
  // Check for duplicate indexes
  const collections = await db.listCollections().toArray();
  
  for (const coll of collections) {
    const indexes = await db.collection(coll.name).listIndexes().toArray();
    const indexKeys = {};
    
    for (const idx of indexes) {
      const keyStr = JSON.stringify(idx.key);
      if (indexKeys[keyStr]) {
        console.log(`   ⚠️  Duplicate index found on ${coll.name}: ${keyStr}`);
      }
      indexKeys[keyStr] = true;
    }
  }
  
  console.log('   ✓ Index optimization check complete');
};

const main = async () => {
  try {
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║  MongoDB Atlas Enterprise Production Setup            ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');
    
    await mongoose.connect(process.env.MONGO_URI, mongoConfig.connection);
    console.log('✓ Connected to MongoDB Atlas\n');
    
    const db = mongoose.connection.db;
    
    await setupCollections(db);
    await setupIndexes(db);
    await setupValidators(db);
    await setupTTLIndexes(db);
    await setupTextIndexes(db);
    await setupCompoundIndexes(db);
    await optimizeExistingIndexes(db);
    
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║  ✓ MongoDB Atlas Enterprise Setup Complete           ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');
    
    process.exit(0);
  } catch (error) {
    console.error('✗ Setup failed:', error);
    process.exit(1);
  }
};

main();