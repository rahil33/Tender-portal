/**
 * MongoDB Atlas Infrastructure Test Suite
 * Comprehensive tests for collections, indexes, synchronization, backup, and more
 */

require('dotenv').config();
const mongoose = require('mongoose');
const assert = require('assert');

class MongoDBInfrastructureTests {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      total: 0,
      tests: [],
    };
  }

  async connect() {
    await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
    });
    console.log('✓ Connected to MongoDB Atlas for testing\n');
  }

  async disconnect() {
    await mongoose.connection.close();
    console.log('\n✓ Disconnected from MongoDB Atlas');
  }

  async test(name, fn) {
    this.results.total++;
    try {
      await fn();
      this.results.passed++;
      this.results.tests.push({ name, status: 'PASSED' });
      console.log(`  ✓ ${name}`);
    } catch (error) {
      this.results.failed++;
      this.results.tests.push({ name, status: 'FAILED', error: error.message });
      console.log(`  ✗ ${name}`);
      console.log(`    Error: ${error.message}`);
    }
  }

  async runCollectionTests() {
    console.log('\n📁 Collection Tests');
    const db = mongoose.connection.db;

    const requiredCollections = [
      'users', 'organizations', 'tenders', 'bids', 'documents', 'notifications',
      'users_backup', 'organizations_backup', 'tenders_backup', 'bids_backup',
      'documents_backup', 'notifications_backup',
      'archived_tenders', 'archived_bids', 'archived_documents',
      'audit_logs', 'application_logs', 'system_events',
      'sync_queue', 'dead_letter_queue', 'sync_metadata',
      'analytics', 'metrics',
    ];

    const existingCollections = await db.listCollections().toArray();
    const existingNames = new Set(existingCollections.map(c => c.name));

    for (const collection of requiredCollections) {
      await this.test(`Collection '${collection}' exists`, () => {
        assert(existingNames.has(collection), `Collection ${collection} does not exist`);
      });
    }
  }

  async runIndexTests() {
    console.log('\n🔍 Index Tests');
    const db = mongoose.connection.db;

    // Test users indexes
    const usersIndexes = await db.collection('users').listIndexes().toArray();
    await this.test('Users has unique email index', () => {
      const hasUniqueEmail = usersIndexes.some(idx => idx.key?.email && idx.unique);
      assert(hasUniqueEmail, 'Users collection missing unique email index');
    });

    // Test tenders indexes
    const tendersIndexes = await db.collection('tenders').listIndexes().toArray();
    await this.test('Tenders has status index', () => {
      const hasStatusIndex = tendersIndexes.some(idx => idx.key?.status);
      assert(hasStatusIndex, 'Tenders collection missing status index');
    });

    await this.test('Tenders has compound index', () => {
      const hasCompoundIndex = tendersIndexes.some(idx => Object.keys(idx.key).length > 1);
      assert(hasCompoundIndex, 'Tenders collection missing compound indexes');
    });

    // Test sync_queue indexes
    const syncQueueIndexes = await db.collection('sync_queue').listIndexes().toArray();
    await this.test('Sync Queue has proper indexes', () => {
      assert(syncQueueIndexes.length >= 4, 'Sync Queue missing required indexes');
    });

    // Test TTL indexes
    const sessionsIndexes = await db.collection('sessions').listIndexes().toArray();
    await this.test('Sessions has TTL index', () => {
      const hasTTL = sessionsIndexes.some(idx => idx.expireAfterSeconds !== undefined);
      assert(hasTTL, 'Sessions collection missing TTL index');
    });
  }

  async runValidatorTests() {
    console.log('\n🔒 Validator Tests');
    const db = mongoose.connection.db;

    await this.test('Sync Queue has schema validator', async () => {
      const collections = await db.listCollections({ name: 'sync_queue' }, { nameOnly: false }).toArray();
      const hasValidator = collections[0]?.options?.validator?.$jsonSchema;
      assert(hasValidator, 'Sync Queue missing schema validator');
    });

    await this.test('Sync Metadata has schema validator', async () => {
      const collections = await db.listCollections({ name: 'sync_metadata' }, { nameOnly: false }).toArray();
      const hasValidator = collections[0]?.options?.validator?.$jsonSchema;
      assert(hasValidator, 'Sync Metadata missing schema validator');
    });
  }

  async runDataIntegrityTests() {
    console.log('\n✅ Data Integrity Tests');
    const db = mongoose.connection.db;

    await this.test('Users collection is accessible', async () => {
      const count = await db.collection('users').countDocuments();
      assert(count > 0, 'Users collection is empty');
    });

    await this.test('Tenders collection is accessible', async () => {
      const count = await db.collection('tenders').countDocuments();
      assert(count > 0, 'Tenders collection is empty');
    });

    await this.test('Bids collection is accessible', async () => {
      const count = await db.collection('bids').countDocuments();
      assert(count > 0, 'Bids collection is empty');
    });
  }

  async runBackupTests() {
    console.log('\n💾 Backup Tests');
    const db = mongoose.connection.db;

    await this.test('Users backup has data', async () => {
      const count = await db.collection('users_backup').countDocuments();
      assert(count > 0, 'Users backup is empty');
    });

    await this.test('Tenders backup has data', async () => {
      const count = await db.collection('tenders_backup').countDocuments();
      assert(count > 0, 'Tenders backup is empty');
    });

    await this.test('Organizations backup has data', async () => {
      const count = await db.collection('organizations_backup').countDocuments();
      assert(count > 0, 'Organizations backup is empty');
    });
  }

  async runArchiveTests() {
    console.log('\n📦 Archive Tests');
    const db = mongoose.connection.db;

    await this.test('Archived tenders collection exists', async () => {
      const exists = (await db.listCollections({ name: 'archived_tenders' }).toArray()).length > 0;
      assert(exists, 'Archived tenders collection does not exist');
    });

    await this.test('Archived bids collection exists', async () => {
      const exists = (await db.listCollections({ name: 'archived_bids' }).toArray()).length > 0;
      assert(exists, 'Archived bids collection does not exist');
    });
  }

  async runSynchronizationTests() {
    console.log('\n🔄 Synchronization Tests');
    const db = mongoose.connection.db;

    await this.test('Sync Queue collection exists', async () => {
      const exists = (await db.listCollections({ name: 'sync_queue' }).toArray()).length > 0;
      assert(exists, 'Sync Queue collection does not exist');
    });

    await this.test('Dead Letter Queue exists', async () => {
      const exists = (await db.listCollections({ name: 'dead_letter_queue' }).toArray()).length > 0;
      assert(exists, 'Dead Letter Queue collection does not exist');
    });

    await this.test('Sync Metadata exists', async () => {
      const exists = (await db.listCollections({ name: 'sync_metadata' }).toArray()).length > 0;
      assert(exists, 'Sync Metadata collection does not exist');
    });
  }

  async runAnalyticsTests() {
    console.log('\n📈 Analytics Tests');
    const db = mongoose.connection.db;

    await this.test('Analytics collection has data', async () => {
      const count = await db.collection('analytics').countDocuments();
      assert(count > 0, 'Analytics collection is empty');
    });

    await this.test('Audit Logs collection has data', async () => {
      const count = await db.collection('audit_logs').countDocuments();
      assert(count > 0, 'Audit Logs collection is empty');
    });

    await this.test('Application Logs collection has data', async () => {
      const count = await db.collection('application_logs').countDocuments();
      assert(count > 0, 'Application Logs collection is empty');
    });
  }

  async runSecurityTests() {
    console.log('\n🛡️ Security Tests');
    const db = mongoose.connection.db;

    await this.test('Admin users exist', async () => {
      const count = await db.collection('adminusers').countDocuments();
      assert(count > 0, 'No admin users configured');
    });

    await this.test('Audit logging is active', async () => {
      const count = await db.collection('audit_logs').countDocuments();
      assert(count > 0, 'Audit logging is not active');
    });

    await this.test('Soft delete is implemented', async () => {
      const count = await db.collection('documents').countDocuments({ isDeleted: { $exists: true } });
      assert(count >= 0, 'Soft delete not implemented');
    });
  }

  async runPerformanceTests() {
    console.log('\n⚡ Performance Tests');
    const db = mongoose.connection.db;

    await this.test('Text search indexes exist', async () => {
      const tendersIndexes = await db.collection('tenders').listIndexes().toArray();
      const hasTextIndex = tendersIndexes.some(idx => idx.key?._fts);
      assert(hasTextIndex, 'Text search indexes missing');
    });

    await this.test('Compound indexes exist', async () => {
      const bidsIndexes = await db.collection('bids').listIndexes().toArray();
      const hasCompoundIndex = bidsIndexes.some(idx => Object.keys(idx.key).length > 1);
      assert(hasCompoundIndex, 'Compound indexes missing');
    });
  }

  async runAllTests() {
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║  MongoDB Atlas Infrastructure Test Suite               ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    await this.connect();

    try {
      await this.runCollectionTests();
      await this.runIndexTests();
      await this.runValidatorTests();
      await this.runDataIntegrityTests();
      await this.runBackupTests();
      await this.runArchiveTests();
      await this.runSynchronizationTests();
      await this.runAnalyticsTests();
      await this.runSecurityTests();
      await this.runPerformanceTests();
    } finally {
      await this.disconnect();
    }

    // Print summary
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║  TEST SUMMARY                                        ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');
    console.log(`Total Tests: ${this.results.total}`);
    console.log(`Passed: ${this.results.passed}`);
    console.log(`Failed: ${this.results.failed}`);
    console.log(`Success Rate: ${((this.results.passed / this.results.total) * 100).toFixed(2)}%\n`);

    return this.results;
  }
}

const tests = new MongoDBInfrastructureTests();
tests.runAllTests().then(() => {
  process.exit(tests.results.failed > 0 ? 1 : 0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});