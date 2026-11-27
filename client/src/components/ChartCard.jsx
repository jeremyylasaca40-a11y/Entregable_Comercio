import { useRef } from "react";
import "./ChartCard.css";

export default function ChartCard({
  number,
  title,
  image,
  insight,
  type = "Análisis de datos",
}) {
  const dialogRef = useRef(null);

  const openModal = () => {
    dialogRef.current?.showModal();
  };

  const closeModal = () => {
    dialogRef.current?.close();
  };

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      closeModal();
    }
  };

  return (
    <article className="ec-chart-card">

      {/* Encabezado */}
      <header className="ec-chart-header">
        <div>
          <span className="ec-chart-label">
            {number && `GRÁFICO ${number} · `}
            {type}
          </span>

          <h3 className="ec-chart-title">
            {title}
          </h3>
        </div>

        <button
          type="button"
          className="ec-chart-expand"
          onClick={openModal}
          aria-label={`Ampliar ${title}`}
          title="Ampliar gráfico"
        >
          ⤢
        </button>
      </header>

      {/* Imagen del gráfico */}
      <button
        type="button"
        className="ec-chart-image-button"
        onClick={openModal}
        aria-label={`Ver gráfico ampliado: ${title}`}
      >
        <img
          className="ec-chart-image"
          src={image}
          alt={title}
          loading="lazy"
        />
      </button>

      {/* Interpretación */}
      <div className="ec-chart-insight">
        <span className="ec-insight-label">
          Interpretación del gráfico
        </span>

        <p>{insight}</p>
      </div>

      {/* Pie de tarjeta */}
      <footer className="ec-chart-footer">
        <span>Fuente: Ecommerce_2000.csv</span>

        <button
          type="button"
          className="ec-chart-link"
          onClick={openModal}
        >
          Ampliar gráfico ↗
        </button>
      </footer>

      {/* Modal */}
      <dialog
        ref={dialogRef}
        className="ec-chart-modal"
        aria-label={title}
        onClick={handleBackdropClick}
      >
        <div className="ec-modal-content">

          <header className="ec-modal-header">
            <div>
              <span className="ec-chart-label">
                GRÁFICO {number}
              </span>

              <h2>{title}</h2>
            </div>

            <button
              type="button"
              className="ec-modal-close"
              onClick={closeModal}
              aria-label="Cerrar gráfico"
              autoFocus
            >
              ×
            </button>
          </header>

          <div className="ec-modal-image-container">
            <img
              src={image}
              alt={title}
              className="ec-modal-image"
            />
          </div>

          <div className="ec-chart-insight">
            <span className="ec-insight-label">
              Interpretación del gráfico
            </span>

            <p>{insight}</p>
          </div>

          <div className="ec-modal-footer">
            <a
              href={image}
              download
              className="ec-chart-download"
            >
              Descargar gráfico
            </a>

            <button
              type="button"
              className="ec-modal-button"
              onClick={closeModal}
            >
              Cerrar
            </button>
          </div>

        </div>
      </dialog>

    </article>
  );
}