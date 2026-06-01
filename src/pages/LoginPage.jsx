// import { signIn, signUp, signOut } from "../services/auth";
import { AuthContext } from "../contexts/AuthContext";
import { useAuth } from "../contexts/AuthContext";

export default function LoginPage() {
  // Extraemos lo necesario del contexto global
  const { user, isAuthenticated, login, logout } = useAuth();

  return (
    <div className="p-8">
      <h2>Página de Login (Pública)</h2>
      <p className="mt-2 text-sm text-slate-600">
        ¿Usuario autenticado globalmente?:{" "}
        <strong>{isAuthenticated ? "SÍ" : "NO"}</strong>
      </p>
      {isAuthenticated && (
        <p className="mt-1 text-sm text-green-600">
          Bienvenido de nuevo, <strong>{user?.name}</strong> (Rol: {user?.role})
        </p>
      )}

      <div className="mt-4 flex gap-2">
        <button
          onClick={() => login("david.pasamar@gmail.com", "Password123!")}
          className="rounded bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
        >
          Login
        </button>

        <button
          onClick={logout}
          className="rounded bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
