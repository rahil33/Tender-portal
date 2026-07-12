import React, { useState } from 'react';
import { X, Mail, Lock, User, Phone, Building, Briefcase, ShoppingCart } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { LoadingSpinner } from '../../components/Loading';
import { useNavigate } from 'react-router';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, mode: initialMode }) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const { login, register, isLoading, user, isAuthenticated } = useAuth();
  const { success, error: showError } = useNotification();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    companyName: '',
    phone: '',
    email: '',
    password: '',
    role: 'vendor' as 'vendor' | 'buyer',
  });
  const [formError, setFormError] = useState('');

  React.useEffect(() => {
    setMode(initialMode);
    setFormData({
      fullName: '',
      companyName: '',
      phone: '',
      email: '',
      password: '',
      role: 'vendor',
    });
    setFormError('');
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleRedirect = (role: string) => {
    switch (role) {
      case 'buyer':
        navigate('/buyer/dashboard');
        break;
      case 'vendor':
        navigate('/seller/dashboard');
        break;
      case 'admin':
        navigate('/admin/dashboard');
        break;
      default:
        navigate('/');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

try {
        if (mode === 'login') {
          await login({ email: formData.email, password: formData.password });
          success('Login successful!', 'Welcome back');
          onClose();
        } else {
        const result = await register({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          companyName: formData.companyName,
          phone: formData.phone,
          role: formData.role,
        });
        success('Registration successful!', 'Welcome to Phoenix Tender');
        onClose();
        const userRole = result?.data?.user?.role || formData.role;
        handleRedirect(userRole);
      }
    } catch (err: any) {
      const message = err.message || 'Operation failed';
      setFormError(message);
      showError(message);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setFormError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card rounded-lg max-w-md w-full p-6 relative shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 p-2 hover:bg-muted rounded-full transition-colors disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-foreground mb-6">{mode === 'login' ? 'Login' : 'Register'}</h2>

        <form noValidate onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">Register As</label>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`relative flex flex-col p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.role === 'vendor' 
                      ? 'border-blue-600 bg-blue-50' 
                      : 'border-border hover:border-gray-300'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="radio"
                        name="role"
                        value="vendor"
                        checked={formData.role === 'vendor'}
                        onChange={() => setFormData((prev) => ({ ...prev, role: 'vendor' }))}
                        className="w-4 h-4 text-blue-600"
                      />
                      <Briefcase className="w-5 h-5 text-gray-600" />
                      <span className="font-semibold text-foreground">Seller</span>
                    </div>
                    <p className="text-xs text-muted-foreground pl-6">
                      Publish tenders and manage procurement
                    </p>
                  </label>

                  <label className={`relative flex flex-col p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.role === 'buyer' 
                      ? 'border-blue-600 bg-blue-50' 
                      : 'border-border hover:border-gray-300'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="radio"
                        name="role"
                        value="buyer"
                        checked={formData.role === 'buyer'}
                        onChange={() => setFormData((prev) => ({ ...prev, role: 'buyer' }))}
                        className="w-4 h-4 text-blue-600"
                      />
                      <ShoppingCart className="w-5 h-5 text-gray-600" />
                      <span className="font-semibold text-foreground">Buyer</span>
                    </div>
                    <p className="text-xs text-muted-foreground pl-6">
                      Browse tenders and submit bids
                    </p>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2 border-2 border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Company Name</label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2 border-2 border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                    placeholder="Enter your company name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2 border-2 border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-2 border-2 border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
                pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$"
                className="w-full pl-10 pr-4 py-2 border-2 border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                placeholder="Min 8 chars: uppercase, lowercase, number, special char"
              />
            </div>
          </div>

          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
              {formError}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-200 shadow-sm rounded-md hover:bg-gray-50 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" />
                {mode === 'login' ? 'Logging in...' : 'Registering...'}
              </>
            ) : (
              mode === 'login' ? 'Login' : 'Register'
            )}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            disabled={isLoading}
            className="text-sm text-primary hover:underline disabled:opacity-50"
          >
            {mode === 'login' ? "Don't have an account? Register" : 'Already have an account? Login'}
          </button>
        </div>
      </div>
    </div>
  );
};