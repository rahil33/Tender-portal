const { LiveTender } = require('./model');
const { GemCategory } = require('./category.model');
const { GemSyncRun } = require('./syncRun.model');
const { SOURCE_PORTALS, UNCLASSIFIED_CATEGORY } = require('./constants');
const { liveTenderQuery } = require('./queries');
const logger = require('../../config/logger');

/**
 * GeM category handling.
 *
 * Source of truth: the category fields GeM itself puts on each bid record
 * (`b_category_name` / `bd_category_name`, plus an id / parent id when the
 * record carries one). This service only aggregates what GeM has published;
 * it contains NO hand-written category list.
 *
 * Limitation (documented, not hidden): GeM's complete product/service taxonomy
 * (category tree with ids and parents) is served by the interactive GeM site
 * and is not available through the public bid-listing endpoint this project
 * integrates with. Until such an official export is imported, `parentId` /
 * `gemCategoryId` are only filled when the bid records contain them, and every
 * bid without a category is explicitly "Unclassified".
 */
const mostSpecificClassification = (values) => {
  const distinct = [...new Set((values || []).filter((v) => v && v !== 'unclassified'))];
  return distinct.length === 1 ? distinct[0] : 'unclassified';
};

/** Legacy documents (synced before categoryInfo existed) have no category key: they are Unclassified until re-synced. */
const legacyUnclassifiedCount = (match) => LiveTender.countDocuments({ ...match, 'categoryInfo.key': { $exists: false } });

/**
 * Groups (by each bid's PRIMARY GeM category) on the full category tuple with a plain $sum only (portable: no
 * $first/$min/$cond needed) and collapses the tuples to one record per key in
 * JavaScript. When tuples disagree the most frequent name wins (ties: A-Z).
 */
async function aggregateCategories(match) {
  const rows = await LiveTender.aggregate([
    { $match: match },
    {
      $group: {
        _id: {
          key: '$categoryInfo.key',
          name: '$categoryInfo.name',
          id: '$categoryInfo.id',
          parentId: '$categoryInfo.parentId',
          parentName: '$categoryInfo.parentName',
          classification: '$categoryInfo.classification',
          classificationSource: '$categoryInfo.classificationSource',
        },
        count: { $sum: 1 },
      },
    },
  ]);
  const byKey = new Map();
  rows.forEach((r) => {
    const t = r._id || {};
    if (!t.key) return;
    const entry = byKey.get(t.key) || { key: t.key, count: 0, names: new Map(), classifications: [], tuples: [] };
    entry.count += r.count;
    const label = t.name || (t.key === UNCLASSIFIED_CATEGORY.key ? UNCLASSIFIED_CATEGORY.name : t.key);
    entry.names.set(label, (entry.names.get(label) || 0) + r.count);
    entry.classifications.push(t.classification);
    entry.tuples.push(t);
    byKey.set(t.key, entry);
  });
  return [...byKey.values()].map((e) => {
    const name = [...e.names.entries()].sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0])))[0][0];
    const pick = (field) => e.tuples.map((t) => t[field]).filter(Boolean).sort()[0];
    return {
      key: e.key,
      name,
      id: pick('id'),
      parentId: pick('parentId'),
      parentName: pick('parentName'),
      classification: mostSpecificClassification(e.classifications),
      classificationSource: pick('classificationSource') || 'none',
      count: e.count,
    };
  });
}

