import { useState, useEffect } from "react";
import { getPortfoliosByUser } from "../services/portfolios";
import { getAssetsByPortfolio } from "../services/assets";

/**
 * Hook personalizado para el Dashboard.
 * Encapsula: peticiones a Supabase, cálculo de métricas y estados de carga/error.
 */
export function useDashboardData(userId) {
  const [portfolios, setPortfolios] = useState([]);
  const [globalStats, setGlobalStats] = useState({
    totalAssetsCount: 0,
    totalValue: 0,
  });
  const [portfolioMetricsMap, setPortfolioMetricsMap] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!userId) return;

    async function loadDashboardData() {
      try {
        setIsLoading(true);
        setErrorMsg("");

        // 1. Obtener carteras del usuario
        const portfoliosData = await getPortfoliosByUser(userId);

        // 2. Obtener activos de todas las carteras en paralelo
        const allPortfoliosAssets = await Promise.all(
          portfoliosData.map((p) => getAssetsByPortfolio(p.id)),
        );

        // 3. Calcular métricas por cartera y acumulados globales
        let accumulatedAssetsCount = 0;
        let accumulatedTotalValue = 0;
        const metricsMap = {};

        portfoliosData.forEach((portfolio, index) => {
          const assetsData = allPortfoliosAssets[index] || [];

          let portfolioValue = 0;

          assetsData.forEach((asset) => {
            if (asset.quantity > 0) {
              portfolioValue +=
                asset.quantity * (parseFloat(asset.last_value) || 0);
            }
          });

          metricsMap[portfolio.id] = {
            count: assetsData.length,
            value: portfolioValue,
          };

          accumulatedAssetsCount += assetsData.length;
          accumulatedTotalValue += portfolioValue;
        });

        // 4. Todos los setState juntos -> Se agrupan en un solo render
        setPortfolios(portfoliosData);
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
  }, [userId]);

  return { portfolios, globalStats, portfolioMetricsMap, isLoading, errorMsg };
}
