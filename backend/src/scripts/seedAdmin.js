require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const { ROLES } = require('../modules/auth/constants');
const logger = require('../config/logger');

const DEFAULT_ADMIN_EMAIL = 'admin@phoenixtech.in';
const DEFAULT_ADMIN_NAME = 'Phoenix Admin';
const DEFAULT_ADMIN_ROLE = ROLES.ADMIN;

/**
 * Idempotently seeds a single production admin account from environment
 * variables.
 *
 * Security rules:
 *  - The password is ONLY read from the ADMIN_PASSWORD environment variable.
 *    It is never hardcoded in source, never logged, and never returned.
 *  - Never stores a plaintext password (the User model hashes via bcrypt
 *    on save).
 *  - If ADMIN_PASSWORD is not configured, the account is NOT created; a
 *    warning is logged instead.
 *  - Running the server N times always results in exactly one admin account:
 *      * If no user exists with ADMIN_EMAIL           -> create it.
 *      * If a user already exists (any role)          -> do NOT create a
 *        duplicate and do NOT reset its password.
 *      * If the existing user lacks the admin role    -> safely promote to
 *        admin when the desired role is admin.
 *
 * @returns {Promise<{created: boolean, promoted: boolean, existed: boolean, skipped?: boolean}>}
 */
async function seedAdmin() {
  const email = (process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL).trim().toLowerCase();
  const displayName = process.env.ADMIN_NAME || DEFAULT_ADMIN_NAME;
  const role = process.env.ADMIN_ROLE || DEFAULT_ADMIN_ROLE;

  if (!email) {
    logger.warn('ADMIN_EMAIL not set; skipping admin seed');
    return { created: false, promoted: false, existed: false, skipped: true };
  }

  const desiredPassword = process.env.ADMIN_PASSWORD;
  if (!desiredPassword) {
    logger.warn('ADMIN_PASSWORD is not configured; skipping admin seed');
    return { created: false, promoted: false, existed: false, skipped: true };
  }

  const existing = await User.findOne({ email });

  if (existing) {
    let promoted = false;
    if (role === ROLES.ADMIN && existing.role !== ROLES.ADMIN) {
      existing.role = ROLES.ADMIN;
      await existing.save();
      promoted = true;
      logger.info(`Promoted existing user ${existing.email} to ${ROLES.ADMIN} role`);
    }
    return { created: false, promoted, existed: true };
  }

  const admin = await User.create({
    fullName: displayName,
    email,
    password: desiredPassword,
    role,
    isActive: true,
  });

  logger.info(`Admin account ensured: ${admin.email}, role=${admin.role}`);
  return { created: true, promoted: false, existed: false, adminId: admin._id };
}

async function run() {
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/tender_portal', {
      serverSelectionTimeoutMS: 15000,
    });
  }
  const result = await seedAdmin();
  logger.info('Admin seed result:', { result: { ...result, adminId: undefined } });
  await mongoose.disconnect();
  return result;
}

module.exports = { seedAdmin };

// Allow running directly: `node src/scripts/seedAdmin.js`
if (require.main === module) {
  run().catch((err) => {
    logger.error('Admin seed failed', { error: err.message });
    process.exit(1);
  });
}