require('dotenv').config({ path: 'C:/Users/rahil/Desktop/tender portal/backend/.env' });
const mongoose = require('mongoose');
async function main() {
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 20000 });
  const db = mongoose.connection.db;
  const colls = await db.listCollections().toArray();
  console.log('COLLECTIONS:', colls.map((c) => c.name).join(', '));
  const users = db.collection('users');
  const tenders = db.collection('livetenders');
  console.log('user count:', await users.countDocuments());
  console.log('livetender count:', await tenders.countDocuments());
  const liveTenderNames = db.collection('livetenders').collectionName;
  const sample = await tenders.find({}, { projection: { title: 1, sourcePortal: 1, 'metadata.gemBidId': 1 } }).limit(3).toArray();
  console.log('sample tenders:', JSON.stringify(sample));
  await mongoose.disconnect();
}
main().then(() => process.exit(0)).catch((e) => { console.error('ERR', e.message); process.exit(1); });