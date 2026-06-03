import { fetchSupabase } from "./supabaseClient";

// === CONFIGURACIÓN DE LA API EXTERNA ===
// Se leen las credenciales desde las variables de entorno de Vite (.env.local)
// NUNCA se hardcodean API keys en el código fuente
const EODHD_BASE_URL = "https://eodhd.com/api";
const EODHD_API_KEY = import.meta.env.VITE_EODHD_API_KEY;

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
  // === CACHÉ DE 24 HORAS ===
  // Si el dato almacenado tiene menos de 24h, lo reutilizamos sin llamar a EODHD
  const now = Date.now();
  const twentyFourHours = 24 * 60 * 60 * 1000;

  if (
    asset.last_value_timestamp &&
    now - asset.last_value_timestamp < twentyFourHours
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
  // EODHD devuelve timestamp en segundos → lo convertimos a milisegundos para JS
  const timestamp = (data.timestamp || 0) * 1000;

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
 * Consulta el consumo actual de la API de EODHD.
 * Útil para el panel de administración: muestra cuántas peticiones se han usado hoy.
 *
 * @returns {Promise<object>} - { apiRequests, dailyRateLimit } del plan actual
 */
export async function getApiUsage() {
  return fetchEODHD("user");
}
