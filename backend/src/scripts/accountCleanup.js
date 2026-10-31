require('dotenv').config();
const mongoose = require('mongoose');
const database = require('../config/database');
const User = require('../models/User');

const APPLY = process.argv.includes('--apply');

const FAKE_EMAILS = [
  'vendor@example.com',
  'evaluator@example.com',
  'seller1@test.com',
  'admin@example.com',
  'buyer12@example.com',
  'verify.vendor@example.com',
  'admin@phoenixtender.com',
];

const FAKE_PATTERNS = [
  /_\d+@test\.com$/i,
  /^matrix_vendor_.*@test\.com$/i,
];

const DISPLAY_NAME_UPDATES = [
  { email: 'test.admin@phoenixtech.in', fullName: 'Admin' },
  { email: 'test.seller@phoenixtech.in', fullName: 'Seller' },
  { email: 'test.buyer@phoenixtech.in', fullName: 'Buyer' },
];

async function main() {
  await database.connect();
  console.log('Connected');

  const all = await User.find({}).lean();
  console.log('\n=== ALL USERS BEFORE ===');
  for (const u of all) {
    console.log(`${u.email} | fullName: ${JSON.stringify(u.fullName)} | role: ${u.role} | active: ${u.isActive}`);
  }

  console.log('\n=== DISPLAY NAME UPDATES (password untouched) ===');
  for (const upd of DISPLAY_NAME_UPDATES) {
    const existing = await User.findOne({ email: upd.email });
    if (!existing) {
      console.log(`MISSING: ${upd.email}`);
      continue;
    }
    if (existing.fullName === upd.fullName) {
      console.log(`already correct: ${upd.email} -> ${upd.fullName}`);
      continue;
    }
    if (APPLY) {
      await User.updateOne({ email: upd.email }, { $set: { fullName: upd.fullName } });
      console.log(`UPDATED: ${upd.email} -> ${upd.fullName}`);
    } else {
      console.log(`[dry-run] would update ${upd.email}: ${JSON.stringify(existing.fullName)} -> ${upd.fullName}`);
    }
  }

  const toDelete = all.filter((u) => {
    if (FAKE_EMAILS.includes(u.email)) return true;
    return FAKE_PATTERNS.some((re) => re.test(u.email));
  });

  console.log('\n=== FAKE/DEMO ACCOUNTS TO REMOVE ===');
  for (const u of toDelete) {
    console.log(`${u.email} | fullName: ${JSON.stringify(u.fullName)} | role: ${u.role}`);
  }

  if (APPLY && toDelete.length) {
    const emails = toDelete.map((u) => u.email);
    const res = await User.deleteMany({ email: { $in: emails } });
    console.log(`\nDELETED ${res.deletedCount} fake/demo user(s)`);
  }

  if (APPLY) {
    const remaining = await User.find({}).lean();
    console.log('\n=== ALL USERS AFTER ===');
    for (const u of remaining) {
      console.log(`${u.email} | fullName: ${JSON.stringify(u.fullName)} | role: ${u.role} | active: ${u.isActive}`);
    }
  } else {
    console.log('\nDry-run complete. Re-run with --apply to commit.');
  }

  await database.disconnect();
}

main().catch((e) => { console.error('FAILED', e); process.exit(1); });