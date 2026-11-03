import api from './api';

export interface LiveTender {
  _id?: string;
  tenderNumber: string;
  title: string;
  description: string;
  /** Official GeM category name (or "Unclassified"). */
  category: string;
  categoryInfo?: {
    key?: string;
    id?: string;
    name?: string;
    parentId?: string;
    parentName?: string;
    classification?: 'product' | 'service' | 'unclassified';
    classificationSource?: string;
    raw?: string;
  };
  status: 'published' | 'open' | 'closed' | 'cancelled';
  visibility: 'public';
  budget: {
    estimated?: number;
    currency: string;
    budgetType: 'fixed';
  };
  submissionDeadline: string;
  openingDate?: string;
  issuingOrganization: string;
  location: string;
  department: string;
  tenderType: 'government';
  tags: string[];
  sourcePortal: 'GEM';
  metadata: {
    source: 'GEM';
    originalUrl: string;
    gemBidId?: string;
    ministry?: string;
    state?: string;
    city?: string;
    corrigendumCount?: number;
    productCategory?: string;
    bidType?: number;
    bidDownloadUrl?: string;
    gemStatus?: string;
  };
  documents: Array<{
    documentName: string;
    documentUrl: string;
    documentType: string;
    name?: string;
    url?: string;
    type?: string;
    source?: string;
  }>;
  contactInfo: {
    organisation: string;
    department: string;
    officer: string;
    email: string;
    phone: string;
    address: string;
  };
  createdAt: string;
}

export interface LiveTenderFilters {
  page?: number;
  limit?: number;
  search?: string;
  /** Official GeM category key (see getFilters().categories[].key). */
  category?: string;
  classification?: 'product' | 'service' | 'unclassified';
  status?: 'published' | 'open';
  publishedFrom?: string;
  publishedTo?: string;
  location?: string;
  state?: string;
  authority?: string;
  bidType?: string | number;
  minValue?: number;
  maxValue?: number;
  deadlineFrom?: string;
  deadlineTo?: string;
  isArchived?: boolean;
}

export interface LiveTenderResponse {
  success: boolean;
  message: string;
  data: {
    data: LiveTender[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface GemCategory {
  key: string;
  name: string;
  id?: string;
  parentId?: string;
  parentName?: string;
  classification: 'product' | 'service' | 'unclassified';
  count: number;
}

export interface LiveTenderFilterOptions {
  categories: GemCategory[];
  classifications: Array<{ value: string; count: number }>;
  bidTypes: Array<{ value: number; label: string; count: number }>;
  statuses: Array<{ value: string; count: number }>;
  states: Array<{ value: string; count: number }>;
  ranges: { minDeadline?: string; maxDeadline?: string; minPublished?: string; maxPublished?: string } | null;
  meta: {
    totalLive: number;
    totalGemRecords: number;
    hasImportedAny: boolean;
    lastSync: { status: 'running' | 'success' | 'partial' | 'failed'; startedAt?: string; finishedAt?: string } | null;
    lastSuccessfulSyncAt: string | null;
  };
}

export const liveTenderService = {
  /** Every filter dropdown + sync info, all backed by live records. */
  async getFilters(): Promise<LiveTenderFilterOptions> {
    const response = await api.get<LiveTenderFilterOptions>('/live-tenders/filters');
    return response.data.data as LiveTenderFilterOptions;
  },

  async getLiveTenders(filters: LiveTenderFilters = {}) {
    const response = await api.get<{
      data: LiveTender[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    }>('/live-tenders', {
      params: filters,
    });

    return response.data;
  },

  async getStates() {
    const response = await api.get<{
      success: boolean;
      data: {
        states: string[];
        counts: Record<string, number>;
      };
    }>('/live-tenders/states');
    if (response.data.success && response.data.data) {
      return { states: response.data.data.states, counts: response.data.data.counts };
    }
    return { states: [], counts: {} };
  },

  async getCategories(): Promise<GemCategory[]> {
    const response = await api.get<GemCategory[]>('/live-tenders/categories');
    const categories = response.data.data ?? [];
    return Array.isArray(categories) ? categories : [];
  },

  async getDepartments() {
    const response = await api.get<string[]>('/live-tenders/departments');
    return response.data.data;
  },

  async getAuthorities() {
    const response = await api.get<string[]>('/live-tenders/authorities');
    return response.data.data ?? [];
  },

  async getTenderDetails(tenderId: string) {
    const response = await api.get<{ success: boolean; data: any }>(`/live-tenders/${tenderId}`);
    return response.data;
  },

  async downloadDocument(tenderId: string, documentUrl: string) {
    const response = await api.post(
      `/live-tenders/${tenderId}/download`,
      { documentUrl },
      { responseType: 'blob' }
    );
    return response.data;
  },

  async clearCache() {
    const response = await api.delete('/live-tenders/cache');
    return response.data;
  },
};