import api from './api';

export interface Bid {
  _id: string;
  bidNumber: string;
  tenderId: string;
  vendorId: string;
  organizationId: string;
  status: 'draft' | 'submitted' | 'under_evaluation' | 'accepted' | 'rejected' | 'withdrawn';
  bidType: 'technical' | 'financial' | 'combined';
  bidAmount: number;
  currency: string;
  technicalProposal?: string;
  financialProposal?: string;
  documents: any[];
  versionHistory: any[];
  currentVersion: number;
  evaluation?: {
    technicalScore?: number;
    financialScore?: number;
    totalScore?: number;
    technicalRemarks?: string;
    financialRemarks?: string;
    overallRemarks?: string;
    isRecommended?: boolean;
  };
  evaluationStatus: 'pending' | 'technical_evaluated' | 'financial_evaluated' | 'completed';
  submittedAt?: string;
  withdrawnAt?: string;
  withdrawalReason?: string;
  isWithdrawn: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBidData {
  tenderId: string;
  organizationId: string;
  bidAmount: number;
  bidType?: 'technical' | 'financial' | 'combined';
  technicalProposal?: string;
  financialProposal?: string;
  documents?: any[];
}

export interface UpdateBidData extends Partial<CreateBidData> {
  changes?: string;
}

export interface BidFilters {
  page?: number;
  limit?: number;
  status?: string;
  bidType?: string;
  evaluationStatus?: string;
  tenderId?: string;
  vendorId?: string;
  organizationId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const bidService = {
  async getAllBids(filters: BidFilters = {}) {
    const response = await api.get<{
      data: Bid[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    }>('/bids', { params: filters });
    return response.data;
  },

  async getBidById(bidId: string) {
    const response = await api.get<Bid>(`/bids/${bidId}`);
    return response.data;
  },

  async createBid(data: CreateBidData) {
    const response = await api.post<Bid>('/bids', data);
    return response.data;
  },

  async updateBid(bidId: string, data: UpdateBidData) {
    const response = await api.put<Bid>(`/bids/${bidId}`, data);
    return response.data;
  },

  async deleteBid(bidId: string) {
    const response = await api.delete(`/bids/${bidId}`);
    return response.data;
  },

  async submitBid(bidId: string) {
    const response = await api.put(`/bids/${bidId}/submit`);
    return response.data;
  },

  async withdrawBid(bidId: string, withdrawalReason?: string) {
    const response = await api.put(`/bids/${bidId}/withdraw`, { withdrawalReason });
    return response.data;
  },

  async evaluateBid(bidId: string, evaluationData: {
    technicalScore?: number;
    financialScore?: number;
    technicalRemarks?: string;
    financialRemarks?: string;
    overallRemarks?: string;
    isRecommended?: boolean;
  }) {
    const response = await api.put(`/bids/${bidId}/evaluate`, evaluationData);
    return response.data;
  },

  async updateBidStatus(bidId: string, status: string) {
    const response = await api.put(`/bids/${bidId}/status`, { status });
    return response.data;
  },

  async getVendorBids(vendorId: string, page = 1, limit = 10) {
    const response = await api.get<{
      data: Bid[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    }>(`/bids/vendor/${vendorId}`, { params: { page, limit } });
    return response.data;
  },

  async getTenderBids(tenderId: string, page = 1, limit = 10) {
    const response = await api.get<{
      data: Bid[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    }>(`/bids/tender/${tenderId}`, { params: { page, limit } });
    return response.data;
  },

  async searchBids(query: string, page = 1, limit = 10) {
    const response = await api.get<{
      data: Bid[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    }>('/bids/search', { params: { q: query, page, limit } });
    return response.data;
  },

  async getStatistics() {
    const response = await api.get('/bids/statistics');
    return response.data;
  },

  async addDocument(bidId: string, documentData: {
    documentType: string;
    documentName: string;
    documentUrl: string;
    fileSize?: number;
    mimeType?: string;
  }) {
    const response = await api.post(`/bids/${bidId}/documents`, documentData);
    return response.data;
  },

  async removeDocument(bidId: string, documentId: string) {
    const response = await api.delete(`/bids/${bidId}/documents/${documentId}`);
    return response.data;
  },
};