import { fetchSupabase } from "./supabaseClient";

/**
 * 1. OBTENER CARTERAS DEL USUARIO
 * Endpoint Supabase: GET /rest/v1/portfolios?user_id=eq.{userId}&Select=*
 */
export async function getPortfoliosByUser(userId) {
  if (!userId) return [];
  // Se filtra por la columna user_id que sea igual (eq) al ID del usuario
  return await fetchSupabase(
    `/rest/v1/portfolios?user_id=eq.${userId}&select=*`,
    {
      method: "GET",
    },
  );
}

/**
 * 2. CREAR NUEVO PORTFOLIO
 * Endpoint Supabase: POST /rest/v1/portfolios
 */
export async function createPortfolio(userId, name) {
  return await fetchSupabase("/rest/v1/portfolios", {
    method: "POST",
    body: JSON.stringify({
      name: name,
      user_id: userId, // Columna relacional FK -> users.id
    }),
  });
}

/**
 * 3. ACTUALIZAR NOMBRE DE UN PORTFOLIO
 * Endpoint Supabase: PATCH /rest/v1/portfolios?id=eq.{portfolioId}
 */
export async function updatePortfolioName(portfolioId, newName) {
  return await fetchSupabase(`/rest/v1/portfolios?id=eq.${portfolioId}`, {
    method: "PATCH",
    body: JSON.stringify({
      name: newName,
    }),
  });
}

/**
 * 4. ELIMINAR UN PORTFOLIO
 * Endpoint Supabase: DELETE /rest/v1/portfolios?id=eq.{portfoliosId}
 * Borrado en cascada
 */
export async function deletePortfolio(portfolioId) {
  return await fetchSupabase(`/rest/v1/portfolios?id=eq.{portfoliosId}`, {
    method: "DELETE",
  });
}
