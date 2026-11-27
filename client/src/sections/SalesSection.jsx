import ChartCard from "../components/ChartCard.jsx";
import "./SalesSection.css";

const salesCharts = [
  {
    number: "01",
    title: "Evolución mensual de ventas",
    image: "/charts/es_01_lineas.png",
    type: "Tendencia temporal",
    insight:
      "Las ventas presentan fluctuaciones durante el periodo analizado. Diciembre de 2024 registra el mayor monto de ventas, con USD 21,616.22. Este comportamiento permite identificar periodos de alta demanda y planificar los recursos comerciales y logísticos.",
    featured: true,
  },
  {
    number: "03",
    title: "Ventas por categoría de producto",
    image: "/charts/es_03_barras_h.png",
    type: "Análisis comercial",
    insight:
      "Electrónica lidera las ventas con USD 189,450.18, seguida de Deportes y aire libre. Identificar las categorías de mayor aporte económico permite priorizar la gestión de inventarios y evaluar su impacto en las devoluciones.",
  },
  {
    number: "04",
    title: "Cantidad de pedidos por estación",
    image: "/charts/es_04_barras_v.png",
    type: "Estacionalidad",
    insight:
      "Invierno registra la mayor cantidad de pedidos con 544, mientras que verano registra 468. La distribución es relativamente equilibrada, aunque existen diferencias que pueden orientar la planificación comercial. Los periodos por estación no tienen necesariamente la misma cobertura temporal.",
  },
  {
    number: "05",
    title: "Descuento vs. monto final de compra",
    image: "/charts/es_05_dispersion.png",
    type: "Comportamiento de compra",
    insight:
      "La correlación entre el descuento y el monto final es de aproximadamente -0.023, lo que indica una relación lineal prácticamente nula. Un mayor descuento no garantiza compras de mayor valor. También es necesario considerar el precio, la cantidad y la categoría del producto.",
  },
  {
    number: "07",
    title: "Pedidos por método de pago",
    image: "/charts/es_07_metodo_pago.png",
    type: "Preferencias de pago",
    insight:
      "Buy Now Pay Later es el método más utilizado con 319 pedidos, equivalente al 16.1% del total. Los siete métodos presentan una distribución relativamente equilibrada, lo que evidencia la importancia de mantener diferentes alternativas de pago.",
  },
];

const conclusions = [
  {
    number: "01",
    title: "Planificación de la demanda",
    description:
      "Identificar los periodos de mayores ventas permite anticipar necesidades de inventario, personal y capacidad de entrega.",
  },
  {
    number: "02",
    title: "Priorización de categorías",
    description:
      "Electrónica representa la categoría con mayor monto de ventas. Se recomienda analizar también su comportamiento logístico y sus devoluciones.",
  },
  {
    number: "03",
    title: "Optimización de promociones",
    description:
      "El porcentaje de descuento no presenta una relación lineal relevante con el monto final. Las promociones deben evaluarse junto con otras variables.",
  },
  {
    number: "04",
    title: "Flexibilidad en los pagos",
    description:
      "La distribución equilibrada de los medios de pago resalta la conveniencia de ofrecer alternativas a los consumidores.",
  },
];

export default function SalesSection() {
  return (
    <section
      className="ec-sales-section"
      aria-label="Ventas y comportamiento de compra"
    >

      {/* Presentación de la sección */}
      <div className="ec-sales-hero">

        <div className="ec-sales-hero-copy">
          <span className="ec-sales-eyebrow">
            ANÁLISIS EXPLORATORIO DE DATOS
          </span>

          <h2>
            Entendiendo el comportamiento de compra
          </h2>

          <p>
            Analizamos la evolución de las ventas,
            las categorías de productos, las estaciones
            del año, los descuentos y las preferencias
            de pago para identificar oportunidades de
            mejora en la operación del comercio electrónico.
          </p>
        </div>

        <div className="ec-sales-stats">

          <div className="ec-sales-stat">
            <strong>1,980</strong>
            <span>Pedidos únicos</span>
          </div>

          <div className="ec-sales-stat">
            <strong>10</strong>
            <span>Categorías</span>
          </div>

          <div className="ec-sales-stat">
            <strong>7</strong>
            <span>Métodos de pago</span>
          </div>

        </div>
      </div>

      {/* Encabezado de gráficos */}
      <div className="ec-sales-heading">
        <div>
          <span className="ec-sales-overline">
            EXPLORACIÓN VISUAL
          </span>

          <h2>Ventas y comportamiento de compra</h2>

          <p>
            Visualizaciones elaboradas con Pandas
            y Matplotlib en Google Colab.
          </p>
        </div>

        <span className="ec-sales-count">
          5 visualizaciones
        </span>
      </div>

      {/* Listado de gráficos */}
      <div className="ec-sales-grid">

        {salesCharts.map((chart) => (
          <div
            key={chart.number}
            className={
              chart.featured
                ? "ec-sales-grid-item ec-sales-featured"
                : "ec-sales-grid-item"
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

      {/* Nota metodológica */}
      <div className="ec-sales-note">
        <strong>Nota metodológica:</strong>

        <p>
          El análisis utiliza 1,980 registros únicos,
          después de eliminar 20 registros duplicados.
          Los montos corresponden a FinalAmount,
          expresado en dólares estadounidenses,
          sin descontar posibles reembolsos por
          devoluciones. Las visualizaciones son
          estáticas y representan el dataset completo.
        </p>
      </div>

      {/* Conclusiones */}
      <section
        className="ec-sales-conclusions"
        aria-labelledby="ec-conclusions-title"
      >
        <div className="ec-sales-heading">
          <div>
            <span className="ec-sales-overline">
              HALLAZGOS PRINCIPALES
            </span>

            <h2 id="ec-conclusions-title">
              Conclusiones del análisis
            </h2>

            <p>
              Oportunidades identificadas a partir
              del comportamiento de compra.
            </p>
          </div>
        </div>

        <div className="ec-conclusions-grid">

          {conclusions.map((item) => (
            <article
              key={item.number}
              className="ec-conclusion-card"
            >
              <span className="ec-conclusion-number">
                {item.number}
              </span>

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