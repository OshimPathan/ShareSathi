import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import StockDetail from './pages/StockDetail';
import Portfolio from './pages/Portfolio';
import Trading from './pages/Trading';
import Watchlist from './pages/Watchlist';
import Login from './pages/Auth/Login';
import Landing from './pages/Landing';
import About from './pages/InfoPages/About';
import Contact from './pages/InfoPages/Contact';
import MarketDataPage from './pages/MarketData';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/market/:type" element={<MarketDataPage />} />
        <Route path="/" element={<Landing />} />

        {/* Wrap all authenticated pages in ProtectedRoute */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/trade" element={<Trading />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/watchlist" element={<Watchlist />} />
            <Route path="/stock/:symbol" element={<StockDetail />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
