/**
 * Integration Tests - GeM Tender Search
 *
 * Covers the search requirement scenarios against GET /api/live-tenders:
 *   1. Empty search
 *   2. Tender number search
 *   3. Bid ID search
 *   4. Title search
 *   5. Organization / Department search
 *   6. Category search
 *   7. State search
 *   8. Combined search + filter
 *   9. No results
 *  10. Expired tender exclusion
 *  11. Pagination
 *  12. Malformed search input
 *  13. GeM link (metadata.originalUrl / metadata.gemBidId)
 *
 * All seeded records are prefixed with SEARCHTEST- so they can be cleaned up
 * and never collide with scheduler-synced real GeM records.
 */

const request = require('supertest');
const app = require('../../../server');
const { LiveTender } = require('../../../src/modules/live-tenders/model');
const mongoose = require('mongoose');

const addDays = (days) => new Date(Date.now() + days * 24 * 60 * 60 * 1000);

const GEM_SEEDS = [
  {
    tenderNumber: 'SEARCHTEST-GEM-9560543',
    title: 'Supply of Laptop Computers for Technical Education',
    description: 'Items: laptop computers. Total quantity: 150. Ministry: MSDE. Department: Technical Education.',
    category: 'it_software',
    status: 'published',
    visibility: 'public',
    budget: { estimated: 12000000, currency: 'INR', budgetType: 'fixed' },
    submissionDeadline: addDays(10),
    openingDate: new Date(),
    issuingOrganization: 'Directorate of Technical Education',
    location: 'Chennai, Tamil Nadu',
    department: 'Technical Education',
    tenderType: 'government',
    tags: ['it_software', 'laptop', 'computers', 'gem'],
    sourcePortal: 'GEM',
    metadata: {
      source: 'GEM',
      originalUrl: 'https://bidplus.gem.gov.in/showbidDocument/9560543',
      gemBidId: '9560543',
      ministry: 'Ministry of Skill Development',
      state: 'Tamil Nadu',
      city: 'Chennai',
      productCategory: 'IT Hardware - Laptops',
      bidType: 1,
    },
    documents: [{
      documentName: 'GeM Bid Document',
      documentUrl: 'https://bidplus.gem.gov.in/showbidDocument/9560543',
      documentType: 'tender_document',
    }],
    contactInfo: { organisation: 'Directorate of Technical Education', department: 'Technical Education' },
  },
  {
    tenderNumber: 'SEARCHTEST-GEM-9560999',
    title: 'Procurement of Computer Accessories',
    description: 'Items: computer accessories and peripherals.',
    category: 'goods',
    status: 'open',
    visibility: 'public',
    submissionDeadline: addDays(15),
    openingDate: new Date(),
    issuingOrganization: 'Tamil Nadu State Police',
    location: 'Chennai',
    department: 'Home Department',
    tenderType: 'government',
    sourcePortal: 'GEM',
    metadata: {
      source: 'GEM',
      originalUrl: 'https://bidplus.gem.gov.in/showbidDocument/9560999',
      gemBidId: '9560999',
      ministry: 'Home Affairs',
      state: 'Tamil Nadu',
      city: 'Chennai',
      productCategory: 'Computer Accessories',
    },
  },
  {
    tenderNumber: 'SEARCHTEST-GEM-9900001',
    title: 'Manpower Services for Office Operations',
    description: 'Items: manpower services.',
    category: 'services',
    status: 'open',
    visibility: 'public',
    submissionDeadline: addDays(20),
    openingDate: new Date(),
    issuingOrganization: 'Karnataka State Bank',
    location: 'Bengaluru',
    department: 'General Administration',
    tenderType: 'government',
    sourcePortal: 'GEM',
    metadata: {
      source: 'GEM',
      originalUrl: 'https://bidplus.gem.gov.in/showbidDocument/9900001',
      gemBidId: '9900001',
      ministry: 'Finance',
      state: 'Karnataka',
      city: 'Bengaluru',
    },
  },
  {
    tenderNumber: 'SEARCHTEST-GEM-OLD-2000001',
    title: 'Old Laptop Tender (Expired)',
    description: 'Items: laptop computers - expired deadline.',
    category: 'it_software',
    status: 'published',
    visibility: 'public',
    submissionDeadline: addDays(-5),
    openingDate: addDays(-30),
    issuingOrganization: 'Directorate of Technical Education',
    location: 'India',
    department: 'Technical Education',
    tenderType: 'government',
    sourcePortal: 'GEM',
    metadata: {
      source: 'GEM',
      originalUrl: 'https://bidplus.gem.gov.in/showbidDocument/2000001',
      gemBidId: '2000001',
      state: 'Tamil Nadu',
      productCategory: 'IT Hardware - Laptops',
    },
  },
];

