import { useState, useEffect } from "react";
import {
  fetchExternalAssets,
  syncAssetsReference,
} from "../services/assetsReference";
import { getLastSync, logSync } from "../services/syncLog";
import { fetchSupabase } from "../services/supabaseClient";

/**
 * Hook para el panel de administración.
 * Orquesta: sincronización de catálogo EODHD → assets_reference + historial de sync_log.
 *
 * @param {object} user - Usuario admin del AuthContext
 * @returns {{ exchange, setExchange, isSyncing, syncResult, syncLogs, handleSync, isLoadingLogs }}
 */
export function useAdmin(user) {
  // === ESTADOS ===
  const [exchange, setExchange] = useState("MC");
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null); // { success, message, count }
  const [syncLogs, setSyncLogs] = useState([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);

  // === CARGA DEL HISTORIAL DE SINCRONIZACIONES ===
  async function loadSyncLogs() {
    try {
      setIsLoadingLogs(true);
      const data = await fetchSupabase(
        "/rest/v1/sync_log?order=last_sync_at.desc&limit=10",
        { method: "GET" },
      );
      setSyncLogs(data || []);
    } catch (err) {
      console.error("Error al cargar el historial de sincronización:", err);
    } finally {
      setIsLoadingLogs(false);
    }
  }

  useEffect(() => {
    loadSyncLogs();
  }, []);

  // === SINCRONIZACIÓN COMPLETA ===
  const handleSync = async () => {
    const trimmed = exchange.trim().toUpperCase();
    if (!trimmed) return;

    const confirmed = confirm(
      `¿Sincronizar el catálogo del mercado "${trimmed}" desde EODHD?\nEsto consumirá una petición de la API.`,
    );
    if (!confirmed) return;

    try {
      setIsSyncing(true);
      setSyncResult(null);

      // 1. Descargar activos desde EODHD
      const externalAssets = await fetchExternalAssets(trimmed);

      if (!externalAssets || externalAssets.length === 0) {
        setSyncResult({
          success: false,
          message: `No se encontraron activos para el mercado "${trimmed}".`,
          count: 0,
        });
        return;
      }

      // 2. Upsert en assets_reference (Supabase)
      await syncAssetsReference(externalAssets, trimmed);

      // 3. Registrar en sync_log
      await logSync(trimmed, user?.name || user?.email || "admin");

      setSyncResult({
        success: true,
        message: `Catálogo "${trimmed}" sincronizado correctamente.`,
        count: externalAssets.length,
      });

      // 4. Refrescar historial
      await loadSyncLogs();
    } catch (err) {
      console.error("Error en la sincronización:", err);
      setSyncResult({
        success: false,
        message: `Error al sincronizar: ${err.message}`,
        count: 0,
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    exchange,
    setExchange,
    isSyncing,
    syncResult,
    syncLogs,
    isLoadingLogs,
    handleSync,
  };
}
