/**
 * Builds MongoDB update documents for GeM tender upserts.
 *
 * Rules (each one fixes a concrete defect of the previous implementation):
 *  - $set and $setOnInsert NEVER touch the same path. MongoDB rejects such an
 *    update with error 40 ("would create a conflict"), which made every write
 *    of the old implementation fail.
 *  - Only fields that actually have a value are written. A later scrape that is
 *    missing a field (empty string / undefined / null) therefore can not blank
 *    out valid data that was stored earlier. Nested objects are written with
 *    dotted paths for the same reason (no whole-subdocument overwrite).
 *  - A tender that is seen again on GeM is (re)activated and un-archived.
 */
const { UNCLASSIFIED_CATEGORY } = require('../constants');

const isPlainObject = (v) =>
  v !== null && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Date) && Object.getPrototypeOf(v) === Object.prototype;

const hasValue = (v) => {
  if (v === undefined || v === null) return false;
  if (typeof v === 'string') return v.trim() !== '';
  if (Array.isArray(v)) return v.length > 0;
  if (isPlainObject(v)) return Object.keys(v).length > 0;
  if (v instanceof Date) return !Number.isNaN(v.getTime());
  return true;
};

/** Flatten nested plain objects to dotted paths, dropping empty values. */
function flatten(obj, prefix = '', out = {}) {
  Object.keys(obj).forEach((key) => {
    const value = obj[key];
    const path = prefix ? `${prefix}.${key}` : key;
    if (!hasValue(value)) return;
    if (isPlainObject(value) && path !== 'categoryInfo.rawFields') flatten(value, path, out);
    else out[path] = value;
  });
  return out;
}

const conflicts = (path, keys) => keys.some((k) => k === path || k.startsWith(`${path}.`) || path.startsWith(`${k}.`));

/**
 * @param {object} tender  output of normalizeGemDocument().tender
 * @param {Date}   [now]
 * @returns {{filter: object, update: object}}
 */
function buildUpsertOperation(tender, now = new Date()) {
  const unclassified = tender.categoryInfo && tender.categoryInfo.key === UNCLASSIFIED_CATEGORY.key;

  const data = {
    tenderNumber: tender.tenderNumber,
    title: tender.title,
    description: tender.description,
    issuingOrganization: tender.issuingOrganization,
    department: tender.department,
    location: tender.location,
    tenderType: 'government',
    budget: tender.budget,
    submissionDeadline: tender.submissionDeadline,
    openingDate: tender.openingDate,
    sourcePortal: tender.sourcePortal || 'GEM',
    metadata: tender.metadata,
    documents: tender.documents,
    contactInfo: tender.contactInfo,
    tags: tender.tags,
    contentHash: tender.contentHash,
    status: 'published',
    visibility: 'public',
    isActive: true,
    isArchived: false,
    lastSeenAt: now,
    lastSyncedAt: now,
  };

  // A fallback title/description (the bid number) must never replace a real
  // one stored earlier -> it is only applied on insert.
  const insertOnly = {};
  if (data.title === tender.tenderNumber) { insertOnly.title = data.title; delete data.title; }
  if (data.description === `GeM tender ${tender.tenderNumber}`) { insertOnly.description = data.description; delete data.description; }

  if (unclassified) {
    // Do not overwrite a real category with "Unclassified" because one scrape
    // lacked it; keep the raw source fields for later correction.
    data.categoryInfo = {
      classification: tender.categoryInfo.classification !== 'unclassified' ? tender.categoryInfo.classification : undefined,
      classificationSource: tender.categoryInfo.classification !== 'unclassified' ? tender.categoryInfo.classificationSource : undefined,
      id: tender.categoryInfo.id,
      parentId: tender.categoryInfo.parentId,
      parentName: tender.categoryInfo.parentName,
      rawFields: tender.categoryInfo.rawFields,
    };
  } else {
    data.category = tender.category;
    data.categoryInfo = tender.categoryInfo;
  }

  const $set = flatten(data);
  // `items`/`rawFields`/arrays stay whole values; `categoryInfo.items` is an array so flatten kept it.

  const setOnInsertCandidates = {
    ...insertOnly,
    category: UNCLASSIFIED_CATEGORY.name,
    'categoryInfo.key': UNCLASSIFIED_CATEGORY.key,
    'categoryInfo.classification': 'unclassified',
    department: '',
    'budget.currency': 'INR',
  };
  const keys = Object.keys($set);
  const $setOnInsert = {};
  Object.keys(setOnInsertCandidates).forEach((path) => {
    if (!conflicts(path, keys)) $setOnInsert[path] = setOnInsertCandidates[path];
  });

  const update = { $set, $unset: { archivedAt: '', archiveReason: '' } };
  if (Object.keys($setOnInsert).length) update.$setOnInsert = $setOnInsert;

  return { filter: { tenderNumber: tender.tenderNumber }, update };
}

module.exports = { buildUpsertOperation, flatten, conflicts, hasValue };
