import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import DashboardPage from "../pages/DashboardPage";
import LoginPage from "../pages/LoginPage";
import MarketSearchPage from "../pages/MarketSearchPage";
import PortfolioDetailPage from "../pages/PortfolioDetailPage";
import PortfoliosPage from "../pages/PortfoliosPage";
import ProfilePage from "../pages/ProfilePage";
import RegisterPage from "../pages/RegisterPage";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Rutas Privadas */}
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/portfolios" element={<PortfoliosPage />} />
        <Route path="/portfolios/:id" element={<PortfolioDetailPage />} />
        <Route path="/market" element={<MarketSearchPage />} />
        <Route path="/profile" element={<ProfilePage />} />

        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
