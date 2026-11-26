import { useCallback, useEffect, useState } from "react";
import Sidebar from "./components/Sidebar.jsx";
import Icon from "./components/Icon.jsx";
import Filters from "./components/Filters.jsx";
import KpiGrid from "./components/KpiGrid.jsx";
import DataNotes from "./components/DataNotes.jsx";
import ContextSection from "./sections/ContextSection.jsx";
import PendingSection from "./sections/PendingSection.jsx";
import { teamSections } from "./sections/index.js";
import useApi from "./hooks/useApi.js";
import { integer, validateKpis } from "./lib/api.js";

const names = {
  resumen: "Resumen general",
  contexto: "Contexto del problema",
  ventas: "Ventas y pagos",
  logistica: "Envíos y devoluciones",
  prediccion: "Predicción de devolución",
};
function currentSection() {
  const id = window.location.hash.slice(1);
  return Object.hasOwn(names, id) ? id : "resumen";
}
function validateOptions(data) {
  if (!Array.isArray(data?.categorias) || !Array.isArray(data?.estaciones))
    throw new Error("No se recibieron los filtros disponibles.");
  return data;
}

export default function App() {
  const [section, setSection] = useState(currentSection);
  const [menuOpen, setMenuOpen] = useState(false);
  const [category, setCategory] = useState("");
  const [season, setSeason] = useState("");
  const [revision, setRevision] = useState(0);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const retry = () => setRevision((value) => value + 1);
  const options = useApi("/resumen", revision, validateOptions);
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (season) params.set("season", season);
  const query = params.toString();
  const kpis = useApi(
    `/kpis${query ? `?${query}` : ""}`,
    revision,
    validateKpis,
  );
  useEffect(() => {
    const onHashChange = () => {
      setSection(currentSection());
      setMenuOpen(false);
      window.scrollTo({ top: 0 });
      document.getElementById("page-title")?.focus();
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);
  useEffect(() => {
    document.title = `${names[section]} · Comercio`;
  }, [section]);
  const TeamSection = teamSections[section];
  const status = kpis.loading
    ? "Consultando datos"
    : kpis.error
      ? "Conexión pendiente"
      : "Datos conectados";

  return (
    <div className="app-shell">
      <a
        className="skip-link"
        href="#main-content"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById("main-content").focus();
        }}
      >
        Saltar al contenido
      </a>
      <Sidebar section={section} open={menuOpen} onClose={closeMenu} />
      <div className="main-shell" inert={menuOpen ? true : undefined}>
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="icon-button mobile-only"
              onClick={() => setMenuOpen(true)}
              aria-label="Abrir menú"
              aria-expanded={menuOpen}
              aria-controls="main-navigation"
            >
              <Icon name="menu" />
            </button>
            <span>Panel de análisis</span>
            <span className="breadcrumb-divider">/</span>
            <strong>{names[section]}</strong>
          </div>
          <div
            className={`connection ${kpis.error ? "offline" : ""}`}
            role="status"
          >
            <span className="status-dot" />
            {status}
          </div>
        </header>
        <main id="main-content" className="main-content" tabIndex={-1}>
          <div className="page-heading">
            <div>
              <span className="eyebrow">
                INTELIGENCIA DE NEGOCIO · E-COMMERCE
              </span>
              <h1 id="page-title" tabIndex={-1}>
                {names[section]}
              </h1>
              <p>
                {section === "resumen"
                  ? "Conoce los pedidos. Encuentra las preguntas que importan."
                  : section === "contexto"
                    ? "El propósito, la base de datos y los límites de nuestro análisis."
                    : "Explora otra perspectiva de la experiencia de compra."}
              </p>
            </div>
            <span className="period-tag">
              <Icon name="calendar" size={17} />
              Ene 2022 — Feb 2025
            </span>
          </div>
          {section === "resumen" ? (
            <>
              <section className="hero-banner" aria-label="Introducción">
                <div className="hero-copy">
                  <span className="hero-label">
                    <span />
                    DE LOS DATOS A LAS PREGUNTAS
                  </span>
                  <h2>
                    Cada pedido tiene
                    <br />
                    algo que contar.
                  </h2>
                  <p>
                    Un punto de partida para entender las ventas,
                    <br className="desktop-break" /> la entrega y la experiencia
                    del cliente.
                  </p>
                  <a href="#contexto" className="hero-link">
                    Conocer el análisis <Icon name="context" size={16} />
                  </a>
                </div>
                <div className="hero-visual" aria-hidden="true">
                  <div className="orbit orbit-one" />
                  <div className="orbit orbit-two" />
                  <div className="hero-node node-top">
                    <Icon name="bag" size={25} />
                    <span>Compra</span>
                  </div>
                  <div className="hero-node node-middle">
                    <Icon name="truck" size={25} />
                    <span>Entrega</span>
                  </div>
                  <div className="hero-node node-bottom">
                    <Icon name="star" size={25} />
                    <span>Experiencia</span>
                  </div>
                </div>
                <span className="hero-watermark">comercio</span>
              </section>
              <Filters
                category={category}
                season={season}
                setCategory={setCategory}
                setSeason={setSeason}
                options={options.data}
                loading={options.loading}
                error={options.error}
                retry={retry}
                reset={() => {
                  setCategory("");
                  setSeason("");
                }}
              />
              <section
                className="indicators"
                aria-labelledby="indicators-title"
              >
                <div className="section-heading">
                  <div>
                    <h2 id="indicators-title">La operación, en cifras</h2>
                    <p className="selection-label" aria-live="polite">
                      {category || "Todas las categorías"} ·{" "}
                      {season || "Todas las estaciones"}
                      {!kpis.loading &&
                        kpis.data &&
                        ` · ${integer(kpis.data.totalPedidos)} pedidos`}
                    </p>
                  </div>
                  <button
                    className="button button-quiet"
                    onClick={retry}
                    disabled={kpis.loading}
                  >
                    <Icon name="refresh" size={16} />
                    Actualizar
                  </button>
                </div>
                <KpiGrid {...kpis} retry={retry} />
                <p className="metric-caption">
                  <Icon name="info" size={15} />
                  Los filtros se aplican a estos indicadores. Montos en unidades
                  monetarias (u. m.).
                </p>
              </section>
              <ContextSection compact />
              <DataNotes />
            </>
          ) : section === "contexto" ? (
            <>
              <ContextSection />
              <DataNotes />
            </>
          ) : TeamSection ? (
            <TeamSection />
          ) : (
            <PendingSection section={section} />
          )}
          <footer className="page-footer">
            <span>
              <Icon name="bag" size={16} />
              Comercio · Análisis de e-commerce
            </span>
            <span>
              Dataset: Ecommerce_2000.csv{" "}
              <span className="footer-divider">/</span> Proyecto académico
            </span>
          </footer>
        </main>
      </div>
    </div>
  );
}
