import Icon from "./Icon.jsx";

function Select({ id, label, value, onChange, disabled, children }) {
  return (
    <div className="filter-field">
      <label htmlFor={id}>{label}</label>
      <div className="select-wrap">
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
        >
          {children}
        </select>
        <Icon name="chevron" size={16} />
      </div>
    </div>
  );
}

export default function Filters({
  category,
  season,
  setCategory,
  setSeason,
  options,
  loading,
  error,
  retry,
  reset,
}) {
  return (
    <section className="filters" aria-label="Filtros de indicadores">
      <div className="filter-intro">
        <span className="filter-icon">
          <Icon name="filter" />
        </span>
        <div>
          <strong>Explora los indicadores</strong>
          <p>Filtra los pedidos que quieres analizar.</p>
        </div>
      </div>
      <div className="filter-controls">
        <Select
          id="category"
          label="Categoría"
          value={category}
          onChange={setCategory}
          disabled={loading || !!error}
        >
          <option value="">Todas las categorías</option>
          {options?.categorias.map((item) => (
            <option key={item.categoria} value={item.categoria}>
              {item.categoria}
            </option>
          ))}
        </Select>
        <Select
          id="season"
          label="Estación registrada"
          value={season}
          onChange={setSeason}
          disabled={loading || !!error}
        >
          <option value="">Todas las estaciones</option>
          {options?.estaciones.map((item) => (
            <option key={item.estacion} value={item.estacion}>
              {item.estacion}
            </option>
          ))}
        </Select>
        <button
          className="reset-button"
          onClick={reset}
          disabled={!category && !season}
        >
          Limpiar
        </button>
      </div>
      {error && (
        <div className="filter-error" role="alert">
          No se pudieron cargar los filtros.{" "}
          <button onClick={retry}>Reintentar</button>
        </div>
      )}
    </section>
  );
}
