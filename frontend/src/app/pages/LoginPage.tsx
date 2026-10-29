import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginPage() {
  const [form, setForm] = useState<LoginFormData>({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const from = (location.state as any)?.from?.pathname || '/tenders';
  const { error: showError, success } = useNotification();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(form);
      success('Login successful', 'You are now logged in');
      navigate(from, { replace: true });
    } catch (err: any) {
      const errorMessage = err.message || 'Login failed';
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: '#F8FAFC' }}>
      <div className="max-w-md mx-auto px-4 py-20">
        <div className="bg-white rounded-xl p-8 shadow-sm max-w-lg mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: '#111827' }}>
            Sign in to access GeM tenders
          </h2>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email address
              </label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 rounded-[12px] border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition-colors"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                name="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 rounded-[12px] border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-4 rounded-[12px] bg-[#16A34A] text-white font-medium text-sm hover:bg-[#148f3a] transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Sign in...' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-sm text-center text-gray-500">
            Need an account? Use <span className="font-medium">Register</span> from the home page header.
          </p>
        </div>
      </div>
    </div>
  );
}