// A legacy non-GeM record. sourcePortal is NOT "GEM"; it is inserted directly
// via the raw collection because the Mongoose schema's enum forbids it (GeM-only).
const LEGACY_NON_GEM = {
  tenderNumber: 'SEARCHTEST-CPPP-111',
  title: 'CPPP Legacy Road Construction Tender',
  description: 'Legacy non-GeM record that must never be returned.',
  category: 'construction',
  status: 'open',
  visibility: 'public',
  submissionDeadline: addDays(10),
  openingDate: new Date(),
  issuingOrganization: 'PWD',
  location: 'India',
  department: 'PWD',
  tenderType: 'government',
  sourcePortal: 'CPPP',
  metadata: {
    source: 'CPPP',
    originalUrl: 'https://legacy-cppp.example.in/bid/111',
    gemBidId: 'CPPP111',
    state: 'Delhi',
  },
};

const MARKER = 'SEARCHTEST';

describe('GeM Tender Search - Integration Tests', () => {
  beforeAll(async () => {
    await LiveTender.collection.deleteMany({ tenderNumber: { $regex: `^${MARKER}-` } });
    await LiveTender.create(GEM_SEEDS);
    await LiveTender.collection.insertOne(LEGACY_NON_GEM);
  });

  afterAll(async () => {
    await LiveTender.collection.deleteMany({ tenderNumber: { $regex: `^${MARKER}-` } });
    await mongoose.connection.close();
  });

  const assertAllGem = (rows) => {
    rows.forEach((row) => {
      expect(row.sourcePortal).toBe('GEM');
      expect(row.metadata?.originalUrl).toMatch(/^https:\/\/bidplus\.gem\.gov\.in\//);
    });
  };

  describe('1. Empty search', () => {
    it('returns live GeM tenders with valid pagination metadata', async () => {
      const response = await request(app)
        .get('/api/live-tenders')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.pagination).toMatchObject({
        page: 1,
        limit: 10,
      });
      expect(typeof response.body.data.pagination.total).toBe('number');
      expect(typeof response.body.data.pagination.pages).toBe('number');
      expect(response.body.data.data).toBeDefined();
      assertAllGem(response.body.data.data);
      // The legacy CPPP record must never appear.
      expect(response.body.data.data.map((t) => t.tenderNumber)).not.toContain(LEGACY_NON_GEM.tenderNumber);
    });
  });

  describe('2. Tender number search', () => {
    it('finds the matching tender by tender number', async () => {
      const response = await request(app)
        .get('/api/live-tenders')
        .query({ search: 'SEARCHTEST-GEM-9560999' })
        .expect(200);

      const numbers = response.body.data.data.map((t) => t.tenderNumber);
      expect(numbers).toContain('SEARCHTEST-GEM-9560999');
      assertAllGem(response.body.data.data);
    });
  });

  describe('3. Bid ID (gemBidId) search', () => {
    it('finds a tender by its GeM bid id', async () => {
      const response = await request(app)
        .get('/api/live-tenders')
        .query({ search: '9560543' })
        .expect(200);

      const matches = response.body.data.data.filter((t) => t.metadata?.gemBidId === '9560543');
      expect(matches.length).toBeGreaterThan(0);
      const found = matches[0];
      expect(found.tenderNumber).toBe('SEARCHTEST-GEM-9560543');
    });

    it('supports the q alias for the same bid id', async () => {
      const response = await request(app)
        .get('/api/live-tenders')
        .query({ q: '9560543' })
        .expect(200);

      const matches = response.body.data.data.filter((t) => t.metadata?.gemBidId === '9560543');
      expect(matches.length).toBeGreaterThan(0);
    });
  });

  describe('4. Title search (case-insensitive)', () => {
    it('finds tenders by title keyword, ignoring case', async () => {
      const response = await request(app)
        .get('/api/live-tenders')
        .query({ search: 'LAPTOP' })
        .expect(200);

      const titles = response.body.data.data.map((t) => t.title);
      expect(titles).toContain('Supply of Laptop Computers for Technical Education');
      // Expired laptop must be excluded.
      expect(response.body.data.data.map((t) => t.metadata?.gemBidId)).not.toContain('2000001');
    });
  });

  describe('5. Organization / Department search', () => {
    it('searches issuing organization', async () => {
      const response = await request(app)
        .get('/api/live-tenders')
        .query({ search: 'Directorate of Technical Education' })
        .expect(200);

      expect(response.body.data.data.map((t) => t.issuingOrganization))
        .toContain('Directorate of Technical Education');
    });

    it('filters by department', async () => {
      const response = await request(app)
        .get('/api/live-tenders')
        .query({ department: 'Technical Education' })
        .expect(200);

      const numbers = response.body.data.data.map((t) => t.tenderNumber);
      expect(numbers).toContain('SEARCHTEST-GEM-9560543');
      assertAllGem(response.body.data.data);
    });

    it('filters by organization alias', async () => {
      const response = await request(app)
        .get('/api/live-tenders')
        .query({ organization: 'Technical Education' })
        .expect(200);

      expect(response.body.data.data.map((t) => t.tenderNumber)).toContain('SEARCHTEST-GEM-9560543');
    });
  });

  describe('6. Category search', () => {
    it('filters by category', async () => {
      const response = await request(app)
        .get('/api/live-tenders')
        .query({ category: 'it_software' })
        .expect(200);

      expect(response.body.data.data.map((t) => t.tenderNumber)).toContain('SEARCHTEST-GEM-9560543');
      response.body.data.data.forEach((t) => expect(t.category).toBe('it_software'));
    });
  });

  describe('7. State search', () => {
    it('filters by metadata.state', async () => {
      const response = await request(app)
        .get('/api/live-tenders')
        .query({ state: 'Tamil Nadu' })
        .expect(200);

      const numbers = response.body.data.data.map((t) => t.tenderNumber);
      expect(numbers).toContain('SEARCHTEST-GEM-9560543');
      expect(numbers).toContain('SEARCHTEST-GEM-9560999');
      expect(numbers).not.toContain('SEARCHTEST-GEM-9900001');
      response.body.data.data.forEach((t) => expect(t.metadata?.state).toBe('Tamil Nadu'));
    });
  });

  describe('8. Combined search + filter', () => {
    it('combines keyword search with state filter', async () => {
      const response = await request(app)
        .get('/api/live-tenders')
        .query({ search: 'computer', state: 'Tamil Nadu' })
        .expect(200);

      const numbers = response.body.data.data.map((t) => t.tenderNumber);
      expect(numbers).toContain('SEARCHTEST-GEM-9560543');
      expect(numbers).toContain('SEARCHTEST-GEM-9560999');
      expect(numbers).not.toContain('SEARCHTEST-GEM-9900001');
      assertAllGem(response.body.data.data);
    });
  });

  describe('9. No results', () => {
    it('returns an empty list for a nonsense search', async () => {
      const response = await request(app)
        .get('/api/live-tenders')
        .query({ search: 'zzzzznonexistentqueryzzzzz' })
        .expect(200);

      expect(response.body.data.data).toEqual([]);
      expect(response.body.data.pagination.total).toBe(0);
    });
  });

  describe('10. Expired tender exclusion', () => {
    it('never returns tenders whose submission deadline has passed', async () => {
      const response = await request(app)
        .get('/api/live-tenders')
        .query({ search: 'Old Laptop' })
        .expect(200);

      expect(response.body.data.data.map((t) => t.metadata?.gemBidId)).not.toContain('2000001');
      expect(response.body.data.data.map((t) => t.tenderNumber)).not.toContain('SEARCHTEST-GEM-OLD-2000001');
    });
  });

  describe('GeM-only enforcement', () => {
    it('never returns a non-GEM sourcePortal record', async () => {
      const response = await request(app)
        .get('/api/live-tenders')
        .query({ search: 'CPPP Legacy' })
        .expect(200);

      expect(response.body.data.pagination.total).toBe(0);
      expect(response.body.data.data.map((t) => t.tenderNumber)).not.toContain(LEGACY_NON_GEM.tenderNumber);
    });

    it('rejects a non-GEM sourcePortal at the schema level', async () => {
      await expect(LiveTender.create({ ...LEGACY_NON_GEM, tenderNumber: 'SEARCHTEST-CPPP-SCHEMA-1' }))
        .rejects
        .toMatchObject({ name: 'ValidationError' });
    });
  });

  describe('11. Pagination', () => {
    it('returns correct pagination metadata for a search', async () => {
      // Three future-deadline records match 'SEARCHTEST-GEM'; the expired one
      // and the CPPP record must not be counted.
      const response = await request(app)
        .get('/api/live-tenders')
        .query({ search: 'SEARCHTEST-GEM', limit: 2, page: 1 })
        .expect(200);

      const { data, pagination } = response.body.data;
      expect(pagination.total).toBe(3);
      expect(pagination.limit).toBe(2);
      expect(pagination.page).toBe(1);
      expect(pagination.pages).toBe(2);
      expect(data).toHaveLength(2);

      const page2 = await request(app)
        .get('/api/live-tenders')
        .query({ search: 'SEARCHTEST-GEM', limit: 2, page: 2 })
        .expect(200);

      expect(page2.body.data.pagination.page).toBe(2);
      expect(page2.body.data.data).toHaveLength(1);
    });
  });

  describe('12. Malformed search input', () => {
    it('escapes regex metacharacters without crashing', async () => {
      const response = await request(app)
        .get('/api/live-tenders')
        .query({ search: '(?=.*[a-z])(?=.*[A-Z]).*' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.pagination.total).toBe(0);
    });

    it('rejects a non-numeric page', async () => {
      const response = await request(app)
        .get('/api/live-tenders')
        .query({ page: 'abc' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    it('rejects page below 1', async () => {
      await request(app)
        .get('/api/live-tenders')
        .query({ page: '0' })
        .expect(400);
    });

    it('rejects an unbounded limit', async () => {
      const response = await request(app)
        .get('/api/live-tenders')
        .query({ limit: '999999999' })
        .expect(400);

      expect(response.body.errors).toBeDefined();
    });

    it('rejects a negative limit', async () => {
      await request(app)
        .get('/api/live-tenders')
        .query({ limit: '-5' })
        .expect(400);
    });

    it('rejects an oversized search string', async () => {
      await request(app)
        .get('/api/live-tenders')
        .query({ search: 'x'.repeat(300) })
        .expect(400);
    });

    it('rejects array-valued filters', async () => {
      await request(app)
        .get('/api/live-tenders')
        .query({ state: ['a', 'b'] })
        .expect(400);
    });
  });

  describe('13. GeM bid link preservation', () => {
    it('keeps metadata.gemBidId and metadata.originalUrl intact', async () => {
      const response = await request(app)
        .get('/api/live-tenders')
        .query({ search: '9560543' })
        .expect(200);

      const found = response.body.data.data.find((t) => t.metadata?.gemBidId === '9560543');
      expect(found).toBeDefined();
      expect(found.metadata.originalUrl).toBe('https://bidplus.gem.gov.in/showbidDocument/9560543');
      expect(found.metadata.gemBidId).toBe('9560543');
      expect(found.sourcePortal).toBe('GEM');
    });
  });
});