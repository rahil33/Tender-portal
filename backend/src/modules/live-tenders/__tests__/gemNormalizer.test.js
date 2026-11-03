const { normalizeGemDocument, extractCategory, normalizeKey, REJECT } = require('../services/gemNormalizer');
const { buildUpsertOperation } = require('../services/upsertBuilder');

const future = () => new Date(Date.now() + 5 * 86400000).toISOString();
const rawDoc = (over = {}) => ({
  b_id: ['7469542'],
  b_bid_number: ['GEM/2026/B/7469542'],
  b_category_name: ['Laptop / Notebook'],
  bbt_title: ['Supply of laptops'],
  ba_official_details_minName: ['Ministry of Defence'],
  ba_official_details_deptName: ['Dept of Military Affairs'],
  final_start_date_sort: [new Date().toISOString()],
  final_end_date_sort: [future()],
  b_bid_type: [1],
  b_total_quantity: [25],
  ...over,
});

describe('normalizeGemDocument', () => {
  test('extracts identifiers, organisation, dates, type, URL and category', () => {
    const { tender } = normalizeGemDocument(rawDoc());
    expect(tender.tenderNumber).toBe('GEM/2026/B/7469542');
    expect(tender.metadata.gemBidId).toBe('7469542');
    expect(tender.title).toBe('Supply of laptops');
    expect(tender.issuingOrganization).toBe('Ministry of Defence');
    expect(tender.department).toBe('Dept of Military Affairs');
    expect(tender.submissionDeadline).toBeInstanceOf(Date);
    expect(tender.openingDate).toBeInstanceOf(Date);
    expect(tender.metadata.bidType).toBe(1);
    expect(tender.metadata.originalUrl).toBe('https://bidplus.gem.gov.in/showbidDocument/7469542');
    expect(tender.category).toBe('Laptop / Notebook');
    expect(tender.categoryInfo.key).toBe('laptop-notebook');
    expect(tender.contentHash).toMatch(/^[0-9a-f]{40}$/);
  });

  test.each([
    ['missing bid id', { b_id: undefined }, REJECT.MISSING_BID_ID],
    ['missing bid number', { b_bid_number: [] }, REJECT.MISSING_BID_NUMBER],
    ['empty bid number', { b_bid_number: ['  '] }, REJECT.MISSING_BID_NUMBER],
    ['malformed bid number (whitespace)', { b_bid_number: ['GEM 2026 B 1'] }, REJECT.MALFORMED_BID_NUMBER],
    ['missing end date', { final_end_date_sort: undefined }, REJECT.MISSING_END_DATE],
    ['invalid end date', { final_end_date_sort: ['not-a-date'] }, REJECT.INVALID_END_DATE],
    ['inactive bid', { b_is_inactive: [1] }, REJECT.INACTIVE_BID],
  ])('rejects %s with an explicit reason', (_n, over, reason) => {
    const res = normalizeGemDocument(rawDoc(over));
    expect(res.tender).toBeUndefined();
    expect(res.reject.reason).toBe(reason);
  });

  test('rejects non-objects', () => {
    expect(normalizeGemDocument(null).reject.reason).toBe(REJECT.NOT_AN_OBJECT);
    expect(normalizeGemDocument([]).reject.reason).toBe(REJECT.NOT_AN_OBJECT);
  });
});

describe('category extraction', () => {
  test('keeps every GeM category and the original raw value', () => {
    const c = extractCategory({ b_category_name: ['Desktop Computers', 'Printers'] }, 1);
    expect(c.items.map((i) => i.name)).toEqual(['Desktop Computers', 'Printers']);
    expect(c.name).toBe('Desktop Computers');
    expect(c.raw).toBe('Desktop Computers | Printers');
  });

  test('uses category id / parent only when GeM actually supplies them', () => {
    const withIds = extractCategory({ b_category_name: ['X'], b_cat_id: [4521], parent_category_id: ['77'], parent_category_name: ['Parent'] }, 1);
    expect(withIds.id).toBe('4521');
    expect(withIds.parentId).toBe('77');
    expect(withIds.parentName).toBe('Parent');
    const without = extractCategory({ b_category_name: ['X'] }, 1);
    expect(without.id).toBeUndefined();
    expect(without.parentId).toBeUndefined();
  });

  test('missing category becomes explicit Unclassified, never a generic bucket', () => {
    const c = extractCategory({ some_cat_field: 'kept' }, 4);
    expect(c.key).toBe('unclassified');
    expect(c.name).toBe('Unclassified');
    expect(c.items).toEqual([]);
    expect(c.rawFields).toEqual({ some_cat_field: 'kept' });
  });

  test('product/service classification comes from GeM bid type only', () => {
    expect(extractCategory({ b_category_name: ['A'] }, 1).classification).toBe('product');
    expect(extractCategory({ b_category_name: ['A'] }, 5).classification).toBe('product');
    expect(extractCategory({ b_category_name: ['A'] }, 2).classification).toBe('service');
    expect(extractCategory({ b_category_name: ['A'] }, 4).classification).toBe('unclassified');
  });

  test('normalizeKey is stable and searchable', () => {
    expect(normalizeKey('  Laptop / Notebook & Tablets ')).toBe('laptop-notebook-and-tablets');
  });
});

describe('buildUpsertOperation', () => {
  const paths = (op, f) => Object.keys(op.update[f] || {});
  const overlaps = (a, b) => a.some((x) => b.some((y) => x === y || x.startsWith(`${y}.`) || y.startsWith(`${x}.`)));

  test('$set and $setOnInsert never touch the same path (MongoDB error 40 regression)', () => {
    const op = buildUpsertOperation(normalizeGemDocument(rawDoc()).tender);
    expect(overlaps(paths(op, '$set'), paths(op, '$setOnInsert'))).toBe(false);
    const bare = buildUpsertOperation(normalizeGemDocument(rawDoc({ b_category_name: undefined, bbt_title: undefined })).tender);
    expect(overlaps(paths(bare, '$set'), paths(bare, '$setOnInsert'))).toBe(false);
  });

  test('missing values are not written (cannot blank existing data)', () => {
    const op = buildUpsertOperation(normalizeGemDocument(rawDoc({ ba_official_details_deptName: undefined })).tender);
    expect(op.update.$set).not.toHaveProperty('department');
    expect(op.update.$set).not.toHaveProperty('metadata.state');
  });

  test('an Unclassified scrape does not overwrite a stored real category', () => {
    const op = buildUpsertOperation(normalizeGemDocument(rawDoc({ b_category_name: undefined })).tender);
    expect(op.update.$set).not.toHaveProperty('category');
    expect(op.update.$set).not.toHaveProperty('categoryInfo.key');
    expect(op.update.$setOnInsert.category).toBe('Unclassified');
  });

  test('fallback title (bid number) only applies on insert', () => {
    const op = buildUpsertOperation(normalizeGemDocument(rawDoc({ bbt_title: undefined, b_category_name: undefined })).tender);
    expect(op.update.$set).not.toHaveProperty('title');
    expect(op.update.$setOnInsert.title).toBe('GEM/2026/B/7469542');
  });

  test('dedup key is the GeM bid number', () => {
    expect(buildUpsertOperation(normalizeGemDocument(rawDoc()).tender).filter).toEqual({ tenderNumber: 'GEM/2026/B/7469542' });
  });
});
