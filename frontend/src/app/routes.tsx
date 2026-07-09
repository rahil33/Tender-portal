import { createBrowserRouter } from "react-router";
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
      { path: "seller/dashboard", Component: SellerDashboardPage },
      { path: "seller/upload", Component: TenderUploadPage },
      { path: "*", Component: NotFoundPage },
    ],
  },
]);