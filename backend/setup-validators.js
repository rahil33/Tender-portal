require('dotenv').config();
const mongoose = require('mongoose');

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const db = mongoose.connection.db;
    
    console.log('Setting up schema validators...');
    
    // Set validator on sync_queue
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
    
    console.log('✓ Validator set on sync_queue');
    
    // Set validator on sync_metadata
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
    
    console.log('✓ Validator set on sync_metadata');
    console.log('\nSchema validation complete!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();