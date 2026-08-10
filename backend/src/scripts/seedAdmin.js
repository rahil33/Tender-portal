/**
 * Safe idempotent production admin seed script.
 *
 * Usage (from backend/):
 *   npm run seed:admin
 *
 * All admin configuration is read ONLY from environment variables:
 *   ADMIN_EMAIL     admin email (defaults to admin@example.com if unset)
 *   ADMIN_PASSWORD  admin password — REQUIRED, never hardcoded
 *   ADMIN_NAME      admin full name (defaults to Administrator)
 *   ADMIN_ROLE      admin role (defaults to admin)
 *
 * Optional one-time rotation flag:
 *   ADMIN_RESET_PASSWORD=true  forces the stored password to be re-hashed
 *                              from ADMIN_PASSWORD. Without this flag the
 *                              existing password is NEVER overwritten, so the
 *                              script stays idempotent by default.
 *
 * Behavior:
 *   - Connects with the existing MONGO_URI environment variable.
 *   - Looks up ADMIN_EMAIL.
 *   - If it does NOT exist -> creates the admin (role admin, isActive true).
 *     The password is hashed by the User model's bcrypt pre-save hook; the
 *     plaintext password is never stored or printed.
 *   - If it already exists -> does NOT create a duplicate; only ensures
 *     role === ADMIN_ROLE and isActive === true. The password is reset ONLY
 *     when ADMIN_RESET_PASSWORD=true (one-time rotation/compromise response).
 *   - Self-verifies after seeding: account exists, role matches, isActive is
 *     true, and bcrypt password verification succeeds against ADMIN_PASSWORD.
 *
 * Security rules:
 *   - Never logs or prints the password.
 *   - Does not require JWT_SECRET so it can be run with only MONGO_URI set.
 *   - Does not expose any API endpoint.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const INVALID_PASSWORD_HINT = 'CHANGE_THIS_IN_PRODUCTION';

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'admin@example.com').trim().toLowerCase();
const ADMIN_FULL_NAME = (process.env.ADMIN_NAME || 'Administrator').trim();
const ADMIN_ROLE = (process.env.ADMIN_ROLE || 'admin').trim().toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_RESET_PASSWORD = process.env.ADMIN_RESET_PASSWORD === 'true';

/**
 * Seeds the production admin account (idempotent).
 * @param {object} [opts] Optional overrides (used by tests/callers).
 * @param {string} [opts.email]
 * @param {string} [opts.fullName]
 * @param {string} [opts.role]
 * @param {string} [opts.password]
 * @param {boolean} [opts.resetPassword]
 * @returns {Promise<{created: boolean, existed: boolean, resetPassword: boolean}>}
 */
async function seedAdmin(opts = {}) {
  const email = (opts.email || ADMIN_EMAIL).trim().toLowerCase();
  const fullName = (opts.fullName || ADMIN_FULL_NAME).trim();
  const role = (opts.role || ADMIN_ROLE).trim().toLowerCase();
  const password = opts.password || ADMIN_PASSWORD;
  const resetPassword = opts.resetPassword === true || ADMIN_RESET_PASSWORD;

  if (!password || password === INVALID_PASSWORD_HINT) {
    throw new Error(
      'ADMIN_PASSWORD is not set or still holds a placeholder. Set a real production password in the environment (.env / Render).'
    );
  }

  let existing = await User.findOne({ email });

  if (existing) {
    let modified = false;

    if (existing.role !== role) {
      existing.role = role;
      modified = true;
    }

    if (existing.isActive !== true) {
      existing.isActive = true;
      modified = true;
    }

    // One-time / explicit rotation only. Without ADMIN_RESET_PASSWORD=true the
    // stored password is never overwritten.
    if (resetPassword) {
      existing.password = password;
      modified = true;
    }

    if (modified) {
      await existing.save();
    }

    await verifyAdmin(existing, email, password);
    return { created: false, existed: true, resetPassword };
  }

  const admin = await User.create({
    fullName,
    email,
    password,
    role,
    isActive: true,
  });

  await verifyAdmin(admin, email, password);
  return { created: true, existed: false, resetPassword: false };
}

/**
 * Verifies the admin account is usable for login.
 * Throws if any check fails. Never logs the password.
 */
async function verifyAdmin(user, email, password) {
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
  const match = await found.comparePassword(password);
  if (!match) {
    throw new Error(
      `bcrypt password verification failed for ${email}. ` +
        'If the stored password must be rotated, re-run with ADMIN_RESET_PASSWORD=true'
    );
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
  if (result.resetPassword) {
    console.log('Admin password was rotated (ADMIN_RESET_PASSWORD=true). Password was never printed.');
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