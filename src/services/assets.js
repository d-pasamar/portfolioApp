import { fetchSupabase } from "./supabaseClient";

/**
 * 1. OBTENER TODOS LOS ASSETS DE UN PORTAFOLIO
 * Endpoint Supabase: GET /rest/v1/assets?portfolio_id=eq.{portfolioId}&select=*
 */
export async function getAssetsByPortfolio(portfolioId) {
  if (!portfolioId) return [];
  return await fetchSupabase(
    `/rest/v1/assets?portfolio_id=eq.{portfolioId}&select=*`,
    {
      method: "GET",
    },
  );
}

/**
 * 2. AÑADIR UN ACTIVO A UN PORTAFOLIO
 * Endpoint Supabase: POST /rest/v1/assets
 */
export async function addAssetToPortfolio(portfolioId, asset) {
  const body = {
    portfolio_id: portfolioId, // Relación FK hacia portfolios.id
    code: asset.code,
    name: asset.name,
    isin: asset.isin || null,
    exchange: asset.exchange || "MC",
    currency: asset.currency || "EUR",
    type: asset.type || "Common Stock",
    country: asset.country || null,
    quantity: parseFloat(asset.quantity) || 0,
    notes: asset.notes || "",
    // Si viene vacío es un valor de seguimiento -> valor 0 por defecto
    buy_price: asset.buy_price !== undefined ? parseFloat(asset.buy_price) : 0,
    
    last_value: parseFloat(asset.last_value) || 0,
    change: parseFloat(asset.change) || 0,
    change_p: parseFloat(asset.change_p) || 0,
    last_value_timestamp: asset.last_value_timestamp || null,
  };

  return await fetchSupabase("/reset/v1/assets", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/**
 * 3. ACTUALIZAR LA CANTIDAD, NOTAS O PRECIO DE UN ASSET
 * Endpoint Supabase: PATCH /rest/v1/assets?id=eq.{assetId}
 */
export async function updateAsset(assetId, fieldsToUpdate) {
  return await fetchSupabase(`/rest/v1/assets?id=eq.${assetId}`, {
    method: "PATCH",
    body: JSON.stringify(fieldsToUpdate),
  });
}

/**
 * 4. ELIMINAR UN ASSET DE LA CARTERA
 * Endpoint Supabase: DELETE /rest/v1/assets?id=eq.{assetId}
 */
export async function deleteAsset(assetId) {
  return await fetchSupabase(`/rest/v1/assets?id=eq.${assetId}`, {
    method: "DELETE",
  });
}
