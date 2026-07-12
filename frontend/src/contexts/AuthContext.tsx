import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { authService, User, LoginData, RegisterData, AuthApiResponse } from '../services/authService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('authToken'));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log('[AuthContext] Render:', { user, token, isAuthenticated: !!user && !!token, isLoading });

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const refreshUser = useCallback(() => {
    console.log('=== refreshUser() called ===');
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');
    
    console.log('storedToken:', storedToken);
    console.log('storedUser:', storedUser);
    
    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log('parsedUser:', parsedUser);
        setUser(parsedUser);
        setToken(storedToken);
        console.log('User restored from localStorage');
      } catch (e) {
        console.error('Failed to parse stored user:', e);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
      }
    } else {
      console.log('No stored auth data found');
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (data: LoginData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.login(data);
      console.log('=== AuthContext.login() ===');
      console.log('Response received:', response);
      console.log('response.data:', response.data);
      console.log('response.data?.data:', response.data?.data);
      console.log('response.data?.data?.user:', response.data?.data?.user);
      console.log('response.data?.data?.token:', response.data?.data?.token);
      
      const userData = response.data?.user;
      const tokenData = response.data?.token;
      
      console.log('Setting user:', userData);
      console.log('Setting token:', tokenData);
      
      setUser(userData);
      setToken(tokenData);
      localStorage.setItem('authToken', tokenData);
      localStorage.setItem('user', JSON.stringify(userData));
      
      console.log('=== localStorage after set ===');
      console.log('Stored user:', localStorage.getItem('user'));
      console.log('Stored token:', localStorage.getItem('authToken'));
      console.log('State updated');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.register(data);
      const userData = response.data?.user;
      const tokenData = response.data?.token;
      if (!userData || !tokenData) {
    throw new Error("Invalid authentication response");
}

      setUser(userData);
      setToken(tokenData);
      localStorage.setItem('authToken', tokenData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.response?.data?.errors?.[0] || 'Registration failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
    error,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};