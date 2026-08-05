import React, { useState, useCallback, useRef, useEffect } from 'react';
import { X, Mail, Lock, User, Phone, Building, CheckCircle } from 'lucide-react';
import { useEscapeKey } from '../hooks/useEscapeKey';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'login' | 'register';
}

const inputCls =
  'w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition-all placeholder:text-gray-300';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, mode: initialMode }) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleDone, setGoogleDone] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = 'auth-modal-title';

  React.useEffect(() => { setMode(initialMode); }, [initialMode]);

  const handleClose = useCallback(() => onClose(), [onClose]);
  useEscapeKey(handleClose, isOpen);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.activeElement as HTMLElement | null;
    const focusable = dialogRef.current?.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    focusable?.focus();
    return () => { prev?.focus?.(); };
  }, [isOpen, mode]);

  if (!isOpen) return null;

  function handleGoogleAuth() {
    setGoogleLoading(true);
    // Placeholder: In production, trigger Google OAuth flow here
    setTimeout(() => {
      setGoogleLoading(false);
      setGoogleDone(true);
      setTimeout(onClose, 1200);
    }, 1500);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="bg-white rounded-2xl max-w-md w-full shadow-2xl relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="px-7 pt-7 pb-5 border-b border-gray-100">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 p-2 text-gray-300 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={18} aria-hidden="true" />
          </button>

          <h2 id={titleId} className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            {mode === 'login'
              ? 'Sign in to your Phoenix Tender Tech account.'
              : 'Join 3,800+ businesses winning government tenders.'}
          </p>
        </div>

        <div className="px-7 py-6 space-y-4">

          {/* Google Auth Button */}
          {googleDone ? (
            <div className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-green-50 border border-green-100 text-sm font-semibold text-green-700" role="status">
              <CheckCircle size={16} aria-hidden="true" /> Signed in with Google!
            </div>
          ) : (
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={googleLoading}
              aria-busy={googleLoading || undefined}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border-2 border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-60"
            >
              {googleLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-[#16A34A] rounded-full animate-spin" aria-hidden="true" />
                  Connecting…
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 48 48" fill="none" aria-hidden="true">
                    <path d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" fill="#FFC107" />
                    <path d="M6.306 14.691l6.571 4.819C14.655 15.108 19.002 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" fill="#FF3D00" />
                    <path d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" fill="#4CAF50" />
                    <path d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" fill="#1976D2" />
                  </svg>
                  Continue with Google
                </>
              )}
            </button>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3" role="separator" aria-label="or">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-300 font-medium">or continue with email</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* Email Form */}
          <form onSubmit={(e) => { e.preventDefault(); onClose(); }} className="space-y-3">
            {mode === 'register' && (
              <>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" aria-hidden="true" />
                  <input type="text" required placeholder="Full Name" aria-label="Full Name" className={inputCls} autoComplete="name" />
                </div>
                <div className="relative">
                  <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" aria-hidden="true" />
                  <input type="text" placeholder="Company Name" aria-label="Company Name" className={inputCls} autoComplete="organization" />
                </div>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" aria-hidden="true" />
                  <input type="tel" required placeholder="Phone Number" aria-label="Phone Number" className={inputCls} autoComplete="tel" />
                </div>
              </>
            )}

            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" aria-hidden="true" />
              <input type="email" required placeholder="Email Address" aria-label="Email Address" className={inputCls} autoComplete="email" />
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" aria-hidden="true" />
              <input type="password" required placeholder="Password" aria-label="Password" className={inputCls} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
            </div>

            {mode === 'login' && (
              <div className="text-right -mt-1">
                <button type="button" className="text-xs text-gray-400 hover:text-[#16A34A] transition-colors">
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl font-semibold text-sm bg-gray-900 text-white hover:bg-gray-800 transition-colors shadow-sm mt-1"
            >
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400">
            {mode === 'login' ? "Don't have an account? " : 'Already registered? '}
            <button
              type="button"
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="font-semibold text-gray-700 hover:text-[#16A34A] transition-colors underline underline-offset-2"
            >
              {mode === 'login' ? 'Sign Up' : 'Login'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
