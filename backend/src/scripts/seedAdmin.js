const database = require('../config/database');
const User = require('../models/User');

const PLACEHOLDER_PASSWORD_RE = /^(change[_\s-]?(me|this)|your[_\s-]?password|password|admin|admin123|12345678|placeholder|example|todo|xxx+)/i;
const MIN_PASSWORD_LENGTH = 10;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const ADMIN_FULL_NAME = (process.env.ADMIN_NAME || 'Administrator').trim();
const ADMIN_ROLE = (process.env.ADMIN_ROLE || 'admin').trim().toLowerCase();
const ADMIN_RESET_PASSWORD = process.env.ADMIN_RESET_PASSWORD === 'true';

/**
 * Validates seeder input. Throws with a message that never contains the password.
 */
function validateAdminInput({ email, password }) {
  if (!email) {
    throw new Error('ADMIN_EMAIL is not set. Set a real admin email in the environment (.env / Render).');
  }
  if (!EMAIL_RE.test(email)) {
    throw new Error('ADMIN_EMAIL is not a valid email address.');
  }
  if (/@example\.(com|org|net)$/i.test(email) && process.env.NODE_ENV === 'production') {
    throw new Error('ADMIN_EMAIL is still the example placeholder. Use a real address.');
  }
  if (!password || PLACEHOLDER_PASSWORD_RE.test(password.trim())) {
    throw new Error(
      'ADMIN_PASSWORD is not set or still holds a placeholder. Set a real password in the environment (.env / Render).'
    );
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`ADMIN_PASSWORD must be at least ${MIN_PASSWORD_LENGTH} characters.`);
  }
}

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
  const email = (opts.email || process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const fullName = (opts.fullName || ADMIN_FULL_NAME).trim();
  const role = (opts.role || ADMIN_ROLE).trim().toLowerCase();
  const password = opts.password || process.env.ADMIN_PASSWORD;
  const resetPassword = opts.resetPassword === true || ADMIN_RESET_PASSWORD;

  validateAdminInput({ email, password });

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

    await verifyAdmin(existing, email, password, role);
    return { created: false, existed: true, resetPassword };
  }

  let admin;
  try {
    admin = await User.create({
      fullName,
      email,
      password,
      role,
      isActive: true,
    });
  } catch (err) {
    // Unique index on email: a concurrent run already created it.
    if (err && err.code === 11000) {
      existing = await User.findOne({ email });
      await verifyAdmin(existing, email, password, role);
      return { created: false, existed: true, resetPassword: false };
    }
    throw err;
  }

  await verifyAdmin(admin, email, password, role);
  return { created: true, existed: false, resetPassword: false };
}

/**
 * Verifies the admin account is usable for login.
 * Throws if any check fails. Never logs the password.
 */
async function verifyAdmin(user, email, password, expectedRole = ADMIN_ROLE) {
  const found = await User.findOne({ email });
  if (!found) {
    throw new Error(`Admin account not found in MongoDB for ${email}`);
  }
  if (found.role !== expectedRole) {
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
  await database.connect();
  try {
    const result = await seedAdmin();

    if (result.created) {
      console.log('Admin account created successfully.');
    } else {
      console.log('Admin account already exists (no duplicate created).');
    }
    if (result.resetPassword) {
      console.log('Admin password was rotated (ADMIN_RESET_PASSWORD=true). Password was never printed.');
    }
    return result;
  } finally {
    await database.disconnect();
  }
}

module.exports = { seedAdmin, verifyAdmin, validateAdminInput };

// Allow running directly: `node src/scripts/seedAdmin.js`
if (require.main === module) {
  run()
    .then(() => process.exit(0))
    .catch((err) => {
      if (err && err.category) {
        console.error(`\nAdmin seed FAILED (MongoDB ${err.category} error): ${err.message}`);
        (err.problems || []).forEach((p) => console.error(`  - ${p}`));
        if (err.hint) console.error(`Hint: ${err.hint}`);
      } else {
        console.error('\nAdmin seed FAILED:', database.redact(err && err.message));
      }
      process.exit(1);
    });
}
