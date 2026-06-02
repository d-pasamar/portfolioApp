import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getPortfoliosByUser } from "../services/portfolios";
import StatCard from "../components/common/StatCard";

export default function DashboardPage() {
  const { user } = useAuth();

  // Estados para controlar los datos de la base de datos
  const [portfolios, setPortfolios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Fecha real
  const currentDate = new Date().toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  // DATOS MOCK
  const mockStats = {
    portfoliosCount: 4,
    totalAssets: 23,
    totalValue: "$ 142.800",
  };

  useEffect(() => {
    async function loadDashboardData() {
      if (!user?.id) return;

      try {
        setIsLoading(true);
        setErrorMsg("");

        // Petición a Supabase
        const data = await getPortfoliosByUser(user.id);
        setPortfolios(data);
      } catch (err) {
        console.error("Error al cargar los datos del dashboard:", err);
        setErrorMsg("No se pudieron cargar tus carteras.");
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, [user]);

  return (
    <div className="space-y-10 font-mono select-none animate-fadeIn">
      {/* CABECERA DE LA PÁGINA */}
      <div className="flex items-baseline gap-4 border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-black">
          Dashboard
        </h1>
        <span className="text-xs text-slate-400 tracking-wider uppercase">
          {currentDate}
        </span>
      </div>

      {/* 1. FILA DE TARJETAS DE MÉTRICAS */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <StatCard
          title="Portafolios"
          value={portfolios.length}
          subtext="activos"
          isLoading={isLoading}
        />
        <StatCard
          title="Total Activos"
          value={mockStats.totalAssets}
          subtext="instrumentos"
          isLoading={isLoading}
        />
        <StatCard
          title="Valor Total"
          value={mockStats.totalValue}
          subtext="USD estimado"
          isLoading={isLoading}
        />
      </div>

      {/* 2. SECCIÓN ÚLTIMAS ACTUALIZACIONES */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs text-slate-600 uppercase tracking-wider">
          <div className="w-3 h-3 border border-slate-400 bg-white"></div>
          <h2>Últimas actualizaciones</h2>
        </div>

        {/* Muestra errores si falla la API */}
        {errorMsg && (
          <div className="rounded border border-red-200 bg-red-50 p-4 text-xs text-red-600">
            {errorMsg}
          </div>
        )}

        <div className="border border-slate-300 bg-[#f9f9f9] overflow-hidden shadow-sm">
          {isLoading ? (
            <div className="p-8 text-center text-xs text-slate-500">
              Cargando carteras...
            </div>
          ) : portfolios.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500 bg-white">
              No hay carteras creadas todavía. Ve a la sección de Portafolios
              para empezar.
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-300 bg-slate-100 text-slate-500 uppercase tracking-wider text-[10px]">
                  <th className="p-4 font-bold tracking-wider">Portfolio</th>
                  <th className="p-4 font-bold tracking-wider">
                    Últ. Actualización
                  </th>
                  <th className="p-4 font-bold tracking-wider text-center">
                    Activos
                  </th>
                  <th className="p-4 font-bold tracking-wider text-right">
                    Valor Total
                  </th>
                  <th className="p-4 font-bold tracking-wider text-center">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-[#f9f9f9]">
                {portfolios.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-100/70 transition-colors"
                  >
                    <td className="p-4 font-bold text-black tracking-wide">
                      {item.name}
                    </td>
                    <td className="p-4 text-slate-600 font-mono">
                      {item.created_at
                        ? new Date(item.created_at).toLocaleDateString("es-ES")
                        : "Sin datos"}
                    </td>
                    <td className="p-4 text-center text-slate-600 font-medium">
                      {item.assetsCount}
                    </td>
                    <td className="p-4 text-right font-bold text-black">
                      {item.totalValue}
                    </td>
                    <td className="p-4 text-center">
                      <button className="border border-slate-300 bg-white px-3 py-1 text-[10px] font-bold tracking-widest uppercase transition-colors duration-150 hover:bg-black hover:text-white cursor-pointer">
                        Ver →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
