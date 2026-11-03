/**
 * GeM record normalization (pure functions, no I/O).
 *
 * Turns one raw GeM "Solr" bid document (as returned by
 * bidplus.gem.gov.in/all-bids-data) into either
 *   { tender }                     - a validated LiveTender payload, or
 *   { reject: { reason, ... } }    - an explicit rejection with a reason code.
 *
 * Nothing here invents data: a value that GeM does not supply stays empty and
 * a category that GeM does not supply becomes the explicit "Unclassified"
 * category with the raw source fields preserved.
 */
const crypto = require('crypto');
const { CLASSIFICATION, UNCLASSIFIED_CATEGORY } = require('../constants');

const GEM_HOST = 'bidplus.gem.gov.in';
const GEM_OFFICIAL_HOSTS = new Set(['bidplus.gem.gov.in', 'bid.gem.gov.in', 'www.bidplus.gem.gov.in']);

const REJECT = Object.freeze({
  NOT_AN_OBJECT: 'not_an_object',
  MISSING_BID_ID: 'missing_bid_id',
  MISSING_BID_NUMBER: 'missing_bid_number',
  MALFORMED_BID_NUMBER: 'malformed_bid_number',
  MISSING_END_DATE: 'missing_end_date',
  INVALID_END_DATE: 'invalid_end_date',
  INACTIVE_BID: 'inactive_bid',
  NO_OFFICIAL_URL: 'no_official_url',
});

// ─── small helpers ────────────────────────────────────────────────────────────
const first = (doc, key) => {
  const v = doc[key];
  return Array.isArray(v) ? v[0] : v;
};

const asArray = (v) => {
  if (v === undefined || v === null) return [];
  return (Array.isArray(v) ? v : [v]).map((x) => (typeof x === 'string' ? x.trim() : x)).filter((x) => x !== '' && x !== null && x !== undefined);
};

const text = (v) => (typeof v === 'string' ? v.trim() : v === undefined || v === null ? '' : String(v).trim());

/** Search/lookup-friendly key: lowercase, accents/punctuation collapsed to "-". */
const normalizeKey = (value) =>
  text(value)
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 160);

function normalizeGemTenderUrl(url) {
  if (!url || typeof url !== 'string' || !url.trim()) return null;
  try {
    const resolved = new URL(url.trim(), `https://${GEM_HOST}`);
    if (!GEM_OFFICIAL_HOSTS.has(resolved.hostname.toLowerCase())) return null;
    if (!['https:', 'http:'].includes(resolved.protocol)) return null;
    return resolved.href;
  } catch (_) {
    return null;
  }
}

/** Official GeM bid document path (mirrors the portal's own listing template). */
function gemBidUrlPath(doc) {
  const bidId = text(first(doc, 'b_id'));
  if (!bidId) return '';
  let label = 'showbidDocument';
  const bidType = Number(first(doc, 'b_bid_type'));
  if (bidType === 5) label = 'showdirectradocumentPdf';
  else if (bidType === 2) label = Number(first(doc, 'b_eval_type')) > 0 ? 'list-ra-schedules' : 'showradocumentPdf';
  return `/${label}/${bidId}`;
}

/** GeM bid numbers look like GEM/2026/B/1234567 (or /R/ for RA). Be lenient. */
const isPlausibleBidNumber = (n) => typeof n === 'string' && n.length >= 5 && n.length <= 64 && !/\s/.test(n);

// ─── category extraction ──────────────────────────────────────────────────────
// Identifier/parent fields are only used if they are actually present in the
// source record; their names are matched by pattern, never assumed to exist.
const CATEGORY_ID_FIELD_RE = /^(?:b|bd|bbt)?_?(?:cat|category)_?(?:id|code|ids)$/i;
const CATEGORY_PARENT_ID_FIELD_RE = /parent.*cat.*id|cat.*parent.*id|parent_?cat(egory)?_?id/i;
const CATEGORY_PARENT_NAME_FIELD_RE = /parent.*cat.*name|cat.*parent.*name|parent_?cat(egory)?_?name/i;
const CATEGORY_ANY_FIELD_RE = /cat/i;

const classificationFromBidType = (bidType) => {
  // GeM bid-type codes: 1 & 5 are product bids, 2 is a service bid. Every other
  // code (BOQ, bid-to-RA, rate contract ...) does not say product vs service.
  if (bidType === 1 || bidType === 5) return CLASSIFICATION.PRODUCT;
  if (bidType === 2) return CLASSIFICATION.SERVICE;
  return CLASSIFICATION.UNCLASSIFIED;
};

/**
 * @param {object} doc  raw GeM document
 * @param {number} bidType
 * @returns {object} categoryInfo (always populated; Unclassified when GeM has none)
 */
