import { useState } from "react";

/**
 * Modal para editar cantidad y precio de compra de un activo.
 * Se abre desde el menú kebab (⋮) → "Editar" en AssetRow.
 *
 * @param {object} asset - Activo a editar (name, code, quantity, buy_price)
 * @param {Function} onConfirm - Callback al confirmar → (fieldsToUpdate)
 * @param {Function} onCancel - Callback al cancelar o cerrar
 * @param {boolean} isUpdating - Estado de carga durante la operación
 */
export default function EditAssetModal({
  asset,
  onConfirm,
  onCancel,
  isUpdating,
}) {
  const [quantity, setQuantity] = useState(String(asset.quantity));
  const [buyPrice, setBuyPrice] = useState(String(asset.buy_price));

  const handleSubmit = () => {
    const fields = {};

    const newQty = parseFloat(quantity);
    const newPrice = parseFloat(buyPrice);

    if (!isNaN(newQty) && newQty !== asset.quantity) {
      fields.quantity = newQty;
    }
    if (!isNaN(newPrice) && newPrice !== asset.buy_price) {
      fields.buy_price = newPrice;
    }

    if (Object.keys(fields).length === 0) {
      onCancel();
      return;
    }

    onConfirm(asset.id, fields);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md mx-4 bg-white border border-slate-300 shadow-lg font-mono animate-fadeIn">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-black">
            Editar {asset.code}
          </h2>
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-black text-lg leading-none cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Cantidad
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full border border-slate-300 bg-white px-3 py-2.5 text-sm text-black outline-none focus:border-black transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Precio de Compra
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={buyPrice}
              onChange={(e) => setBuyPrice(e.target.value)}
              className="w-full border border-slate-300 bg-white px-3 py-2.5 text-sm text-black outline-none focus:border-black transition-colors"
            />
            <p className="text-[10px] text-slate-400 tracking-wide">
              Pon 0 en ambos campos para pasar a seguimiento (watchlist).
            </p>
          </div>
        </div>

        <div className="flex gap-3 border-t border-slate-200 px-6 py-4">
          <button
            onClick={handleSubmit}
            disabled={isUpdating}
            className="flex-1 border border-black bg-black text-white text-xs py-2.5 font-bold tracking-wider uppercase transition-colors hover:bg-white hover:text-black cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUpdating ? "Guardando..." : "Confirmar"}
          </button>
          <button
            onClick={onCancel}
            disabled={isUpdating}
            className="flex-1 border border-black bg-white text-black text-xs py-2.5 font-bold tracking-wider uppercase transition-colors hover:bg-black hover:text-white cursor-pointer disabled:opacity-50"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
