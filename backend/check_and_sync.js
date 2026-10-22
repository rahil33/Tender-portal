const mongoose = require('mongoose');
mongoose.connect('mongodb://rahilatlasms_db_user:rahilatlasms_123@ac-lmcxjzs-shard-00-00.tbrxt65.mongodb.net:27017,ac-lmcxjzs-shard-00-01.tbrxt65.mongodb.net:27017,ac-lmcxjzs-shard-00-02.tbrxt65.mongodb.net:27017/?ssl=true&replicaSet=atlas-9mjaxy-shard-0&authSource=admin&appName=Cluster0', {
  family: 4
}).then(() => {
  const { LiveTender } = require('./src/modules/live-tenders/model');
  
  // Check current state
  return LiveTender.countDocuments({ sourcePortal: 'GEM' }).then(total => {
    console.log('Current GEM records in DB:', total);
    
    // Run the sync
    const syncService = require('./src/modules/live-tenders/service');
    console.log('Starting sync...');
    return syncService.synchronizeTenders()
      .then(result => {
        console.log('Sync completed!');
        console.log('gemReportedTotal:', result.stats.gemReportedTotal);
        console.log('pagesProcessed:', result.stats.pagesProcessed);
        console.log('pagesExpected:', result.stats.pagesExpected);
        console.log('reachedFinalPage:', result.stats.reachedFinalPage);
        console.log('totalInserted:', result.stats.totalInserted);
        console.log('totalUpdated:', result.stats.totalUpdated);
        console.log('totalFailed:', result.stats.totalFailed);
        
        // Check DB state after sync
        return LiveTender.countDocuments({ sourcePortal: 'GEM' }).then(afterTotal => {
          console.log('GEM records in DB after sync:', afterTotal);
          process.exit(0);
        });
      })
      .catch(err => {
        console.error('Sync error:', err);
        process.exit(1);
      });
  }).catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
}).catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});