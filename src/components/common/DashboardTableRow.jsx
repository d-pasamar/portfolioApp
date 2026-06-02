// --- HELPER ---
const formatEUR = (num) =>
  num.toLocaleString("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export default function DashboardTableRow({ portfolio, metrics, onNavigate }) {
  const { count = 0, value = 0 } = metrics || {};

  const formattedDate = portfolio.created_at
    ? new Date(portfolio.created_at).toLocaleDateString("es-ES")
    : "Sin datos";

  return (
    <tr className="hover:bg-slate-100/70 transition-colors bg-white">
      <td className="p-4 font-bold text-black tracking-wide">
        {portfolio.name}
      </td>
      <td className="p-4 text-slate-600 font-mono">
        {formattedDate}{" "}
        {/* TODO: Cambiar por portfolio.updated_at cuando exista en DB */}
      </td>
      <td className="p-4 text-center text-slate-600 font-semibold font-mono">
        {count}
      </td>
      <td className="p-4 text-right font-bold text-black font-mono">
        {formatEUR(value)} EUR
      </td>
      <td className="p-4 text-center">
        <button
          onClick={() => onNavigate(`/portfolios/${portfolio.id}`)}
          className="border border-slate-300 bg-white px-3 py-1 text-[10px] font-bold tracking-widest uppercase transition-colors duration-150 hover:bg-black hover:text-white cursor-pointer"
        >
          Ver →
        </button>
      </td>
    </tr>
  );
}
