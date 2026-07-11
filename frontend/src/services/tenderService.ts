import api from './api';

export interface Tender {
  _id: string;
  title: string;
  tenderNumber: string;
  slug: string;
  description: string;
  category: string;
  status: 'draft' | 'published' | 'closed' | 'cancelled';
  visibility: 'public' | 'restricted' | 'private';
  budget: {
    estimated?: number;
    currency: string;
    budgetType: 'fixed' | 'range';
    minBudget?: number;
    maxBudget?: number;
  };
  submissionDeadline: string;
  openingDate?: string;
  documents: any[];
  issuingOrganization?: string;
  createdBy: string;
  publishedAt?: string;
  publishedBy?: string;
  closedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  isArchived: boolean;
  archivedAt?: string;
  tags: string[];
  location?: string;
  contactPerson?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface TenderFilters {
  page?: number;
  limit?: number;
  status?: string;
  category?: string;
  visibility?: string;
  isArchived?: boolean;
  search?: string;
  createdBy?: string;
  issuingOrganization?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateTenderData {
  title: string;
  description: string;
  category: string;
  submissionDeadline: string;
  budget?: {
    estimated?: number;
    currency?: string;
    budgetType?: 'fixed' | 'range';
    minBudget?: number;
    maxBudget?: number;
  };
  visibility?: 'public' | 'restricted' | 'private';
  location?: string;
  tags?: string[];
  contactPerson?: {
    name?: string;
    email?: string;
    phone?: string;
  };
}

export interface UpdateTenderData extends Partial<CreateTenderData> {
  title?: string;
  description?: string;
}

export const tenderService = {
  async getAllTenders(filters: TenderFilters = {}) {
    const response = await api.get<{
      data: Tender[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    }>('/tenders', { params: filters });
    return response.data;
  },

  async getTenderById(tenderId: string) {
    const response = await api.get<Tender>(`/tenders/${tenderId}`);
    return response.data;
  },

  async createTender(data: CreateTenderData) {
    const response = await api.post<Tender>('/tenders', data);
    return response.data;
  },

  async updateTender(tenderId: string, data: UpdateTenderData) {
    const response = await api.put<Tender>(`/tenders/${tenderId}`, data);
    return response.data;
  },

  async deleteTender(tenderId: string) {
    const response = await api.delete(`/tenders/${tenderId}`);
    return response.data;
  },

  async publishTender(tenderId: string) {
    const response = await api.put(`/tenders/${tenderId}/publish`);
    return response.data;
  },

  async unpublishTender(tenderId: string) {
    const response = await api.put(`/tenders/${tenderId}/unpublish`);
    return response.data;
  },

  async closeTender(tenderId: string) {
    const response = await api.put(`/tenders/${tenderId}/close`);
    return response.data;
  },

  async cancelTender(tenderId: string, cancellationReason?: string) {
    const response = await api.put(`/tenders/${tenderId}/cancel`, { cancellationReason });
    return response.data;
  },

  async archiveTender(tenderId: string) {
    const response = await api.put(`/tenders/${tenderId}/archive`);
    return response.data;
  },

  async unarchiveTender(tenderId: string) {
    const response = await api.put(`/tenders/${tenderId}/unarchive`);
    return response.data;
  },

  async searchTenders(query: string, page = 1, limit = 10) {
    const response = await api.get<{
      data: Tender[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    }>('/tenders/search', { params: { q: query, page, limit } });
    return response.data;
  },

  async getStatistics() {
    const response = await api.get('/tenders/statistics');
    return response.data;
  },
};