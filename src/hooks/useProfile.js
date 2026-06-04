import { useState } from "react";
import { updateUserName, deleteUserAccount } from "../services/users";

/**
 * Hook para la página de perfil.
 * Responsabilidades: editar nombre + eliminar cuenta.
 *
 * @param {object} user - Usuario del AuthContext
 * @param {Function} logout - Función de cierre de sesión del AuthContext
 * @returns {{ name, setName, isSaving, handleSaveName, handleDeleteAccount }}
 */
export function useProfile(user, logout) {
  const [name, setName] = useState(user?.name || "");
  const [isSaving, setIsSaving] = useState(false);

  // === GUARDAR NOMBRE ===
  const handleSaveName = async () => {
    const trimmed = name.trim();
    if (!trimmed || trimmed === user?.name) return;

    try {
      setIsSaving(true);
      await updateUserName(user.id, trimmed);
      alert("Nombre actualizado correctamente.");
      // Nota: el AuthContext no se refresca automáticamente.
      // En la siguiente sesión se verá el cambio, o puedes forzar un reload.
      window.location.reload();
    } catch (err) {
      console.error("Error al actualizar el nombre:", err);
      alert("No se pudo actualizar el nombre.");
    } finally {
      setIsSaving(false);
    }
  };

  // === ELIMINAR CUENTA ===
  const handleDeleteAccount = async () => {
    const confirmed = confirm(
      "⚠️ Esta acción es permanente e irreversible.\nSe eliminarán todos tus portfolios, activos y datos de cuenta.\n\n¿Estás seguro?",
    );
    if (!confirmed) return;

    try {
      // Llama al servicio
      await deleteUserAccount(user.id);
      // Cierra la sesión en el contexto (limpia el estado de user y borra el 'sb_token')
      await logout();
    } catch (err) {
      console.error("Error al eliminar la cuenta:", err);
      alert("No se pudo eliminar la cuenta.");
    }
  };

  return { name, setName, isSaving, handleSaveName, handleDeleteAccount };
}
