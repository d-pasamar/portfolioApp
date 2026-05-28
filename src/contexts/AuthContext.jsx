import { createContext, useState, useEffect } from "react";
import { signIn, signUp, signOut } from "../services/auth";
import { fetchSupabase } from "../services/supabaseClient";

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

  // Función handler para Registro
  async function registerHandler(name, email, password) {
    const result = await signUp(name, email, password);
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
