import api from './api';

export interface User {
  _id: string;
  fullName: string;
  email: string;
  role: 'admin' | 'vendor' | 'evaluator' | 'buyer';
  companyName?: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface RegisterData {
  fullName: string;
  email: string;
  password: string;
  companyName: string;
  phone: string;
  role?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export const authService = {
  async register(data: RegisterData) {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  async login(data: LoginData) {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  async logout() {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  async getSessions() {
    const response = await api.get('/auth/sessions');
    return response.data;
  },

  async revokeSession(sessionId: string) {
    const response = await api.delete(`/auth/sessions/${sessionId}`);
    return response.data;
  },
};