import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getPortfoliosByUser } from "../services/portfolios";
import { getAssetsByPortfolio } from "../services/assets";
import StatCard from "../components/common/StatCard";
import DashboardTableRow from "../components/common/DashboardTableRow";

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Estados para controlar los datos de la base de datos
  const [portfolios, setPortfolios] = useState([]);
  const [globalStats, setGlobalStats] = useState({
    totalAssetsCount: 0,
    totalValue: 0,
  });
  const [portfolioMetricsMap, setPortfolioMetricsMap] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Fecha real
  const currentDate = new Date().toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  // --- HELPER ---
  const formatEUR = (num) =>
    num.toLocaleString("es-ES", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  useEffect(() => {
    async function loadDashboardData() {
      if (!user?.id) return;

      try {
        setIsLoading(true);
        setErrorMsg("");

        // 1. Petición a Supabase
        const portfoliosData = await getPortfoliosByUser(user.id);
        setPortfolios(portfoliosData);

        // ---PETICIONES EN PARALELO CON PROMISE.ALL ---
        const assetsPromises = portfoliosData.map((p) =>
          getAssetsByPortfolio(p.id),
        );
        const allPortfoliosAssets = await Promise.all(assetsPromises);

        // 2. Para cada cartera, se traen los activos en paralelo
        let accumulatedAssetsCount = 0;
        let accumulatedTotalValue = 0;
        const metricsMap = {};

        portfoliosData.forEach((portfolio, index) => {
          const assetsData = allPortfoliosAssets[index] || [];

          // Calcular totales individuales de esta cartera concreta
          let portfolioValue = 0;
          let portfolioAssetsCount = assetsData.length;

          assetsData.forEach((asset) => {
            // Si es un activo comprado (quantity > 0), sumamos su valor de mercado actual
            if (asset.quantity > 0) {
              portfolioValue +=
                asset.quantity * (parseFloat(asset.last_value) || 0);
            }
          });

          // Guardamos las métricas calculadas asociadas al ID de la cartera
          metricsMap[portfolio.id] = {
            count: portfolioAssetsCount,
            value: portfolioValue,
          };

          // Sumamos al acumulado global de las tarjetas superiores
          accumulatedAssetsCount += portfolioAssetsCount;
          accumulatedTotalValue += portfolioValue;
        });

        // Guardamos los mapas de datos en los estados
        setPortfolioMetricsMap(metricsMap);
        setGlobalStats({
          totalAssetsCount: accumulatedAssetsCount,
          totalValue: accumulatedTotalValue,
        });
      } catch (err) {
        console.error("Error al cargar los datos del dashboard:", err);
        setErrorMsg("No se pudieron cargar tus carteras.");
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, [user?.id]);

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
          value={globalStats.totalAssetsCount}
          subtext="en seguimiento o propiedad"
          isLoading={isLoading}
        />
        <StatCard
          title="Valor Total"
          value={`${formatEUR(globalStats.totalValue)} EUR`}
          subtext="Capital estimado"
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
              Sincronizando hilos asíncronos en paralelo...
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
                  <DashboardTableRow
                    key={item.id}
                    portfolio={item}
                    metrics={portfolioMetricsMap[item.id]}
                    onNavigate={navigate}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
