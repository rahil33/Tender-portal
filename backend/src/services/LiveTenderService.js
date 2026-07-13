/**
 * Live Tender Service - India CPPP Integration
 * 
 * This service fetches live tender data from the Central Public Procurement Portal (CPPP)
 * Government of India eProcurement System
 * 
 * Official Sources:
 * - https://eprocure.gov.in/eprocure/app
 * - https://eprocure.gov.in/epublish/app
 * 
 * Note: CPPP does not provide a public REST API. This service uses:
 * 1. Official RSS feeds where available
 * 2. Web scraping as fallback (with proper rate limiting)
 * 3. Modular design for easy replacement when official API becomes available
 */

const axios = require('axios');
const { Tender } = require('./model');
const { TenderDTO, TenderSummaryDTO } = require('./dto');

const CPPP_BASE_URL = 'https://eprocure.gov.in';
const CPPP_RSS_URL = 'https://eprocure.gov.in/epublish/rss.aspx';
const REQUEST_TIMEOUT = 30000;
const CACHE_TTL = 300000; // 5 minutes
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

class LiveTenderService {
  constructor() {
    this.cache = new Map();
    this.httpClient = axios.create({
      baseURL: CPPP_BASE_URL,
      timeout: REQUEST_TIMEOUT,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json, text/html, application/xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });
  }

