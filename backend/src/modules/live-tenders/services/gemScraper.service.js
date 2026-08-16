const axios = require('axios');
const logger = require('../../../config/logger');

/**
 * GeMScraperService
 *
 * Fetches live tenders from the Government e-Marketplace (GeM) public bid
 * listing portal (https://bidplus.gem.gov.in).
 *
 * Data source (verified working):
 *  - GET  https://bidplus.gem.gov.in/all-bids  -> HTML containing the CSRF
 *    token (`chash`) plus a session cookie.
 *  - POST https://bidplus.gem.gov.in/all-bids-data -> JSON (Solr shaped):
 *      { code, message, response: { response: { numFound, start, docs[] } } }
 *    The request is form-encoded with `payload` (JSON) and `csrf_bd_gem_nk`.
 *
 * Only public, unauthenticated data is used.
 */

const GEM_HOST = 'bidplus.gem.gov.in';
const GEM_OFFICIAL_HOSTS = new Set(['bidplus.gem.gov.in', 'bid.gem.gov.in', 'www.bidplus.gem.gov.in']);

/**
 * Returns true when the given URL belongs to an official GeM domain.
 * Used to validate every external GeM URL before it is stored or displayed.
 * @param {string} url
 * @returns {boolean}
 */
function isOfficialGemUrl(url) {
  if (!url || typeof url !== 'string') {
    return false;
  }
  try {
    const parsed = new URL(url);
    return GEM_OFFICIAL_HOSTS.has(parsed.hostname.toLowerCase()) && ['https:', 'http:'].includes(parsed.protocol);
  } catch (error) {
    return false;
  }
}

/**
 * Resolves and validates a GeM tender URL.
 *
 * - Accepts absolute or relative GeM URLs.
 * - Resolves relative URLs against the official GeM host.
 * - Rejects URLs that do not belong to an official GeM domain.
 * - Returns null for invalid/unsafe URLs instead of fabricating a link.
 *
 * @param {string} url - Absolute or relative GeM URL (e.g. "/showbidDocument/123456").
 * @returns {string|null} The absolute official GeM URL, or null when invalid.
 */
function normalizeGemTenderUrl(url) {
  if (!url || typeof url !== 'string') {
    return null;
  }

  const trimmed = url.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const resolved = new URL(trimmed, `https://${GEM_HOST}`);
    if (!GEM_OFFICIAL_HOSTS.has(resolved.hostname.toLowerCase())) {
      return null;
    }
    if (!['https:', 'http:'].includes(resolved.protocol)) {
      return null;
    }
    return resolved.href;
  } catch (error) {
    logger.warn(`normalizeGemTenderUrl: invalid URL "${url}"`, { error: error.message });
    return null;
  }
}

/**
 * Returns the official GeM bid document path for a bid, mirroring the exact
 * path the GeM portal uses in its own listing template:
 *   - b_bid_type 1  -> showbidDocument/<id>
 *   - b_bid_type 2  -> showradocumentPdf/<id>  (or list-ra-schedules/<id>)
 *   - b_bid_type 5  -> showdirectradocumentPdf/<id>
 *
 * @param {object} doc - Raw GeM Solr bid document.
 * @returns {string} Relative GeM URL path (e.g. "/showbidDocument/123456").
 */
function gemBidUrlPath(doc) {
  const bidId = String(Array.isArray(doc.b_id) ? doc.b_id[0] : (doc.b_id || ''));
  if (!bidId) {
    return '';
  }

  let docLabel = 'showbidDocument';
  const bidType = Number(doc.b_bid_type);
  if (bidType === 5) {
    docLabel = 'showdirectradocumentPdf';
  } else if (bidType === 2) {
    docLabel = 'showradocumentPdf';
    if (Number(doc.b_eval_type) > 0) {
      docLabel = 'list-ra-schedules';
    }
  }
  return `/${docLabel}/${bidId}`;
}

