/**
 * Tabla de resultados de búsqueda del mercado.
 * Muestra los activos encontrados en el catálogo local (assets_reference)
 * con un botón "+ Añadir" por fila que abre el modal de confirmación.
 *
 * Columnas (según Figma): Código, Nombre, Exchange, Tipo, Moneda, ISIN, Acción
 *
 * A diferencia de AssetRow (que tiene menú kebab y cálculos de rendimiento),
 * aquí cada fila es solo lectura + un botón, por lo que no se extrae
 * a un subcomponente separado.
 *
 * @param {Array} results - Lista de activos devueltos por searchAssets()
 * @param {Function} onAdd - Callback al pulsar "+ Añadir" → abre el modal con el activo seleccionado
 */
export default function MarketSearchResultsTable({ results, onAdd }) {
  return (
    <div className="border border-slate-300 bg-[#f9f9f9] overflow-visible shadow-sm">
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="border-b border-slate-300 bg-slate-100 text-slate-500 uppercase tracking-wider text-[10px]">
            <th className="p-4 font-bold tracking-wider">Código</th>
            <th className="p-4 font-bold tracking-wider">Nombre</th>
            <th className="p-4 font-bold tracking-wider">Exchange</th>
            <th className="p-4 font-bold tracking-wider">Tipo</th>
            <th className="p-4 font-bold tracking-wider">Moneda</th>
            <th className="p-4 font-bold tracking-wider">ISIN</th>
            <th className="p-4 font-bold tracking-wider text-center">Acción</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {results.map((asset) => (
            <tr key={asset.id} className="hover:bg-slate-50 transition-colors">
              {/* Código / Ticker */}
              <td className="p-4 font-mono tracking-wider">
                <span className="font-bold text-black text-sm">
                  {asset.code}
                </span>
              </td>

              {/* Nombre */}
              <td className="p-4 text-slate-600 font-medium">{asset.name}</td>

              {/* Exchange */}
              <td className="p-4 font-mono text-slate-500">{asset.exchange}</td>

              {/* Tipo */}
              <td className="p-4 text-slate-500">{asset.type}</td>

              {/* Moneda */}
              <td className="p-4 font-mono text-slate-500">{asset.currency}</td>

              {/* ISIN */}
              <td className="p-4 font-mono text-slate-400 text-[11px]">
                {asset.isin || "—"}
              </td>

              {/* Botón Añadir */}
              <td className="p-4 text-center">
                <button
                  onClick={() => onAdd(asset)}
                  className="border border-black bg-white text-black text-[11px] px-3 py-1.5 font-bold tracking-wider uppercase transition-colors hover:bg-black hover:text-white cursor-pointer"
                >
                  + Añadir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
