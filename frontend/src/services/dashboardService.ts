import api from './api';

export interface DashboardStats {
  totalTenders: number;
  publishedTenders: number;
  draftTenders: number;
  closedTenders: number;
  cancelledTenders: number;
  archivedTenders: number;
  totalBids: number;
  activeBids: number;
  wonBids: number;
  lostBids: number;
  revenue?: number;
  upcomingDeadlines: any[];
  recentTenders: any[];
}

export const dashboardService = {
  async getBuyerDashboard() {
    const response = await api.get<DashboardStats>('/dashboard/buyer');
    return response.data;
  },

  async getSellerDashboard() {
    const response = await api.get<DashboardStats>('/dashboard/seller');
    return response.data;
  },

  async getAdminDashboard() {
    const response = await api.get<DashboardStats>('/dashboard/admin');
    return response.data;
  },

  async getMyTenders(page = 1, limit = 10) {
    const response = await api.get('/dashboard/my-tenders', {
      params: { page, limit }
    });
    return response.data;
  },

  async getMyBids(page = 1, limit = 10) {
    const response = await api.get('/dashboard/my-bids', {
      params: { page, limit }
    });
    return response.data;
  },
};