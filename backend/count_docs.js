const mongoose = require('mongoose');
mongoose.connect('mongodb://rahilatlasms_db_user:rahilatlasms_123@ac-lmcxjzs-shard-00-00.tbrxt65.mongodb.net:27017,ac-lmcxjzs-shard-00-01.tbrxt65.mongodb.net:27017,ac-lmcxjzs-shard-00-02.tbrxt65.mongodb.net:27017/?ssl=true&replicaSet=atlas-9mjaxy-shard-0&authSource=admin&appName=Cluster0', {family:4})
  .then(() => {
    mongoose.connection.db.collection('live-tenders').countDocuments({}, function(err, count) {
      console.log('live-tenders count:', count);
      // Also count GEM documents
      mongoose.connection.db.collection('live-tenders').countDocuments({ 'metadata.source': 'GEM' }, function(err, gemCount) {
        console.log('GEM documents:', gemCount);
        // Count active GEM documents
        mongoose.connection.db.collection('live-tenders').countDocuments({ 'metadata.source': 'GEM', isActive: true }, function(err, activeGemCount) {
          console.log('Active GEM documents:', activeGemCount);
          // Count inactive GEM documents
          mongoose.connection.db.collection('live-tenders').countDocuments({ 'metadata.source': 'GEM', isActive: false }, function(err, inactiveGemCount) {
            console.log('Inactive GEM documents:', inactiveGemCount);
            // Count with gemBidId
            mongoose.connection.db.collection('live-tenders').countDocuments({ 'metadata.gemBidId': { $exists: true, $ne: null } }, function(err, withGemBidId) {
              console.log('Documents with gemBidId:', withGemBidId);
              // Check for duplicates
              mongoose.connection.db.collection('live-tenders').aggregate([
                { $group: { _id: '$metadata.gemBidId', count: { $sum: 1 } } },
                { $match: { count: { $gt: 1 } } }
              ], function(err, duplicates) {
                console.log('Duplicate gemBidId count:', duplicates.length);
                process.exit(0);
              });
            });
          });
        });
      });
    });
  })
  .catch(err => { console.error('Error:', err); process.exit(1); });