import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useDashboardData } from "../hooks/useDashboardData";
import { formatEUR, formatDateShort } from "../utils/format";
import StatCard from "../components/common/StatCard";
import DashboardTableRow from "../components/dashboard/DashboardTableRow";

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { portfolios, globalStats, portfolioMetricsMap, isLoading, errorMsg } =
    useDashboardData(user?.id);

  return (
    <div className="space-y-10 font-mono select-none animate-fadeIn">
      {/* CABECERA DE LA PÁGINA */}
      <div className="flex items-baseline gap-4 border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-black">
          Dashboard
        </h1>
        <span className="text-xs text-slate-400 tracking-wider uppercase">
          {formatDateShort()}
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

        <div className="border border-slate-300 bg-[#f9f9f9] overflow-x-auto shadow-sm">
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
