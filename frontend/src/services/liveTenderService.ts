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
  metadata: {
    source: 'CPPP';
    originalUrl: string;
    cpppId: string;
    ministry?: string;
    state?: string;
    city?: string;
    corrigendumCount?: number;
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
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.category) params.append('category', filters.category);
    if (filters.location) params.append('location', filters.location);
    if (filters.state) params.append('state', filters.state);
    if (filters.status) params.append('status', filters.status);

if (filters.isArchived !== undefined)
  params.append('isArchived', String(filters.isArchived));

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
    
    // DEBUG: Log what the service returns
    console.log('[liveTenderService] API response:', response);
    console.log('[liveTenderService] Returning response.data:', response.data);
    
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

  async getTenderDetails(cpppId: string) {
    const response = await api.get<{ success: boolean; data: any }>(`/live-tenders/${cpppId}`);
    return response.data;
  },

  async downloadDocument(cpppId: string, documentUrl: string) {
    const response = await api.post(
      `/live-tenders/${cpppId}/download`,
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