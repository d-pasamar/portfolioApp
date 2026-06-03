import { useState, useEffect, useRef } from "react";
import { searchAssets } from "../services/assetsReference";
import { addAssetToPortfolio } from "../services/assets";
import { getPortfoliosByUser } from "../services/portfolios";

/**
 * Hook para la página de búsqueda de mercado (MarketSearchPage).
 *
 * Encapsula:
 * - Búsqueda con debounce sobre el catálogo local (assets_reference)
 * - Carga de las carteras del usuario (para el selector de destino)
 * - Acción de añadir un activo a una cartera seleccionada
 *
 * Flujo completo:
 * 1. El usuario escribe en el buscador → debounce de 400ms → searchAssets()
 * 2. Pulsa "+" en un resultado → se abre formulario con selector de cartera + cantidad + precio
 * 3. Si el precio de compra es 0 o vacío → el activo entra en modo watchlist (seguimiento)
 *
 * @param {string} userId - ID del usuario autenticado
 * @returns {{ query, setQuery, results, portfolios, selectedPortfolioId, setSelectedPortfolioId, isSearching, isAdding, handleAddAsset }}
 */
export function useMarketSearch(userId) {
  // === ESTADOS DE BÚSQUEDA ===
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // === ESTADOS DE CARTERAS ===
  // Lista de carteras del usuario para el selector de destino
  const [portfolios, setPortfolios] = useState([]);
  const [selectedPortfolioId, setSelectedPortfolioId] = useState("");

  // === ESTADOS DE ACCIÓN (añadir activo) ===
  const [isAdding, setIsAdding] = useState(false);

  // === REF PARA EL DEBOUNCE ===
  // Se usa useRef en vez de una variable para que el timer persista entre renders
  const debounceTimer = useRef(null);

  // === CARGA INICIAL DE CARTERAS ===
  // Se ejecuta una vez al montar el hook para popular el selector de destino
  useEffect(() => {
    if (!userId) return;

    async function loadPortfolios() {
      try {
        const data = await getPortfoliosByUser(userId);
        setPortfolios(data);

        // Se preselecciona la primera cartera por comodidad
        if (data.length > 0) {
          setSelectedPortfolioId(data[0].id);
        }
      } catch (err) {
        console.error("Error al cargar carteras:", err);
      }
    }

    loadPortfolios();
  }, [userId]);

  // === BÚSQUEDA CON DEBOUNCE ===
  // Cada vez que cambia `query`, se espera 400ms antes de lanzar la búsqueda.
  // Si el usuario sigue tecleando, se cancela el timer anterior y se reinicia.
  // Esto evita saturar Supabase con una petición por cada tecla.
  useEffect(() => {
    // Si el input está vacío, limpiamos resultados inmediatamente
    if (!query.trim()) {
      setResults([]);
      return;
    }

    // Se cancela cualquier búsqueda pendiente del tecleo anterior
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(async () => {
      try {
        setIsSearching(true);
        const data = await searchAssets(query.trim());
        setResults(data);
      } catch (err) {
        console.error("Error en la búsqueda de mercado:", err);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    // Cleanup: si el componente se desmonta antes de que el timer salte, se cancela
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query]);

  // === ACCIÓN: AÑADIR ACTIVO A UNA CARTERA ===
  /**
   * Añade un activo del catálogo a la cartera seleccionada.
   * Si buyPrice es 0 o vacío, el activo entra en modo watchlist (seguimiento sin posición).
   *
   * @param {object} asset - Activo del catálogo (code, name, exchange, currency, type, isin, country)
   * @param {number} quantity - Cantidad de participaciones (0 para watchlist)
   * @param {number} buyPrice - Precio de compra por unidad (0 para watchlist)
   * @returns {Promise<boolean>} - true si se añadió con éxito, false si hubo error
   */
  const handleAddAsset = async (asset, quantity, buyPrice) => {
    if (!selectedPortfolioId) {
      alert("Selecciona una cartera de destino.");
      return false;
    }

    try {
      setIsAdding(true);

      await addAssetToPortfolio(selectedPortfolioId, {
        code: asset.code,
        name: asset.name,
        exchange: asset.exchange,
        currency: asset.currency,
        type: asset.type,
        isin: asset.isin || null,
        country: asset.country || null,
        quantity: parseFloat(quantity) || 0,
        buy_price: parseFloat(buyPrice) || 0,
      });

      return true;
    } catch (err) {
      console.error("Error al añadir activo a la cartera:", err);
      alert("No se pudo añadir el activo.");
      return false;
    } finally {
      setIsAdding(false);
    }
  };

  // === API PÚBLICA DEL HOOK ===
  return {
    // Búsqueda
    query,
    setQuery,
    results,
    isSearching,

    // Carteras
    portfolios,
    selectedPortfolioId,
    setSelectedPortfolioId,

    // Acción
    handleAddAsset,
    isAdding,
  };
}
