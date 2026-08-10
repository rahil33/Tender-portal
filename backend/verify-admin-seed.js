const mongoose = require('mongoose');
require('./src/config/env');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');

async function main() {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    console.error('ADMIN_PASSWORD is not set in the environment.');
    process.exit(1);
  }
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@phoenixtech.in';
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 15000 });
  const docs = await User.find({ email: adminEmail }).lean();
  console.log('ADMIN COUNT:', docs.length);
  if (docs.length) {
    const u = docs[0];
    console.log('email:', u.email);
    console.log('role:', u.role);
    console.log('isActive:', u.isActive);
    console.log('fullName:', u.fullName);
    const hash = u.password || '';
    console.log('password is bcrypt hash (starts $2):', /^\$2[aby]\$/.test(hash));
    console.log('stored hash does NOT contain the plaintext password:', !hash.includes(adminPassword));
    const match = await bcrypt.compare(adminPassword, hash);
    console.log('bcrypt compare with env ADMIN_PASSWORD:', match);
  }
  await mongoose.disconnect();
}
main().catch((e) => { console.error(e); process.exit(1); });