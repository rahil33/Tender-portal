const mongoose = require('mongoose');
mongoose.connect('mongodb://rahilatlasms_db_user:rahilatlasms_123@ac-lmcxjzs-shard-00-00.tbrxt65.mongodb.net:27017,ac-lmcxjzs-shard-00-01.tbrxt65.mongodb.net:27017,ac-lmcxjzs-shard-00-02.tbrxt65.mongodb.net:27017/?ssl=true&replicaSet=atlas-9mjaxy-shard-0&authSource=admin&appName=Cluster0', {
  family: 4
}).then(() => {
  const { LiveTender } = require('./src/modules/live-tenders/model');
  
  return LiveTender.countDocuments({ sourcePortal: 'GEM' }).then(count => {
    console.log('GEM records in DB:', count);
    process.exit(0);
  });
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});