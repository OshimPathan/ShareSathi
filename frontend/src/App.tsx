import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import StockDetail from './pages/StockDetail';
import Portfolio from './pages/Portfolio';
import Trading from './pages/Trading';
import Watchlist from './pages/Watchlist';
import Login from './pages/Auth/Login';
import VerifyEmail from './pages/Auth/VerifyEmail';
import Landing from './pages/Landing';
import About from './pages/InfoPages/About';
import Contact from './pages/InfoPages/Contact';
import MarketDataPage from './pages/MarketData';
import MarketPage from './pages/Market';
import NewsPage from './pages/News';
import IpoPage from './pages/IPO';
import AnnouncementsPage from './pages/Announcements';
import ReportsPage from './pages/Reports';
import ServicesPage from './pages/Services';
import PortfolioInfoPage from './pages/PortfolioInfo';
import Profile from './pages/Profile';
import NotFoundPage from './pages/NotFound';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Pages */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/market" element={<MarketPage />} />
        <Route path="/market/:type" element={<MarketDataPage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/ipo" element={<IpoPage />} />
        <Route path="/announcements" element={<AnnouncementsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/portfolio-info" element={<PortfolioInfoPage />} />
        <Route path="/stock/:symbol" element={<StockDetail />} />

        {/* Wrap all authenticated pages in ProtectedRoute */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/trade" element={<Trading />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/watchlist" element={<Watchlist />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Route>

        {/* 404 Catch-All */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
