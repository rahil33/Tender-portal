import api from './api';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: 'admin' | 'vendor' | 'evaluator' | 'buyer';
  companyName?: string;
  phone?: string;
}

export interface AuthApiResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    user: User;
  };
  errors?: string[];
  timestamp?: string;
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
    const response = await api.post<AuthApiResponse>('/auth/register', data);
    return response.data;
  },

  async login(data: LoginData) {
    const response = await api.post<AuthApiResponse>('/auth/login', data);
    console.log('=== authService.login() ===');
    console.log('Full axios response:', JSON.stringify(response, null, 2));
    console.log('response.data:', JSON.stringify(response.data, null, 2));
    console.log('response.data.data:', response.data?.data);
    console.log('response.data.user:', response.data?.user);
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