/**
 * Safe database cleanup/migration for legacy non-GeM (CPPP) live tenders.
 *
 * The Live Tenders collection should only contain GeM-sourced records. This
 * script identifies and optionally deletes legacy records where:
 *   - sourcePortal is not "GEM", OR
 *   - sourcePortal is missing, OR
 *   - metadata.cpppId exists (i.e. the tender came from CPPP).
 *
 * GeM records (sourcePortal === "GEM") are never touched.
 *
 * Usage:
 *   node src/scripts/cleanupCpppTenders.js              # dry-run: count only
 *   node src/scripts/cleanupCpppTenders.js --apply      # delete matching records
 *
 * Run with the same environment as the server (MONGO_URI).
 */

require('dotenv').config();
const mongoose = require('mongoose');
const database = require('../config/database');
const logger = require('../config/logger');
const { LiveTender } = require('../modules/live-tenders/model');
const { SOURCE_PORTALS } = require('../modules/live-tenders/constants');

const apply = process.argv.includes('--apply');

async function main() {
  await database.connect();
  logger.info('Connected to MongoDB for legacy tender cleanup');

  const legacyQuery = {
    $or: [
      { sourcePortal: { $ne: SOURCE_PORTALS.GEM } },
      { sourcePortal: { $exists: false } },
      { 'metadata.cpppId': { $exists: true } },
    ],
  };

  const legacyCount = await LiveTender.countDocuments(legacyQuery);
  const gemCount = await LiveTender.countDocuments({ sourcePortal: SOURCE_PORTALS.GEM });

  logger.info(
    `Cleanup ${apply ? 'applied' : 'dry-run'}: found ${legacyCount} legacy non-GeM record(s), ${gemCount} GeM record(s).`
  );

  if (!apply) {
    logger.warn('No changes made. Re-run with --apply to delete legacy records.');
    return;
  }

  if (legacyCount > 0) {
    const result = await LiveTender.deleteMany(legacyQuery);
    logger.info(`Deleted ${result.deletedCount} legacy non-GeM record(s). ${gemCount} GeM record(s) kept.`);
  } else {
    logger.info('No legacy non-GeM records to delete.');
  }

  // Drop the legacy cpppId index that is no longer part of the schema.
  try {
    const indexes = await LiveTender.collection.indexes();
    const legacyIndex = indexes.find((i) => i.name === 'metadata.cpppId_1');
    if (legacyIndex) {
      await LiveTender.collection.dropIndex('metadata.cpppId_1');
      logger.info('Dropped legacy index metadata.cpppId_1');
    } else {
      logger.info('Legacy index metadata.cpppId_1 already absent.');
    }
  } catch (error) {
    logger.warn('Could not drop legacy index metadata.cpppId_1', { error: error.message });
  }
}

main()
  .then(() => database.disconnect())
  .then(() => process.exit(0))
  .catch((error) => {
    logger.error('Cleanup failed', { error: error.message });
    database.disconnect().finally(() => process.exit(1));
  });