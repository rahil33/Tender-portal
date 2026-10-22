const mongoose = require('mongoose');
mongoose.connect('mongodb://rahilatlasms_db_user:rahilatlasms_123@ac-lmcxjzs-shard-00-00.tbrxt65.mongodb.net:27017,ac-lmcxjzs-shard-00-01.tbrxt65.mongodb.net:27017,ac-lmcxjzs-shard-00-02.tbrxt65.mongodb.net:27017/?ssl=true&replicaSet=atlas-9mjaxy-shard-0&authSource=admin&appName=Cluster0', {
  family: 4
}).then(() => {
  const { LiveTender } = require('./src/modules/live-tenders/model');
  
  LiveTender.countDocuments({ sourcePortal: 'GEM' }).then(count => {
    console.log('GEM records:', count);
    
    LiveTender.findOne({ sourcePortal: 'GEM' }).then(doc => {
      if (doc) {
        console.log('Sample doc gemBidId:', doc.metadata?.gemBidId);
        console.log('Sample doc tenderNumber:', doc.tenderNumber);
      } else {
        console.log('No documents found');
      }
    });
  }).catch(err => {
    console.error('Query error:', err.message);
  });
}).catch(err => {
  console.error('Connection error:', err.message);
});