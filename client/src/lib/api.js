export async function getJson(path, { signal } = {}) {
  // /api funciona tanto con el proxy de Vite como con el backend en Vercel.
  const response = await fetch(`/api${path}`, {
    signal,
    headers: { Accept: "application/json" },
  });
  if (!response.ok)
    throw new Error(`El servicio respondió con un error (${response.status}).`);
  if (!response.headers.get("content-type")?.includes("application/json")) {
    throw new Error(
      "No se recibió una respuesta válida del servicio de datos.",
    );
  }
  return response.json();
}

export async function postJson(path, body, { signal } = {}) {
  const response = await fetch(`/api${path}`, {
    method: "POST",
    signal,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!response.ok)
    throw new Error(`El servicio respondió con un error (${response.status}).`);
  if (!response.headers.get("content-type")?.includes("application/json")) {
    throw new Error(
      "No se recibió una respuesta válida del servicio de datos.",
    );
  }
  return response.json();
}

export const integer = (value) =>
  new Intl.NumberFormat("es-PE", { maximumFractionDigits: 0 }).format(value);
export const decimal = (value) =>
  new Intl.NumberFormat("es-PE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

export function validateKpis(data) {
  const keys = [
    "totalPedidos",
    "ventasTotales",
    "ticketPromedio",
    "totalDevueltos",
    "totalNoDevueltos",
    "tasaDevolucion",
    "calificacionPromedio",
    "diasEnvioPromedio",
    "descuentoPromedio",
  ];
  if (
    !data ||
    !keys.every(
      (key) => typeof data[key] === "number" && Number.isFinite(data[key]),
    )
  ) {
    throw new Error(
      "Los indicadores recibidos están incompletos. Intenta actualizar los datos.",
    );
  }
  return data;
}