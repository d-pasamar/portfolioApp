import { fetchSupabase } from "./supabaseClient";

// === CONFIGURACIÓN DE LA API EXTERNA ===
// Se leen las credenciales desde las variables de entorno de Vite (.env.local)
// NUNCA se hardcodean API keys en el código fuente
// const EODHD_BASE_URL = "https://eodhd.com/api";
const EODHD_BASE_URL = "/eodhd/api";
const EODHD_API_KEY = import.meta.env.VITE_EODHD_API_KEY;

// Tiempo mínimo entre actualizaciones del mismo activo.
// Evita gastar API calls por doble-clic o refrescos accidentales.
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos en milisegundos

/**
 * Cliente genérico para la API de EODHD (datos de mercado).
 *
 * Centraliza:
 * - Construcción de la URL con token y formato JSON
 * - Manejo de errores HTTP
 * - Punto único de salida hacia la API externa
 *
 * Dos consumidores principales:
 * 1. assetsReference.js → descarga del catálogo de un mercado (solo admins)
 * 2. Actualización de precios → precio actual de un activo concreto (usuarios)
 *
 * @param {string} endpoint - Ruta relativa del recurso (ej: "exchange-symbol-list/MC", "eod/SAN.MC")
 * @param {Object} params - Parámetros adicionales de query string (opcionales)
 * @returns {Promise<Object|Array>} - Respuesta JSON de EODHD
 */
export async function fetchEODHD(endpoint, params = {}) {
  // Se construyen los query params con el token y formato obligatorios
  const query = new URLSearchParams({
    api_token: EODHD_API_KEY,
    fmt: "json",
    ...params,
  });

  const response = await fetch(`${EODHD_BASE_URL}/${endpoint}?${query}`);

  if (!response.ok) {
    throw new Error(
      `[EODHD API Error] ${response.status} en el endpoint: ${endpoint}`,
    );
  }

  return response.json();
}

/**
 * Obtiene el precio en tiempo real de un activo desde EODHD.
 * Implementa caché de 24h: si el timestamp almacenado en Supabase es reciente,
 * devuelve el valor local sin gastar una petición a la API externa.
 *
 * Endpoint utilizado: GET /real-time/{code}.{exchange}
 * Respuesta de EODHD:
 *   { code, timestamp, open, high, low, close, volume, previousClose, change, change_p }
 *
 * Se persisten en Supabase: last_value, change, change_p y last_value_timestamp,
 * que coinciden con las columnas de la tabla `assets`.
 *
 * @param {object} asset - Objeto del activo (debe contener id, code, exchange, last_value, last_value_timestamp)
 * @returns {Promise<object>} - Datos de precio actualizados + flag fromCache
 */
export async function getLatestPrice(asset) {
  // === CACHÉ DE 5 MIN ===
  // Si el dato almacenado tiene menos de 24h, lo reutilizamos sin llamar a EODHD
  const now = Date.now();

  if (
    asset.last_value_timestamp &&
    now - asset.last_value_timestamp < CACHE_TTL
  ) {
    return {
      close: parseFloat(asset.last_value) || 0,
      change: parseFloat(asset.change) || 0,
      change_p: parseFloat(asset.change_p) || 0,
      timestamp: asset.last_value_timestamp,
      fromCache: true,
    };
  }

  // === LLAMADA A EODHD (real-time) ===
  // Devuelve: { close, change, change_p, timestamp, volume, open, high, low, previousClose }
  const data = await fetchEODHD(`real-time/${asset.code}.${asset.exchange}`);

  const close = parseFloat(data.close) || 0;
  const change = parseFloat(data.change) || 0;
  const changeP = parseFloat(data.change_p) || 0;
  // Se registra el momento exacto en que el usuario sincronizó
  const timestamp = Date.now();

  // === PERSISTENCIA EN SUPABASE ===
  // Se actualizan las 4 columnas de mercado en la tabla assets
  await fetchSupabase(`/rest/v1/assets?id=eq.${asset.id}`, {
    method: "PATCH",
    body: JSON.stringify({
      last_value: close,
      change: change,
      change_p: changeP,
      last_value_timestamp: timestamp,
    }),
  });

  return { close, change, change_p: changeP, timestamp, fromCache: false };
}

/**
 * Calcula cuántos activos necesitan actualización (no están en caché).
 * Se usa ANTES de sincronizar para mostrar la advertencia al usuario:
 * "Esta acción consumirá X llamadas a la API."
 *
 * No hace ninguna petición a EODHD, solo filtra por timestamp.
 *
 * @param {Array} assets - Lista de activos de la cartera
 * @returns {{ cached: number, stale: number }} - Cuántos están en caché vs cuántos necesitan llamada
 */
