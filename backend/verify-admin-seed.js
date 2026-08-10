const mongoose = require('mongoose');
require('./src/config/env');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');

async function main() {
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 15000 });
  const docs = await User.find({ email: 'admin@phoenixtech.in' }).lean();
  console.log('ADMIN COUNT:', docs.length);
  if (docs.length) {
    const u = docs[0];
    console.log('email:', u.email);
    console.log('role:', u.role);
    console.log('isActive:', u.isActive);
    console.log('fullName:', u.fullName);
    const hash = u.password || '';
    console.log('password is bcrypt hash (starts $2):', /^\$2[aby]\$/.test(hash));
    console.log('password contains plaintext value:', hash.includes('Admin#2026'));
    const match = await bcrypt.compare('Phoenix@Admin#2026!Secure', hash);
    console.log('bcrypt compare with provided password:', match);
  }
  await mongoose.disconnect();
}
main().catch((e) => { console.error(e); process.exit(1); });