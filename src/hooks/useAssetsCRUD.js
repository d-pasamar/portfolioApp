import { useState } from "react";
import { updateAsset, deleteAsset } from "../services/assets";

/**
 * Hook para las operaciones CRUD de assets dentro de una cartera.
 * Separado de usePortfolioDetail para respetar responsabilidad única:
 * - usePortfolioDetail → lectura y cálculos
 * - useAssetsCRUD → escritura y efectos secundarios
 *
 * @param {Function} refreshAssets - Callback del hook de detalle para refrescar la lista tras cada operación
 * @returns {{ handleEditAsset: Function, handleDeleteAsset: Function, isUpdating: boolean }}
 */
export function useAssetsCRUD(refreshAssets) {
  // === ESTADOS ===
  // Control de carga durante operaciones de escritura (editar/eliminar)
  const [isUpdating, setIsUpdating] = useState(false);

  // === OPERACIONES CRUD ===

  /**
   * Editar un asset existente (cantidad, precio de compra, notas, etc.)
   * Recibe el asset completo para poder mostrar su nombre en la UI,
   * y un objeto con los campos a actualizar.
   * @param {string} assetId - ID del asset a modificar
   * @param {object} fieldsToUpdate - Campos a enviar al PATCH de Supabase
   */
  const handleEditAsset = async (assetId, fieldsToUpdate) => {
    if (!assetId || !fieldsToUpdate) return;

    try {
      setIsUpdating(true);
      await updateAsset(assetId, fieldsToUpdate);

      // Tras la edición, se refresca la lista para reflejar los cambios en la UI
      await refreshAssets();
    } catch (err) {
      console.error("Error al actualizar el activo:", err);
      alert("No se pudo actualizar el activo.");
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Eliminar un asset de la cartera.
   * Devuelve true/false para que el componente sepa si la operación fue exitosa.
   * @param {string} assetId - ID del asset a eliminar
   */
  const handleDeleteAsset = async (assetId) => {
    if (!assetId) return false;

    try {
      setIsUpdating(true);
      await deleteAsset(assetId);

      // Refrescamos la lista para que la fila desaparezca de la tabla
      await refreshAssets();
      return true;
    } catch (err) {
      console.error("Error al eliminar el activo:", err);
      alert("No se pudo eliminar el activo.");
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  // === API PÚBLICA DEL HOOK ===
  return {
    handleEditAsset,
    handleDeleteAsset,
    isUpdating,
  };
}