export function getSyncCost(assets) {
  const now = Date.now();

  let cached = 0;
  let stale = 0;

  assets.forEach((asset) => {
    // Los activos en watchlist (qty 0, precio 0) no se sincronizan
    if (asset.quantity === 0 && asset.buy_price === 0) return;

    if (
      asset.last_value_timestamp &&
      now - asset.last_value_timestamp < CACHE_TTL
    ) {
      cached++;
    } else {
      stale++;
    }
  });

  return { cached, stale };
}

/**
 * Actualiza los precios de múltiples activos en una sola petición a EODHD.
 *
 * Endpoint: GET /real-time/{primer_ticker}?s={resto_tickers_separados_por_comas}
 * Cada ticker consume 1 API call. EODHD recomienda máximo 15-20 tickers por petición.
 *
 * Proceso:
 * 1. Separa activos con caché válida (< 24h) de los que necesitan actualización
 * 2. Agrupa los activos sin caché en lotes de 15
 * 3. Hace una petición por lote al endpoint real-time
 * 4. Persiste los precios actualizados en Supabase
 * 5. Devuelve un resumen con los resultados
 *
 * @param {Array} assets - Lista de activos de la cartera (con id, code, exchange, last_value_timestamp)
 * @returns {Promise<object>} - { updated, fromCache, errors }
 */
export async function getLatestPricesBulk(assets) {
  const now = Date.now();

  // === PASO 1: SEPARAR CACHÉ VS ACTUALIZACIÓN ===
  const cachedAssets = [];
  const staleAssets = [];

  assets.forEach((asset) => {
    // Los activos en watchlist no se sincronizan
    if (asset.quantity === 0 && asset.buy_price === 0) return;

    if (
      asset.last_value_timestamp &&
      now - asset.last_value_timestamp < CACHE_TTL
    ) {
      cachedAssets.push(asset);
    } else {
      staleAssets.push(asset);
    }
  });

  // Si todos están en caché, no se hace ninguna llamada
  if (staleAssets.length === 0) {
    return { updated: 0, fromCache: cachedAssets.length, errors: 0 };
  }

  // === PASO 2: AGRUPAR EN LOTES DE 15 ===
  const BATCH_SIZE = 15;
  let totalUpdated = 0;
  let totalErrors = 0;

  for (let i = 0; i < staleAssets.length; i += BATCH_SIZE) {
    const batch = staleAssets.slice(i, i + BATCH_SIZE);

    // El primer ticker va en la URL, el resto en el parámetro `s`
    const firstTicker = `${batch[0].code}.${batch[0].exchange}`;
    const extraTickers = batch
      .slice(1)
      .map((a) => `${a.code}.${a.exchange}`)
      .join(",");

    try {
      // === PASO 3: PETICIÓN BULK A EODHD ===
      const params = {};
      if (extraTickers) {
        params.s = extraTickers;
      }

      const response = await fetchEODHD(`real-time/${firstTicker}`, params);

      // Si solo hay 1 ticker, EODHD devuelve un objeto; si hay varios, un array
      const dataArray = Array.isArray(response) ? response : [response];

      // === PASO 4: PERSISTIR EN SUPABASE ===
      for (const priceData of dataArray) {
        // Buscar el asset correspondiente por código
        const ticker = priceData.code; // viene como "SAN.MC"
        const matchedAsset = batch.find(
          (a) => `${a.code}.${a.exchange}` === ticker,
        );

        if (!matchedAsset) continue;

        const close = parseFloat(priceData.close) || 0;
        const change = parseFloat(priceData.change) || 0;
        const changeP = parseFloat(priceData.change_p) || 0;
        const timestamp = Date.now();

        try {
          await fetchSupabase(`/rest/v1/assets?id=eq.${matchedAsset.id}`, {
            method: "PATCH",
            body: JSON.stringify({
              last_value: close,
              change: change,
              change_p: changeP,
              last_value_timestamp: timestamp,
            }),
          });
          totalUpdated++;
        } catch (err) {
          console.error(
            `Error al persistir precio de ${matchedAsset.code}:`,
            err,
          );
          totalErrors++;
        }
      }
    } catch (err) {
      console.error(`Error en lote bulk (${firstTicker}):`, err);
      totalErrors += batch.length;
    }
  }

  return {
    updated: totalUpdated,
    fromCache: cachedAssets.length,
    errors: totalErrors,
  };
}

/**
 * Consulta el consumo actual de la API de EODHD.
 * Útil para el panel de administración y para la advertencia antes de sincronizar.
 * Devuelve cuántas peticiones se han usado hoy y el límite diario del plan.
 *
 * @returns {Promise<object>} - { apiRequests, dailyRateLimit } del plan actual
 */
export async function getApiUsage() {
  return fetchEODHD("user");
}
