import Icon from "../components/Icon.jsx";

export default function ContextSection({ compact = false }) {
  return (
    <section
      className={`context-section ${compact ? "" : "context-full"}`}
      aria-labelledby="context-title"
    >
      <div className="section-heading">
        <div>
          <span className="eyebrow">EL PUNTO DE PARTIDA</span>
          <h2 id="context-title">Detrás de la compra, hay una experiencia.</h2>
        </div>
        {compact && (
          <a className="text-link" href="#contexto">
            Leer el contexto completo
          </a>
        )}
      </div>
      <div className="context-layout">
        <article className="context-card">
          <span className="section-icon">
            <Icon name="context" size={22} />
          </span>
          <h3>¿Qué queremos entender?</h3>
          <p>
            Un pedido no termina con el pago. El envío, la experiencia del
            cliente y una posible devolución también forman parte de la
            operación de un comercio electrónico.
          </p>
          <p>
            Este análisis reúne los pedidos del dataset para observar qué se
            compra, cuánto tarda en llegar y cómo se relacionan estos datos con
            las calificaciones y devoluciones.
          </p>
          <div className="research-question">
            ¿Qué patrones de ventas, envíos y devoluciones conviene investigar
            para mejorar la gestión?
          </div>
        </article>
        <div className="question-list">
          <article>
            <span className="question-icon green">
              <Icon name="sales" />
            </span>
            <div>
              <h3>Comportamiento de compra</h3>
              <p>
                ¿Cómo varía el monto de los pedidos por mes, categoría y método
                de pago?
              </p>
            </div>
          </article>
          <article>
            <span className="question-icon blue">
              <Icon name="truck" />
            </span>
            <div>
              <h3>Experiencia de entrega</h3>
              <p>
                ¿Qué tiempos de envío se observan y cómo cambian las
                calificaciones?
              </p>
            </div>
          </article>
          <article>
            <span className="question-icon orange">
              <Icon name="returns" />
            </span>
            <div>
              <h3>Pedidos que regresan</h3>
              <p>
                ¿Qué proporción se devuelve y cómo se distribuye entre
                categorías?
              </p>
            </div>
          </article>
        </div>
      </div>
      {!compact && (
        <>
          <div className="method-grid">
            <article className="panel">
              <span className="eyebrow">OBJETIVO</span>
              <h3>Hacer visibles los patrones</h3>
              <p>
                Describir ventas, envíos y devoluciones mediante indicadores y
                visualizaciones. Los resultados ayudan a formular preguntas y
                orientar una revisión de la operación; por sí solos no prueban
                las causas de una devolución.
              </p>
            </article>
            <article className="panel">
              <span className="eyebrow">ALCANCE</span>
              <h3>Un archivo, una misma base</h3>
              <p>
                El estudio utiliza <strong>Ecommerce_2000.csv</strong>: 2,000
                filas originales y 23 columnas. Tras retirar 20 duplicados
                quedan 1,980 pedidos únicos, registrados entre el 1 de enero de
                2022 y el 28 de febrero de 2025.
              </p>
            </article>
          </div>
          <article className="panel methodology">
            <span className="eyebrow">CÓMO SE PREPARARON LOS DATOS</span>
            <h3>Del registro al indicador</h3>
            <ol>
              <li>
                <strong>Revisión inicial.</strong> Verificación de columnas,
                valores faltantes y pedidos repetidos. No se encontraron celdas
                vacías en el archivo revisado.
              </li>
              <li>
                <strong>Una fila por pedido.</strong> Se conserva el primer
                registro de cada OrderID, usando el mismo criterio en el
                análisis de Colab y en el servicio de indicadores.
              </li>
              <li>
                <strong>Fechas y medidas.</strong> Se interpreta la fecha
                original como mes/día/año, se revisan variables numéricas y se
                crean etiquetas en español.
              </li>
              <li>
                <strong>Resumen e interpretación.</strong> Se calculan
                indicadores y se preparan diez gráficos para explorar los
                resultados.
              </li>
            </ol>
          </article>
        </>
      )}
    </section>
  );
}
