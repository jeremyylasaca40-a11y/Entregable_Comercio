import Icon from "./Icon.jsx";

export default function DataNotes() {
  return (
    <section className="data-notes" aria-label="Cómo interpretar los datos">
      <div className="notes-title">
        <Icon name="info" />
        <h2>Antes de interpretar los resultados</h2>
      </div>
      <div className="notes-grid">
        <details>
          <summary>¿Qué significa el monto total?</summary>
          <p>
            Es la suma de FinalAmount después de descuentos, incluyendo pedidos
            devueltos. No representa utilidad ni ingresos netos de reembolsos.
            El CSV no especifica la moneda: se muestran unidades monetarias (u.
            m.).
          </p>
        </details>
        <details>
          <summary>¿Cómo se calcula una devolución?</summary>
          <p>
            La tasa es el número de pedidos marcados con Returned = Yes dividido
            entre los pedidos de la selección, multiplicado por 100. No equivale
            a una pérdida monetaria.
          </p>
        </details>
        <details>
          <summary>¿Qué límites tiene este análisis?</summary>
          <p>
            El archivo no documenta su fuente original ni una empresa. Sus
            resultados describen esta muestra. El año 2025 solo incluye enero y
            febrero; las asociaciones observadas no prueban causalidad.
          </p>
        </details>
      </div>
    </section>
  );
}