function extractCategory(doc, bidType) {
  const names = asArray(doc.b_category_name).map(text).filter(Boolean);
  const detailNames = asArray(doc.bd_category_name).map(text).filter(Boolean);
  const source = names.length ? names : detailNames;

  // Preserve every category-looking source field for later correction.
  const rawFields = {};
  Object.keys(doc).forEach((k) => {
    if (CATEGORY_ANY_FIELD_RE.test(k) && doc[k] !== undefined && doc[k] !== null && doc[k] !== '') rawFields[k] = doc[k];
  });

  const pick = (re) => {
    const k = Object.keys(doc).find((key) => re.test(key) && text(first(doc, key)) !== '');
    return k ? text(first(doc, k)) : undefined;
  };
  const id = pick(CATEGORY_ID_FIELD_RE);
  const parentId = pick(CATEGORY_PARENT_ID_FIELD_RE);
  const parentName = pick(CATEGORY_PARENT_NAME_FIELD_RE);

  const classification = classificationFromBidType(bidType);
  const classificationSource = classification === CLASSIFICATION.UNCLASSIFIED ? 'none' : 'gem-bid-type';
  const raw = source.join(' | ');

  if (!source.length) {
    return {
      key: UNCLASSIFIED_CATEGORY.key,
      name: UNCLASSIFIED_CATEGORY.name,
      id: id || undefined,
      parentId,
      parentName,
      classification,
      classificationSource,
      raw: '',
      items: [],
      rawFields,
    };
  }

  const items = [];
  const seen = new Set();
  source.forEach((name) => {
    const key = normalizeKey(name);
    if (key && !seen.has(key)) {
      seen.add(key);
      items.push({ key, name });
    }
  });
  if (items.length === 0) {
    return { key: UNCLASSIFIED_CATEGORY.key, name: UNCLASSIFIED_CATEGORY.name, classification, classificationSource, raw, items: [], rawFields };
  }
  // The id/parent fields in the payload describe the primary category only.
  items[0] = { ...items[0], ...(id ? { id } : {}) };

  return {
    key: items[0].key,
    name: items[0].name,
    id,
    parentId,
    parentName,
    classification,
    classificationSource,
    raw,
    items,
    rawFields,
  };
}

// ─── content hash ─────────────────────────────────────────────────────────────
function computeContentHash(t) {
  const stable = {
    title: t.title,
    description: t.description,
    category: t.category,
    categoryInfo: t.categoryInfo && {
      key: t.categoryInfo.key, id: t.categoryInfo.id, parentId: t.categoryInfo.parentId,
      classification: t.categoryInfo.classification, items: t.categoryInfo.items,
    },
    issuingOrganization: t.issuingOrganization,
    department: t.department,
    location: t.location,
    submissionDeadline: t.submissionDeadline && t.submissionDeadline.toISOString(),
    openingDate: t.openingDate && t.openingDate.toISOString(),
    budget: t.budget,
    originalUrl: t.originalUrl,
    metadata: {
      gemBidId: t.metadata.gemBidId, ministry: t.metadata.ministry, state: t.metadata.state, city: t.metadata.city,
      bidType: t.metadata.bidType, bidDownloadUrl: t.metadata.bidDownloadUrl, isHighValue: t.metadata.isHighValue,
      isRateContract: t.metadata.isRateContract, isGlobalTendering: t.metadata.isGlobalTendering,
    },
  };
  return crypto.createHash('sha1').update(JSON.stringify(stable)).digest('hex');
}

const generateTags = (categoryName, ministry, department) => {
  const tags = new Set(['gem']);
  [categoryName, ministry, department].forEach((v) => {
    if (v && v !== UNCLASSIFIED_CATEGORY.name) tags.add(String(v).toLowerCase());
  });
  return Array.from(tags);
};

// ─── main entry point ─────────────────────────────────────────────────────────
/**
 * @param {object} doc raw GeM document
 * @returns {{tender: object}|{reject: {reason: string, bidNumber?: string, gemBidId?: string}}}
 */