  /**
   * Simple in-memory cache
   */
  _getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  _setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Retry mechanism with exponential backoff
   */
  async _withRetry(fn, retries = MAX_RETRIES) {
    try {
      return await fn();
    } catch (error) {
      if (retries <= 0) {
        throw error;
      }
      console.log(`Request failed, retrying... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (MAX_RETRIES - retries + 1)));
      return this._withRetry(fn, retries - 1);
    }
  }

  /**
   * Normalize CPPP tender data to our schema
   */
  _normalizeTender(cpppData) {
    const tender = {
      title: cpppData.tenderTitle || cpppData.title || 'Untitled Tender',
      tenderNumber: cpppData.tenderNo || cpppData.tenderNumber || cpppData.referenceId || `CPPP-${Date.now()}`,
      description: cpppData.tenderDescription || cpppData.description || cpppData.shortDescription || '',
      category: this._mapCategory(cpppData.orgName || cpppData.department || 'other'),
      status: 'published',
      visibility: 'public',
      budget: {
        estimated: this._parseAmount(cpppData.tenderValue || cpppData.estimatedValue || cpppData.budget),
        currency: 'INR',
        budgetType: 'fixed',
      },
      submissionDeadline: this._parseDate(cpppData.endDate || cpppData.submissionDate || cpppData.bidSubmissionEndDate),
      openingDate: this._parseDate(cpppData.openingDate || cpppData.tenderOpeningDate),
      issuingOrganization: cpppData.orgName || cpppData.department || cpppData.organisation || 'Government of India',
      location: cpppData.state || cpppData.location || cpppData.city || 'India',
      department: cpppData.department || cpppData.ministry || '',
      tenderType: 'government',
      tags: this._extractTags(cpppData),
      metadata: {
        source: 'CPPP',
        originalUrl: cpppData.tenderUrl || cpppData.url || '',
        cpppId: cpppData.tenderId || cpppData.id || '',
        ministry: cpppData.ministry || '',
        state: cpppData.state || '',
        city: cpppData.city || '',
        corrigendumCount: cpppData.corrigendumCount || 0,
      },
      documents: cpppData.documents || [],
      contactInfo: {
        organisation: cpppData.orgName || '',
        department: cpppData.department || '',
        officer: cpppData.contactPerson || '',
        email: cpppData.contactEmail || '',
        phone: cpppData.contactPhone || '',
        address: cpppData.address || '',
      },
    };

    return tender;
  }

  _mapCategory(orgName) {
    const name = (orgName || '').toLowerCase();
    if (name.includes('construction') || name.includes('works') || name.includes('civil')) return 'construction';
    if (name.includes('it') || name.includes('software') || name.includes('computer')) return 'it_software';
    if (name.includes('medical') || name.includes('health') || name.includes('hospital')) return 'medical';
    if (name.includes('transport') || name.includes('railway') || name.includes('road')) return 'transportation';
    if (name.includes('agriculture') || name.includes('farm')) return 'agriculture';
    if (name.includes('education') || name.includes('school') || name.includes('university')) return 'education';
    if (name.includes('consult') || name.includes('service')) return 'services';
    return 'goods';
  }

  _parseAmount(amountStr) {
    if (!amountStr) return undefined;
    if (typeof amountStr === 'number') return amountStr;
    
    const cleaned = amountStr
      .replace(/,/g, '')
      .replace(/₹/g, '')
      .replace(/INR/g, '')
      .replace(/[^\d.]/g, '');
    
    const amount = parseFloat(cleaned);
    return isNaN(amount) ? undefined : amount;
  }

  _parseDate(dateStr) {
    if (!dateStr) return undefined;
    if (dateStr instanceof Date) return dateStr;
    
    // Try parsing various Indian date formats
    const formats = [
      /(\d{2})-(\d{2})-(\d{4})/, // DD-MM-YYYY
      /(\d{2})\/(\d{2})\/(\d{4})/, // DD/MM/YYYY
      /(\d{4})-(\d{2})-(\d{2})/, // YYYY-MM-DD
    ];

    for (const format of formats) {
      const match = dateStr.match(format);
      if (match) {
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) return date;
      }
    }

    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? undefined : date;
  }

  _extractTags(data) {
    const tags = [];
    if (data.orgName) tags.push(data.orgName.toLowerCase().split(' ')[0]);
    if (data.state) tags.push(data.state.toLowerCase());
    if (data.ministry) tags.push(data.ministry.toLowerCase());
    if (data.tenderType) tags.push(data.tenderType.toLowerCase());
    return tags;
  }

  /**
   * Fetch tenders from CPPP RSS feed
   */
  async fetchFromRSS() {
    const cacheKey = 'cppp_rss';
    const cached = this._getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await this._withRetry(() => 
        this.httpClient.get('/epublish/rss.aspx', {
          headers: { 'Accept': 'application/xml, text/xml' }
        })
      );

      const parser = require('xml2js');
      const parseStringPromise = parser.parseStringPromise;
      const result = await parseStringPromise(response.data);
      
      const tenders = result.rss?.channel?.[0]?.item?.map(item => ({
        tenderTitle: item.title?.[0],
        tenderDescription: item.description?.[0],
        tenderUrl: item.link?.[0],
        endDate: item.endDate?.[0],
        orgName: item.orgName?.[0],
        department: item.department?.[0],
        state: item.state?.[0],
      })) || [];

      this._setCache(cacheKey, tenders);
      return tenders;
    } catch (error) {
      console.error('Failed to fetch CPPP RSS:', error.message);
      return [];
    }
  }

  /**
   * Fetch tenders from CPPP main page (web scraping fallback)
   */
  async fetchFromWeb() {
    const cacheKey = 'cppp_web';
    const cached = this._getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await this._withRetry(() =>
        this.httpClient.get('/eprocure/app', {
          headers: { 'Accept': 'text/html,application/xhtml+xml' }
        })
      );

      const cheerio = require('cheerio');
      const $ = cheerio.load(response.data);
      
      const tenders = [];
      $('.tender-item, .tender-row, tr').each((i, el) => {
        const tender = {
          tenderTitle: $(el).find('.title, td.title, a').first().text().trim(),
          tenderNumber: $(el).find('.tender-no, .ref-no').first().text().trim(),
          orgName: $(el).find('.org, .organization').first().text().trim(),
          endDate: $(el).find('.date, .deadline, .end-date').first().text().trim(),
          tenderUrl: $(el).find('a').first().attr('href'),
        };
        
        if (tender.tenderTitle) {
          tenders.push(tender);
        }
      });

      this._setCache(cacheKey, tenders);
      return tenders.slice(0, 50); // Limit to 50 tenders
    } catch (error) {
      console.error('Failed to fetch CPPP web:', error.message);
      return [];
    }
  }

  /**
   * Get live tenders from CPPP with filters
   */
  async getLiveTenders(filters = {}) {
    try {
      let rawTenders = [];
      
      // Try RSS first, then fallback to web scraping
      rawTenders = await this.fetchFromRSS();
      if (rawTenders.length === 0) {
        rawTenders = await this.fetchFromWeb();
      }

      // Normalize data
      const normalizedTenders = rawTenders.map(t => this._normalizeTender(t));

      // Apply filters
      let filtered = normalizedTenders;

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filtered = filtered.filter(t =>
          t.title.toLowerCase().includes(searchLower) ||
          t.description.toLowerCase().includes(searchLower) ||
          t.tenderNumber.toLowerCase().includes(searchLower)
        );
      }

      if (filters.category) {
        filtered = filtered.filter(t => t.category === filters.category);
      }

      if (filters.location) {
        filtered = filtered.filter(t =>
          t.location?.toLowerCase().includes(filters.location.toLowerCase())
        );
      }

      if (filters.state) {
        filtered = filtered.filter(t =>
          t.metadata?.state?.toLowerCase() === filters.state.toLowerCase()
        );
      }

      // Pagination
      const page = filters.page || 1;
      const limit = filters.limit || 10;
      const start = (page - 1) * limit;
      const paginatedTenders = filtered.slice(start, start + limit);

      return {
        success: true,
        data: {
          data: paginatedTenders.map(t => new TenderSummaryDTO(t)),
          pagination: {
            page,
            limit,
            total: filtered.length,
            pages: Math.ceil(filtered.length / limit),
          },
        },
      };
    } catch (error) {
      console.error('Live tender service error:', error);
      throw new Error(`Failed to fetch live tenders: ${error.message}`);
    }
  }

  /**
   * Get single tender details
   */
  async getTenderDetails(cpppId) {
    try {
      // This would require fetching the actual tender detail page
      // For now, return a placeholder that can be enhanced later
      return {
        success: true,
        data: {
          cpppId,
          message: 'Tender details fetching not yet implemented',
        },
      };
    } catch (error) {
      throw new Error(`Failed to fetch tender details: ${error.message}`);
    }
  }

  /**
   * Download tender documents
   */
  async downloadDocument(documentUrl) {
    try {
      const response = await this._withRetry(() =>
        this.httpClient.get(documentUrl, {
          responseType: 'arraybuffer',
        })
      );

      return {
        success: true,
        data: {
          content: response.data,
          contentType: response.headers['content-type'],
        },
      };
    } catch (error) {
      throw new Error(`Failed to download document: ${error.message}`);
    }
  }

  /**
   * Get available states from CPPP
   */
  async getStates() {
    const cacheKey = 'cppp_states';
    const cached = this._getFromCache(cacheKey);
    if (cached) return cached;

    const states = [
      'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
      'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
      'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
      'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
      'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
      'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi',
    ];

    this._setCache(cacheKey, states);
    return states;
  }

  /**
   * Get available departments/ministries
   */
  async getDepartments() {
    const cacheKey = 'cppp_departments';
    const cached = this._getFromCache(cacheKey);
    if (cached) return cached;

    const departments = [
      'Ministry of Defence', 'Ministry of Railways', 'Ministry of Road Transport',
      'Ministry of Health', 'Ministry of Education', 'Ministry of Power',
      'Ministry of Petroleum', 'Ministry of Communications', 'Ministry of Finance',
      'Ministry of Home Affairs', 'Ministry of Agriculture', 'Ministry of Commerce',
    ];

    this._setCache(cacheKey, departments);
    return departments;
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }
}

module.exports = new LiveTenderService();