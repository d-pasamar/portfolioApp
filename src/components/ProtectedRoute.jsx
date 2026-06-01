import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

/**
 * Componente de envoltura para proteger rutas privadas del sistema.
 * @param { JSX.Element } children - El componente que se desea renderizar si está autenticado
 * @returns { JSX.Element } - El componente protegido o una redirección al Login
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  // 1. Si el contexto está recuperando la sesión del localStorage (en el arranque),
  // no se toma ninguna decisión de redirección.
  if (loading) {
    <div className="flex min-h-screen items-center justifiy-center bg-slate-50">
      <p className="text-sm font-medium text-slate-500">
        Verificando credenciales...
      </p>
    </div>;
  }

  // 2. Si ya terminó de cargar y no está autenticado, lo redirigimos a /login.
  // "replace" limpia el historial de navegación para que no pueda dar "atrás".
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 3. Si el usuario está autenticado, luz verde para ver la pantalla
  return children;
}
