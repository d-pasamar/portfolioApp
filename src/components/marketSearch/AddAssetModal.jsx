import { useState } from "react";

/**
 * Modal de confirmación para añadir un activo a una cartera.
 * Se abre al pulsar "+ Añadir" en una fila de MarketResultsTable.
 *
 * Campos del formulario (según Figma + requisito de watchlist):
 * 1. Selector de cartera destino (dropdown con las carteras del usuario)
 * 2. Cantidad de participaciones
 * 3. Precio de compra por unidad
 *
 * Si cantidad o precio de compra se dejan en 0 → el activo entra en modo watchlist (seguimiento).
 *
 * @param {object} asset - Activo seleccionado del catálogo (code, name, exchange...)
 * @param {Array} portfolios - Lista de carteras del usuario
 * @param {string} selectedPortfolioId - ID de la cartera preseleccionada
 * @param {Function} onSelectPortfolio - Callback para cambiar la cartera seleccionada
 * @param {Function} onConfirm - Callback al pulsar "Confirmar" → (quantity, buyPrice)
 * @param {Function} onCancel - Callback al pulsar "Cancelar" o la X
 * @param {boolean} isAdding - Estado de carga durante la operación de añadir
 */
export default function AddAssetModal({
  asset,
  portfolios,
  selectedPortfolioId,
  onSelectPortfolio,
  onConfirm,
  onCancel,
  isAdding,
}) {
  // === ESTADOS LOCALES DEL FORMULARIO ===
  const [quantity, setQuantity] = useState("");
  const [buyPrice, setBuyPrice] = useState("");

  // === HANDLER DE CONFIRMACIÓN ===
  const handleSubmit = () => {
    onConfirm(quantity, buyPrice);
  };

  return (
    // === OVERLAY / BACKDROP ===
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      {/* === CONTENEDOR DEL MODAL === */}
      <div className="w-full max-w-md mx-4 bg-white border border-slate-300 shadow-lg font-mono animate-fadeIn">
        {/* Cabecera: título + botón cerrar */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-black">
            Añadir {asset.code}
          </h2>
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-black text-lg leading-none cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Cuerpo del formulario */}
        <div className="px-6 py-5 space-y-5">
          {/* Selector de cartera */}
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Seleccionar Portfolio
            </label>
            <select
              value={selectedPortfolioId}
              onChange={(e) => onSelectPortfolio(e.target.value)}
              className="w-full border border-slate-300 bg-white px-3 py-2.5 text-sm text-black outline-none focus:border-black transition-colors cursor-pointer"
            >
              {portfolios.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Cantidad */}
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
              placeholder="0"
              className="w-full border border-slate-300 bg-white px-3 py-2.5 text-sm text-black placeholder-slate-400 outline-none focus:border-black transition-colors"
            />
          </div>

          {/* Precio de compra */}
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
              placeholder="0.00"
              className="w-full border border-slate-300 bg-white px-3 py-2.5 text-sm text-black placeholder-slate-400 outline-none focus:border-black transition-colors"
            />
            <p className="text-[10px] text-slate-400 tracking-wide">
              Déjalo vacío o en 0 para añadir como seguimiento (watchlist).
            </p>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-3 border-t border-slate-200 px-6 py-4">
          <button
            onClick={handleSubmit}
            disabled={isAdding}
            className="flex-1 border border-black bg-black text-white text-xs py-2.5 font-bold tracking-wider uppercase transition-colors hover:bg-white hover:text-black cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAdding ? "Añadiendo..." : "Confirmar"}
          </button>
          <button
            onClick={onCancel}
            disabled={isAdding}
            className="flex-1 border border-black bg-white text-black text-xs py-2.5 font-bold tracking-wider uppercase transition-colors hover:bg-black hover:text-white cursor-pointer disabled:opacity-50"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
