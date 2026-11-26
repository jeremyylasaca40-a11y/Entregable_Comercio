import Icon from "../components/Icon.jsx";

// Integrantes 3 y 4: reemplazar estos contenidos mediante sections/index.js.
const content = {
  ventas: {
    icon: "sales",
    title: "Ventas y comportamiento de compra",
    description:
      "Una mirada a los montos, categorías, estaciones, descuentos y medios de pago.",
    topics: [
      "Evolución mensual",
      "Ventas por categoría",
      "Pedidos por estación",
      "Descuentos y montos",
      "Métodos de pago",
    ],
  },
  logistica: {
    icon: "truck",
    title: "Envíos y devoluciones",
    description:
      "El recorrido de los pedidos: tiempos de envío, calificaciones y devoluciones.",
    topics: [
      "Estado de devolución",
      "Distribución de envíos",
      "Calificación por envío",
      "Devoluciones por categoría",
      "Envío y experiencia",
    ],
  },
  prediccion: {
    icon: "predict",
    title: "Predicción de devolución",
    description:
      "Un espacio para explorar estimaciones del modelo y conocer sus resultados de evaluación.",
    topics: [
      "Características del pedido",
      "Estimación de devolución",
      "Métricas del modelo",
    ],
  },
};

export default function PendingSection({ section }) {
  const item = content[section];
  return (
    <section className="pending-section">
      <span className="pending-badge">Próximamente</span>
      <div className="pending-illustration">
        <Icon name={item.icon} size={45} />
      </div>
      <h2>{item.title}</h2>
      <p>{item.description}</p>
      <div className="topic-pills">
        {item.topics.map((topic) => (
          <span key={topic}>{topic}</span>
        ))}
      </div>
      <div className="pending-explanation">
        <Icon name="info" size={18} />
        <span>
          Esta sección está pendiente de integrar. Los indicadores generales ya
          están disponibles en el resumen.
        </span>
      </div>
      <a href="#resumen" className="button button-primary">
        Ver resumen general
      </a>
    </section>
  );
}