function normalizeGemDocument(doc) {
  if (!doc || typeof doc !== 'object' || Array.isArray(doc)) return { reject: { reason: REJECT.NOT_AN_OBJECT } };

  const bidId = text(first(doc, 'b_id'));
  const bidNumber = text(first(doc, 'b_bid_number'));
  if (!bidId) return { reject: { reason: REJECT.MISSING_BID_ID, bidNumber } };
  if (!bidNumber) return { reject: { reason: REJECT.MISSING_BID_NUMBER, gemBidId: bidId } };
  if (!isPlausibleBidNumber(bidNumber)) return { reject: { reason: REJECT.MALFORMED_BID_NUMBER, bidNumber, gemBidId: bidId } };

  const endRaw = first(doc, 'final_end_date_sort');
  if (endRaw === undefined || endRaw === null || endRaw === '') return { reject: { reason: REJECT.MISSING_END_DATE, bidNumber, gemBidId: bidId } };
  const endDate = new Date(endRaw);
  if (Number.isNaN(endDate.getTime())) return { reject: { reason: REJECT.INVALID_END_DATE, bidNumber, gemBidId: bidId } };

  if (Number(first(doc, 'b_is_inactive')) === 1) return { reject: { reason: REJECT.INACTIVE_BID, bidNumber, gemBidId: bidId } };

  const officialUrl = normalizeGemTenderUrl(gemBidUrlPath(doc));
  if (!officialUrl) return { reject: { reason: REJECT.NO_OFFICIAL_URL, bidNumber, gemBidId: bidId } };

  const startRaw = first(doc, 'final_start_date_sort');
  const startDate = startRaw ? new Date(startRaw) : undefined;
  const openingDate = startDate && !Number.isNaN(startDate.getTime()) ? startDate : undefined;

  const bidType = Number(first(doc, 'b_bid_type')) || 1;
  const boqTitle = text(first(doc, 'bbt_title'));
  const ministry = text(first(doc, 'ba_official_details_minName'));
  const department = text(first(doc, 'ba_official_details_deptName'));
  const quantity = text(first(doc, 'b_total_quantity'));

  const categoryInfo = extractCategory(doc, bidType);
  const categoryName = categoryInfo.name;
  const title = boqTitle || (categoryInfo.key !== UNCLASSIFIED_CATEGORY.key ? categoryInfo.name : '') || bidNumber;

  const state = text(first(doc, 'b_delivery_state') || first(doc, 'ba_state_name')) || undefined;
  const city = text(first(doc, 'b_delivery_city') || first(doc, 'ba_city_name')) || undefined;

  const rawValue = first(doc, 'b_bid_value') ?? first(doc, 'b_reserve_price') ?? first(doc, 'b_estimated_value');
  const parsedValue = typeof rawValue === 'string' ? parseFloat(rawValue.replace(/[^0-9.]/g, '')) : parseFloat(rawValue);
  const estimated = Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : undefined;

  const description = [
    categoryInfo.raw ? `Items: ${categoryInfo.raw}` : null,
    quantity ? `Total quantity: ${quantity}` : null,
    ministry ? `Ministry: ${ministry}` : null,
    department ? `Department: ${department}` : null,
  ].filter(Boolean).join('. ') || `GeM tender ${bidNumber}`;

  const catalogue = normalizeGemTenderUrl(text(first(doc, 'b_catalogue_url')));
  const bidDownloadUrl = catalogue || officialUrl;

  const tender = {
    tenderNumber: bidNumber,
    title,
    description,
    category: categoryName,
    categoryInfo,
    status: 'published',
    issuingOrganization: ministry || department || 'Government of India',
    department,
    location: state || 'India',
    tenderType: 'government',
    budget: estimated ? { estimated, currency: 'INR', budgetType: 'fixed' } : undefined,
    submissionDeadline: endDate,
    openingDate,
    originalUrl: officialUrl,
    sourcePortal: 'GEM',
    metadata: {
      source: 'GEM',
      originalUrl: officialUrl,
      gemBidId: bidId,
      gemStatus: 'ongoing',
      ministry: ministry || undefined,
      state,
      city,
      boqUrl: boqTitle ? officialUrl : undefined,
      tenderPdfUrl: officialUrl,
      bidType,
      isHighValue: !!doc.is_high_value,
      isRateContract: Number(first(doc, 'is_rc_bid')) === 1,
      isGlobalTendering: Number(first(doc, 'ba_is_global_tendering')) === 1,
      bidDownloadUrl,
    },
    documents: [{
      documentName: 'GeM Bid Document',
      documentUrl: officialUrl,
      documentType: 'tender_document',
      name: 'GeM Bid Document',
      url: officialUrl,
      type: 'tender_document',
      source: 'GEM',
    }],
    contactInfo: {
      organisation: ministry || department || '',
      department,
      address: `${ministry} ${department}`.trim(),
    },
    tags: generateTags(categoryInfo.key === UNCLASSIFIED_CATEGORY.key ? '' : categoryName, ministry, department),
  };
  tender.contentHash = computeContentHash(tender);
  return { tender };
}

module.exports = {
  REJECT,
  normalizeGemDocument,
  extractCategory,
  normalizeKey,
  normalizeGemTenderUrl,
  gemBidUrlPath,
  computeContentHash,
  classificationFromBidType,
};
