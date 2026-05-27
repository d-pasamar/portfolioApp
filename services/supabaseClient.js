// 1. Se leen las variables de entorno del archivo .env.local
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export async function fetchSupabase(endpoint, options = {}) {
  // 2. Se une la URL base con el endpoint
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${SUPABASE_URL}${cleanEndpoint}`;

  // 3. Se pilla el token de sesión si el usuario ya estuviera logueado
  const sessionToken = localStorage.getItem("sb_token");

  // 4. Se configuran las cabeceras para hablar con la API REST
  const headers = {
    apikey: SUPABASE_ANON_KEY,
    // Si hay token en localstorage -> se usa, si no, se usa la clave anon
    Authorization: `Bearer ${sessionToken || SUPABASE_ANON_KEY}`,
    ...options.headers, // permite añadir o modificar cabeceras si fuera necesario
  };

  // Como en un GET no hace falta enviar "Content-Type"
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  try {
    // 5. Se lanza la petición a internet
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // 6. Control por si el servidor devuelve HTTP 204 (No Content)
    if (response.status === 204) {
      return null;
    }

    // 7. Se parsea la respuesta a JSON
    const data = await response.json();

    // 8. Si el estado HTTP no es un 2xx (éxito), se lanza un error
    if (!response.ok) {
      throw new Error(
        data.message ||
          data.error ||
          data.error_description ||
          "Error en la API de Supabase",
      );
    }

    // 9. Si todo va bien, se devuelven los datos para usar
    return data;
    // Se registra el error en la consola para facilitar depuración
  } catch (error) {
    console.error(
      `[Supabase API Error] ${options.method || "GET"} ${endpoint}:`,
      error.message,
    );
    throw error;
  }
}
