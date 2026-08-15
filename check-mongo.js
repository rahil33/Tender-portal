const { MongoClient } = require('mongodb');
const uri = 'mongodb://localhost:27017/tender_portal';

MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(client => {
    console.log('Connected to MongoDB locally');
    const db = client.db();
    db.admin().ping().then(() => {
      console.log('MongoDB ping successful');
      client.close();
    });
  })
  .catch(err => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });