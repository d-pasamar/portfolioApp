import { useState, useEffect } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { getApiUsage } from "../../services/eodhdClient";

export default function Layout() {
  const { user, logout, isAdmin } = useAuth();

  // === ESTADO DEL MENÚ MÓVIL ===
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  // Clases comunes para los enlaces de navegación de la barra superior — DESKTOP (barra horizontal)
  const linkClass = ({ isActive }) =>
    `px-4 py-2 text-xs font-medium tracking-wider uppercase border border-transparent transition-colors duration-150 ${
      isActive
        ? "bg-[#222222] text-white" // Estado activo
        : "text-slate-600 hover:text-black hover:bg-slate-200"
    }`;

  // Clases para los enlaces de navegación — MÓVIL (panel vertical)
  const mobileLinkClass = ({ isActive }) =>
    `block w-full px-4 py-3 text-xs font-medium tracking-wider uppercase border-b border-slate-200 transition-colors duration-150 ${
      isActive
        ? "bg-[#222222] text-white"
        : "text-slate-600 hover:text-black hover:bg-slate-100"
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
      <header className="relative border-b border-slate-300 bg-[#f9f9f9] shadow-sm">
        <div className="flex h-16 w-full items-center justify-between px-4 md:px-6">
          {/* LOGO */}
          <div className="text-sm font-bold tracking-widest text-black uppercase">
            Portfolio<span className="text-slate-500 font-normal">App</span>
          </div>

          {/* MENÚ DE NAVEGACIÓN CENTRAL — solo visible en desktop */}
          <nav className="hidden md:flex items-center gap-2">
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

          {/* SECCIÓN USUARIO Y LOGOUT — solo visible en desktop */}
          <div className="hidden md:flex items-center gap-4">
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

          {/* BOTÓN HAMBURGUESA — solo visible en móvil */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden flex flex-col justify-center items-center w-8 h-8 gap-1.5 cursor-pointer"
            aria-label="Abrir menú de navegación"
          >
            <span
              className={`block w-5 h-0.5 bg-black transition-all duration-200 ${isMenuOpen ? "rotate-45 translate-y-2" : ""}`}
            />
            <span
              className={`block w-5 h-0.5 bg-black transition-all duration-200 ${isMenuOpen ? "opacity-0" : ""}`}
            />
            <span
              className={`block w-5 h-0.5 bg-black transition-all duration-200 ${isMenuOpen ? "-rotate-45 -translate-y-2" : ""}`}
            />
          </button>
        </div>

        {/* PANEL DESPLEGABLE MÓVIL */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-[#f9f9f9] animate-fadeIn">
            {/* Enlaces de navegación */}
            <nav>
              <NavLink
                to="/dashboard"
                className={mobileLinkClass}
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/portfolios"
                className={mobileLinkClass}
                onClick={() => setIsMenuOpen(false)}
              >
                Portafolios
              </NavLink>
              <NavLink
                to="/market"
                className={mobileLinkClass}
                onClick={() => setIsMenuOpen(false)}
              >
                Market
              </NavLink>
              <NavLink
                to="/profile"
                className={mobileLinkClass}
                onClick={() => setIsMenuOpen(false)}
              >
                Profile
              </NavLink>
              {isAdmin && (
                <NavLink
                  to="/admin"
                  className={mobileLinkClass}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Admin
                </NavLink>
              )}
            </nav>

            {/* Info de usuario + logout */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-300 bg-slate-50">
              <div className="flex items-center gap-3">
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
              </div>

              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  logout();
                }}
                className="border border-slate-400 bg-white px-3 py-1.5 text-xs font-medium tracking-wider uppercase transition-colors duration-150 hover:bg-black hover:text-white"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        )}
      </header>

      {/* 2. CONTENEDOR DINÁMICO DE LAS PÁGINAS */}
      <main className="flex-1 p-6 md:p-10 max-w-7xl w-full mx-auto">
        {/* En este espacio React Router inyectará DashboardPage, portfolioPage, etc */}
        <Outlet />
      </main>
    </div>
  );
}
