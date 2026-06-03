import { useState, useEffect, useMemo } from "react";
import { getAssetsByPortfolio } from "../services/assets";
import { getPortfoliosByUser } from "../services/portfolios";

/**
 * Hook para cargar y calcular métricas de una cartera específica.
 *
 * @param {string} portfolioId - ID único de la cartera a cargar
 * @param {object} user - Objeto de usuario autenticado (debe contener `id`)
 * @returns {{ portfolioName: string, assets: Array, metrics: object, isLoading: boolean, isSyncing: boolean, handleSyncPrices: Function }}
 */

export function usePortfolioDetail(portfolioId, user) {
  // === ESTADOS ===
  const [portfolioName, setPortfolioName] = useState("Cargando...");
  const [assets, setAssets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // === CARGA DE DATOS Y LÓGICA DE NEGOCIO ===
  async function loadData() {
    // Si falta ID de cartera o usuario, detenemos la carga para evitar errores
    if (!portfolioId || !user?.id) return;
    try {
      setIsLoading(true);

      // 1. Obtener assets
      const assetsData = await getAssetsByPortfolio(portfolioId);

      // 2. Procesar assets (Lógica financiera + Simulación temporal)
      const processedAssets = assetsData.map((asset) => {
        const buyPrice = parseFloat(asset.buy_price) || 0;
        let currentPrice = parseFloat(asset.last_value) || 0;

        // Simulación de oscilación si no hay API externa conectada
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

      // 3. Buscar nombre de la cartera en la lista del usuario
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
  useEffect(() => {
    loadData();
  }, [portfolioId, user]);

  // Función pública para que otros hooks (useAssetsCRUD) puedan refrescar la lista
  const refreshAssets = () => loadData();

  // === INTERACCIONES / ACCIONES ===

  // Botón de sincronización (simulación)
  const handleSyncPrices = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      alert(
        "Precios actualizados con la API del mercado de Madrid (Simulado). En el siguiente frente conectaremos el cliente EODHD real.",
      );
    }, 1200);
  };

  // === CÁLCULOS ECONÓMICOS ===
  // Memorizamos los cálculos para evitar recálculos innecesarios en renders de UI
  const metrics = useMemo(() => {
    const globalMetrics = assets.reduce(
      (acc, asset) => {
        // Si algún valor es 0, se ignora (assets en watchlist)
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

    // Rendimiento Total
    const globalProfit =
      globalMetrics.totalMarketValue - globalMetrics.totalCost;
    // Rendimiento Total en porcentaje
    const globalProfitP =
      globalMetrics.totalCost > 0
        ? (globalProfit / globalMetrics.totalCost) * 100
        : 0;

    return {
      totalMarketValue: globalMetrics.totalMarketValue,
      globalProfit,
      globalProfitP,
    };
  }, [assets]);

  // === API PÚBLICA DEL HOOK ===
  return {
    portfolioName,
    assets,
    metrics,
    isLoading,
    isSyncing,
    handleSyncPrices,
    refreshAssets,
  };
}
