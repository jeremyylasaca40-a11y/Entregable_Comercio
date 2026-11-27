import ChartCard from "../components/ChartCard.jsx";
import "./LogisticsSection.css";

const logisticsCharts = [
  {
    number: "09",
    title: "Tasa de devolución por categoría de producto",
    image: "/charts/es_09_tasa_devolucion.png",
    type: "Riesgo por categoría",
    insight:
      "Clothing registra la tasa más alta de devoluciones con 13.04% (27 de 207 pedidos), seguida por Electronics con 10.55% (21 de 199). En el extremo opuesto, Grocery presenta solo 1.01% (2 de 198). Esto permite priorizar controles de calidad y empaque en las categorías más sensibles.",
    featured: true,
  },
  {
    number: "02",
    title: "Estado de devolución de pedidos",
    image: "/charts/es_02_anillos.png",
    type: "Proporción global",
    insight:
      "De los 1,980 pedidos únicos analizados, 1,854 no fueron devueltos (93.64%) y 126 sí registraron devolución (6.36%). Este desbalance de clases justifica el uso de pesos balanceados al entrenar el modelo predictivo.",
  },
  {
    number: "06",
    title: "Distribución de días de envío",
    image: "/charts/es_06_histograma.png",
    type: "Tiempos de entrega",
    insight:
      "Los tiempos de entrega oscilan entre 1 y 8 días, con un promedio de 3.56 días, mediana de 4 y moda de 3 días (512 pedidos). El 68.9% de los pedidos (1,365) se concentra en la franja de 3 a 5 días.",
  },
  {
    number: "08",
    title: "Calificación promedio según días de envío",
    image: "/charts/es_08_review_envio.png",
    type: "Experiencia del cliente",
    insight:
      "La valoración se mantiene estable entre 3.80 y 4.01 puntos para envíos de 1 a 7 días. En 8 días cae a 2.86, aunque ese tramo contiene únicamente 7 pedidos, por lo que debe interpretarse con cautela.",
  },
  {
    number: "10",
    title: "Días de envío vs. calificación del cliente",
    image: "/charts/es_10_dispersion_envio.png",
    type: "Correlación",
    insight:
      "La correlación lineal entre los días de envío y la calificación es de -0.040, prácticamente nula. Esto sugiere que la satisfacción del cliente depende de múltiples factores adicionales al tiempo de tránsito.",
  },
];

const findings = [
  {
    number: "01",
    title: "Foco en Clothing y Electronics",
    description:
      "Ambas categorías superan el 10% de devoluciones y concentran una parte relevante del volumen total; conviene revisar tallas, especificaciones y protección en despacho.",
  },
  {
    number: "02",
    title: "Ventana operativa estable",
    description:
      "Casi 7 de cada 10 pedidos llegan entre 3 y 5 días, manteniendo la calificación promedio cerca de 4 sobre 5.",
  },
  {
    number: "03",
    title: "Desbalance para Machine Learning",
    description:
      "Al representar las devoluciones solo el 6.36% del historial, evaluar el modelo únicamente por exactitud sería engañoso; el recall y el F1 resultan clave.",
  },
  {
    number: "04",
    title: "Satisfacción multifactorial",
    description:
      "El tiempo de envío por sí solo no explica linealmente la calificación (r = -0.040), por lo que las alertas deben combinar categoría, monto y condiciones del pedido.",
  },
];

export default function LogisticsSection() {
  return (
    <section
      className="ec-log-section"
      aria-label="Logística, envíos y devoluciones"
    >
      <div className="ec-log-hero">
        <div className="ec-log-hero-copy">
          <span className="ec-log-eyebrow">
            LOGÍSTICA Y EXPERIENCIA POST-COMPRA
          </span>
          <h2>Envíos, satisfacción y riesgo de devolución</h2>
          <p>
            Examinamos cuánto tardan en llegar los pedidos, cómo evalúan los
            clientes la entrega y qué categorías concentran la mayor tasa de
            devoluciones sobre la muestra limpia de pedidos únicos.
          </p>
        </div>

        <div className="ec-log-stats">
          <div className="ec-log-stat">
            <strong>6.36%</strong>
            <span>Tasa devolución</span>
          </div>
          <div className="ec-log-stat">
            <strong>3.56 d</strong>
            <span>Envío promedio</span>
          </div>
          <div className="ec-log-stat">
            <strong>3.95 / 5</strong>
            <span>Calificación media</span>
          </div>
        </div>
      </div>

      <div className="ec-log-heading">
        <div>
          <span className="ec-log-overline">EXPLORACIÓN VISUAL</span>
          <h2>Gráficos de logística y devoluciones</h2>
          <p>
            Visualizaciones generadas con Pandas y Matplotlib en Google Colab.
          </p>
        </div>
        <span className="ec-log-count">5 visualizaciones</span>
      </div>

      <div className="ec-log-grid">
        {logisticsCharts.map((chart) => (
          <div
            key={chart.number}
            className={
              chart.featured
                ? "ec-log-grid-item ec-log-featured"
                : "ec-log-grid-item"
            }
          >
            <ChartCard
              number={chart.number}
              title={chart.title}
              image={chart.image}
              insight={chart.insight}
              type={chart.type}
            />
          </div>
        ))}
      </div>

      <div className="ec-log-note">
        <strong>Nota metodológica:</strong>
        <p>
          Todos los gráficos corresponden a los 1,980 pedidos únicos del dataset
          Ecommerce_2000.csv (sin duplicados por OrderID). Los resultados
          describen asociaciones observadas en la muestra y no prueban
          causalidad directa. En el gráfico de dispersión se aplicó un ligero
          desplazamiento visual (jitter) para evitar superposición de puntos
          discretos.
        </p>
      </div>

      <section
        className="ec-log-conclusions"
        aria-labelledby="ec-log-conclusions-title"
      >
        <div className="ec-log-heading">
          <div>
            <span className="ec-log-overline">HALLAZGOS CLAVE</span>
            <h2 id="ec-log-conclusions-title">Conclusiones de logística</h2>
            <p>
              Puntos prioritarios para reducir devoluciones y mejorar entregas.
            </p>
          </div>
          <a href="#prediccion" className="button button-primary">
            Probar predictor ML
          </a>
        </div>

        <div className="ec-log-conclusions-grid">
          {findings.map((item) => (
            <article key={item.number} className="ec-log-conclusion-card">
              <span className="ec-log-conclusion-number">{item.number}</span>
              <div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}