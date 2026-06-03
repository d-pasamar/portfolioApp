import { fetchSupabase } from "./supabaseClient";

/**
 * Servicio para gestionar el registro de sincronizaciones (tabla `sync_log`).
 *
 * Cada vez que un administrador sincroniza el catálogo de activos desde EODHD,
 * se deja constancia de quién lo hizo, cuándo y de qué mercado.
 *
 * Dos funciones:
 * - getLastSync()       → consulta el último registro (lectura)
 * - logSync()           → inserta un registro nuevo tras sincronizar (escritura)
 *
 * Columnas de la tabla `sync_log`:
 *   id (uuid) | market (text) | performed_by (text) | last_sync_at (timestamp)
 */

/**
 * Obtiene el registro más reciente de sincronización desde Supabase.
 * Útil para mostrar en el panel de admin: "Última sincronización: 3 jun 2026 por admin@correo.com"
 *
 * Se ordena por `last_sync_at` descendente y se limita a 1 resultado.
 * Si no hay registros (primera vez), devuelve null.
 *
 * @returns {Promise<Object|null>} - El objeto SyncLog más reciente o null
 */
export async function getLastSync() {
  try {
    const data = await fetchSupabase(
      "/rest/v1/sync_log?order=last_sync_at.desc&limit=1",
      {
        method: "GET",
      },
    );

    // Supabase devuelve un array → extraemos el primer registro
    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error("Error al obtener el último sync log:", error);
    return null;
  }
}

/**
 * Registra una nueva sincronización en la tabla `sync_log`.
 * Se llama DESPUÉS de que `syncAssetsReference` termine con éxito,
 * para dejar constancia de la operación.
 *
 * @param {string} market - Código del mercado sincronizado (ej: "MC", "US")
 * @param {string} performedBy - Nombre o email del administrador que ejecutó la sincronización
 * @returns {Promise<Object>} - El registro creado en Supabase
 */
export async function logSync(market, performedBy) {
  return await fetchSupabase("/rest/v1/sync_log", {
    method: "POST",
    headers: {
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      market: market,
      performed_by: performedBy,
      last_sync_at: new Date().toISOString(),
    }),
  });
}
