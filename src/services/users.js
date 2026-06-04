import { fetchSupabase } from "./supabaseClient";

/**
 * Actualizar el nombre del usuario en public.users
 * Endpoint: PATCH /rest/v1/users?id=eq.{userId}
 */
export async function updateUserName(userId, newName) {
  return await fetchSupabase(`/rest/v1/users?id=eq.${userId}`, {
    method: "PATCH",
    body: JSON.stringify({ name: newName }),
  });
}

/**
 * Eliminar la cuenta del usuario.
 * Invoca la Edge Function "delete-account" que elimina al usuario de auth.users,
 * desencadenando el ON DELETE CASCADE en cascada para users, portfolios y assets.
 */
export async function deleteUserAccount() {
  // Ya no necesitas recibir el 'userId' como parámetro,
  // la Edge Function lo detecta automáticamente mediante el Token de autenticación.
  return await fetchSupabase(`/functions/v1/delete-account`, {
    method: "POST",
  });
}
