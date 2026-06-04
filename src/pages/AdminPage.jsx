import { useAuth } from "../contexts/AuthContext";
import { useAdmin } from "../hooks/useAdmin";
import { formatDate } from "../utils/format";

export default function AdminPage() {
  const { user } = useAuth();
  const {
    exchange,
    setExchange,
    isSyncing,
    syncResult,
    syncLogs,
    isLoadingLogs,
    handleSync,
  } = useAdmin(user);

  return (
    <div className="space-y-10 font-mono select-none animate-fadeIn">
      {/* TÍTULO */}
      <div className="border-b border-slate-200 pb-6">
        <h1 className="text-2xl font-bold tracking-tight text-black">
          Panel de Administración
        </h1>
        <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">
          Gestión del catálogo de activos y sincronización con EODHD
        </p>
      </div>

      {/* PANEL DE SINCRONIZACIÓN */}
      <div className="border border-slate-300 bg-[#f9f9f9] shadow-sm p-6 space-y-5">
        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Sincronizar Catálogo
        </span>
        <p className="text-xs text-slate-500">
          Descarga la lista completa de activos de un mercado desde EODHD y
          actualiza la tabla local. Los usuarios buscarán sobre estos datos.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          {/* Input de exchange */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
              Código del mercado
            </label>
            <input
              type="text"
              value={exchange}
              onChange={(e) => setExchange(e.target.value)}
              placeholder="MC, US, LSE, PA..."
              className="w-48 bg-white border border-slate-300 px-3 py-2 text-sm text-black font-mono uppercase focus:outline-none focus:border-black transition-colors"
            />
          </div>

          {/* Botón sincronizar */}
          <button
            onClick={handleSync}
            disabled={isSyncing || !exchange.trim()}
            className={`border border-black text-xs px-6 py-2.5 font-bold tracking-wider uppercase transition-colors cursor-pointer ${
              isSyncing || !exchange.trim()
                ? "bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed"
                : "bg-black text-white hover:bg-white hover:text-black"
            }`}
          >
            {isSyncing ? "Sincronizando..." : "Sincronizar"}
          </button>
        </div>

        {/* Resultado de la última acción */}
        {syncResult && (
          <div
            className={`text-xs p-3 border ${
              syncResult.success
                ? "border-green-300 bg-green-50 text-green-700"
                : "border-red-300 bg-red-50 text-red-700"
            }`}
          >
            {syncResult.message}
            {syncResult.count > 0 &&
              ` (${syncResult.count} activos procesados)`}
          </div>
        )}
      </div>

      {/* HISTORIAL DE SINCRONIZACIONES */}
      <div className="border border-slate-300 bg-[#f9f9f9] overflow-x-auto shadow-sm">
        <div className="p-6 border-b border-slate-200">
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Historial de Sincronizaciones
          </span>
        </div>

        {isLoadingLogs ? (
          <div className="p-6 text-xs text-slate-400">
            Cargando historial...
          </div>
        ) : syncLogs.length === 0 ? (
          <div className="p-6 text-xs text-slate-400">
            No hay sincronizaciones registradas.
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100 text-slate-500 uppercase tracking-wider text-[10px]">
                <th className="p-4 font-bold">Mercado</th>
                <th className="p-4 font-bold">Realizada por</th>
                <th className="p-4 font-bold text-right">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {syncLogs.map((log) => (
                <tr
                  key={log.id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="p-4 font-bold text-black tracking-wider">
                    {log.market}
                  </td>
                  <td className="p-4 text-slate-600">{log.performed_by}</td>
                  <td className="p-4 text-right text-slate-500 font-mono">
                    {formatDate(log.last_sync_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
