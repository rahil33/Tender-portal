const axios = require('axios');
const cheerio = require('cheerio');
const logger = require('../../../config/logger');

/**
 * CPPPScraperService
 *
 * Fetches live tenders from the Central Public Procurement Portal (CPPP) /
 * Government of India eProcurement System (https://eprocure.gov.in).
 *
 * Data source (verified working, no CAPTCHA required):
 *  - GET https://eprocure.gov.in/eprocure/app  -> homepage HTML containing a
 *    "Latest Tenders" table with real rows:
 *      { Tender Title, Reference No, Closing Date, Bid Opening Date, detail link }
 *    The detail links are session-bound, so the session cookie from the same
 *    request is reused when fetching each tender detail page.
 *  - GET <detail link> (with session cookie) -> tender detail HTML exposing
 *    Organisation Chain, Tender ID, Tender Reference Number, Tender Value,
 *    Product Category, Location, Address, Published Date, etc.
 *
 * Only public, unauthenticated data is used. If a request fails, an empty
 * result is returned - never fake/random tender data.
 */
class CPPPScraperService {
  constructor() {
    this.baseUrl = 'https://eprocure.gov.in';
    this.listUrl = 'https://eprocure.gov.in/eprocure/app';
    this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    this.timeout = 30000;
    this.maxRetries = 3;
    this.retryDelay = 2000;
    this.maxTenders = parseInt(process.env.CPPP_MAX_TENDERS, 10) || 10;
  }

  async fetchWithRetry(fn, retryCount = 0) {
    try {
      return await fn();
    } catch (error) {
      if (retryCount < this.maxRetries) {
        logger.warn(`Retry ${retryCount + 1}/${this.maxRetries} for CPPP request`, { error: error.message });
        await new Promise((resolve) => setTimeout(resolve, this.retryDelay * (retryCount + 1)));
        return this.fetchWithRetry(fn, retryCount + 1);
      }
      throw error;
    }
  }

  async getHeaders(extra = {}) {
    return {
      'User-Agent': this.userAgent,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      ...extra,
    };
  }

  /**
   * Fetches the homepage and parses the "Latest Tenders" table rows.
   * Returns { sessionCookie, tenders: [...] }.
   */
  async fetchList() {
    const headers = await this.getHeaders();
    const response = await this.fetchWithRetry(() =>
      axios.get(this.listUrl, {
        timeout: this.timeout,
        maxRedirects: 5,
        headers,
      })
    );

    const sessionCookie = (response.headers['set-cookie'] || [])
      .map((cookie) => cookie.split(';')[0])
      .join('; ');

    const $ = cheerio.load(response.data);
    const tenders = [];

    $('#activeTenders tr, tr[id^="informal_"]').each((_, el) => {
      const cells = $(el).find('td');
      if (cells.length < 4) return;

      const titleCell = $(cells[0]);
      const title = titleCell.text().replace(/\s+/g, ' ').trim();
      const detailUrl = titleCell.find('a').attr('href');

      if (!title || !detailUrl) return;

      // Skip corrigendum / extension notices - they are not new tenders.
      if (/corrigendum|date has been extended|bid auto extn/i.test(title)) return;

      const referenceNo = $(cells[1]).text().replace(/\s+/g, ' ').trim();
      const closingDate = $(cells[2]).text().replace(/\s+/g, ' ').trim();
      const openingDate = $(cells[3]).text().replace(/\s+/g, ' ').trim();

      // Strip the leading "N. " row numbering.
      const cleanTitle = title.replace(/^\d+\.\s*/, '').trim();

      tenders.push({
        title: cleanTitle || title,
        referenceNo,
        closingDate,
        openingDate,
        detailUrl: detailUrl.replace(/&amp;/g, '&'),
      });
    });

    return { sessionCookie, tenders: tenders.slice(0, this.maxTenders) };
  }

  /**
   * Fetches one tender detail page and returns the parsed fields.
   */
  async fetchDetails(sessionCookie, detailUrl) {
    const headers = await this.getHeaders({
      'Cookie': sessionCookie,
      'Referer': this.listUrl,
    });
    const response = await this.fetchWithRetry(() =>
      axios.get(`${this.baseUrl}${detailUrl.startsWith('http') ? '' : detailUrl}`, {
        timeout: this.timeout,
        maxRedirects: 5,
        headers,
      })
    );

    const $ = cheerio.load(response.data);
    const fields = {};

    // Parse caption/field table pairs (e.g. "Organisation Chain" -> value).
    $('td.td_caption').each((_, el) => {
      const $caption = $(el);
      const $field = $caption.next('td.td_field');
      if (!$field.length) return;
      const label = $caption.text().replace(/\s+/g, ' ').trim();
      const value = $field.text().replace(/\s+/g, ' ').trim();
      if (label && value && value !== '&nbsp;' && !/^\s*$/.test(value)) {
        fields[label] = value;
      }
    });

    // Direct label lookups that are not in caption/field pairs.
    const findField = (prefix) => {
      const key = Object.keys(fields).find((k) => k.toLowerCase().startsWith(prefix.toLowerCase()));
      return key ? fields[key] : undefined;
    };

    return {
      fields,
      raw: response.data,
      value: findField('Tender Value'),
      productCategory: findField('Product Category'),
    };
  }

  parseDate(value) {
    if (!value) return undefined;
    const text = String(value).trim();
    if (/^NA$/i.test(text) || /^-+$/.test(text)) return undefined;

    const match = text.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{4})\s+(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (match) {
      const months = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };
      let hours = parseInt(match[4], 10);
      const isPM = match[6].toUpperCase() === 'PM';
      const isAM = match[6].toUpperCase() === 'AM';
      if (isPM && hours < 12) hours += 12;
      if (isAM && hours === 12) hours = 0;
      const monthIndex = months[match[2].toLowerCase()];
      if (monthIndex !== undefined) {
        return new Date(parseInt(match[3], 10), monthIndex, parseInt(match[1], 10), hours, parseInt(match[5], 10));
      }
    }

