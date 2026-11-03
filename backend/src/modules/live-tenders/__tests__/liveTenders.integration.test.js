/**
 * End-to-end tests: mocked GeM HTTP -> scraper -> normalizer -> MongoDB sync
 * -> Express API. They need a REAL MongoDB-compatible server, so they only run
 * when TEST_MONGO_URI is set, e.g.
 *     TEST_MONGO_URI=mongodb://127.0.0.1:27017/phoenix_gem_test npm test
 * The database name must contain "test": the suite wipes the LiveTender,
 * sync-run, category and session collections and refuses to touch anything else.
 * GeM itself is NEVER contacted (all HTTP is mocked), so passing here proves
 * the pipeline logic, not live GeM connectivity.
 */
const express = require('express');
const request = require('supertest');
const mongoose = require('mongoose');

const TEST_URI = process.env.TEST_MONGO_URI;
const suite = TEST_URI ? describe : describe.skip;

suite('GeM sync + live tender API (mocked GeM, real MongoDB)', () => {
  let scraper; let syncService; let categoryService; let LiveTender; let GemSyncRun; let GemCategory; let Session; let app; let generateToken;
  let userToken; let adminToken;

  // Fixed base time: real GeM dates are stable between crawls, so the content hash must be too.
  const BASE = Date.now();
  const future = (days = 5) => new Date(BASE + days * 86400000).toISOString();
  const mk = (n, over = {}) => ({
    b_id: [String(1000 + n)],
    b_bid_number: [`GEM/2026/B/${1000 + n}`],
    b_category_name: [n % 3 === 0 ? 'Consultancy Services' : n % 2 === 0 ? 'Office Chairs' : 'Laptop'],
    bbt_title: [`Tender ${n}`],
    ba_official_details_minName: [n % 2 === 0 ? 'Ministry A' : 'Ministry B'],
    ba_official_details_deptName: ['Dept X'],
    b_delivery_state: [n % 2 === 0 ? 'Tamil Nadu' : 'Kerala'],
    final_start_date_sort: [new Date(BASE - n * 3600000).toISOString()],
    final_end_date_sort: [future(2 + n)],
    b_bid_type: [n % 3 === 0 ? 2 : n % 5 === 0 ? 4 : 1],
    ...over,
  });

  /** Installs a fake GeM: `state.docs` are served 10 per page; pages in `state.failPages` return 500. */
  const state = { docs: [], failPages: new Set() };
  const installFakeGem = () => {
    scraper.sleep = async () => {};
    scraper.requestDelayMs = 0;
    scraper.maxRetries = 0;
    scraper.http = {
      get: async () => ({ data: '<input id="chash" value="tok123">', headers: { 'set-cookie': ['sess=abc; Path=/'] } }),
      post: async (_url, body) => {
        const payload = JSON.parse(new URLSearchParams(body).get('payload'));
        if (state.failPages.has(payload.page)) { const e = new Error('Request failed with status code 500'); e.response = { status: 500, headers: {} }; throw e; }
        const start = (payload.page - 1) * 10;
        return { data: { code: 200, response: { response: { numFound: state.docs.length, start, docs: state.docs.slice(start, start + 10) } } } };
      },
    };
  };

  beforeAll(async () => {
    const dbName = new URL(TEST_URI).pathname.replace('/', '');
    if (!/test/i.test(dbName)) throw new Error(`Refusing to run destructive tests on database "${dbName}" (name must contain "test")`);
    await mongoose.connect(TEST_URI, { serverSelectionTimeoutMS: 5000 });
    ({ LiveTender } = require('../model'));
    ({ GemSyncRun } = require('../syncRun.model'));
    ({ GemCategory } = require('../category.model'));
    ({ Session } = require('../../auth/model'));
    ({ generateToken } = require('../../../config/jwt'));
    scraper = require('../services/gemScraper.service');
    syncService = require('../service');
    categoryService = require('../categoryService');
    await Promise.all([LiveTender.deleteMany({}), GemSyncRun.deleteMany({}), GemCategory.deleteMany({}), Session.deleteMany({})]);
    await LiveTender.init();
    installFakeGem();

    const mkSession = async (role) => {
      const id = new mongoose.Types.ObjectId();
      const token = generateToken({ id: String(id), role }, '1h');
      await Session.create({ userId: id, token, expiresAt: new Date(Date.now() + 3600000) });
      return token;
    };
    userToken = await mkSession('vendor');
    adminToken = await mkSession('admin');

    app = express();
    app.use(express.json());
    app.use('/api/live-tenders', require('../routes'));
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  // 25 raw records: 22 unique valid, 1 duplicate of #1, 2 invalid (no bid number / no end date)
  const initialDocs = () => [
    ...Array.from({ length: 22 }, (_, i) => mk(i + 1)),
    mk(1),
    mk(90, { b_bid_number: [] }),
    mk(91, { final_end_date_sort: undefined }),
  ];

  test('regression: schema accepts documents[].type (previously every write failed Mongoose casting)', async () => {
    const { normalizeGemDocument } = require('../services/gemNormalizer');
    const { buildUpsertOperation } = require('../services/upsertBuilder');
    const t = normalizeGemDocument(mk(500)).tender;
    const { filter, update } = buildUpsertOperation(t);
    const res = await LiveTender.bulkWrite([{ updateOne: { filter, update, upsert: true } }], { ordered: false });
    expect(res.upsertedCount).toBe(1);
    expect((res.mongoose && res.mongoose.validationErrors) || []).toHaveLength(0);
    const saved = await LiveTender.findOne({ tenderNumber: t.tenderNumber }).lean();
    expect(saved.documents[0].type).toBe('tender_document');
    expect(saved.documents[0].url).toMatch(/^https:\/\/bidplus\.gem\.gov\.in\//);
    await LiveTender.deleteMany({});
  });

  test('first sync inserts every valid tender and reports REAL counters', async () => {
    state.docs = initialDocs();
    const result = await syncService.synchronizeTenders({ trigger: 'test' });
    const s = result.stats;
    expect(result.success).toBe(true);
    expect(s.lastSyncStatus).toBe('success');
    expect(s.pagesDiscovered).toBe(3);
    expect(s.pagesProcessed).toBe(3);
    expect(s.tendersExtracted).toBe(25);
    expect(s.tendersValidated).toBe(23);
    expect(s.tendersRejected).toBe(2);
    expect(s.duplicatesSkipped).toBe(1);
    expect(s.tendersInserted).toBe(22);
    expect(s.dbWriteFailures).toBe(0);
    expect(s.verifiedPersisted).toBe(22);
    expect(await LiveTender.countDocuments({})).toBe(22); // what the counters say is what is in MongoDB
    const run = await GemSyncRun.findOne({ type: 'tenders' }).lean();
    expect(run.status).toBe('success');
    expect(run.tendersInserted).toBe(22);
    expect(run.rejectionReasons).toEqual({ missing_bid_number: 1, missing_end_date: 1 });
  });

  test('second identical sync creates no duplicates and changes nothing', async () => {
    const s = (await syncService.synchronizeTenders({ trigger: 'test' })).stats;
    expect(s.tendersInserted).toBe(0);
    expect(s.tendersUpdated).toBe(0);
    expect(s.tendersUnchanged).toBe(22);
    expect(await LiveTender.countDocuments({})).toBe(22);
  });

  test('changed tender is updated; missing fields in a later scrape do not overwrite stored data', async () => {
    state.docs = initialDocs();
    state.docs[0] = mk(1, { bbt_title: ['Tender 1 (corrected)'] });
    state.docs[1] = mk(2, { b_category_name: undefined, ba_official_details_deptName: undefined, b_delivery_state: undefined });
    state.docs[22] = mk(1); // keep the in-crawl duplicate
    const s = (await syncService.synchronizeTenders({ trigger: 'test' })).stats;
    expect(s.tendersUpdated).toBe(1 /* only #1 changed visibly */ + 1 /* #2 hash changed */);
    const one = await LiveTender.findOne({ tenderNumber: 'GEM/2026/B/1001' }).lean();
    expect(one.title).toBe('Tender 1 (corrected)');
    const two = await LiveTender.findOne({ tenderNumber: 'GEM/2026/B/1002' }).lean();
    expect(two.category).toBe('Office Chairs'); // not replaced by "Unclassified"
    expect(two.department).toBe('Dept X');
    expect(two.metadata.state).toBe('Tamil Nadu');
  });

  test('partial crawl (a page fails) never archives anything', async () => {
    state.docs = initialDocs().slice(0, 21); // GeM no longer lists #22.. but the crawl is partial
    state.failPages = new Set([2]);
    const result = await syncService.synchronizeTenders({ trigger: 'test' });
    state.failPages = new Set();
    expect(result.stats.lastSyncStatus).toBe('partial');
    expect(result.stats.pagesFailed).toBe(1);
    expect(result.stats.totalRemoved).toBe(0);
    expect(await LiveTender.countDocuments({ isActive: true, isArchived: false })).toBe(22);
  });

  test('complete crawl archives bids no longer on GeM (not deleted) and archives expired bids', async () => {
    await LiveTender.updateOne({ tenderNumber: 'GEM/2026/B/1005' }, { $set: { submissionDeadline: new Date(Date.now() - 1000) } });
    state.docs = initialDocs().slice(0, 20); // #21, #22 vanished from GeM
    const result = await syncService.synchronizeTenders({ trigger: 'test' });
    expect(result.stats.lastSyncStatus).toBe('success');
    expect(await LiveTender.countDocuments({})).toBe(22); // nothing deleted
    const gone = await LiveTender.findOne({ tenderNumber: 'GEM/2026/B/1021' }).lean();
    expect(gone).toMatchObject({ isActive: false, isArchived: true, archiveReason: 'not_listed_on_gem' });
    const expired = await LiveTender.findOne({ tenderNumber: 'GEM/2026/B/1005' }).lean();
    expect(expired).toMatchObject({ isArchived: true, archiveReason: 'deadline_passed' });
  });

  test('a database that rejects writes is reported as failed, not as a successful sync', async () => {
    const original = LiveTender.bulkWrite;
    LiveTender.bulkWrite = async () => { throw new Error('simulated database outage'); };
    try {
      state.docs = Array.from({ length: 40 }, (_, i) => mk(200 + i));
      const result = await syncService.synchronizeTenders({ trigger: 'test' });
      expect(result.stats.tendersInserted).toBe(0);
      expect(result.stats.dbWriteFailures).toBeGreaterThan(0);
      expect(['failed', 'partial']).toContain(result.stats.lastSyncStatus);
      expect(result.stats.lastSyncStatus).not.toBe('success');
    } finally {
      LiveTender.bulkWrite = original;
    }
  });

  // ─── API ───────────────────────────────────────────────────────────────────
  describe('API', () => {
    beforeAll(async () => {
      await LiveTender.deleteMany({});
      state.docs = Array.from({ length: 30 }, (_, i) => mk(i + 1));
      state.failPages = new Set();
      await syncService.synchronizeTenders({ trigger: 'test' });
    });
    const get = (path, token = userToken) => request(app).get(`/api/live-tenders${path}`).set('Authorization', `Bearer ${token}`);

    test('requires authentication', async () => {
      expect((await request(app).get('/api/live-tenders')).status).toBe(401);
      expect((await request(app).get('/api/live-tenders/categories')).status).toBe(401);
      expect((await request(app).get('/api/live-tenders').set('Authorization', 'Bearer junk')).status).toBe(401);
    });

    test('saved records are returned, with accurate totals and pagination', async () => {
      const res = await get('?limit=10&page=1');
      expect(res.status).toBe(200);
      expect(res.body.data.pagination).toMatchObject({ total: 30, pages: 3, page: 1, limit: 10 });
      expect(res.body.data.data).toHaveLength(10);
      const p3 = await get('?limit=10&page=3');
      expect(p3.body.data.data).toHaveLength(10);
      const ids = new Set([...res.body.data.data, ...p3.body.data.data].map((t) => t.tenderNumber));
      expect(ids.size).toBe(20);
    });

    test('archived and expired bids are excluded', async () => {
      await LiveTender.updateOne({ tenderNumber: 'GEM/2026/B/1001' }, { $set: { isArchived: true, isActive: false } });
      await LiveTender.updateOne({ tenderNumber: 'GEM/2026/B/1002' }, { $set: { submissionDeadline: new Date(Date.now() - 5000) } });
      const res = await get('?limit=100');
      expect(res.body.data.pagination.total).toBe(28);
      expect(res.body.data.data.find((t) => t.tenderNumber === 'GEM/2026/B/1001')).toBeUndefined();
      await LiveTender.updateOne({ tenderNumber: 'GEM/2026/B/1001' }, { $set: { isArchived: false, isActive: true } });
      await LiveTender.updateOne({ tenderNumber: 'GEM/2026/B/1002' }, { $set: { submissionDeadline: new Date(Date.now() + 5 * 86400000) } });
    });

    test('/categories returns real GeM category records with counts (no generic buckets)', async () => {
      const res = await get('/categories');
      const names = res.body.data.map((c) => c.name).sort();
      expect(names).toEqual(['Consultancy Services', 'Laptop', 'Office Chairs']);
      expect(res.body.data.reduce((n, c) => n + c.count, 0)).toBe(30);
      expect(res.body.data[0]).toHaveProperty('key');
    });

    test('category filter works on its own', async () => {
      const res = await get('?category=laptop&limit=100');
      expect(res.body.data.data.length).toBeGreaterThan(0);
      expect(res.body.data.data.every((t) => t.category === 'Laptop')).toBe(true);
    });

    test('bid type filter works independently of category', async () => {
      const res = await get('?bidType=4&limit=100');
      expect(res.body.data.data.length).toBeGreaterThan(0);
      expect(res.body.data.data.every((t) => t.metadata.bidType === 4)).toBe(true);
      const cats = new Set(res.body.data.data.map((t) => t.category));
      expect(cats.size).toBeGreaterThan(0); // bid type does not imply a category
    });

    test('filters combine (category + bid type + state)', async () => {
      const res = await get('?category=laptop&bidType=1&state=Kerala&limit=100');
      expect(res.body.data.data.every((t) => t.category === 'Laptop' && t.metadata.bidType === 1 && /kerala/i.test(t.metadata.state))).toBe(true);
    });

    test('classification (product/service) filter', async () => {
      const svc = await get('?classification=service&limit=100');
      expect(svc.body.data.data.every((t) => t.metadata.bidType === 2)).toBe(true);
      const prod = await get('?classification=product&limit=100');
      expect(prod.body.data.data.every((t) => [1, 5].includes(t.metadata.bidType))).toBe(true);
      expect(svc.body.data.pagination.total + prod.body.data.pagination.total).toBeLessThanOrEqual(30);
    });

    test('rejects invalid filter values with 400', async () => {
      expect((await get('?classification=bogus')).status).toBe(400);
      expect((await get('?bidType=abc')).status).toBe(400);
    });

    test('/filters exposes only values backed by data, plus sync meta', async () => {
      const res = await get('/filters');
      const d = res.body.data;
      expect(d.bidTypes.map((b) => b.value).sort()).toEqual([1, 2, 4]);
      expect(d.bidTypes.find((b) => b.value === 2).label).toBe('Service Bid/RA');
      expect(d.categories).toHaveLength(3);
      expect(d.meta.hasImportedAny).toBe(true);
      expect(d.meta.totalLive).toBe(30);
      expect(d.meta.lastSuccessfulSyncAt).toBeTruthy();
    });

    test('admin-only sync endpoints', async () => {
      expect((await request(app).post('/api/live-tenders/manual-sync').set('Authorization', `Bearer ${userToken}`)).status).toBe(403);
      expect((await request(app).post('/api/live-tenders/categories/sync').set('Authorization', `Bearer ${userToken}`)).status).toBe(403);
      const ok = await request(app).post('/api/live-tenders/categories/sync').set('Authorization', `Bearer ${adminToken}`);
      expect(ok.status).toBe(200);
      expect(await GemCategory.countDocuments({})).toBe(3);
    });

    test('/sync-status reports data from real run logs and records', async () => {
      const res = await get('/sync-status', adminToken);
      expect(res.body.data.lastRun.type).toBe('tenders');
      expect(res.body.data.lastSuccessfulRun.status).toBe('success');
      expect(res.body.data.categorySync.type).toBe('categories');
      expect(res.body.data.statistics.active).toBe(30);
      expect(res.body.data.statistics).toHaveProperty('archived');
    });

    test('unclassified tenders are explicit, not folded into a real category', async () => {
      await LiveTender.deleteMany({});
      state.docs = [mk(1, { b_category_name: undefined }), mk(2)];
      await syncService.synchronizeTenders({ trigger: 'test' });
      const cats = (await get('/categories')).body.data;
      expect(cats.find((c) => c.key === 'unclassified')).toMatchObject({ name: 'Unclassified', count: 1 });
      const res = await get('?category=unclassified');
      expect(res.body.data.pagination.total).toBe(1);
    });
  });
});
