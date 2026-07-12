import { createBrowserRouter, Navigate } from "react-router-dom";
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
import AdminDashboardPage from "./pages/AdminDashboardPage";
import ProtectedRoute from "../components/ProtectedRoute";
import { useAuth } from "../contexts/AuthContext";

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
          <ProtectedRoute requiredRoles={['admin']}>
            <AdminDashboardPage />
          </ProtectedRoute>
        ) 
      },
      { 
        path: "admin", 
        element: (
          <ProtectedRoute requiredRoles={['admin']}>
            <AdminDashboardPage />
          </ProtectedRoute>
        ) 
      },
      
      { path: "*", Component: NotFoundPage },
    ],
  },
]);