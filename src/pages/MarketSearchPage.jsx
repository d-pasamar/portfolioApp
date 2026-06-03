import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useMarketSearch } from "../hooks/useMarketSearch";
import MarketSearchResultsTable from "../components/marketSearch/MarketSearchResultsTable";
import AddAssetModal from "../components/marketSearch/AddAssetModal";

/**
 * Página de búsqueda de mercado.
 * Permite buscar activos en el catálogo local (assets_reference) y añadirlos a una cartera.
 *
 * Estructura visual (según Figma):
 * 1. Título "Buscar en el mercado"
 * 2. Input de búsqueda con debounce + botón "Buscar"
 * 3. Contador de resultados
 * 4. Tabla de resultados con botón "+ Añadir" por fila
 * 5. Modal para seleccionar cartera, cantidad y precio de compra
 *
 * Orquesta:
 * - useMarketSearch → lógica de búsqueda, carteras y acción de añadir
 * - MarketResultsTable → tabla de resultados
 * - AddAssetModal → modal de confirmación al pulsar "+ Añadir"
 */
export default function MarketSearchPage() {
  const { user } = useAuth();

  // === HOOK DE BÚSQUEDA ===
  const {
    query,
    setQuery,
    results,
    isSearching,
    portfolios,
    selectedPortfolioId,
    setSelectedPortfolioId,
    handleAddAsset,
    isAdding,
  } = useMarketSearch(user?.id);

  // === ESTADO DEL MODAL ===
  // Almacena el activo seleccionado al pulsar "+ Añadir" en una fila
  // Si es null, el modal está cerrado
  const [assetToAdd, setAssetToAdd] = useState(null);

  // === HANDLERS ===

  // Se dispara al pulsar "+ Añadir" en una fila de la tabla
  const handleOpenModal = (asset) => {
    setAssetToAdd(asset);
  };

  // Se dispara al pulsar "Cancelar" o la X del modal
  const handleCloseModal = () => {
    setAssetToAdd(null);
  };

  // Se dispara al pulsar "Confirmar" en el modal
  const handleConfirmAdd = async (quantity, buyPrice) => {
    const success = await handleAddAsset(assetToAdd, quantity, buyPrice);
    if (success) {
      setAssetToAdd(null);
    }
  };

  return (
    <div className="space-y-10 font-mono select-none animate-fadeIn">
      {/* CABECERA */}
      <div className="border-b border-slate-200 pb-6">
        <h1 className="text-2xl font-bold tracking-tight text-black">
          Buscar en el mercado
        </h1>
      </div>

      {/* BARRA DE BÚSQUEDA */}
      <div className="flex gap-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar ticker o nombre... (ej: AAPL, Apple Inc.)"
          className="flex-1 border border-slate-300 bg-white px-4 py-3 text-sm text-black placeholder-slate-400 outline-none focus:border-black transition-colors"
        />
        <button
          disabled={isSearching}
          className="border border-black bg-black text-white text-xs px-6 py-3 font-bold tracking-wider uppercase transition-colors hover:bg-white hover:text-black cursor-pointer disabled:opacity-50"
        >
          {isSearching ? "Buscando..." : "Buscar"}
        </button>
      </div>

      {/* RESULTADOS */}
      {query.trim() && (
        <div className="space-y-4">
          {/* Contador de resultados */}
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            Resultados — {results.length} instrumento
            {results.length !== 1 ? "s" : ""} encontrado
            {results.length !== 1 ? "s" : ""}
          </p>

          {/* Tabla o mensaje vacío */}
          {isSearching ? (
            <div className="text-xs text-slate-500">
              Buscando en el catálogo de mercado...
            </div>
          ) : results.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500 border border-slate-300 bg-[#f9f9f9] shadow-sm">
              No se encontraron instrumentos para "{query}". Prueba con otro
              ticker o nombre.
            </div>
          ) : (
            <MarketSearchResultsTable
              results={results}
              onAdd={handleOpenModal}
            />
          )}
        </div>
      )}

      {/* MODAL DE AÑADIR ACTIVO */}
      {assetToAdd && (
        <AddAssetModal
          asset={assetToAdd}
          portfolios={portfolios}
          selectedPortfolioId={selectedPortfolioId}
          onSelectPortfolio={setSelectedPortfolioId}
          onConfirm={handleConfirmAdd}
          onCancel={handleCloseModal}
          isAdding={isAdding}
        />
      )}
    </div>
  );
}
