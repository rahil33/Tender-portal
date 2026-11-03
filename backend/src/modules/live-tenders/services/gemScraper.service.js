const axios = require('axios');
const logger = require('../../../config/logger');
const { normalizeGemDocument, REJECT } = require('./gemNormalizer');

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

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const intEnv = (name, fallback) => {
  const n = parseInt(process.env[name], 10);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
};

class GeMScraperService {
  constructor() {
    this.http = axios; // overridable in tests
    this.sleep = sleep; // overridable in tests
    this.baseUrl = 'https://bidplus.gem.gov.in';
    this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    this.timeout = 30000;
    this.maxRetries = intEnv('GEM_MAX_RETRIES', 3);
    this.retryBaseDelayMs = intEnv('GEM_RETRY_BASE_DELAY_MS', 2000);
    this.retryMaxDelayMs = 60000;
    // Politeness: strictly sequential requests with a small pause between
    // pages (never concurrent). Override with GEM_REQUEST_DELAY_MS.
    this.requestDelayMs = intEnv('GEM_REQUEST_DELAY_MS', 150);
    this.maxConsecutivePageFailures = intEnv('GEM_MAX_CONSECUTIVE_PAGE_FAILURES', 5);
    // GeM returns a fixed number of results per request regardless of any
    // requested page size. There is deliberately NO artificial page ceiling:
    // pagination continues until GeM's own reported result count is exhausted.
    this.pageSize = 10;
  }

  isRetryable(error) {
    const status = error && error.response && error.response.status;
    if (!status) return true; // network error / timeout / DNS
    return status === 408 || status === 429 || status >= 500;
  }

  backoffDelay(attempt, error) {
    const exp = Math.min(this.retryMaxDelayMs, this.retryBaseDelayMs * 2 ** attempt);
    const jittered = exp * (0.8 + Math.random() * 0.4);
    const retryAfter = Number(error && error.response && error.response.headers && error.response.headers['retry-after']);
    const requested = Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 0;
    return Math.min(this.retryMaxDelayMs, Math.max(jittered, requested));
  }

  /** Retries transient failures with exponential backoff + jitter (honours Retry-After). */
  async fetchWithRetry(fn, label = 'GeM request') {
    for (let attempt = 0; ; attempt += 1) {
      try {
        return await fn();
      } catch (error) {
        if (attempt >= this.maxRetries || !this.isRetryable(error)) throw error;
        const delay = this.backoffDelay(attempt, error);
        logger.warn(`Retry ${attempt + 1}/${this.maxRetries} for ${label} in ${Math.round(delay)}ms`, {
          error: error.message, status: error.response && error.response.status,
        });
        await this.sleep(delay);
      }
    }
  }

  /**
   * Opens the /all-bids page to obtain the CSRF token and the session cookies
   * required by the data endpoint.
   */
  async getSession() {
    const response = await this.fetchWithRetry(() =>
      this.http.get(`${this.baseUrl}/all-bids`, {
        timeout: this.timeout,
        maxRedirects: 5,
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      }),
      'GeM session'
    );

    const html = response.data;
    const tokenMatch = typeof html === 'string' && html.match(/id="chash"\s+value="([^"]+)"/);
    if (!tokenMatch) {
      throw new Error('Unable to extract CSRF token from GeM portal');
    }

    const cookies = (response.headers['set-cookie'] || [])
      .map((cookie) => cookie.split(';')[0])
      .join('; ');

