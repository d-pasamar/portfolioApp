import { useState, useEffect, useMemo } from "react";
import { getAssetsByPortfolio } from "../services/assets";
import { getPortfoliosByUser } from "../services/portfolios";
import {
  getSyncCost,
  getLatestPricesBulk,
  getLatestPrice,
} from "../services/eodhdClient";

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
  const handleSyncPrices = async () => {
    // 1. Calcular coste antes de gastar
    const { stale } = getSyncCost(assets);

    if (stale === 0) {
      alert("Todos los precios están actualizados.");
      return;
    }

    // 2. Advertencia al usuario
    const confirmed = confirm(
      `Se consumirán ${stale} llamadas a la API de EODHD. ¿Continuar?`,
    );
    if (!confirmed) return;

    // 3. Sincronización real
    try {
      setIsSyncing(true);
      const result = await getLatestPricesBulk(assets);
      await loadData();
      // Notificar al navbar para que actualice el contador de API calls
      window.dispatchEvent(new Event("eodhd-sync"));
      alert(
        `Sincronización completada: ${result.updated} actualizados, ${result.fromCache} en caché, ${result.errors} errores.`,
      );
    } catch (err) {
      console.error("Error al sincronizar precios:", err);
      alert("Error al sincronizar los precios.");
    } finally {
      setIsSyncing(false);
    }
  };

  // Sincronización individual de un solo activo (botón 🔄 por fila)
  const handleSyncSingleAsset = async (assetId) => {
    const asset = assets.find((a) => a.id === assetId);
    if (!asset) return;

    try {
      await getLatestPrice(asset);
      await loadData();
      window.dispatchEvent(new Event("eodhd-sync"));
    } catch (err) {
      console.error(`Error al sincronizar ${asset.code}:`, err);
      alert(`No se pudo actualizar el precio de ${asset.code}.`);
    }
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

        // Guardamos el timestamp más reciente de todos los activos
        if (asset.last_value_timestamp > (acc.lastSyncAt || 0)) {
          acc.lastSyncAt = asset.last_value_timestamp;
        }
        return acc;
      },
      { totalCost: 0, totalMarketValue: 0, lastSyncAt: 0 },
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
      lastSyncAt: globalMetrics.lastSyncAt,
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
    handleSyncSingleAsset,
    refreshAssets,
  };
}