class CategoryService {
  /**
   * Rebuilds the GemCategory registry from stored GeM bids. Safe to run at any
   * time and independently of the tender sync (POST /api/live-tenders/categories/sync).
   */
  async syncCategories({ trigger = 'manual' } = {}) {
    const startedAt = new Date();
    let runDoc = null;
    try {
      runDoc = await GemSyncRun.create({ type: 'categories', trigger, status: 'running', startedAt });
    } catch (e) {
      logger.error(`Could not create category sync run: ${e.message}`);
    }

    try {
      const gem = { sourcePortal: SOURCE_PORTALS.GEM };
      const rows = await aggregateCategories(gem);
      const activeRows = await aggregateCategories({ ...gem, isActive: true, isArchived: { $ne: true } });
      const activeByKey = new Map(activeRows.map((r) => [r.key, r.count]));

      const [legacyTotal, legacyActive] = await Promise.all([
        legacyUnclassifiedCount(gem),
        legacyUnclassifiedCount({ ...gem, isActive: true, isArchived: { $ne: true } }),
      ]);
      const unclassifiedRow = rows.find((r) => r.key === UNCLASSIFIED_CATEGORY.key);
      const unclassifiedTotal = (unclassifiedRow ? unclassifiedRow.count : 0) + legacyTotal;
      const unclassifiedActive = (activeByKey.get(UNCLASSIFIED_CATEGORY.key) || 0) + legacyActive;

      const now = new Date();
      const ops = rows
        .filter((r) => r.key !== UNCLASSIFIED_CATEGORY.key)
        .map((r) => ({
          updateOne: {
            filter: { key: r.key },
            update: {
              $set: {
                name: r.name,
                ...(r.id ? { gemCategoryId: r.id } : {}),
                ...(r.parentId ? { parentId: r.parentId } : {}),
                ...(r.parentName ? { parentName: r.parentName } : {}),
                classification: r.classification,
                classificationSource: r.classificationSource,
                source: 'gem-bid-listing',
                activeCount: activeByKey.get(r.key) || 0,
                totalCount: r.count,
                lastSeenAt: now,
                lastSyncedAt: now,
              },
              $setOnInsert: { firstSeenAt: now },
            },
            upsert: true,
          },
        }));
      if (unclassifiedTotal > 0) {
        ops.push({
          updateOne: {
            filter: { key: UNCLASSIFIED_CATEGORY.key },
            update: {
              $set: { name: UNCLASSIFIED_CATEGORY.name, classification: 'unclassified', source: 'system', activeCount: unclassifiedActive, totalCount: unclassifiedTotal, lastSyncedAt: now },
              $setOnInsert: { firstSeenAt: now },
            },
            upsert: true,
          },
        });
      }

      let upserted = 0;
      if (ops.length) {
        const res = await GemCategory.bulkWrite(ops, { ordered: false });
        upserted = (res.upsertedCount || 0) + (res.modifiedCount || 0) + (res.matchedCount || 0);
      }
      // Zero out categories that no longer have any bids (kept for history).
      const seenKeys = ops.map((o) => o.updateOne.filter.key);
      await GemCategory.updateMany({ key: { $nin: seenKeys } }, { $set: { activeCount: 0, lastSyncedAt: now } });

      const categoriesTotal = await GemCategory.countDocuments({});
      const finishedAt = new Date();
      if (runDoc) {
        await GemSyncRun.updateOne({ _id: runDoc._id }, {
          $set: { status: 'success', finishedAt, durationMs: finishedAt - startedAt, categoriesUpserted: upserted, categoriesTotal },
        });
      }
      logger.info(`Category sync complete: ${ops.length} categories from GeM bid data, ${categoriesTotal} in registry`);
      return { success: true, categoriesUpserted: upserted, categoriesTotal };
    } catch (error) {
      const finishedAt = new Date();
      if (runDoc) {
        await GemSyncRun.updateOne({ _id: runDoc._id }, {
          $set: { status: 'failed', finishedAt, durationMs: finishedAt - startedAt, error: error.message },
        }).catch(() => {});
      }
      throw error;
    }
  }

  /**
   * Category facet for the filter UI: real categories with live counts, taken
   * from currently live tenders (always accurate, independent of the registry).
   */
  async getCategoryFacets(now = new Date()) {
    const live = liveTenderQuery(now);
    const [rows, legacyUnclassified, registry] = await Promise.all([
      aggregateCategories(live),
      legacyUnclassifiedCount(live),
      GemCategory.find({}).select('key gemCategoryId parentId parentName').lean(),
    ]);
    const reg = new Map(registry.map((r) => [r.key, r]));

    const categories = rows
      .map((r) => {
        const known = reg.get(r.key) || {};
        return {
          key: r.key,
          name: r.name,
          id: r.id || known.gemCategoryId || undefined,
          parentId: r.parentId || known.parentId || undefined,
          parentName: r.parentName || known.parentName || undefined,
          classification: r.classification,
          count: r.count,
        };
      })
      .filter((c) => c.key !== UNCLASSIFIED_CATEGORY.key)
      .sort((a, b) => a.name.localeCompare(b.name));

    const unclassifiedRow = rows.find((r) => r.key === UNCLASSIFIED_CATEGORY.key);
    const unclassified = (unclassifiedRow ? unclassifiedRow.count : 0) + legacyUnclassified;
    if (unclassified > 0) {
      categories.push({ key: UNCLASSIFIED_CATEGORY.key, name: UNCLASSIFIED_CATEGORY.name, classification: 'unclassified', count: unclassified });
    }
    return categories;
  }
}

module.exports = new CategoryService();
