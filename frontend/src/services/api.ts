import axios, { AxiosInstance, AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken');
        const hasAuthHeader = !!config.headers.Authorization;
        const bearerPrefix = token ? token.startsWith('Bearer ') : false;
        
        // Safe diagnostics - no secrets logged
        if (process.env.NODE_ENV !== 'production') {
          console.debug('[API interceptor] token present:', !!token);
          console.debug('[API interceptor] Authorization header exists:', hasAuthHeader);
          console.debug('[API interceptor] Bearer prefix:', bearerPrefix);
          console.debug('[API interceptor] VITE_API_URL:', import.meta.env.VITE_API_URL);
        }
        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        } else if (hasAuthHeader && !bearerPrefix) {
          // Clear malformed auth header
          delete config.headers.Authorization;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.api.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => response,
      (error: AxiosError<ApiResponse>) => {
        if (error.response?.status === 401) {
          const authHeader = error.config?.headers?.Authorization;
          const bearerPresent = authHeader ? authHeader.startsWith('Bearer ') : false;
          const tokenFromLocalStorage = localStorage.getItem('authToken');
          
          // Safe diagnostics - no secrets logged
          if (process.env.NODE_ENV !== 'production') {
            console.error('[API response] 401 status received');
            console.error('[API response] Authorization header from config:', authHeader);
            console.error('[API response] Bearer prefix present:', bearerPresent);
            console.error('[API response] authToken in localStorage:', !!tokenFromLocalStorage);
            console.error('[API response] error name:', error.name);
            console.error('[API response] error message:', error.message);
            console.error('[API response] response status:', error.response?.status);
          }
          
          // If token is missing or malformed, clear stale auth data
          if (!tokenFromLocalStorage || !bearerPresent) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
          }
        }
        return Promise.reject(error);
      }
    );
  }

  public get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.api.get(url, config);
  }

  public post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.api.post(url, data, config);
  }

  public put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.api.put(url, data, config);
  }

  public delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.api.delete(url, config);
  }

  public upload<T = any>(url: string, formData: FormData, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.api.post(url, formData, {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(config?.headers || {}),
      },
    });
  }

  public setAuthToken(token: string): void {
    this.api.defaults.headers.Authorization = `Bearer ${token}`;
  }

  public removeAuthToken(): void {
    delete this.api.defaults.headers.Authorization;
  }
}

export const api = new ApiService();
export default api;