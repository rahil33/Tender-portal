/**
 * Safe idempotent production admin seed script.
 *
 * Usage (from backend/):
 *   npm run seed:admin
 *
 * Behavior:
 *   - Connects with the existing MONGO_URI environment variable.
 *   - Looks up email `admin@phoenixtech.in`.
 *   - If it does NOT exist -> creates Phoenix Admin (role admin, isActive true).
 *     The password is hashed by the User model's bcrypt pre-save hook; the
 *     plaintext password is never stored or printed.
 *   - If it already exists -> does NOT create a duplicate, does NOT reset the
 *     password; only ensures role === 'admin' and isActive === true.
 *   - Self-verifies after seeding: account exists, role is admin, isActive is
 *     true, and bcrypt password verification succeeds.
 *
 * Security rules:
 *   - Never logs or prints the password.
 *   - Does not require JWT_SECRET so it can be run with only MONGO_URI set.
 *   - Does not expose any API endpoint.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const ADMIN_EMAIL = 'admin@phoenixtech.in';
const ADMIN_FULL_NAME = 'Phoenix Admin';
const ADMIN_ROLE = 'admin';
const ADMIN_PASSWORD = 'Phoenix@Admin#2026!Secure';

/**
 * Seeds the production admin account (idempotent).
 * @returns {Promise<{created: boolean, existed: boolean}>}
 */
async function seedAdmin() {
  const email = ADMIN_EMAIL.trim().toLowerCase();

  let existing = await User.findOne({ email });

  if (existing) {
    let modified = false;

    if (existing.role !== ADMIN_ROLE) {
      existing.role = ADMIN_ROLE;
      modified = true;
    }

    if (existing.isActive !== true) {
      existing.isActive = true;
      modified = true;
    }

    if (modified) {
      await existing.save();
    }

    await verifyAdmin(existing, email);
    return { created: false, existed: true };
  }

  const admin = await User.create({
    fullName: ADMIN_FULL_NAME,
    email,
    password: ADMIN_PASSWORD,
    role: ADMIN_ROLE,
    isActive: true,
  });

  await verifyAdmin(admin, email);
  return { created: true, existed: false };
}

/**
 * Verifies the admin account is usable for login.
 * Throws if any check fails. Never logs the password.
 */
async function verifyAdmin(user, email) {
  const found = await User.findOne({ email });
  if (!found) {
    throw new Error(`Admin account not found in MongoDB for ${email}`);
  }
  if (found.role !== ADMIN_ROLE) {
    throw new Error(`Admin role verification failed for ${email}`);
  }
  if (found.isActive !== true) {
    throw new Error(`Admin isActive verification failed for ${email}`);
  }
  const match = await found.comparePassword(ADMIN_PASSWORD);
  if (!match) {
    throw new Error(`bcrypt password verification failed for ${email}`);
  }
}

async function run() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('MONGO_URI is not set. Set MONGO_URI before running seed:admin.');
    process.exit(1);
  }

  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 15000,
  });

  const result = await seedAdmin();

  if (result.created) {
    console.log('Admin account created successfully.');
  } else {
    console.log('Admin account already exists.');
  }

  await mongoose.disconnect();
  return result;
}

module.exports = { seedAdmin, verifyAdmin };

// Allow running directly: `node src/scripts/seedAdmin.js`
if (require.main === module) {
  run()
    .then((result) => process.exit(0))
    .catch((err) => {
      console.error('\nAdmin seed verification FAILED:', err.message);
      process.exit(1);
    });
}