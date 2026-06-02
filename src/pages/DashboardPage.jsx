import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getPortfoliosByUser } from "../services/portfolios";

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
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, [user]);

  const mockPortfolios = [
    {
      id: 1,
      name: "Tech Growth",
      lastSync: "26 may 2026, 14:32",
      assetsCount: 8,
      totalValue: "$ 78.200",
    },
    {
      id: 2,
      name: "Value Fund",
      lastSync: "25 may 2026, 09:15",
      assetsCount: 7,
      totalValue: "$ 41.600",
    },
    {
      id: 3,
      name: "LATAM Mix",
      lastSync: "24 may 2026, 18:47",
      assetsCount: 5,
      totalValue: "$ 15.400",
    },
    {
      id: 4,
      name: "Commodities",
      lastSync: "20 may 2026, 11:00",
      assetsCount: 3,
      totalValue: "$ 7.600",
    },
  ];

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
        {/* TARJETA 1: PORTFOLIOS */}
        <div className="border border-slate-300 bg-[#f9f9f9] p-6 shadow-sm relative">
          <div className="absolute top-4 right-4 w-3 h-3 border border-slate-400 bg-white"></div>
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Portfolios
          </span>
          <span className="block text-4xl font-medium text-black mt-4">
            {/* Temporal eliminación 
            {mockStats.portfoliosCount}
            */}
            {isLoading ? "..." : portfolios.length}
          </span>
          <span className="block text-[10px] text-slate-500 mt-1 uppercase tracking-wider">
            activos
          </span>
        </div>

        {/* TARJETA 2: TOTAL ACTIVOS */}
        {/* temporal por el momento */}
        <div className="border border-slate-300 bg-[#f9f9f9] p-6 shadow-sm relative">
          <div className="absolute top-4 right-4 w-3 h-3 border border-slate-400 bg-white"></div>
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Total Activos
          </span>
          <span className="block text-4xl font-medium text-black mt-4">
            {mockStats.totalAssets}
          </span>
          <span className="block text-[10px] text-slate-500 mt-1 uppercase tracking-wider">
            instrumentos
          </span>
        </div>

        {/* TARJETA 3: VALOR TOTAL */}
        {/* temporal por el momento */}
        <div className="border border-slate-300 bg-[#f9f9f9] p-6 shadow-sm relative">
          <div className="absolute top-4 right-4 w-3 h-3 border border-slate-400 bg-white"></div>
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Valor Total
          </span>
          <span className="block text-3xl font-bold text-black mt-4 tracking-tight">
            {mockStats.totalValue}
          </span>
          <span className="block text-[10px] text-slate-500 mt-2 uppercase tracking-wider">
            USD estimado
          </span>
        </div>
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
              No hay carteras creadas todavía. Ve a la sección de Portfolios
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
                {mockPortfolios.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-100/70 transition-colors"
                  >
                    <td className="p-4 font-bold text-black tracking-wide">
                      {item.name}
                    </td>
                    <td className="p-4 text-slate-600 font-mono">
                      {item.lastSync}
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
