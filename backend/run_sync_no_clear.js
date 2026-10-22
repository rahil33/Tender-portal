const mongoose = require('mongoose');
mongoose.connect('mongodb://rahilatlasms_db_user:rahilatlasms_123@ac-lmcxjzs-shard-00-00.tbrxt65.mongodb.net:27017,ac-lmcxjzs-shard-00-01.tbrxt65.mongodb.net:27017,ac-lmcxjzs-shard-00-02.tbrxt65.mongodb.net:27017/?ssl=true&replicaSet=atlas-9mjaxy-shard-0&authSource=admin&appName=Cluster0', {
  family: 4
}).then(() => {
  const syncService = require('./src/modules/live-tenders/service');
  console.log('Starting GeM synchronization (without clearing DB)...');
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
}).catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});