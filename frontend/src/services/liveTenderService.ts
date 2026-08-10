import api from './api';

export interface LiveTender {
  _id?: string;
  tenderNumber: string;
  title: string;
  description: string;
  category: string;
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
  };
  documents: Array<{
    documentName: string;
    documentUrl: string;
    documentType: string;
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
  category?: string;
  location?: string;
  state?: string;
  status?: string;
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

export const liveTenderService = {
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
    const response = await api.get<string[]>('/live-tenders/states');
    return response.data.data ?? [];
  },

  async getDepartments() {
    const response = await api.get<string[]>('/live-tenders/departments');
    return response.data.data;
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