class GeMScraperService {
  constructor() {
    this.baseUrl = 'https://bidplus.gem.gov.in';
    this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    this.timeout = 30000;
    this.maxRetries = 3;
    this.retryDelay = 2000;
    // GeM returns a fixed number of results per request regardless of any
    // requested page size. There is deliberately NO artificial page ceiling:
    // pagination continues until GeM's own reported result count is exhausted.
    this.pageSize = 10;
  }

  async fetchWithRetry(fn, retryCount = 0) {
    try {
      return await fn();
    } catch (error) {
      if (retryCount < this.maxRetries) {
        logger.warn(`Retry ${retryCount + 1}/${this.maxRetries} for GeM request`, { error: error.message });
        await new Promise((resolve) => setTimeout(resolve, this.retryDelay * (retryCount + 1)));
        return this.fetchWithRetry(fn, retryCount + 1);
      }
      throw error;
    }
  }

  /**
   * Opens the /all-bids page to obtain the CSRF token and the session cookies
   * required by the data endpoint.
   */
  async getSession() {
    const response = await this.fetchWithRetry(() =>
      axios.get(`${this.baseUrl}/all-bids`, {
        timeout: this.timeout,
        maxRedirects: 5,
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      })
    );

    const html = response.data;
    const tokenMatch = html.match(/id="chash"\s+value="([^"]+)"/);
    if (!tokenMatch) {
      throw new Error('Unable to extract CSRF token from GeM portal');
    }

    const cookies = (response.headers['set-cookie'] || [])
      .map((cookie) => cookie.split(';')[0])
      .join('; ');

