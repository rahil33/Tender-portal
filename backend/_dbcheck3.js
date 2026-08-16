require('dotenv').config({ path: 'C:/Users/rahil/Desktop/tender portal/backend/.env' });
const mongoose = require('mongoose');
async function main() {
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 20000 });
  const db = mongoose.connection.db;
  const tenders = db.collection('livetenders');
  const docs = await tenders.find({}, { projection: { tenderNumber: 1, title: 1, category: 1, 'metadata.gemBidId': 1, 'metadata.bidDownloadUrl': 1, 'metadata.state': 1, 'metadata.bidType': 1, documents: 1, submissionDeadline: 1, budget: 1, department: 1, issuingOrganization: 1 } }).limit(5).toArray();
  for (const t of docs) {
    console.log('=====', t.tenderNumber, '| gemBidId:', t.metadata && t.metadata.gemBidId);
    console.log('title:', t.title);
    console.log('category:', t.category, '| state:', t.metadata && t.metadata.state, '| bidType:', t.metadata && t.metadata.bidType);
    console.log('bidDownloadUrl:', t.metadata && t.metadata.bidDownloadUrl);
    console.log('documents:', JSON.stringify(t.documents, null, 1));
    console.log('department:', t.department, '| org:', t.issuingOrganization);
  }
  const states = await tenders.aggregate([{ $group: { _id: '$metadata.state', count: { $sum: 1 } } }]).toArray();
  console.log('STATES:', JSON.stringify(states));
  const cats = await tenders.distinct('category', { isActive: true });
  console.log('CATEGORIES:', JSON.stringify(cats));
  const depts = await tenders.distinct('department', { isActive: true });
  console.log('DEPTS sample:', JSON.stringify(depts.slice(0, 10)));
  await mongoose.disconnect();
}
main().then(() => process.exit(0)).catch((e) => { console.error('ERR', e.message); process.exit(1); });