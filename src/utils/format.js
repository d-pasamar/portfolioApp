/**
 * Formatea un número como moneda EUR con separadores españoles.
 */

export const formatEUR = (num) =>
  num.toLocaleString("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export const formatDateShort = () =>
  new Date().toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
