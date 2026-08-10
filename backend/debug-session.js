require('dotenv').config();
const mongoose = require('mongoose');
const { verifyToken } = require('./src/utils/jwt');
const { Session } = require('./src/modules/auth/model');

(async () => {
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 15000 });
  const res = await fetch('http://localhost:5050/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@phoenixtech.in', password: 'Phoenix@Admin#2026!Secure' }),
  });
  const j = await res.json();
  const token = j.data?.token;
  console.log('login', res.status, 'token head', (token || '').slice(0, 20));

  try {
    const dec = verifyToken(token);
    console.log('verifyToken OK', JSON.stringify(dec));
  } catch (e) {
    console.log('verifyToken FAIL:', e.message);
  }

  const s = await Session.collection.countDocuments({ token, isActive: true });
  console.log('session docs with this token:', s);
  const sAny = await Session.findOne({ token }).lean();
  console.log('session doc:', sAny ? { isActive: sAny.isActive, expiresAt: sAny.expiresAt, userId: String(sAny.userId) } : 'NONE');

  await mongoose.disconnect();
})();