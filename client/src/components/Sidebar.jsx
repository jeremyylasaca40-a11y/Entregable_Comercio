import { useEffect, useRef } from "react";
import Icon from "./Icon.jsx";
import { teamSections } from "../sections/index.js";

const links = [
  { id: "resumen", label: "Resumen general", icon: "dashboard" },
  { id: "contexto", label: "Contexto del problema", icon: "context" },
  {
    id: "ventas",
    label: "Ventas y pagos",
    icon: "sales",
    pending: !teamSections.ventas,
  },
  {
    id: "logistica",
    label: "Envíos y devoluciones",
    icon: "truck",
    pending: !teamSections.logistica,
  },
  {
    id: "prediccion",
    label: "Predicción de devolución",
    icon: "predict",
    pending: !teamSections.prediccion,
  },
];

export default function Sidebar({ section, open, onClose }) {
  const panel = useRef(null);
  useEffect(() => {
    if (!open) return;
    const before = document.activeElement;
    panel.current.querySelector("button")?.focus();
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function keyboard(event) {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab") return;
      const elements = [...panel.current.querySelectorAll("a, button")];
      const first = elements[0],
        last = elements.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }
      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", keyboard);
    return () => {
      document.body.style.overflow = oldOverflow;
      document.removeEventListener("keydown", keyboard);
      before?.focus();
    };
  }, [open, onClose]);

  return (
    <>
      {open && (
        <div
          className="sidebar-backdrop"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        ref={panel}
        id="main-navigation"
        className={`sidebar ${open ? "is-open" : ""}`}
        aria-label="Menú principal"
        role={open ? "dialog" : undefined}
        aria-modal={open ? true : undefined}
      >
        <div className="brand-row">
          <a className="brand" href="#resumen" onClick={onClose}>
            <span className="brand-symbol">
              <Icon name="bag" size={25} />
            </span>
            <span>
              comercio<span className="brand-caption">DATOS QUE CUENTAN</span>
            </span>
          </a>
          <button
            className="icon-button mobile-only sidebar-close"
            onClick={onClose}
            aria-label="Cerrar menú"
          >
            <Icon name="close" />
          </button>
        </div>
        <div className="workspace-tag">
          <span className="workspace-avatar">EC</span>
          <div>
            <strong>E-commerce</strong>
            <span>Panel de análisis</span>
          </div>
        </div>
        <p className="nav-label">EXPLORAR</p>
        <nav>
          {links.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              onClick={onClose}
              className={`nav-link ${section === link.id ? "active" : ""}`}
              aria-current={section === link.id ? "page" : undefined}
            >
              <Icon name={link.icon} />
              <span>{link.label}</span>
              {link.pending && (
                <span
                  className="pending-dot"
                  title="Sección pendiente"
                  aria-label="Pendiente de integrar"
                />
              )}
            </a>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <Icon name="database" size={22} />
            <strong>Una mirada a cada pedido</strong>
            <p>Ventas, experiencia de compra y logística en un mismo lugar.</p>
          </div>
          <div className="academic-label">
            Proyecto académico<span>Seminario IA 501</span>
          </div>
        </div>
      </aside>
    </>
  );
}
