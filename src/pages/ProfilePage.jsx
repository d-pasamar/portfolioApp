import { useAuth } from "../contexts/AuthContext";
import { useProfile } from "../hooks/useProfile";
import { formatDate } from "../utils/format";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { name, setName, isSaving, handleSaveName, handleDeleteAccount } =
    useProfile(user, logout);

  // Campos de solo lectura extraídos del usuario
  const email = user?.email || "—";
  const role = user?.role === "admin" ? "Administrador" : "Inversor";
  const memberSince = formatDate(user?.created_at);

  return (
    <div className="space-y-10 font-mono select-none animate-fadeIn">
      {/* TÍTULO */}
      <h1 className="text-2xl font-bold tracking-tight text-black">
        Mi perfil
      </h1>

      {/* TARJETA DE PERFIL */}
      <div className="border border-slate-300 bg-[#f9f9f9] shadow-sm">
        {/* Cabecera: avatar + nombre + fecha */}
        <div className="flex items-center gap-4 p-6 border-b border-slate-200">
          <div className="w-14 h-14 border border-slate-300 bg-white flex items-center justify-center">
            <span className="text-slate-300 text-xl">■</span>
          </div>
          <div>
            <p className="text-sm font-bold text-black">{user?.name}</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">
              Miembro desde: {memberSince}
            </p>
          </div>
        </div>

        {/* Formulario de edición */}
        <div className="p-6 space-y-5">
          {/* Nombre — editable */}
          <FieldGroup label="Nombre">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white border border-slate-300 px-3 py-2 text-sm text-black font-mono focus:outline-none focus:border-black transition-colors"
            />
          </FieldGroup>

          {/* Email — solo lectura */}
          <FieldGroup label="Email" readOnly>
            <ReadOnlyField value={email} />
          </FieldGroup>

          {/* Rol — solo lectura */}
          <FieldGroup label="Rol" readOnly>
            <ReadOnlyField value={role} />
          </FieldGroup>

          {/* Miembro desde — solo lectura */}
          <FieldGroup label="Miembro desde" readOnly>
            <ReadOnlyField value={memberSince} />
          </FieldGroup>

          {/* Botón guardar */}
          <button
            onClick={handleSaveName}
            disabled={isSaving || name.trim() === user?.name}
            className={`border border-black text-xs px-6 py-2.5 font-bold tracking-wider uppercase transition-colors cursor-pointer ${
              isSaving || name.trim() === user?.name
                ? "bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed"
                : "bg-black text-white hover:bg-white hover:text-black"
            }`}
          >
            {isSaving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>

      {/* ZONA DE PELIGRO */}
      <div className="border border-slate-300 bg-[#f9f9f9] shadow-sm p-6 space-y-3">
        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Zona de peligro
        </span>
        <p className="text-xs text-slate-500">
          Esta acción es permanente e irreversible. Se eliminarán todos tus
          portfolios, activos y datos de cuenta.
        </p>
        <button
          onClick={handleDeleteAccount}
          className="border border-slate-400 bg-white text-xs px-4 py-2 font-bold tracking-wider uppercase text-slate-600 hover:border-red-500 hover:text-red-600 transition-colors cursor-pointer"
        >
          Eliminar cuenta
        </button>
      </div>
    </div>
  );
}

// ─── Subcomponentes internos (privados de esta página) ─────────────

/** Wrapper de campo con label */
function FieldGroup({ label, readOnly = false, children }) {
  return (
    <div>
      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
        {label}
        {readOnly && (
          <span className="text-slate-300 font-normal ml-1">
            (solo lectura)
          </span>
        )}
      </span>
      {children}
    </div>
  );
}

/** Campo de solo lectura con fondo gris */
function ReadOnlyField({ value }) {
  return (
    <div className="w-full bg-slate-100 border border-slate-200 px-3 py-2 text-sm text-slate-500 font-mono">
      {value}
    </div>
  );
}
