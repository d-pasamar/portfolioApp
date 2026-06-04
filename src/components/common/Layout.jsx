import { useState, useEffect } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { getApiUsage } from "../../services/eodhdClient";

export default function Layout() {
  const { user, logout, isAdmin } = useAuth();

  // === CONTADOR DE API CALLS ===
  const [apiCalls, setApiCalls] = useState(null);

  useEffect(() => {
    async function loadUsage() {
      try {
        const data = await getApiUsage();
        setApiCalls({
          used: data.apiRequests || 0,
          limit: data.dailyRateLimit || 20,
        });
      } catch (err) {
        console.error("Error al obtener uso de API:", err);
      }
    }

    loadUsage();

    // Recargar cuando cualquier sincronización ocurra
    window.addEventListener("eodhd-sync", loadUsage);
    return () => window.removeEventListener("eodhd-sync", loadUsage);
  }, []);

  // Clases comunes para los enlaces de navegación de la barra superior
  const linkClass = ({ isActive }) =>
    `px-4 py-2 text-xs font-medium tracking-wider uppercase border border-transparent transition-colors duration-150 ${
      isActive
        ? "bg-[#222222] text-white" // Estado activo
        : "text-slate-600 hover:text-black hover:bg-slate-200"
    }`;

  return (
    <div
      className="flex min-h-screen flex-col bg-[#eaeaea] font-mono"
      style={{
        backgroundImage: "radial-gradient(#c5c5c5 1px, transparent 1px)",
        backgroundSize: "20px 20px",
      }}
    >
      {/* 1. BARRA DE NAVEGACIÓN SUPERIOR */}
      <header className="flex h-16 w-full items-center justify-between border-b border-slate-300 bg-[#f9f9f9] px-6 shadow-sm">
        {/* LOGO */}
        <div className="text-sm font-bold tracking-widest text-black uppercase">
          Portfolio<span className="text-slate-500 font-normal">App</span>
        </div>

        {/* MENÚ DE NAVEGACIÓN CENTRAL */}
        <nav className="flex items-center gap-2">
          <NavLink to="/dashboard" className={linkClass}>
            Dashboard
          </NavLink>
          <NavLink to="/portfolios" className={linkClass}>
            Portafolios
          </NavLink>
          <NavLink to="/market" className={linkClass}>
            Market
          </NavLink>
          <NavLink to="/profile" className={linkClass}>
            Profile
          </NavLink>
          {/* Si el usuario es Administrador, pestaña extra */}
          {isAdmin && (
            <NavLink to="/admin" className={linkClass}>
              Admin
            </NavLink>
          )}
        </nav>

        {/* SECCIÓN USUARIO Y LOGOUT */}
        <div className="flex items-center gap-4">
          {user && (
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              {user.name || user.email}
            </span>
          )}

          {apiCalls && (
            <span className="text-[10px] font-bold tracking-wider text-slate-400 border border-slate-300 px-2 py-1 bg-white">
              {apiCalls.used}/{apiCalls.limit} API
            </span>
          )}

          <button
            onClick={logout}
            className="border border-slate-400 bg-white px-3 py-1.5 text-xs font-medium tracking-wider uppercase transition-colors duration-150 hover:bg-black hover:text-white"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      {/* 2. CONTENEDOR DINÁMICO DE LAS PÁGINAS */}
      <main className="flex-1 p-6 md:p-10 max-w-7xl w-full mx-auto">
        {/* En este espacio React Router inyectará DashboardPage, portfolioPage, etc */}
        <Outlet />
      </main>
    </div>
  );
}
