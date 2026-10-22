const mongoose = require('mongoose');
mongoose.connect('mongodb://rahilatlasms_db_user:rahilatlasms_123@ac-lmcxjzs-shard-00-00.tbrxt65.mongodb.net:27017,ac-lmcxjzs-shard-00-01.tbrxt65.mongodb.net:27017,ac-lmcxjzs-shard-00-02.tbrxt65.mongodb.net:27017/?ssl=true&replicaSet=atlas-9mjaxy-shard-0&authSource=admin&appName=Cluster0', {
  family: 4
}).then(() => {
  console.log('Connection state:', mongoose.connection.readyState);
  console.log('Database name:', mongoose.connection.name);
  
  // List collections
  mongoose.connection.db.listCollections().toArray(function(err, cols) {
    console.log('Collections:', cols);
    
    // Check live-tenders collection
    mongoose.connection.db.collection('live-tenders').countDocuments({}, function(err, count) {
      console.log('Documents in live-tenders collection:', count);
    });
    
    // Find one document
    mongoose.connection.db.collection('live-tenders').findOne({}, function(err, doc) {
      console.log('Sample document:', doc ? JSON.stringify(doc, null, 2).substring(0, 500) : 'no document found');
    });
  });
}).catch(err => {
  console.error('Error:', err);
});