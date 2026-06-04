import { useState, useRef, useEffect } from "react";
import { formatEUR } from "../../utils/format";

/**
 * Fila individual de la tabla de activos de una cartera.
 * Encapsula:
 * - Lógica visual de watchlist vs activo con posición
 * - Cálculos de rendimiento por fila
 * - Menú kebab (⋮) con acciones de editar y eliminar
 *
 * @param {object} asset - Datos del activo (code, name, quantity, buy_price, current_price, etc.)
 * @param {Function} onEdit - Callback del hook useAssetsCRUD → handleEditAsset
 * @param {Function} onDelete - Callback del hook useAssetsCRUD → handleDeleteAsset
 * @param {boolean} isUpdating - Estado de carga durante operaciones CRUD
 */
export default function AssetRow({
  asset,
  onEdit,
  onDelete,
  onSyncAsset,
  isUpdating,
}) {
  // === ESTADOS DEL MENÚ KEBAB ===
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef();

  // Cierre automático del menú al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // === CÁLCULOS DE RENDIMIENTO POR FILA ===
  const isWatchlist = asset.quantity === 0 || asset.buy_price === 0;
  const totalCost = asset.quantity * asset.buy_price;
  const totalMarket = asset.quantity * asset.current_price;
  const profit = totalMarket - totalCost;
  const profitP = totalCost > 0 ? (profit / totalCost) * 100 : 0;

  // === ACCIONES DEL MENÚ ===

  // Editar: prompt temporal para modificar cantidad y precio de compra
  const handleEdit = (e) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    onEdit(asset);
  };

  // Eliminar: confirmación antes de borrar
  const handleDelete = (e) => {
    e.stopPropagation();
    setIsMenuOpen(false);

    const confirmed = confirm(
      `¿Eliminar "${asset.code} — ${asset.name}" de esta cartera?`,
    );
    if (!confirmed) return;

    onDelete(asset.id);
  };

  // Sincronizar precio individual de este activo
  const handleSync = (e) => {
    e.stopPropagation();
    onSyncAsset(asset.id);
  };

  return (
    <tr className="hover:bg-slate-50 transition-colors">
      {/* Ticker + Exchange */}
      <td className="p-4 font-mono tracking-wider">
        <span className="font-bold text-black text-sm">{asset.code}</span>
        {asset.exchange && (
          <span className="ml-2 text-[10px] text-slate-400 font-bold bg-slate-100 px-1 py-0.5 border border-slate-200">
            {asset.exchange}
          </span>
        )}
      </td>

      {/* Nombre */}
      <td className="p-4 text-slate-600 font-medium">{asset.name}</td>

      {/* Cantidad o badge de seguimiento */}
      <td className="p-4 text-center font-mono text-slate-700 font-semibold">
        {isWatchlist ? (
          <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 font-bold uppercase tracking-wider">
            Vigilando
          </span>
        ) : (
          asset.quantity
        )}
      </td>

      {/* Precio de Compra */}
      <td className="p-4 text-right font-mono text-slate-500">
        {isWatchlist ? "-" : `${formatEUR(asset.buy_price)} ${asset.currency}`}
      </td>

      {/* Precio Actual de Mercado */}
      <td className="p-4 text-right font-mono text-slate-700 font-medium">
        {formatEUR(asset.current_price)} {asset.currency}
      </td>

      {/* Capital Actual en Mercado */}
      <td className="p-4 text-right font-bold text-black font-mono">
        {isWatchlist ? "-" : `${formatEUR(totalMarket)} ${asset.currency}`}
      </td>

      {/* Rendimiento Individual */}
      <td
        className={`p-4 text-center font-bold font-mono text-[11px] ${
          isWatchlist
            ? "bg-slate-50 text-slate-400 font-normal"
            : profit >= 0
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
        }`}
      >
        {isWatchlist
          ? "SEGUIMIENTO"
          : `${profit >= 0 ? "▲" : "▼"} ${profitP.toFixed(2)}%`}
      </td>

      {/* Menú Kebab (⋮) — Acciones */}
      <td className="p-4 text-center relative" ref={menuRef}>
        <button
          onClick={handleSync}
          disabled={isUpdating}
          className="text-slate-400 hover:text-black text-sm leading-none cursor-pointer select-none px-1"
          title="Sincronizar precio"
        >
          🔄
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsMenuOpen(!isMenuOpen);
          }}
          disabled={isUpdating}
          className="text-slate-400 hover:text-black font-bold text-base leading-none cursor-pointer select-none px-1"
        >
          &#8942;
        </button>

        {/* Dropdown flotante */}
        {isMenuOpen && (
          <div className="absolute right-4 top-10 w-36 bg-white border border-slate-300 shadow-md z-10 text-[11px] divide-y divide-slate-100 animate-fadeIn">
            <button
              onClick={handleEdit}
              className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-100 uppercase font-bold tracking-wide"
            >
              Editar
            </button>
            <button
              onClick={handleDelete}
              className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 uppercase font-bold tracking-wide"
            >
              Eliminar
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}
