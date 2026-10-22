const mongoose = require('mongoose');
mongoose.connect('mongodb://rahilatlasms_db_user:rahilatlasms_123@ac-lmcxjzs-shard-00-00.tbrxt65.mongodb.net:27017,ac-lmcxjzs-shard-00-01.tbrxt65.mongodb.net:27017,ac-lmcxjzs-shard-00-02.tbrxt65.mongodb.net:27017/?ssl=true&replicaSet=atlas-9mjaxy-shard-0&authSource=admin&appName=Cluster0', {
  family: 4
}).then(() => {
  // Don't create a model - just use the existing connection
  // Use the LiveTender from the sync service module
  const { LiveTender } = require('./src/modules/live-tenders/model');
  
  console.log('Sync status:', JSON.stringify(require('./src/modules/live-tenders/service').getSyncStatus(), null, 2));
  
  return LiveTender.countDocuments({ sourcePortal: 'GEM' }).then(total => {
    console.log('\nDatabase GEM records:', total);
    return LiveTender.countDocuments({ sourcePortal: 'GEM', isActive: true }).then(active => {
      console.log('Active records:', active);
      return LiveTender.countDocuments({ sourcePortal: 'GEM', status: 'closed' }).then(expired => {
        console.log('Expired records:', expired);
        
        // Check duplicates using LiveTender's method
        LiveTender.find({ sourcePortal: 'GEM' }, 'metadata.gemBidId tenderNumber').then(tenders => {
          const bidIdCounts = {};
          tenders.forEach(function(t) {
            const bidId = t.metadata.gemBidId;
            if (bidId) {
              bidIdCounts[bidId] = (bidIdCounts[bidId] || 0) + 1;
            }
          });
          const duplicateBidIds = Object.keys(bidIdCounts).filter(function(k) { return bidIdCounts[k] > 1; });
          console.log('Duplicate gemBidId count:', duplicateBidIds.length);
          
          process.exit(0);
        });
      });
    });
  }).catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
}).catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});