import { signIn, signUp, signOut } from "../services/auth";

export default function LoginPage() {
  /*
  const handleSignup = async () => {
    try {
      await signUp(
        "David DAM",
        "david.pasamar@gmail.com",
        "Password123!",
      );
    } catch (error) {
      console.error(error);
    }
  }; */

  const handleLogin = async () => {
    try {
      const data = await signIn("david.pasamar@gmail.com", "Password123!");

      console.log("Login correcto:", data);
    } catch (error) {
      console.error("Error login:", error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();

      console.log("Sesión cerrada correctamente");
    } catch (error) {
      console.error("Error logout:", error.message);
    }
  };

  return (
    <div className="p-8">
      <h2>Página de Login (Pública)</h2>

      {/* 
      <button
        onClick={handleSignup}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Crear usuario
      </button>
      */}

      <button
        onClick={handleLogin}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Iniciar sesión
      </button>

      <button
        onClick={handleLogout}
        className="bg-red-500 text-white px-4 py-2 rounded"
      >
        Cerrar sesión
      </button>
    </div>
  );
}