    return { csrfToken: tokenMatch[1], cookies };
  }

  /** Fetches one page of ongoing bids from the GeM JSON endpoint. */
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
      this.http.post(`${this.baseUrl}/all-bids-data`, body, {
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
      }),
      `GeM page ${page}`
    );

    const data = response.data;
    const solr = data && data.response && data.response.response;
    if (!data || data.code !== 200 || !solr) {
      const err = new Error('Unexpected response from GeM bid listing endpoint');
      err.unexpectedResponse = true; // usually an expired CSRF token / session
      throw err;
    }
    return solr;
  }

  /**
   * Crawls every page of ongoing GeM bids, sequentially, and hands each page's
   * validated tenders to `onPage` so the caller can persist them incrementally
   * (nothing waits for the entire crawl to finish).
   *
   * Recovery behaviour:
   *  - a page that still fails after retries is recorded and SKIPPED; the crawl
   *    continues (it is then reported as incomplete, so callers never
   *    reconcile/archive on it);
   *  - an unexpected response triggers one session (CSRF) refresh;
   *  - after N consecutive page failures the crawl aborts;
   *  - if `onPage` throws an error flagged `abortCrawl`, the crawl stops.
   *
   * No CAPTCHA/authentication/access control is bypassed: a refusal simply
   * ends up as a failed page.
   *
   * @param {object} [opts]
   * @param {(info: {page:number, tenders:object[], extracted:number, rejected:number}) => Promise<void>} [opts.onPage]
   */
  async crawl({ onPage } = {}) {
    const report = {
      numFound: 0,
      pagesDiscovered: 0,
      pagesProcessed: 0,
      pagesFailed: 0,
      failedPages: [],
      extracted: 0,
      validated: 0,
      rejected: 0,
      rejectionReasons: {},
      reachedFinalPage: false,
      aborted: false,
      abortReason: null,
    };

    let session = await this.getSession();
    let page = 1;
    let totalPages = 0;
    let consecutiveFailures = 0;
    let refreshedForThisFailureStreak = false;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      let solr;
      try {
        solr = await this.fetchPage(session, page);
        if (!solr.docs || solr.docs.length === 0) {
          const empty = new Error('GeM returned an empty page before the reported final page');
          empty.emptyPage = (solr.numFound || 0) > 0 && page <= Math.ceil((solr.numFound || 0) / this.pageSize);
          if (empty.emptyPage) throw empty;
        }
      } catch (error) {
        consecutiveFailures += 1;
        report.pagesFailed += 1;
        report.failedPages.push({ page, error: error.message });
        logger.error(`GeM page ${page} failed: ${error.message}`, { page, status: error.response && error.response.status });

        if (consecutiveFailures >= this.maxConsecutivePageFailures) {
          report.aborted = true;
          report.abortReason = `${consecutiveFailures} consecutive page failures (last: ${error.message})`;
          break;
        }
        if (error.unexpectedResponse && !refreshedForThisFailureStreak) {
          refreshedForThisFailureStreak = true;
          try { session = await this.getSession(); logger.info('GeM session refreshed'); } catch (refreshError) {
            logger.error(`GeM session refresh failed: ${refreshError.message}`);
          }
        }
        if (totalPages && page >= totalPages) break; // failed on the last page: nothing further to try
        page += 1;
        await this.sleep(this.requestDelayMs);
        continue;
      }

      consecutiveFailures = 0;
      refreshedForThisFailureStreak = false;
      report.pagesProcessed += 1;
      report.numFound = solr.numFound || 0;
      totalPages = Math.ceil(report.numFound / this.pageSize);
      report.pagesDiscovered = totalPages;

      if (totalPages <= 0) { report.reachedFinalPage = true; break; }

      const tenders = [];
      let rejectedOnPage = 0;
      for (const doc of solr.docs || []) {
        report.extracted += 1;
        const result = normalizeGemDocument(doc);
        if (result.tender) {
          tenders.push(result.tender);
          report.validated += 1;
        } else {
          rejectedOnPage += 1;
          report.rejected += 1;
          const reason = result.reject.reason;
          report.rejectionReasons[reason] = (report.rejectionReasons[reason] || 0) + 1;
          logger.debug(`GeM record rejected on page ${page}: ${reason}`, { page, bidNumber: result.reject.bidNumber, gemBidId: result.reject.gemBidId });
        }
      }

      if (onPage) {
        try {
          await onPage({ page, tenders, extracted: (solr.docs || []).length, rejected: rejectedOnPage });
        } catch (error) {
          if (error && error.abortCrawl) {
            report.aborted = true;
            report.abortReason = error.message;
            break;
          }
          throw error;
        }
      }

      if (page % 100 === 0) {
        logger.info(
          `GeM crawl: page ${page}/${totalPages} | extracted ${report.extracted} | validated ${report.validated} | rejected ${report.rejected} | failed pages ${report.pagesFailed}`
        );
      }

      if (page >= totalPages) { report.reachedFinalPage = true; break; }
      page += 1;
      await this.sleep(this.requestDelayMs);
    }

    return report;
  }

  /**
   * Backwards compatible helper: crawl everything and return the tenders in
   * memory. Production sync uses crawl() with incremental persistence instead.
   */
  async fetchActiveTenders() {
    const tenders = [];
    const report = await this.crawl({ onPage: async ({ tenders: pageTenders }) => { tenders.push(...pageTenders); } });
    return {
      tenders,
      numFound: report.numFound,
      pagesProcessed: report.pagesProcessed,
      pagesExpected: report.pagesDiscovered,
      reachedFinalPage: report.reachedFinalPage && report.pagesFailed === 0 && !report.aborted,
      report,
    };
  }

  /** Maps one raw GeM document; returns null when it is rejected (see normalizer). */
  mapTender(doc) {
    const result = normalizeGemDocument(doc);
    return result.tender || null;
  }
}

module.exports = new GeMScraperService();
module.exports.normalizeGemTenderUrl = normalizeGemTenderUrl;
module.exports.isOfficialGemUrl = isOfficialGemUrl;
module.exports.REJECT = REJECT;
