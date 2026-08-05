import type { ComponentType } from 'react';
import { createBrowserRouter } from 'react-router';
import { Layout } from './layout';
import HomePage from './pages/HomePage';

/** Lazy route helper — keeps default exports working with React Router's lazy API */
function lazyPage(loader: () => Promise<{ default: ComponentType }>) {
  return async () => {
    const mod = await loader();
    return { Component: mod.default };
  };
}

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: HomePage },
      { path: 'gem-consultant', lazy: lazyPage(() => import('./pages/GemConsultantPage')) },
      { path: 'tenders', lazy: lazyPage(() => import('./pages/TendersPage')) },
      { path: 'tenders/:id', lazy: lazyPage(() => import('./pages/TenderDetailPage')) },
      { path: 'services', lazy: lazyPage(() => import('./pages/ServicesPage')) },
      { path: 'services/:serviceSlug', lazy: lazyPage(() => import('./pages/ServiceDetailPage')) },
      { path: 'training', lazy: lazyPage(() => import('./pages/TrainingModulesPage')) },
      { path: 'reviews', lazy: lazyPage(() => import('./pages/ReviewsPage')) },
      { path: 'about', lazy: lazyPage(() => import('./pages/AboutPage')) },
      { path: 'resources', lazy: lazyPage(() => import('./pages/ResourcesPage')) },
      { path: 'resources/:slug', lazy: lazyPage(() => import('./pages/ResourceDetailPage')) },
      { path: 'faq', lazy: lazyPage(() => import('./pages/FAQPage')) },
      { path: 'contact', lazy: lazyPage(() => import('./pages/ContactPage')) },
      { path: 'privacy', lazy: lazyPage(() => import('./pages/PrivacyPage')) },
      { path: 'terms', lazy: lazyPage(() => import('./pages/TermsPage')) },
      { path: 'seller', lazy: lazyPage(() => import('./pages/SellerPage')) },
      { path: 'seller/dashboard', lazy: lazyPage(() => import('./pages/SellerDashboardPage')) },
      { path: 'seller/upload', lazy: lazyPage(() => import('./pages/TenderUploadPage')) },
      { path: 'payment', lazy: lazyPage(() => import('./pages/PaymentPage')) },
      { path: 'admin', lazy: lazyPage(() => import('./pages/AdminPage')) },
      { path: '*', lazy: lazyPage(() => import('./pages/NotFoundPage')) },
    ],
  },
]);
