import { createBrowserRouter, Navigate } from "react-router";
import { Layout } from "./layout";
import HomePage from "./pages/HomePage";
import GemConsultantPage from "./pages/GemConsultantPage";
import TendersPage from "./pages/TendersPage";
import TenderDetailPage from "./pages/TenderDetailPage";
import ServicesPage from "./pages/ServicesPage";
import ServiceDetailPage from "./pages/ServiceDetailPage";
import AboutPage from "./pages/AboutPage";
import ResourcesPage from "./pages/ResourcesPage";
import ResourceDetailPage from "./pages/ResourceDetailPage";
import FAQPage from "./pages/FAQPage";
import ContactPage from "./pages/ContactPage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import NotFoundPage from "./pages/NotFoundPage";
import TrainingModulesPage from "./pages/TrainingModulesPage";
import ReviewsPage from "./pages/ReviewsPage";
import SellerPage from "./pages/SellerPage";
import SellerDashboardPage from "./pages/SellerDashboardPage";
import TenderUploadPage from "./pages/TenderUploadPage";
import BuyerDashboardPage from "./pages/BuyerDashboardPage";
import MyBidsPage from "./pages/MyBidsPage";
import ProtectedRoute from "../components/ProtectedRoute";
import { useAuth } from "../contexts/AuthContext";
import { lazy, Suspense } from "react";

const AdminDashboardPage = lazy(() => import("./pages/AdminDashboardPage"));
const AdminUsersPage = lazy(() => import("./pages/AdminUsersPage"));
const AdminOrganizationsPage = lazy(() => import("./pages/AdminOrganizationsPage"));
const AdminTendersPage = lazy(() => import("./pages/AdminTendersPage"));
const AdminBidsPage = lazy(() => import("./pages/AdminBidsPage"));
const AdminAuditLogsPage = lazy(() => import("./pages/AdminAuditLogsPage"));
const AdminAnalyticsPage = lazy(() => import("./pages/AdminAnalyticsPage"));
const AdminNotificationsPage = lazy(() => import("./pages/AdminNotificationsPage"));

const AdminPageLoader = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600 font-medium">Loading...</p>
      </div>
    </div>
  }>
    {children}
  </Suspense>
);

// Role-based redirect component
const DashboardRedirect = () => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  switch (user?.role) {
    case 'buyer':
      return <Navigate to="/buyer/dashboard" replace />;
    case 'vendor':
      return <Navigate to="/seller/dashboard" replace />;
    case 'admin':
      return <Navigate to="/admin/dashboard" replace />;
    default:
      return <Navigate to="/" replace />;
  }
};

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: HomePage },
      { path: "gem-consultant", Component: GemConsultantPage },
      { path: "tenders", Component: TendersPage },
      { path: "tenders/:id", Component: TenderDetailPage },
      { path: "services", Component: ServicesPage },
      { path: "services/:serviceSlug", Component: ServiceDetailPage },
      { path: "training", Component: TrainingModulesPage },
      { path: "reviews", Component: ReviewsPage },
      { path: "about", Component: AboutPage },
      { path: "resources", Component: ResourcesPage },
      { path: "resources/:slug", Component: ResourceDetailPage },
      { path: "faq", Component: FAQPage },
      { path: "contact", Component: ContactPage },
      { path: "privacy", Component: PrivacyPage },
      { path: "terms", Component: TermsPage },
      { path: "seller", Component: SellerPage },
      
      // Dashboard Redirect - redirects based on role
      { path: "dashboard", Component: DashboardRedirect },
      
      // Buyer Routes
      { 
        path: "buyer/dashboard", 
        element: (
          <ProtectedRoute requiredRoles={['buyer']}>
            <BuyerDashboardPage />
          </ProtectedRoute>
        ) 
      },
      { 
        path: "bids/my-bids", 
        element: (
          <ProtectedRoute requiredRoles={['buyer', 'vendor']}>
            <MyBidsPage />
          </ProtectedRoute>
        ) 
      },
      
      // Seller Routes
      { 
        path: "seller/dashboard", 
        element: (
          <ProtectedRoute requiredRoles={['vendor']}>
            <SellerDashboardPage />
          </ProtectedRoute>
        ) 
      },
      { 
        path: "seller/upload", 
        element: (
          <ProtectedRoute requiredRoles={['vendor', 'admin']}>
            <TenderUploadPage />
          </ProtectedRoute>
        ) 
      },
      
      // Admin Routes
      { 
        path: "admin/dashboard", 
        element: (
          <AdminPageLoader>
            <ProtectedRoute requiredRoles={['admin']}>
              <AdminDashboardPage />
            </ProtectedRoute>
          </AdminPageLoader>
        ) 
      },
      { 
        path: "admin", 
        element: (
          <AdminPageLoader>
            <ProtectedRoute requiredRoles={['admin']}>
              <AdminDashboardPage />
            </ProtectedRoute>
          </AdminPageLoader>
        ) 
      },
      {
        path: "admin/users",
        element: (
          <AdminPageLoader>
            <ProtectedRoute requiredRoles={['admin']}>
              <AdminUsersPage />
            </ProtectedRoute>
          </AdminPageLoader>
        )
      },
      {
        path: "admin/users/:userId",
        element: (
          <AdminPageLoader>
            <ProtectedRoute requiredRoles={['admin']}>
              <AdminUsersPage />
            </ProtectedRoute>
          </AdminPageLoader>
        )
      },
      {
        path: "admin/organizations",
        element: (
          <AdminPageLoader>
            <ProtectedRoute requiredRoles={['admin']}>
              <AdminOrganizationsPage />
            </ProtectedRoute>
          </AdminPageLoader>
        )
      },
      {
        path: "admin/organizations/:organizationId",
        element: (
          <AdminPageLoader>
            <ProtectedRoute requiredRoles={['admin']}>
              <AdminOrganizationsPage />
            </ProtectedRoute>
          </AdminPageLoader>
        )
      },
      {
        path: "admin/tenders",
        element: (
          <AdminPageLoader>
            <ProtectedRoute requiredRoles={['admin']}>
              <AdminTendersPage />
            </ProtectedRoute>
          </AdminPageLoader>
        )
      },
      {
        path: "admin/tenders/:tenderId",
        element: (
          <AdminPageLoader>
            <ProtectedRoute requiredRoles={['admin']}>
              <AdminTendersPage />
            </ProtectedRoute>
          </AdminPageLoader>
        )
      },
      {
        path: "admin/bids",
        element: (
          <AdminPageLoader>
            <ProtectedRoute requiredRoles={['admin']}>
              <AdminBidsPage />
            </ProtectedRoute>
          </AdminPageLoader>
        )
      },
      {
        path: "admin/audit-logs",
        element: (
          <AdminPageLoader>
            <ProtectedRoute requiredRoles={['admin']}>
              <AdminAuditLogsPage />
            </ProtectedRoute>
          </AdminPageLoader>
        )
      },
      {
        path: "admin/analytics",
        element: (
          <AdminPageLoader>
            <ProtectedRoute requiredRoles={['admin']}>
              <AdminAnalyticsPage />
            </ProtectedRoute>
          </AdminPageLoader>
        )
      },
      {
        path: "admin/notifications",
        element: (
          <AdminPageLoader>
            <ProtectedRoute requiredRoles={['admin']}>
              <AdminNotificationsPage />
            </ProtectedRoute>
          </AdminPageLoader>
        )
      },
      
      { path: "*", Component: NotFoundPage },
    ],
  },
]);