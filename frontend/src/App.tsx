import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import ErrorBoundary from './components/ui/ErrorBoundary';
import { DashboardSkeleton } from './components/ui/Skeleton';

// Eager-load the landing page for fast first paint
import Landing from './pages/Landing';
import Login from './pages/Auth/Login';

// Lazy-load everything else
const Dashboard = lazy(() => import('./pages/Dashboard'));
const StockDetail = lazy(() => import('./pages/StockDetail'));
const Portfolio = lazy(() => import('./pages/Portfolio'));
const Trading = lazy(() => import('./pages/Trading'));
const Watchlist = lazy(() => import('./pages/Watchlist'));
const VerifyEmail = lazy(() => import('./pages/Auth/VerifyEmail'));
const About = lazy(() => import('./pages/InfoPages/About'));
const Contact = lazy(() => import('./pages/InfoPages/Contact'));
const Disclaimer = lazy(() => import('./pages/Legal/Disclaimer'));
const PrivacyPolicy = lazy(() => import('./pages/Legal/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/Legal/TermsOfService'));
const MarketDataPage = lazy(() => import('./pages/MarketData'));
const MarketPage = lazy(() => import('./pages/Market'));
const NewsPage = lazy(() => import('./pages/News'));
const IpoPage = lazy(() => import('./pages/IPO'));
const AnnouncementsPage = lazy(() => import('./pages/Announcements'));
const ReportsPage = lazy(() => import('./pages/Reports'));
const ServicesPage = lazy(() => import('./pages/Services'));
const PortfolioInfoPage = lazy(() => import('./pages/PortfolioInfo'));
const Profile = lazy(() => import('./pages/Profile'));
const Pricing = lazy(() => import('./pages/Pricing'));
const AdminDashboard = lazy(() => import('./pages/Admin'));
const NotFoundPage = lazy(() => import('./pages/NotFound'));
const LearnPage = lazy(() => import('./pages/Learn'));
const ReferralPage = lazy(() => import('./pages/Referral'));
const ScreenerPage = lazy(() => import('./pages/Screener'));
const LeaderboardPage = lazy(() => import('./pages/Leaderboard'));
const PublicPortfolioPage = lazy(() => import('./pages/PublicPortfolio'));

function PageLoader() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <DashboardSkeleton />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Routes>
        {/* Public Pages */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/disclaimer" element={<Disclaimer />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/market" element={<MarketPage />} />
        <Route path="/market/:type" element={<MarketDataPage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/ipo" element={<IpoPage />} />
        <Route path="/announcements" element={<AnnouncementsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/portfolio-info" element={<PortfolioInfoPage />} />
        <Route path="/learn" element={<LearnPage />} />
        <Route path="/screener" element={<ScreenerPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/portfolio/public/:userId" element={<PublicPortfolioPage />} />
        <Route path="/stock/:symbol" element={<StockDetail />} />

        {/* Wrap all authenticated pages in ProtectedRoute */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/trade" element={<Trading />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/watchlist" element={<Watchlist />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/referral" element={<ReferralPage />} />
          </Route>
        </Route>

        {/* 404 Catch-All */}
        <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
