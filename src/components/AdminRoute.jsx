import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function AdminRoute({ children }) {
  const { isAdmin, loading } = useAuth();

  // 1. Si el contexto está recuperando la sesión del localStorage (en el arranque),
  // no se toma ninguna decisión de redirección.
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm font-medium text-slate-500">
          Verificando permisos...
        </p>
      </div>
    );
  }

  // 2. Si ya terminó de cargar y no es administrador, lo redirigimos al dashboard.
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // 3. Si el usuario es admin, luz verde para ver la pantalla
  return children;
}