    return {
      csrfToken: tokenMatch[1],
      cookies,
    };
  }

  /**
   * Fetches one page of ongoing bids from the GeM JSON endpoint.
   */
  async fetchPage(session, page) {
    const payload = {
      param: { searchBid: '', searchType: 'fullText' },
      filter: {
        bidStatusType: 'ongoing_bids',
        byType: 'all',
        highBidValue: '',
        byEndDate: { from: '', to: '' },
        sort: 'Bid-End-Date-Latest',
      },
      page,
    };

    const body = new URLSearchParams({
      payload: JSON.stringify(payload),
      csrf_bd_gem_nk: session.csrfToken,
    }).toString();

    const response = await this.fetchWithRetry(() =>
      axios.post(`${this.baseUrl}/all-bids-data`, body, {
        timeout: this.timeout,
        maxRedirects: 5,
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'application/json, text/javascript, */*; q=0.01',
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'X-Requested-With': 'XMLHttpRequest',
          'Origin': this.baseUrl,
          'Referer': `${this.baseUrl}/all-bids`,
          'Cookie': session.cookies,
        },
      })
    );

    const data = response.data;
    const solr = data && data.response && data.response.response;
    if (!data || data.code !== 200 || !solr) {
      throw new Error('Unexpected response from GeM bid listing endpoint');
    }

    return solr;
  }

  /**
   * Fetches the complete set of ongoing bids from GeM.
   *
   * Pagination is driven entirely by the result metadata GeM returns:
   *   1. Read GeM's reported total (`numFound`).
   *   2. Calculate the required number of pages.
   *   3. Process pages sequentially until the ACTUAL FINAL PAGE.
   *   4. Stop only when the complete result set has been processed.
   *
   * There is no arbitrary `GEM_MAX_PAGES` ceiling. If any page request fails
   * after retries, the crawl is treated as a critical failure and the error is
   * propagated so callers do NOT reconcile/expire data on a partial crawl.
   *
   * @returns {Promise<{
   *   tenders: Array<object>,
   *   numFound: number,
   *   pagesProcessed: number,
   *   pagesExpected: number,
   *   reachedFinalPage: boolean,
   * }>}
   */
  async fetchActiveTenders() {
    const session = await this.getSession();
    const tenders = [];
    let numFound = 0;
    let page = 1;
    let reachedFinalPage = false;
    let pagesProcessed = 0;

    while (true) {
      const solr = await this.fetchPage(session, page);
      pagesProcessed++;
      numFound = solr.numFound || 0;

      const totalPages = Math.ceil(numFound / this.pageSize);

      if (totalPages <= 0) {
        // No results reported by GeM - nothing to process.
        break;
      }

      if (!solr.docs || solr.docs.length === 0) {
        // GeM returned a page with no documents before the reported final
        // page. This is an incomplete/partial response - do NOT treat the
        // crawl as a full reconciliation.
        logger.warn(
          `GeM returned an empty docs array on page ${page} of ${totalPages} (numFound=${numFound}) - crawl is partial`,
          { pagesProcessed, numFound, totalPages }
        );
        reachedFinalPage = false;
        break;
      }

      for (const doc of solr.docs) {
        const tender = this.mapTender(doc);
        if (tender) {
          tenders.push(tender);
        }
      }

      if (page >= totalPages) {
        reachedFinalPage = true;
        break;
      }

      if (page % 200 === 0) {
        logger.info(`GeM crawl progress: ${page}/${totalPages} pages processed (${tenders.length} tenders mapped)`);
      }

      page++;
    }

    logger.info(
      `Fetched ${tenders.length} tenders from GeM (${numFound} ongoing on portal; pages ${pagesProcessed}/${Math.ceil(numFound / this.pageSize) || 0}; final page reached: ${reachedFinalPage})`
    );

    return {
      tenders,
      numFound,
      pagesProcessed,
      pagesExpected: Math.ceil(numFound / this.pageSize),
      reachedFinalPage,
    };
  }

  /**
   * Maps a raw GeM Solr document to our LiveTender schema.
   */
  mapTender(doc) {
    const first = (key) => {
      const value = doc[key];
      if (Array.isArray(value)) return value[0];
      return value;
    };

    const bidId = String(first('b_id') || '');
    const bidNumber = first('b_bid_number');
    const categoryName = first('b_category_name');
    const bidDetailCategories = first('bd_category_name');
    const boqTitle = first('bbt_title');
    const ministry = first('ba_official_details_minName');
    const department = first('ba_official_details_deptName');
    const quantity = first('b_total_quantity');
    const startDate = first('final_start_date_sort');
    const endDate = first('final_end_date_sort');
    const inactiveFlag = Number(first('b_is_inactive')) || 0;

    if (!bidId || !bidNumber || !endDate) {
      return null;
    }

    // GeM marks bids as inactive when they are no longer acceptive. Never
    // ingest those into the live feed.
    if (inactiveFlag === 1) {
      logger.debug(`GeM bid ${bidNumber} skipped (b_is_inactive=1)`, { gemBidId: bidId });
      return null;
    }

    const title = boqTitle || categoryName || bidNumber;
    const category = this.detectCategory(`${categoryName || ''} ${bidDetailCategories || ''} ${title || ''}`);

    // GeM may expose a delivery/city/state location field on some bids. Only
    // use it when actually present; never invent a location. Falls back to
    // generic "India" so records always have a location value.
    const gemState = first('b_delivery_state') || first('ba_state_name');
    const gemCity = first('b_delivery_city') || first('ba_city_name');
    const metaState = typeof gemState === 'string' && gemState.trim() ? gemState.trim() : undefined;
    const metaCity = typeof gemCity === 'string' && gemCity.trim() ? gemCity.trim() : undefined;

    // Bid value: range/RA bids may expose an estimated/cleared value. Only set
    // when a positive numeric field is present; otherwise the value stays
    // unknown and the value filter simply does not match.
    const rawValue = first('b_bid_value') ?? first('b_reserve_price') ?? first('b_estimated_value');
    let estimatedValue;
    const parsedValue = typeof rawValue === 'string' ? parseFloat(rawValue.replace(/[^0-9.]/g, '')) : parseFloat(rawValue);
    if (Number.isFinite(parsedValue) && parsedValue > 0) {
      estimatedValue = parsedValue;
    }

    const bidUrlPath = gemBidUrlPath(doc);
    const officialUrl = normalizeGemTenderUrl(bidUrlPath);

    if (!officialUrl) {
      logger.warn(`GeM tender skipped: unable to resolve official URL for bid ${bidNumber}`, { gemBidId: bidId });
      return null;
    }

    const description = [
      categoryName ? `Items: ${categoryName}` : null,
      quantity ? `Total quantity: ${quantity}` : null,
      ministry ? `Ministry: ${ministry}` : null,
      department ? `Department: ${department}` : null,
    ].filter(Boolean).join('. ') || `GeM tender ${bidNumber}`;

    // Extract the bid download / catalogue URL from GeM data.
    //
    // GeM does not expose a per-bid document token in the listing payload we
    // consume, but the official bid document page path (showbidDocument / RA
    // schedule variants) is what the GeM listing itself links to and it loads
    // the real bid catalogue/document. We derive bidDownloadUrl from that
    // verifiedGeM path only. If GeM later exposes an explicit showCatalogue
    // token field, it can be preferred here -- but we never fabricate a token,
    // so when no reliable catalogue URL exists bidDownloadUrl stays undefined
    // and the UI falls back to "Bid document unavailable".
    let bidDownloadUrl = undefined;
    const explicitCatalogue = first('b_catalogue_url');
    if (explicitCatalogue && typeof explicitCatalogue === 'string' && explicitCatalogue.trim()) {
      const normalized = normalizeGemTenderUrl(explicitCatalogue.trim());
      if (normalized) {
        bidDownloadUrl = normalized;
      }
    }
    if (!bidDownloadUrl) {
      bidDownloadUrl = officialUrl;
    }

    return {
      tenderNumber: bidNumber,
      title,
      description,
      category,
      status: 'open',
      issuingOrganization: ministry || department || 'Government of India',
      department: department || '',
      location: metaState || 'India',
      tenderType: 'government',
      budget: estimatedValue ? { estimated: estimatedValue, currency: 'INR', budgetType: 'fixed' } : {},
      submissionDeadline: new Date(endDate),
      openingDate: startDate ? new Date(startDate) : undefined,
      originalUrl: officialUrl,
      sourcePortal: 'GEM',
      metadata: {
        source: 'GEM',
        gemBidId: bidId,
        ministry: ministry || '',
        state: metaState,
        city: metaCity,
        corrigendumCount: 0,
        boqUrl: boqTitle ? officialUrl : undefined,
        tenderPdfUrl: officialUrl,
        bidType: Number(first('b_bid_type')) || 1,
        isHighValue: !!doc.is_high_value,
        isRateContract: Number(first('is_rc_bid')) === 1,
        isGlobalTendering: Number(first('ba_is_global_tendering')) === 1,
        bidDownloadUrl: bidDownloadUrl,
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
        department: department || '',
        officer: '',
        email: '',
        phone: '',
        address: `${ministry || ''} ${department || ''}`.trim(),
      },
      tags: this.generateTags(category, ministry, department),
    };
  }

  detectCategory(text) {
    const value = (text || '').toLowerCase();
    if (/(construction|civil|building|infrastructure|road |bridge|pipeline|drainage)/.test(value)) return 'construction';
    if (/(laptop|computer|software|hardware|server|it hardware|networking|cyber|monitor|printer)/.test(value)) return 'it_software';
    if (/(medical|health|hospital|pharma|medicine|surgical|diagnostic|vaccine|clinical)/.test(value)) return 'medical';
    if (/(transport|vehicle|bus |truck|car |automobile|aviation|railway|tyre|marine)/.test(value)) return 'transportation';
    if (/(agriculture|farm|tractor|seed|fertilizer|food grain|crop)/.test(value)) return 'agriculture';
    if (/(education|school|university|college|training|book |stationery)/.test(value)) return 'education';
    if (/(consult|advisory|professional service)/.test(value)) return 'consultancy';
    if (/(works|maintenance|repair|installation|erection|service|amc)/.test(value)) return 'services';
    return 'goods';
  }

  generateTags(category, ministry, department) {
    const tags = new Set();
    if (category) tags.add(category.toLowerCase());
    if (ministry) tags.add(ministry.toLowerCase());
    if (department) tags.add(department.toLowerCase());
    tags.add('gem');
    return Array.from(tags);
  }
}

module.exports = new GeMScraperService();
module.exports.normalizeGemTenderUrl = normalizeGemTenderUrl;
