const mongoose = require('mongoose');
mongoose.connect('mongodb://rahilatlasms_db_user:rahilatlasms_123@ac-lmcxjzs-shard-00-00.tbrxt65.mongodb.net:27017,ac-lmcxjzs-shard-00-01.tbrxt65.mongodb.net:27017,ac-lmcxjzs-shard-00-02.tbrxt65.mongodb.net:27017/?ssl=true&replicaSet=atlas-9mjaxy-shard-0&authSource=admin&appName=Cluster0', {
  family: 4
}).then(() => {
  const syncService = require('./src/modules/live-tenders/service');
  console.log('Starting GeM synchronization with debug...');
  return syncService.synchronizeTenders()
    .then(result => {
      console.log('Sync completed!');
      console.log('Success:', result.success);
      console.log('Message:', result.message);
      console.log('gemReportedTotal:', result.stats.gemReportedTotal);
      console.log('pagesProcessed:', result.stats.pagesProcessed);
      console.log('pagesExpected:', result.stats.pagesExpected);
      console.log('reachedFinalPage:', result.stats.reachedFinalPage);
      console.log('totalSynced:', result.stats.totalSynced);
      console.log('totalInserted:', result.stats.totalInserted);
      console.log('totalUpdated:', result.stats.totalUpdated);
      console.log('totalFailed:', result.stats.totalFailed);
      console.log('totalExpired:', result.stats.totalExpired);
      console.log('totalRemoved:', result.stats.totalRemoved);
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