const mongoose = require('mongoose');
mongoose.connect('mongodb://rahilatlasms_db_user:rahilatlasms_123@ac-lmcxjzs-shard-00-00.tbrxt65.mongodb.net:27017,ac-lmcxjzs-shard-00-01.tbrxt65.mongodb.net:27017,ac-lmcxjzs-shard-00-02.tbrxt65.mongodb.net:27017/?ssl=true&replicaSet=atlas-9mjaxy-shard-0&authSource=admin&appName=Cluster0', {
  family: 4
}).then(() => {
  // Load the actual LiveTender model from the app
  const { LiveTender } = require('./src/modules/live-tenders/model');
  
  return LiveTender.countDocuments({ sourcePortal: 'GEM' }).then(total => {
    console.log('Total GEM records in DB:', total);
    return LiveTender.countDocuments({ sourcePortal: 'GEM', isActive: true }).then(active => {
      console.log('Active records:', active);
      return LiveTender.countDocuments({ sourcePortal: 'GEM', status: 'closed' }).then(expired => {
        console.log('Expired records:', expired);
        
        // Check for duplicates
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
          
          // Sample records
          LiveTender.find({ sourcePortal: 'GEM' })
            .limit(3)
            .select('tenderNumber title gemBidId metadata.state metadata.category')
            .then(samples => {
              console.log('Sample records:');
              samples.forEach(function(s, i) {
                console.log((i+1) + '. ' + s.tenderNumber + ': ' + (s.title ? s.title.substring(0, 40) : 'no title') + ' ...');
                console.log('   gemBidId: ' + s.metadata.gemBidId + ', state: ' + (s.metadata.state || 'none') + ', category: ' + (s.metadata.category || 'none'));
              });
              process.exit(0);
            });
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