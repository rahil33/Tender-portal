const mongoose = require('mongoose');
mongoose.connect('mongodb://rahilatlasms_db_user:rahilatlasms_123@ac-lmcxjzs-shard-00-00.tbrxt65.mongodb.net:27017,ac-lmcxjzs-shard-00-01.tbrxt65.mongodb.net:27017,ac-lmcxjzs-shard-00-02.tbrxt65.mongodb.net:27017/?ssl=true&replicaSet=atlas-9mjaxy-shard-0&authSource=admin&appName=Cluster0', {
  family: 4
}).then(() => {
  const { LiveTender } = require('./src/modules/live-tenders/model');
  
  // Clear existing GEM records
  return LiveTender.deleteMany({ sourcePortal: 'GEM' }).then(() => {
    console.log('Cleared existing GEM records');
    
    // Now run the sync
    const syncService = require('./src/modules/live-tenders/service');
    return syncService.synchronizeTenders()
      .then(result => {
        console.log('Sync completed!');
        console.log(JSON.stringify(result, null, 2));
        process.exit(0);
      })
      .catch(err => {
        console.error('Sync error:', err);
        process.exit(1);
      });
  });
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});