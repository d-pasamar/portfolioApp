import { fetchSupabase } from "./supabaseClient";

/**
 * Registra un nuevo usuario en Supabase Auth y crea su perfil en la tabla pública de usuarios
 * @param {string} name - Nombre completo del usuario
 * @param {string} email - Correo electrónico
 * @param {string} password - Contraseña
 * @returns {Promise<Object>} - Datos del usuario registrado
 */
export async function signUp(name, email, password) {
  try {
    // 1. Petición a la API de autenticación de Supabase
    const authData = await fetchSupabase("/auth/v1/signup", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    // Se extrae el ID real del usuario desde el objeto 'user' (uso de fallaback)
    const userId = authData?.user?.id || authData?.id;

    if (!userId) {
      throw new Error("No se pudo obtener un ID de usuario válido");
    }

    console.log("¡Paso 1 completado! Usuario creado en Auth con ID:", userId);

    // 2. Se inserta el perfil en la tabla 'public.users'
    // El rol por defecto es 'user'
    const userProfile = await fetchSupabase("/rest/v1/users", {
      method: "POST",
      body: JSON.stringify({
        id: userId,
        name: name,
        email: email,
        role: "user",
      }),
      headers: {
        // Prefer — return=representation hace que Supabase devuelva el registro creado en el JSON
        Prefer: "return=representation",
      },
    });

    console.log(
      "¡Paso 2 completado! Perfil creado en la tabla pública:",
      userProfile,
    );

    return { auth: authData, profile: userProfile };
  } catch (error) {
    console.error("[Auth Service Error] Error en el registo:", error.message);
    throw error;
  }
}

/**
 * Inicia sesión de un usuario en Supabase Auth y guarda su token de acceso
 * @param {string} email - Correo electrónico
 * @param {string} password - Contraseña
 * @returns {Promise<Object>} - Datos de la sesión del usuario
 */
export async function signIn(email, password) {
  try {
    // 1. Solicita al endpoint de Supabase que genere tokens de sesión
    // El grant_type=password se pasa obligatoriamente en la URL
    const sessionData = await fetchSupabase(
      "/auth/v1/token?grant_type=password",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      },
    );

    // 2. Si la API devuelve con éxito el access_token, se guarda en el localStorage
    if (sessionData?.access_token) {
      // El nombre de la clave 'sb_token' coincide con la que se busca en supabaseClient.js
      localStorage.setItem("sb_token", sessionData.access_token);

      console.log(
        "¡Inicio de sesión correcto! Token guardado en localStorage.",
      );
    } else {
      throw new Error("No se recibió el token de acceso del servidor.");
    }

    return sessionData;
  } catch (error) {
    console.error(
      "[Auth Service Error] Error en el inicio de sesión:",
      error.message,
    );
    throw error;
  }
}

/**
 * Cierra la sesión del usuario actual en Supabase y elimina el token local
 * @returns {Promise<null>}
 */
export async function signOut() {
  try {
    // 1. Se avisa a Supabase para que invalide el token en el servidor
    // Se envía un objeto vacío en el body ya que el endpoint requiere un POST
    await fetchSupabase("/auth/v1/logout", {
      method: "POST",
      body: JSON.stringify({}),
    });

    console.log("¡Sesión invalidada en el servidor de Supabase!");
  } catch (error) {
    // Si el token había caducado o fallado, se captura el error para que no se bloquee
    // el borrado local del token
    console.warn(
      "[Auth Service Warning] Error al invalidad token en servidor:",
      error.message,
    );
  } finally {
    // 2. Ocurre tanto si la petición tuvo éxito o fallo
    // se elimina el token de localStorage
    localStorage.removeItem("sb_token");
    console.log("¡Token eliminado de localStorage. Sesión cerrada localmente!");
  }

  return null;
}
