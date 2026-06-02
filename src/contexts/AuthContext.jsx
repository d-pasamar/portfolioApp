import { createContext, useState, useEffect, useContext } from "react";
import { signIn, signUp, signOut } from "../services/auth";
import { fetchSupabase } from "../services/supabaseClient";
import { createPortfolio } from "../services/portfolios";

// 1. Se crea el contexto, comparte información entre componentes.
export const AuthContext = createContext(null);

// 2. Se crea el componente Proveedor que envuelve toda la aplicación
export function AuthProvider({ children }) {
  // Estado que almacena los datos del usuario logueado (null si no hay sesión)
  const [user, setUser] = useState(null);
  // Estado para conocer si la app comprueba si había sesión previa al recargar (estado de carga inicial)
  const [loading, setLoading] = useState(true);

  // Función para buscar los datos extendidos del usuario.
  // Se emplea el token guardado en localStorage
  async function loadUserProfile() {
    try {
      // Se llama a un endpoint de Supabase Auth
      const authUser = await fetchSupabase("/auth/v1/user", {
        method: "GET",
      });

      if (authUser?.id) {
        // Con el ID del usuario
        const profiles = await fetchSupabase(
          `/rest/v1/users?id=eq.${authUser.id}`,
          {
            method: "GET",
          },
        );
        // La consulta devuelve un array, se guarda el primer registro
        if (profiles && profiles.length > 0) {
          setUser(profiles[0]); // Se guarda el perfil completo
          console.log(
            "AuthContext: Perfil de usuario cargado con éxito:",
            profiles[0],
          );
        }
      }
    } catch (error) {
      console.error(
        "AuthContext: Error al cargar el perfil inicial:",
        error.message,
      );
      // Si el token no es válido o expiró, se limpiar el localStorage por seguridad
      localStorage.removeItem("sb_token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  // Cuando se arranca la app por primera vez, se comprueba si hay sesión previa
  useEffect(() => {
    const token = localStorage.getItem("sb_token");
    if (token) {
      loadUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  // --- HANDLER para REGISTRO ---
  async function registerHandler(name, email, password) {
    // 1. Ejecución de registro base en Auth y la inserción en public.users
    const result = await signUp(name, email, password);

    // 2. Se extrae el ID del usuario creado
    const profileData = Array.isArray(result.profile)
      ? result.profile[0]
      : result.profile;
    const userId = profileData?.id;

    if (userId) {
      try {
        console.log(
          "AuthContext: Creando portfolio automático por defecto para el usuario...",
        );
        // 3. Se crea la cartera incial sin assets asociados
        await createPortfolio(userId, "Mi Primer Portafolio");
      } catch (error) {
        console.error(
          "AuthContext: No se pudo generar el portafolio por defecto:",
          error.message,
        );
      }
    }

    return result;
  }

  // Función handler para Iniciar Sesión
  async function loginHandler(email, password) {
    await signIn(email, password); // Guarda el token en el localStorage
    await loadUserProfile(); // Se descarga el perfil del usuario
  }

  // Función handler para Cerrar Sesión
  async function logoutHandler() {
    await signOut(); // Se limpia el servidor y se borra el token local
    setUser(null); // Se vacía el estado global
  }

  // Datos y funciones disponibles en toda la aplicación
  const value = {
    user,
    loading,
    isAuthenticated: !!user, // true si user tiene datos, false si es null
    isAdmin: user?.role === "admin",
    login: loginHandler,
    register: registerHandler,
    logout: logoutHandler,
  };

  return (
    <AuthContext.Provider value={value}>
      {/* Si está cargando la sesión inicial, se puede mostrar un mensaje temporal */}
      {loading ? (
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
          <p className="text-sm font-medium text-slate-500">
            Iniciando aplicación...
          </p>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

/**
 * Hook personalizado para consumir el contexto de autenticación de forma simplificada.
 * @returns {Object} - Todos los datos y métodos del AuthContext
 */
export function useAuth() {
  const context = useContext(AuthContext);

  // Si intentamos usar useAuth() en un componente que está fuera del <AuthProvider>,
  // avisará con un error claro en lugar de dar un "undifined".
  if (!context) {
    throw new Error("useAuth debe ser utilizado dentro de un AuthProvider");
  }

  return context;
}