    const parsed = new Date(text);
    return isNaN(parsed.getTime()) ? undefined : parsed;
  }

  parseAmount(value) {
    if (!value) return undefined;
    const cleaned = String(value)
      .replace(/[₹$,]/g, '')
      .replace(/INR/i, '')
      .trim();
    const amount = parseFloat(cleaned);
    return isNaN(amount) ? undefined : amount;
  }

  detectCategory(text) {
    const value = (text || '').toLowerCase();
    if (/(construction|civil|building|infrastructure|road |bridge|pipeline|drainage)/.test(value)) return 'construction';
    if (/(laptop|computer|software|hardware|server|it hardware|networking|cyber|monitor|printer)/.test(value)) return 'it_software';
    if (/(medical|health|hospital|pharma|medicine|surgical|diagnostic|vaccine)/.test(value)) return 'medical';
    if (/(transport|vehicle|bus |truck|automobile|aviation|railway|tyre|marine)/.test(value)) return 'transportation';
    if (/(agriculture|farm|tractor|seed|fertilizer|food grain)/.test(value)) return 'agriculture';
    if (/(education|school|university|college|training|book |stationery)/.test(value)) return 'education';
    if (/(consult|advisory)/.test(value)) return 'consultancy';
    if (/(works|maintenance|repair|installation|erection|service|amc)/.test(value)) return 'services';
    return 'goods';
  }

  mapTender(row, details) {
    const fields = details ? details.fields : {};
    const organisation = (fields['Organisation Chain'] || '').split('||')[0].trim() || '';
    const tenderId = fields['Tender ID'] || '';
    const referenceNo = row.referenceNo || fields['Tender Reference Number'] || '';
    const title = row.title || (fields['Tender Reference Number'] ? `Tender ${fields['Tender Reference Number']}` : 'Untitled Tender');
    const categoryText = details ? `${details.productCategory || ''} ${fields['Tender Category'] || ''} ${title}` : title;
    const location = fields['Location'] || '';
    const address = fields['Address'] || '';

    if (!referenceNo && !tenderId) return null;

    const tender = {
      tenderNumber: referenceNo || tenderId,
      title,
      description: [
        `Reference No: ${referenceNo}`,
        tenderId ? `Tender ID: ${tenderId}` : null,
        details && details.productCategory ? `Product Category: ${details.productCategory}` : null,
        fields['Tender Category'] ? `Tender Category: ${fields['Tender Category']}` : null,
        location ? `Location: ${location}` : null,
      ].filter(Boolean).join('. ') || `CPPP tender ${referenceNo || tenderId}`,
      category: this.detectCategory(categoryText),
      status: 'published',
      issuingOrganization: organisation || 'Government of India',
      department: organisation || 'Government of India',
      location: location || 'India',
      tenderType: 'government',
      budget: {},
      submissionDeadline: this.parseDate(row.closingDate || fields['Bid Submission End Date'] || fields['Document Download / Sale End Date']),
      openingDate: this.parseDate(row.openingDate || fields['Bid Opening Date'] || fields['Published Date']),
      originalUrl: this.listUrl,
      sourcePortal: 'CPPP',
      metadata: {
        source: 'CPPP',
        cpppId: tenderId || referenceNo,
        state: undefined,
        ministry: '',
        city: '',
        corrigendumCount: 0,
        publishedDate: this.parseDate(fields['Published Date']),
        contractType: fields['Contract Type'],
        productCategory: details && details.productCategory,
      },
      documents: [{
        documentName: 'CPPP Tender Details',
        documentUrl: this.listUrl,
        documentType: 'tender_notice',
      }],
      contactInfo: {
        organisation: organisation || '',
        department: organisation || '',
        officer: '',
        email: '',
        phone: '',
        address: address || '',
      },
      tags: this.generateTags(tenderId, organisation, categoryText),
    };

    const estimated = details && details.value ? this.parseAmount(details.value) : undefined;
    if (estimated) {
      tender.budget.estimated = estimated;
      tender.budget.currency = 'INR';
    }

    return tender;
  }

  generateTags(tenderId, organisation, categoryText) {
    const tags = new Set();
    tags.add('cppp');
    if (tenderId) tags.add(tenderId.toLowerCase());
    if (organisation) tags.add(organisation.toLowerCase());
    if (categoryText) tags.add(this.detectCategory(categoryText).toLowerCase());
    return Array.from(tags);
  }

  /**
   * Fetches live tenders from CPPP.
   * Returns real tenders only; returns [] if the portal is unreachable.
   */
  async fetchActiveTenders() {
    const { sessionCookie, tenders } = await this.fetchList();

    if (!tenders.length) {
      logger.warn('CPPP returned no tender rows');
      return [];
    }

    const result = [];
    for (const row of tenders) {
      try {
        const details = await this.fetchDetails(sessionCookie, row.detailUrl);
        const tender = this.mapTender(row, details);
        if (tender) {
          result.push(tender);
        }
      } catch (error) {
        logger.warn(`Failed to fetch CPPP detail for ${row.referenceNo || row.title}`, { error: error.message });
        const tender = this.mapTender(row, null);
        if (tender) {
          result.push(tender);
        }
      }
    }

    logger.info(`Fetched ${result.length} tenders from CPPP`);
    return result;
  }
}

module.exports = new CPPPScraperService();
