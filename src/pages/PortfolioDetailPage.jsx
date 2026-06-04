import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { usePortfolioDetail } from "../hooks/usePortfolioDetail";
import { useAssetsCRUD } from "../hooks/useAssetsCRUD";
import StatCard from "../components/common/StatCard";
import AssetsTable from "../components/portfolioDetail/AssetsTable";
import EditAssetModal from "../components/portfolioDetail/EditAssetModal";
import { formatEUR } from "../utils/format";

export default function PortfolioDetailPage() {
  const { id: portfolioId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const {
    portfolioName,
    assets,
    metrics,
    isLoading,
    isSyncing,
    handleSyncPrices,
    handleSyncSingleAsset,
    refreshAssets,
  } = usePortfolioDetail(portfolioId, user);

  const { handleEditAsset, handleDeleteAsset, isUpdating } =
    useAssetsCRUD(refreshAssets);

  const { totalMarketValue, globalProfit, globalProfitP, lastSyncAt } = metrics;

  const [assetToEdit, setAssetToEdit] = useState(null);

  const handleConfirmEdit = async (assetId, fields) => {
    await handleEditAsset(assetId, fields);
    setAssetToEdit(null);
  };

  return (
    <div className="space-y-10 font-mono select-none animate-fadeIn">
      {/* CABECERA */}
      <div className="border-b border-slate-200 pb-6 space-y-4">
        <button
          onClick={() => navigate("/portfolios")}
          className="text-xs text-slate-400 hover:text-black transition-colors cursor-pointer"
        >
          ← Volver a mis carteras
        </button>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-black">
              {portfolioName}
            </h1>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => navigate("/market")}
              className="border border-black bg-black text-white text-xs px-4 py-2 font-bold tracking-wider uppercase transition-colors hover:bg-white hover:text-black cursor-pointer"
            >
              + Añadir Activo
            </button>

            <button
              onClick={handleSyncPrices}
              disabled={isSyncing || isLoading}
              className={`border border-black text-xs px-4 py-2 font-bold tracking-wider uppercase transition-all duration-150 cursor-pointer ${
                isSyncing
                  ? "bg-slate-200 text-slate-400 border-slate-300"
                  : "bg-white text-black hover:bg-black hover:text-white"
              }`}
            >
              {isSyncing ? "🔄 Sincronizando..." : "🔄 Sincronizar Precios"}
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-xs text-slate-500">
          Calculando analíticas financieras...
        </div>
      ) : assets.length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-500 border border-slate-300 bg-[#f9f9f9] shadow-sm">
          Esta cartera está vacía. Ve a la sección de Mercado para añadir tus
          primeras acciones o activos de seguimiento.
        </div>
      ) : (
        <>
          {/* TARJETAS DE RESUMEN GLOBAL */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <StatCard
              title="Valor Total de Mercado"
              value={`${formatEUR(totalMarketValue)} EUR`}
              subtext={
                lastSyncAt
                  ? `Última sync: ${new Date(lastSyncAt).toLocaleString("es-ES", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}`
                  : "Sin sincronizar"
              }
              isLoading={isLoading}
            />
            <StatCard
              title="Rendimiento Estimado"
              value={`${globalProfit >= 0 ? "+" : ""}${formatEUR(globalProfit)} EUR (${globalProfit >= 0 ? "+" : ""}${globalProfitP.toFixed(2)}%)`}
              subtext="Beneficio no realizado"
              isLoading={isLoading}
              valueClassName={
                globalProfit >= 0 ? "text-green-600" : "text-red-600"
              }
            />
          </div>

          {/* TABLA FINANCIERA */}
          <AssetsTable
            assets={assets}
            onEdit={setAssetToEdit}
            onDelete={handleDeleteAsset}
            onSyncAsset={handleSyncSingleAsset}
            isUpdating={isUpdating}
          />

          {assetToEdit && (
            <EditAssetModal
              asset={assetToEdit}
              onConfirm={handleConfirmEdit}
              onCancel={() => setAssetToEdit(null)}
              isUpdating={isUpdating}
            />
          )}
        </>
      )}
    </div>
  );
}
