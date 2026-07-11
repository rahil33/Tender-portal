import api from './api';

export interface Organization {
  _id: string;
  name: string;
  slug: string;
  type: 'government' | 'public_sector' | 'private' | 'ngo';
  description?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
  };
  contact?: {
    email?: string;
    phone?: string;
    website?: string;
  };
  gstNumber?: string;
  panNumber?: string;
  registrationNumber?: string;
  isActive: boolean;
  isVerified: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrganizationData {
  name: string;
  type: 'government' | 'public_sector' | 'private' | 'ngo';
  description?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
  };
  contact?: {
    email?: string;
    phone?: string;
    website?: string;
  };
  gstNumber?: string;
}

export const organizationService = {
  async getAllOrganizations() {
    const response = await api.get<Organization[]>('/organizations');
    return response.data;
  },

  async getOrganizationById(organizationId: string) {
    const response = await api.get<Organization>(`/organizations/${organizationId}`);
    return response.data;
  },

  async createOrganization(data: CreateOrganizationData) {
    const response = await api.post<Organization>('/organizations', data);
    return response.data;
  },

  async updateOrganization(organizationId: string, data: Partial<CreateOrganizationData>) {
    const response = await api.put<Organization>(`/organizations/${organizationId}`, data);
    return response.data;
  },

  async deleteOrganization(organizationId: string) {
    const response = await api.delete(`/organizations/${organizationId}`);
    return response.data;
  },

  async getMyOrganizations() {
    const response = await api.get<Organization[]>('/organizations/my-organizations');
    return response.data;
  },

  async toggleOrganizationStatus(organizationId: string) {
    const response = await api.put(`/organizations/${organizationId}/toggle-status`);
    return response.data;
  },

  async verifyOrganization(organizationId: string) {
    const response = await api.put(`/organizations/${organizationId}/verify`);
    return response.data;
  },
};