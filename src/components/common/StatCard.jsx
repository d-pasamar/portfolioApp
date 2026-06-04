/**
 * Componente reutilizable para las métricas del Dashboard.
 * @param {string} title - Título de la tarjeta
 * @param {string|numer} value - Valor destacado
 * @param {string} subtext - Texto descriptivo inferior
 * @param {boolean} isLoading - Estado de carga
 */
export default function StatCard({
  title,
  value,
  subtext,
  isLoading = false,
  valueClassName = "text-black",
}) {
  return (
    <div className="border border-slate-300 bg-[#f9f9f9] p-6 shadow-sm relative font-mono select-none">
      <div className="absolute top-4 right-4 w-3 h-3 border border-slate-400 bg-white"></div>

      {/* Título */}
      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        {title}
      </span>

      {/* Valor Central */}
      <span
        className={`block text-2xl sm:text-4xl font-medium mt-4 tracking-tight ${valueClassName}`}
      >
        {isLoading ? "..." : value}
      </span>

      {/* Texto inferior */}
      <span className="block text-[10px] text-slate-500 mt-1 uppercase tracking-wider">
        {subtext}
      </span>
    </div>
  );
}
