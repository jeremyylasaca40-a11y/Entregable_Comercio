import { useEffect, useState } from "react";
import { getJson } from "../lib/api.js";

export default function useApi(
  path,
  revision = 0,
  validate = (value) => value,
) {
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: "",
    request: "",
  });
  const request = `${path}:${revision}`;
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    let timedOut = false;
    const timeout = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, 12000);
    setState({ data: null, loading: true, error: "", request });
    getJson(path, { signal: controller.signal })
      .then(validate)
      .then((data) => {
        if (active) setState({ data, loading: false, error: "", request });
      })
      .catch((error) => {
        if (!active) return;
        setState({
          data: null,
          loading: false,
          error: timedOut
            ? "El servicio está tardando en responder. Intenta nuevamente."
            : error.message === "Failed to fetch"
              ? "No pudimos conectar con el servicio de datos. Comprueba la conexión e intenta nuevamente."
              : error.message,
          request,
        });
      })
      .finally(() => clearTimeout(timeout));
    return () => {
      active = false;
      clearTimeout(timeout);
      controller.abort();
    };
    // El validador es estable; una nueva referencia no debe volver a pedir los datos.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, revision]);
  // Nunca mostrar indicadores de una selección anterior bajo filtros nuevos.
  return state.request === request
    ? state
    : { data: null, loading: true, error: "" };
}
