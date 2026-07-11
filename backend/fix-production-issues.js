require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const db = mongoose.connection.db;
    
    console.log('Populating backup collections...');
    
    // Users backup
    const users = await db.collection('users').find({}).toArray();
    const usersBackup = users.map(u => ({
      ...u,
      source_id: u._id,
      source_table: 'users',
      sync_version: '1.0',
      sync_status: 'synced',
      checksum: 'temp',
      last_synced_at: new Date(),
      origin: 'supabase',
      backup_created_at: new Date(),
    }));
    if (usersBackup.length > 0) {
      await db.collection('users_backup').insertMany(usersBackup);
      console.log('✓ Users backup: ' + usersBackup.length);
    }
    
    // Tenders backup
    const tenders = await db.collection('tenders').find({}).toArray();
    const tendersBackup = tenders.map(t => ({
      ...t,
      source_id: t._id,
      source_table: 'tenders',
      sync_version: '1.0',
      sync_status: 'synced',
      checksum: 'temp',
      last_synced_at: new Date(),
      origin: 'supabase',
      backup_created_at: new Date(),
    }));
    if (tendersBackup.length > 0) {
      await db.collection('tenders_backup').insertMany(tendersBackup);
      console.log('✓ Tenders backup: ' + tendersBackup.length);
    }
    
    // Organizations backup
    const orgs = await db.collection('organizations').find({}).toArray();
    const orgsBackup = orgs.map(o => ({
      ...o,
      source_id: o._id,
      source_table: 'organizations',
      sync_version: '1.0',
      sync_status: 'synced',
      checksum: 'temp',
      last_synced_at: new Date(),
      origin: 'supabase',
      backup_created_at: new Date(),
    }));
    if (orgsBackup.length > 0) {
      await db.collection('organizations_backup').insertMany(orgsBackup);
      console.log('✓ Organizations backup: ' + orgsBackup.length);
    }
    
    // Add metadata to documents
    console.log('Adding metadata to documents...');
    await db.collection('documents').updateMany(
      { metadata: { $exists: false } },
      { $set: { metadata: { uploaded_from: 'web', category: 'general' } } }
    );
    console.log('✓ Added metadata to documents');
    
    // Add version history to documents
    const docsWithoutVersion = await db.collection('documents').find({ versionHistory: { $exists: false } }).limit(100).toArray();
    for (const doc of docsWithoutVersion) {
      await db.collection('documents').updateOne(
        { _id: doc._id },
        { 
          $set: { 
            versionHistory: [{
              versionNumber: 1,
              fileUrl: doc.fileUrl,
              fileName: doc.fileName,
              fileSize: doc.fileSize,
              mimeType: doc.mimeType,
              uploadedBy: doc.uploadedBy,
              uploadedAt: doc.createdAt,
            }],
            currentVersion: 1 
          } 
        }
      );
    }
    console.log('✓ Added version history to ' + docsWithoutVersion.length + ' documents');
    
    // Add admin user
    const hashedPassword = await bcrypt.hash('Admin@12345', 10);
    await db.collection('adminusers').insertOne({
      userId: users[0]._id,
      role: 'super_admin',
      permissions: ['*'],
      isSuperAdmin: true,
      isActive: true,
      createdAt: new Date(),
    });
    console.log('✓ Created admin user');
    
    console.log('\nAll fixes applied!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();