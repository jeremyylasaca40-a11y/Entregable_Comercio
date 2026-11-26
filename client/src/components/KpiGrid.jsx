import Icon from "./Icon.jsx";
import { decimal, integer } from "../lib/api.js";

const cards = [
  {
    key: "ventasTotales",
    label: "Monto total de pedidos",
    icon: "money",
    tone: "green",
    unit: "u. m.",
    format: decimal,
    note: "Después de descuentos; incluye devueltos.",
  },
  {
    key: "totalPedidos",
    label: "Pedidos únicos",
    icon: "bag",
    tone: "blue",
    format: integer,
    note: "Un registro por identificador de pedido.",
  },
  {
    key: "ticketPromedio",
    label: "Ticket promedio",
    icon: "receipt",
    tone: "purple",
    unit: "u. m.",
    format: decimal,
    note: "Monto final promedio por pedido.",
  },
  {
    key: "tasaDevolucion",
    label: "Tasa de devolución",
    icon: "returns",
    tone: "orange",
    unit: "%",
    format: decimal,
    note: (data) =>
      `${integer(data.totalDevueltos)} pedidos marcados como devueltos.`,
  },
  {
    key: "diasEnvioPromedio",
    label: "Tiempo de envío",
    icon: "truck",
    tone: "blue",
    unit: "días",
    format: decimal,
    note: "Promedio de días registrados por pedido.",
  },
  {
    key: "calificacionPromedio",
    label: "Calificación promedio",
    icon: "star",
    tone: "gold",
    unit: "/ 5",
    format: decimal,
    note: "Promedio de valoraciones de los pedidos.",
  },
];

export default function KpiGrid({ data, loading, error, retry }) {
  if (error)
    return (
      <div className="error-panel" role="alert">
        <span className="error-icon">
          <Icon name="info" size={25} />
        </span>
        <div>
          <h3>No pudimos cargar los indicadores</h3>
          <p>{error}</p>
        </div>
        <button className="button button-primary" onClick={retry}>
          <Icon name="refresh" size={16} />
          Reintentar
        </button>
      </div>
    );
  if (!loading && data?.totalPedidos === 0)
    return (
      <div className="empty-data" role="status">
        <Icon name="filter" size={28} />
        <h3>No hay pedidos con esta combinación</h3>
        <p>Selecciona otra categoría o estación, o limpia los filtros.</p>
      </div>
    );
  return (
    <div
      className="kpi-grid"
      aria-busy={loading}
      aria-label="Indicadores principales"
    >
      {loading && (
        <span className="sr-only" role="status">
          Cargando indicadores…
        </span>
      )}
      {cards.map((card) => (
        <article
          key={card.key}
          className={`kpi-card ${loading ? "loading" : ""}`}
        >
          <div className="kpi-heading">
            <span>{card.label}</span>
            <span className={`kpi-icon ${card.tone}`}>
              <Icon name={card.icon} />
            </span>
          </div>
          <div className="kpi-value">
            {loading ? (
              <span className="skeleton skeleton-value" />
            ) : (
              <>
                {card.format(data[card.key])}
                {card.unit && <span className="kpi-unit">{card.unit}</span>}
              </>
            )}
          </div>
          <p className="kpi-note">
            {loading ? (
              <span className="skeleton skeleton-note" />
            ) : typeof card.note === "function" ? (
              card.note(data)
            ) : (
              card.note
            )}
          </p>
        </article>
      ))}
    </div>
  );
}
