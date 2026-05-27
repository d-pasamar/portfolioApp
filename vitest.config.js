import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // Lista de plugins que Vite usará durante las pruebas.
  plugins: [react()],

  // Configuración específica para el entorno de pruebas de Vitest.
  test: {
    // Dónde se ejecutan los tests.
    environment: "jsdom",
    // En 'true', registra funciones como 'describe', 'test', 'expect', de forma global.
    globals: true,
    // Ruta al archivo de configuración inicial que se ejecutará ANTES de lanzar los tests.
    setupFiles: "./src/tests/setup.js",
  },
});
