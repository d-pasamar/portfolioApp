import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  getPortfoliosByUser,
  createPortfolio,
  updatePortfolioName,
  deletePortfolio,
} from "../services/portfolios";

export default function PortfoliosPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Estados de datos y UI
  const [portfolios, setPortfolios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeMenuId, setActiveMenuId] = useState(null); // Qué menú "⋮" está abierto

  const menuRef = useRef();

  // Cargar carteras al entrar
  useEffect(() => {
    loadPortfolios();
  }, [user]);

  // Cerrar menú contextual al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function loadPortfolios() {
    if (!user?.id) return;
    try {
      setIsLoading(true);
      const data = await getPortfoliosByUser(user.id);
      setPortfolios(data);
    } catch (err) {
      console.error("Error al cargar carteras:", err);
    } finally {
      setIsLoading(false);
    }
  }

  // OPERACIONES CRUD PORTAFOLIOS
  const handleCreate = async () => {
    const name = prompt("Introduce el nombre de la nueva cartera:");
    if (!name || !name.trim()) return;

    try {
      await createPortfolio(user.id, name.trim());
      await loadPortfolios();
    } catch (err) {
      alert("No se pudo crear la cartera.");
    }
  };

  const handleRename = async (portfolio, e) => {
    e.stopPropagation();
    setActiveMenuId(null);

    const newName = prompt(
      `Cambiar nombre para "${portfolio.name}":`,
      portfolio.name,
    );
    if (!newName || !newName.trim() || newName.trim() === portfolio.name)
      return;

    try {
      await updatePortfolioName(portfolio.id, newName.trim());
      await loadPortfolios();
    } catch (err) {
      alert("No se pudo renombrar la cartera.");
    }
  };

  const handleDelete = async (portfolio, e) => {
    e.stopPropagation();
    setActiveMenuId(null);

    if (portfolios.length <= 1) {
      alert("No puedes eliminar tu última cartera. Crea otra primero.");
      return;
    }

    if (
      !confirm(
        `¿Estás seguro de que quieres eliminar "${portfolio.name}" de forma permanente?`,
      )
    ) {
      return;
    }

    try {
      await deletePortfolio(portfolio.id);
      await loadPortfolios();
    } catch (err) {
      alert("No se pudo eliminar la cartera.");
    }
  };

  return (
    <div className="space-y-10 font-mono select-none animate-fadeIn">
      {/* CABECERA */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-black">
            Mis Carteras
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Gestiona tus portafolios de inversión de forma individual
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="border border-black bg-black text-white text-xs px-4 py-2 font-bold tracking-wider uppercase transition-colors hover:bg-white hover:text-black cursor-pointer"
        >
          + Nueva Cartera
        </button>
      </div>

      {/* REJILLA DE CARTERAS */}
      {isLoading ? (
        <div className="text-xs text-slate-500">Cargando portafolios...</div>
      ) : portfolios.length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-500 border border-slate-300 bg-[#f9f9f9] shadow-sm">
          No tienes carteras asociadas. ¡Crea una nueva arriba a la derecha!
        </div>
      ) : (
        <div
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          ref={menuRef}
        >
          {portfolios.map((portfolio) => {
            const isMenuOpen = activeMenuId === portfolio.id;

            return (
              <div
                key={portfolio.id}
                className="border border-slate-300 bg-[#f9f9f9] p-6 shadow-sm relative transition-all duration-200 hover:border-slate-500 flex flex-col justify-between h-48"
              >
                {/* BOTÓN CONTEXTUAL DE TRES PUNTOS VERTICALES */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMenuId(isMenuOpen ? null : portfolio.id);
                  }}
                  className="absolute top-4 right-4 text-slate-400 hover:text-black font-bold p-1 text-base leading-none cursor-pointer select-none"
                >
                  &#8942;{" "}
                  {/* Carácter unicode para tres puntos en vertical (⋮) */}
                </button>

                {/* MENÚ DROPDOWN FLOTANTE */}
                {isMenuOpen && (
                  <div className="absolute right-4 top-10 w-36 bg-white border border-slate-300 shadow-md z-10 text-[11px] divide-y divide-slate-100 animate-fadeIn">
                    <button
                      onClick={(e) => handleRename(portfolio, e)}
                      className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-100 uppercase font-bold tracking-wide"
                    >
                      Renombrar
                    </button>
                    <button
                      onClick={(e) => handleDelete(portfolio, e)}
                      className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 uppercase font-bold tracking-wide"
                    >
                      Eliminar
                    </button>
                  </div>
                )}

                {/* CONTENIDO DE LA TARJETA */}
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Portafolio
                  </span>
                  <span className="block text-xl font-bold text-black mt-2 truncate pr-6">
                    {portfolio.name}
                  </span>
                </div>

                {/* BASE DE LA TARJETA CON FECHA Y BOTÓN DE ENTRADA */}
                <div className="flex items-center justify-between border-t border-slate-200 pt-4 mt-auto">
                  <span className="text-[10px] text-slate-400 uppercase">
                    {portfolio.created_at
                      ? new Date(portfolio.created_at).toLocaleDateString(
                          "es-ES",
                        )
                      : "-"}
                  </span>
                  <button
                    onClick={() => navigate(`/portfolios/${portfolio.id}`)}
                    className="text-[10px] font-bold uppercase tracking-wider text-black hover:underline cursor-pointer"
                  >
                    Ver activos →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
