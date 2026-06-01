import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function LoginPage() {
  // 1. Estados locales para capturar las credenciales del usuario
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // 2. Estados de interfaz para gestión de carga y los errores
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, user } = useAuth();
  const navigate = useNavigate();

  // Si ya hay sesión iniciada, redirige a Dashboard (efecto anti-rebote)
  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  // 3. Handler del envío del formulariode login
  async function handleSubmit(e) {
    e.preventDefault(); // Evita que el navegador recargue la página completa
    setErrorMsg(""); // Se limpian errores previos

    // Validación
    if (!email.trim() || !password.trim()) {
      setErrorMsg("Por favor, rellena todos los campos.");
      return;
    }

    try {
      setIsSubmitting(true); // Arranca el estado de carga y se bloquea el botón

      // Se lanza petición a través del contexto
      await login(email, password);

      console.log("¡Inicio de sesión completado con éxito! Redirigiendo...");
      // Si las credenciales son válidas, el contexto se actualiza y vamos al Dashboard
      navigate("/dashboard");
    } catch (err) {
      // Si la API de Supabase -> error (credenciales de login incorrectas)
      setErrorMsg(
        err.message || "Correo electrónico o contraseña incorrectos.",
      );
    } finally {
      setIsSubmitting(false); // Se apaga el estado de carga y liberamos el botón
    }
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-[#eaeaea] px-4 py-12 font-mono"
      style={{
        backgroundImage: "radial-gradient(#c5c5c5 1px, transparent 1px)",
        backgroundSize: "20px 20px",
      }}
    >
      <div className="w-full max-w-md bg-[#f9f9f9] p-10 border border-slate-300 shadow-sm">
        {/* Cabecera de la tarjeta */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-medium tracking-widest text-black uppercase">
            PortfolioApp
          </h2>

          <div className="flex items-center justify-center gap-4">
            <div className="h-[1px] w-16 bg-slate-300"></div>
            <span className="text-xs text-slate-500 tracking-wider">
              Iniciar Sesión
            </span>
            <div className="h-[1px] w-16 bg-slate-300"></div>
          </div>
        </div>

        {/* Mensaje de Error */}
        {errorMsg && (
          <div className="mt-6 rounded border border-red-200 bg-red-50 p-3 text-xs text-red-600">
            {errorMsg}
          </div>
        )}

        {/* Formulario */}
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          {/* EMAIL */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-500 tracking-wider uppercase">
              Email
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3 w-4 h-4 border border-slate-300 bg-white"></div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                className="block w-full border border-slate-300 bg-white pl-10 pr-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-black"
                placeholder="usuario@email.com"
              />
            </div>
          </div>

          {/* CONTRASEÑA */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-500 tracking-wider uppercase">
              Contraseña
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3 w-4 h-4 border border-slate-300 bg-white"></div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                className="block w-full border border-slate-300 bg-white pl-10 pr-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-black"
                placeholder="•••••••••"
              />
            </div>
          </div>

          {/* BOTÓN ENTRAR A LA CUENTA */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#222222] hover:bg-black text-white text-xs font-bold tracking-widest uppercase py-3 transition-colors duration-150 disabled:bg-slate-400"
            >
              {isSubmitting ? "Autenticando..." : "Iniciar Sesión"}
            </button>
          </div>
        </form>

        {/* LINK PARA IR A REGISTRO */}
        <div className="mt-8 text-center">
          <Link
            to="/register"
            className="text-xs text-slate-600 underline tracking-wide hover:text-black"
          >
            ¿No tienes cuenta? Registrarse
          </Link>
        </div>
      </div>
    </div>
  );
}
