import AssetRow from "./AssetRow";

/**
 * Tabla financiera de activos de una cartera.
 * Renderiza el thead con las columnas y delega cada fila a AssetRow.
 *
 * @param {Array} assets - Lista de activos procesados por usePortfolioDetail
 * @param {Function} onEdit - Callback de useAssetsCRUD → handleEditAsset
 * @param {Function} onDelete - Callback de useAssetsCRUD → handleDeleteAsset
 * @param {boolean} isUpdating - Estado de carga durante operaciones CRUD
 */
export default function AssetsTable({
  assets,
  onEdit,
  onDelete,
  onSyncAsset,
  isUpdating,
}) {
  return (
    <div className="border border-slate-300 bg-[#f9f9f9] overflow-x-auto shadow-sm">
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="border-b border-slate-300 bg-slate-100 text-slate-500 uppercase tracking-wider text-[10px]">
            <th className="p-4 font-bold tracking-wider">Ticker</th>
            <th className="p-4 font-bold tracking-wider">Nombre</th>
            <th className="p-4 font-bold tracking-wider text-center">
              Cantidad
            </th>
            <th className="p-4 font-bold tracking-wider text-right">
              P. Compra
            </th>
            <th className="p-4 font-bold tracking-wider text-right">
              P. Actual
            </th>
            <th className="p-4 font-bold tracking-wider text-right">
              Total Mercado
            </th>
            <th className="p-4 font-bold tracking-wider text-center">
              Rendimiento
            </th>
            <th className="p-4 font-bold tracking-wider text-center">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {assets.map((asset) => (
            <AssetRow
              key={asset.id}
              asset={asset}
              onEdit={onEdit}
              onDelete={onDelete}
              onSyncAsset={onSyncAsset}
              isUpdating={isUpdating}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
