import { fetchSupabase } from "./supabaseClient";
import { fetchEODHD } from "./eodhdClient";

/**
 * Servicio para gestionar el catálogo local de activos (tabla `assets_reference`).
 *
 * Dos tipos de consumidor:
 * - Usuarios normales → searchAssets() para buscar activos en el buscador de mercado
 * - Administradores   → fetchExternalAssets() + syncAssetsReference() para actualizar el catálogo
 *
 * Estrategia: los usuarios NUNCA llaman a EODHD directamente.
 * Buscan en `assets_reference` (Supabase), que un admin mantiene actualizado
 * mediante sincronización periódica con EODHD.
 */

// ============================================================
//  FUNCIONES PARA USUARIOS (búsqueda en catálogo local)
// ============================================================

/**
 * Busca activos en el catálogo local de Supabase (tabla `assets_reference`).
 * Filtra por nombre O código usando `ilike` (búsqueda parcial, case-insensitive).
 *
 * Ejemplo: searchAssets("sant") → encuentra "Banco Santander" (por nombre) y "SAN" (por código)
 *
 * @param {string} query - Término de búsqueda del usuario
 * @returns {Promise<Array>} - Lista de activos que coinciden con la búsqueda
 */
export async function searchAssets(query) {
  if (!query || query.trim().length === 0) return [];

  // Se codifica el término para manejar espacios y caracteres especiales
  const encoded = encodeURIComponent(`%${query.trim()}%`);

  // Supabase REST: `or` combina filtros con OR lógico
  // `ilike` es un LIKE case-insensitive de PostgreSQL
  return await fetchSupabase(
    `/rest/v1/assets_reference?or=(name.ilike.${encoded},code.ilike.${encoded})&order=name.asc&limit=30`,
    {
      method: "GET",
    },
  );
}

// ============================================================
//  FUNCIONES PARA ADMINISTRADORES (sincronización con EODHD)
// ============================================================

/**
 * Descarga la lista completa de activos de un mercado desde EODHD.
 * Endpoint: GET /exchange-symbol-list/{exchange}
 *
 * Solo la ejecutan administradores (protegido por `isAdmin` en la UI).
 * Devuelve el array crudo de EODHD con campos en PascalCase (Code, Name, Exchange...).
 *
 * @param {string} exchange - Código del mercado (ej: "MC" para Madrid, "US" para EEUU)
 * @returns {Promise<Array>} - Array de activos crudos de EODHD
 */
export async function fetchExternalAssets(exchange = "MC") {
  return fetchEODHD(`exchange-symbol-list/${exchange}`);
}

/**
 * Sincroniza el catálogo local con los datos descargados de EODHD.
 *
 * Proceso:
 * 1. Recibe el array crudo de EODHD (PascalCase: Code, Name, Exchange...)
 * 2. Normaliza cada activo al formato de la tabla `assets_reference` (lowercase)
 * 3. Hace upsert en Supabase: inserta nuevos y actualiza existentes
 *
 * Requiere un constraint UNIQUE en la tabla `assets_reference` sobre (code, exchange)
 * para que el upsert funcione correctamente con `on_conflict`.
 *
 * @param {Array} rawAssets - Activos crudos devueltos por fetchExternalAssets()
 * @param {string} exchange - Código del mercado (se usa como fallback si falta en los datos)
 * @returns {Promise<void>}
 */
export async function syncAssetsReference(rawAssets, exchange = "MC") {
  if (!rawAssets || rawAssets.length === 0) return;

  // === NORMALIZACIÓN ===
  // EODHD devuelve campos en PascalCase → los mapeamos a las columnas de Supabase (lowercase)
  const normalized = rawAssets.map((asset) => ({
    code: asset.Code,
    name: asset.Name,
    exchange: asset.Exchange || exchange,
    currency: asset.Currency || "EUR",
    type: asset.Type || "Common Stock",
    isin: asset.Isin || null,
    country: asset.Country || null,
  }));

  // === UPSERT EN LOTES ===
  // Supabase tiene límite de tamaño en las peticiones,
  // así que dividimos en bloques de 500 registros
  const BATCH_SIZE = 500;

  for (let i = 0; i < normalized.length; i += BATCH_SIZE) {
    const batch = normalized.slice(i, i + BATCH_SIZE);

    await fetchSupabase("/rest/v1/assets_reference", {
      method: "POST",
      headers: {
        // resolution=merge-duplicates → si ya existe (por code+exchange), actualiza los demás campos
        Prefer: "return=minimal,resolution=merge-duplicates",
      },
      body: JSON.stringify(batch),
    });
  }
}
