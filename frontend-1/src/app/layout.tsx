import React, { useState, Suspense } from 'react';
import { Outlet } from 'react-router';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { WhatsAppButton } from './components/WhatsAppButton';

export const Layout: React.FC = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const handleLoginClick = () => {
    setAuthMode('login');
    setAuthModalOpen(true);
  };

  const handleRegisterClick = () => {
    setAuthMode('register');
    setAuthModalOpen(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:bg-white focus:text-gray-900 focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg focus:text-sm focus:font-semibold focus:ring-2 focus:ring-[#16A34A]"
      >
        Skip to main content
      </a>
      <Header onLoginClick={handleLoginClick} onRegisterClick={handleRegisterClick} />
      <main id="main-content" className="flex-1" tabIndex={-1}>
        <Suspense fallback={<div className="min-h-[40vh]" role="status" aria-label="Loading page" />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <WhatsAppButton />
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        mode={authMode}
      />
    </div>
  );
};
