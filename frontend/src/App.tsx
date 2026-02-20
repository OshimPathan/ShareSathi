import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import StockDetail from './pages/StockDetail';
import Portfolio from './pages/Portfolio';
import Trading from './pages/Trading';
import Login from './pages/Auth/Login';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="trade" element={<Trading />} />
          <Route path="portfolio" element={<Portfolio />} />
          <Route path="stock/:symbol" element={<StockDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
