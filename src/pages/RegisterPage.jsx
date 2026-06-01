import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function RegisterPage() {
  // 1. Estados locales para capturar lo que el usuario escribe
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // 2. Estados de control de flujo e interfaz de usuario
  const [errorMsg, setErrorMsg] = useState(""); // Se guarda el texto del error por si algo falla
  const [isSubmitting, setIsSubmitting] = useState(false); // true bloquea el botón para evitar dobles clics

  const { register } = useAuth();
  const navigate = useNavigate();

  // 3. Función handler del envío del formulario
  async function handleSubmit(e) {
    e.preventDefault(); // Evita que el navegador recargue la página completa
    setErrorMsg(""); // Se limpian errores previos

    // Validación previa antes de llamar a la API
    if (!name.trim() || !email.trim() || !password.trim()) {
      setErrorMsg("Todos los campos son obligatorios");
      return;
    }

    // Validación de longitud mínima por Supabase Auth
    if (password.length < 6) {
      setErrorMsg("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    // Validación que los password coinciden
    if (password !== confirmPassword) {
      setErrorMsg("Las contraseñas introducidas no coinciden.");
      return;
    }

    try {
      setIsSubmitting(true); // Arranca el estado de carga

      // Se lanza petición a través del contexto
      await register(name, email, password);

      console.log("¡Registro completado con éxito!");
      // Se redirige al /login
      navigate("/login");
    } catch (err) {
      // Si la API de Supabase -> error (un correo ya registrado)
      setErrorMsg(err.message || "Ocurrió un error durante el registro.");
    } finally {
      setIsSubmitting(false); // Se apaga el estado de carga
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
              Nueva cuenta
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
          {/* NOMBRE */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-500 tracking-wider uppercase">
              Nombre
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3 w-4 h-4 border border-slate-300 bg-white"></div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSubmitting}
                className="block w-full border border-slate-300 bg-white pl-10 pr-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-black"
                placeholder="Juan García"
              />
            </div>
          </div>

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

          {/* CONFIRMAR CONTRASEÑA */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-500 tracking-wider uppercase">
              Confirmar Contraseña
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3 w-4 h-4 border border-slate-300 bg-white"></div>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isSubmitting}
                className="block w-full border border-slate-300 bg-white pl-10 pr-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-black"
                placeholder="•••••••••"
              />
            </div>
          </div>

          {/* BOTÓN CREAR CUENTA */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#222222] hover:bg-black text-white text-xs font-bold tracking-widest uppercase py-3 transition-colors duration-150 disabled:bg-slate-400"
            >
              {isSubmitting ? "Procesando..." : "Crear Cuenta"}
            </button>
          </div>
        </form>

        {/* LINK INICIAR SESIÓN */}
        <div className="mt-8 text-center">
          <Link
            to="/login"
            className="text-xs text-slate-600 underline tracking-wide hover:text-black"
          >
            ¿Ya tienes cuenta? Iniciar sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
