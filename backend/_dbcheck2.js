require('dotenv').config({ path: 'C:/Users/rahil/Desktop/tender portal/backend/.env' });
const mongoose = require('mongoose');
async function main() {
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 20000 });
  const db = mongoose.connection.db;
  const users = db.collection('users');
  const all = await users.find({}).project({ fullName: 1, email: 1, role: 1, isActive: 1, isDeleted: 1, companyName: 1, status: 1, createdAt: 1 }).toArray();
  for (const u of all) {
    console.log([u.email, '|', u.fullName, '|', u.role, '| active:', u.isActive, '| deleted:', u.isDeleted, '| status:', u.status, '|', u.createdAt].join(' '));
  }
  const tenders = db.collection('livetenders');
  const dist = await tenders.aggregate([{ $group: { _id: '$sourcePortal', count: { $sum: 1 } } }]).toArray();
  console.log('SOURCE PORTAL DIST:', JSON.stringify(dist));
  const activeCount = await tenders.countDocuments({ isActive: true, status: { $in: ['published', 'open'] } });
  console.log('active count:', activeCount);
  const dupGembid = await tenders.aggregate([
    { $group: { _id: '$metadata.gemBidId', count: { $sum: 1 } } },
    { $match: { count: { $gt: 1 } } },
    { $count: 'dups' },
  ]).toArray();
  console.log('duplicate gemBidId groups:', JSON.stringify(dupGembid));
  await mongoose.disconnect();
}
main().then(() => process.exit(0)).catch((e) => { console.error('ERR', e.message); process.exit(1); });