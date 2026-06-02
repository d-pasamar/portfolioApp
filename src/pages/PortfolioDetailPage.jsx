import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getAssetsByPortfolio } from "../services/assets";
import { getPortfoliosByUser } from "../services/portfolios";

export default function PortfolioDetailPage() {
  const { id: portfolioId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Estados
  const [portfolioName, setPortfolioName] = useState("Cargando...");
  const [assets, setAssets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!portfolioId || !user?.id) return;
      try {
        setIsLoading(true);

        // 1. Traer los activos reales de la base de datos
        const assetsData = await getAssetsByPortfolio(portfolioId);

        // 2. Procesar los activos con la lógica financiera
        const processedAssets = assetsData.map((asset) => {
          const buyPrice = parseFloat(asset.buy_price) || 0;
          let currentPrice = parseFloat(asset.last_value) || 0;

          // SIMULACIÓN TEMPORAL: Si el precio actual es igual al de compra (porque aún no se ha
          // conectado la API externa de EODHD), simulamos una pequeña oscilación para probar los colores.
          if (currentPrice === buyPrice && buyPrice > 0) {
            const mockVariation = 1 + Math.sin(asset.code.charCodeAt(0)) * 0.12;
            currentPrice = buyPrice * mockVariation;
          }

          return {
            ...asset,
            buy_price: buyPrice,
            current_price: currentPrice,
          };
        });

        setAssets(processedAssets);

        // 3. Obtener el nombre de la cartera
        const portfolios = await getPortfoliosByUser(user.id);
        const current = portfolios.find((p) => p.id === portfolioId);
        if (current) {
          setPortfolioName(current.name);
        }
      } catch (err) {
        console.error("Error al cargar detalle de cartera:", err);
        setPortfolioName("Error al cargar");
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [portfolioId, user]);

  // Simulador visual del botón de actualización bajo demanda
  const handleSyncPrices = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      alert(
        "Precios actualizados con la API del mercado de Madrid (Simulado). En el siguiente frente conectaremos el cliente EODHD real.",
      );
    }, 1200);
  };

  // 4. CÁLCULOS MACROECONÓMICOS DE LA CARTERA (Ignora los activos de seguimiento)
  const globalMetrics = assets.reduce(
    (acc, asset) => {
      if (asset.quantity > 0 && asset.buy_price > 0) {
        const cost = asset.quantity * asset.buy_price;
        const marketValue = asset.quantity * asset.current_price;
        acc.totalCost += cost;
        acc.totalMarketValue += marketValue;
      }
      return acc;
    },
    { totalCost: 0, totalMarketValue: 0 },
  );

  const globalProfit = globalMetrics.totalMarketValue - globalMetrics.totalCost;
  const globalProfitP =
    globalMetrics.totalCost > 0
      ? (globalProfit / globalMetrics.totalCost) * 100
      : 0;

  return (
    <div className="space-y-10 font-mono select-none animate-fadeIn">
      {/* CABECERA */}
      <div className="border-b border-slate-200 pb-6 space-y-4">
        <button
          onClick={() => navigate("/portfolios")}
          className="text-xs text-slate-400 hover:text-black transition-colors cursor-pointer"
        >
          ← Volver a mis carteras
        </button>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-black">
              {portfolioName}
            </h1>
          </div>
          <button
            onClick={handleSyncPrices}
            disabled={isSyncing || isLoading}
            className={`border border-black text-xs px-4 py-2 font-bold tracking-wider uppercase transition-all duration-150 cursor-pointer ${
              isSyncing
                ? "bg-slate-200 text-slate-400 border-slate-300"
                : "bg-white text-black hover:bg-black hover:text-white"
            }`}
          >
            {isSyncing ? "🔄 Sincronizando..." : "🔄 Sincronizar Precios"}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-xs text-slate-500">
          Calculando analíticas financieras...
        </div>
      ) : assets.length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-500 border border-slate-300 bg-[#f9f9f9] shadow-sm">
          Esta cartera está vacía. Ve a la sección de Mercado para añadir tus
          primeras acciones o activos de seguimiento.
        </div>
      ) : (
        <>
          {/* TARJETAS DE RESUMEN GLOBAL (Estilo StatCard Industrial) */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="border border-slate-300 bg-[#f9f9f9] p-6 shadow-sm relative">
              <div className="absolute top-4 right-4 w-3 h-3 border border-slate-400 bg-white"></div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Valor Total de Mercado
              </span>
              <span className="block text-3xl font-bold text-black mt-4">
                {globalMetrics.totalMarketValue.toLocaleString("es-ES", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                EUR
              </span>
            </div>

            <div className="border border-slate-300 bg-[#f9f9f9] p-6 shadow-sm relative">
              <div className="absolute top-4 right-4 w-3 h-3 border border-slate-400 bg-white"></div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Rendimiento Estimado
              </span>
              <span
                className={`block text-3xl font-bold mt-4 ${globalProfit >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                {globalProfit >= 0 ? "+" : ""}
                {globalProfit.toLocaleString("es-ES", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                EUR
                <span className="text-lg font-medium ml-2">
                  ({globalProfit >= 0 ? "+" : ""}
                  {globalProfitP.toFixed(2)}%)
                </span>
              </span>
            </div>
          </div>

          {/* TABLA FINANCIERA */}
          <div className="border border-slate-300 bg-[#f9f9f9] overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-300 bg-slate-100 text-slate-500 uppercase tracking-wider text-[10px]">
                  <th className="p-4 font-bold tracking-wider">Ticker</th>
                  <th className="p-4 font-bold tracking-wider">Nombre</th>
                  <th className="p-4 font-bold tracking-wider text-center">
                    Cantidad
                  </th>
                  <th className="p-4 font-bold tracking-wider text-right">
                    P. Compra
                  </th>
                  <th className="p-4 font-bold tracking-wider text-right">
                    P. Actual
                  </th>
                  <th className="p-4 font-bold tracking-wider text-right">
                    Total Mercado
                  </th>
                  <th className="p-4 font-bold tracking-wider text-center">
                    Rendimiento
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {assets.map((asset) => {
                  // Verificamos si es una acción de seguimiento (Watchlist)
                  const isWatchlist =
                    asset.quantity === 0 || asset.buy_price === 0;

                  const totalCost = asset.quantity * asset.buy_price;
                  const totalMarket = asset.quantity * asset.current_price;
                  const profit = totalMarket - totalCost;
                  const profitP =
                    totalCost > 0 ? (profit / totalCost) * 100 : 0;

                  return (
                    <tr
                      key={asset.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      {/* Ticker + Mercado (Exchange) */}
                      <td className="p-4 font-mono tracking-wider">
                        <span className="font-bold text-black text-sm">
                          {asset.code}
                        </span>
                        {asset.exchange && (
                          <span className="ml-2 text-[10px] text-slate-400 font-bold bg-slate-100 px-1 py-0.5 border border-slate-200">
                            {asset.exchange}
                          </span>
                        )}
                      </td>

                      {/* Nombre */}
                      <td className="p-4 text-slate-600 font-medium">
                        {asset.name}
                      </td>

                      {/* Cantidad */}
                      <td className="p-4 text-center font-mono text-slate-700 font-semibold">
                        {isWatchlist ? (
                          <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 font-bold uppercase tracking-wider">
                            Vigilando
                          </span>
                        ) : (
                          asset.quantity
                        )}
                      </td>

                      {/* Precio de Compra */}
                      <td className="p-4 text-right font-mono text-slate-500">
                        {isWatchlist
                          ? "-"
                          : `${asset.buy_price.toLocaleString("es-ES", { minimumFractionDigits: 2 })} ${asset.currency}`}
                      </td>

                      {/* Precio Actual de Mercado */}
                      <td className="p-4 text-right font-mono text-slate-700 font-medium">
                        {asset.current_price.toLocaleString("es-ES", {
                          minimumFractionDigits: 2,
                        })}{" "}
                        {asset.currency}
                      </td>

                      {/* Capital Actual en Mercado */}
                      <td className="p-4 text-right font-bold text-black font-mono">
                        {isWatchlist
                          ? "-"
                          : `${totalMarket.toLocaleString("es-ES", { minimumFractionDigits: 2 })} ${asset.currency}`}
                      </td>

                      {/* Celda de Rendimiento Individual */}
                      <td
                        className={`p-4 text-center font-bold font-mono text-[11px] ${
                          isWatchlist
                            ? "bg-slate-50 text-slate-400 font-normal"
                            : profit >= 0
                              ? "bg-green-50 text-green-700"
                              : "bg-red-50 text-red-700"
                        }`}
                      >
                        {isWatchlist
                          ? "SEGUIMIENTO"
                          : `${profit >= 0 ? "▲" : "▼"} ${profitP.toFixed(2)}%`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
