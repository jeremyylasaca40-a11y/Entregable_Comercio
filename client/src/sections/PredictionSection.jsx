import { useState } from "react";
import Icon from "../components/Icon.jsx";
import useApi from "../hooks/useApi.js";
import { decimal, integer, postJson } from "../lib/api.js";
import "./PredictionSection.css";

const CATEGORIES = [
  "Clothing",
  "Electronics",
  "Beauty & Personal Care",
  "Toys & Games",
  "Sports & Outdoors",
  "Health & Wellness",
  "Home & Kitchen",
  "Books",
  "Automotive",
  "Grocery",
];

// El backend traduce PaymentMethod a español al cargar el CSV.
const PAYMENTS = [
  "Compra ahora, paga después",
  "Tarjeta de regalo",
  "Apple Pay",
  "Tarjeta de débito",
  "PayPal",
  "Tarjeta de crédito",
  "Google Pay",
];

const DEVICES = [
  { value: "Mobile", label: "Móvil (Mobile)" },
  { value: "Desktop", label: "Escritorio (Desktop)" },
  { value: "Tablet", label: "Tableta (Tablet)" },
];

const TIERS = [
  { value: "Bronze", label: "Bronze" },
  { value: "Silver", label: "Silver" },
  { value: "Gold", label: "Gold" },
  { value: "Platinum", label: "Platinum" },
];

const DISCOUNTS = [0, 5, 10, 15, 20, 25];

const FEATURE_LABELS = {
  unitPrice: "Precio unitario",
  quantity: "Cantidad",
  discountPercent: "Descuento (%)",
  finalAmount: "Monto final",
  shippingDays: "Días de envío",
};

function formatFeature(raw) {
  if (FEATURE_LABELS[raw]) return FEATURE_LABELS[raw];
  if (raw.startsWith("cat:")) return `Categoría: ${raw.slice(4)}`;
  if (raw.startsWith("pay:")) return `Pago: ${raw.slice(4)}`;
  if (raw.startsWith("dev:")) return `Dispositivo: ${raw.slice(4)}`;
  if (raw.startsWith("tier:")) return `Membresía: ${raw.slice(5)}`;
  return raw;
}

const INITIAL_FORM = {
  category: "Clothing",
  unitPrice: 120,
  quantity: 1,
  discountPercent: 10,
  shippingDays: 5,
  paymentMethod: "Tarjeta de crédito",
  deviceType: "Mobile",
  membershipTier: "Silver",
};

export default function PredictionSection() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [revision, setRevision] = useState(0);

  const metricsApi = useApi("/modelo/metricas", revision);
  const metrics = metricsApi.data;

  const estimatedTotal =
    Number(form.unitPrice || 0) *
    Number(form.quantity || 1) *
    (1 - Number(form.discountPercent || 0) / 100);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const applyPreset = (preset) => {
    setForm(preset);
    setResult(null);
    setSubmitError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setSubmitError("");
    try {
      const payload = {
        ...form,
        unitPrice: Number(form.unitPrice),
        quantity: Number(form.quantity),
        discountPercent: Number(form.discountPercent),
        shippingDays: Number(form.shippingDays),
      };
      const data = await postJson("/predecir-devolucion", payload);
      setResult(data);
    } catch (error) {
      setSubmitError(
        error.message || "No se pudo calcular la predicción en este momento.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const riskClass = result
    ? result.nivelRiesgo === "Alto"
      ? "risk-high"
      : result.nivelRiesgo === "Medio"
        ? "risk-medium"
        : "risk-low"
    : "";

  return (
    <section
      className="ec-pred-section"
      aria-label="Simulador y métricas del modelo de Machine Learning"
    >
      <div className="ec-pred-hero">
        <div className="ec-pred-hero-copy">
          <span className="ec-pred-eyebrow">
            MACHINE LEARNING EN TIEMPO REAL
          </span>
          <h2>Simulador de riesgo de devolución</h2>
          <p>
            Ingresa las características de un pedido para estimar su
            probabilidad de devolución usando el modelo de Regresión Logística
            Binaria entrenado sobre Ecommerce_2000.csv.
          </p>
        </div>
        <div className="ec-pred-presets">
          <span>Escenarios rápidos:</span>
          <div className="ec-pred-preset-buttons">
            <button
              type="button"
              onClick={() =>
                applyPreset({
                  category: "Clothing",
                  unitPrice: 180,
                  quantity: 2,
                  discountPercent: 15,
                  shippingDays: 6,
                  paymentMethod: "Compra ahora, paga después",
                  deviceType: "Mobile",
                  membershipTier: "Bronze",
                })
              }
            >
              Riesgo alto (Ropa)
            </button>
            <button
              type="button"
              onClick={() =>
                applyPreset({
                  category: "Grocery",
                  unitPrice: 35,
                  quantity: 1,
                  discountPercent: 0,
                  shippingDays: 2,
                  paymentMethod: "Tarjeta de débito",
                  deviceType: "Desktop",
                  membershipTier: "Gold",
                })
              }
            >
              Riesgo bajo (Grocery)
            </button>
          </div>
        </div>
      </div>

      {/* Bloque 1: Simulador interactivo */}
      <div className="ec-pred-workspace">
        <form className="ec-pred-card ec-pred-form" onSubmit={handleSubmit}>
          <div className="ec-pred-card-head">
            <h3>Parámetros del pedido</h3>
            <span className="ec-pred-total-pill">
              Monto estimado: <strong>{decimal(estimatedTotal)} u. m.</strong>
            </span>
          </div>

          <div className="ec-pred-grid">
            <label className="ec-pred-field">
              <span>Categoría de producto</span>
              <select
                value={form.category}
                onChange={(e) => updateField("category", e.target.value)}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </label>

            <label className="ec-pred-field">
              <span>Método de pago</span>
              <select
                value={form.paymentMethod}
                onChange={(e) => updateField("paymentMethod", e.target.value)}
              >
                {PAYMENTS.map((pay) => (
                  <option key={pay} value={pay}>
                    {pay}
                  </option>
                ))}
              </select>
            </label>

            <label className="ec-pred-field">
              <span>Precio unitario (u. m.)</span>
              <input
                type="number"
                min="1"
                max="2000"
                step="0.5"
                required
                value={form.unitPrice}
                onChange={(e) => updateField("unitPrice", e.target.value)}
              />
            </label>

            <label className="ec-pred-field">
              <span>Cantidad (1 a 5)</span>
              <input
                type="number"
                min="1"
                max="5"
                required
                value={form.quantity}
                onChange={(e) => updateField("quantity", e.target.value)}
              />
            </label>

            <label className="ec-pred-field">
              <span>Descuento aplicado</span>
              <select
                value={form.discountPercent}
                onChange={(e) =>
                  updateField("discountPercent", Number(e.target.value))
                }
              >
                {DISCOUNTS.map((d) => (
                  <option key={d} value={d}>
                    {d}%
                  </option>
                ))}
              </select>
            </label>

            <label className="ec-pred-field">
              <span>Días de envío ({form.shippingDays} días)</span>
              <input
                type="range"
                min="1"
                max="8"
                value={form.shippingDays}
                onChange={(e) =>
                  updateField("shippingDays", Number(e.target.value))
                }
              />
            </label>

            <label className="ec-pred-field">
              <span>Dispositivo</span>
              <select
                value={form.deviceType}
                onChange={(e) => updateField("deviceType", e.target.value)}
              >
                {DEVICES.map((dev) => (
                  <option key={dev.value} value={dev.value}>
                    {dev.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="ec-pred-field">
              <span>Nivel de membresía</span>
              <select
                value={form.membershipTier}
                onChange={(e) => updateField("membershipTier", e.target.value)}
              >
                {TIERS.map((tier) => (
                  <option key={tier.value} value={tier.value}>
                    {tier.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {submitError && (
            <div className="ec-pred-alert" role="alert">
              <Icon name="info" size={18} />
              <span>{submitError}</span>
            </div>
          )}

          <div className="ec-pred-actions">
            <button
              type="submit"
              className="button button-primary"
              disabled={submitting}
            >
              <Icon name="predict" size={16} />
              {submitting ? "Calculando..." : "Predecir devolución"}
            </button>
            <button
              type="button"
              className="button button-quiet"
              onClick={() => applyPreset(INITIAL_FORM)}
            >
              Restablecer
            </button>
          </div>
        </form>

        {/* Panel de resultado */}
        <aside className="ec-pred-card ec-pred-result" aria-live="polite">
          <h3>Resultado de la predicción</h3>

          {!result ? (
            <div className="ec-pred-placeholder">
              <span className="ec-pred-placeholder-icon">
                <Icon name="predict" size={32} />
              </span>
              <strong>Listo para simular</strong>
              <p>
                Ajusta los campos del formulario y presiona{" "}
                <em>Predecir devolución</em> para consultar el modelo en vivo.
              </p>
            </div>
          ) : (
            <div className="ec-pred-output">
              <div className={`ec-pred-score ${riskClass}`}>
                <span className="ec-pred-badge">
                  Riesgo {result.nivelRiesgo}
                </span>
                <strong>{decimal(result.probabilidadDevolucion)}%</strong>
                <p>
                  Clasificación estimada:{" "}
                  <strong>{result.prediccion}</strong>
                </p>
                <div className="ec-pred-bar-track" aria-hidden="true">
                  <div
                    className="ec-pred-bar-fill"
                    style={{
                      width: `${Math.min(100, Math.max(0, result.probabilidadDevolucion))}%`,
                    }}
                  />
                </div>
              </div>

              <div className="ec-pred-factors">
                <h4>Factores que más influyeron</h4>
                {result.factoresPrincipales?.length > 0 ? (
                  <ul>
                    {result.factoresPrincipales.map((f) => (
                      <li key={f.variable}>
                        <span>{formatFeature(f.variable)}</span>
                        <strong
                          className={
                            f.contribucion >= 0 ? "factor-up" : "factor-down"
                          }
                        >
                          {f.contribucion >= 0 ? "+" : ""}
                          {f.contribucion}
                        </strong>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="ec-pred-muted">
                    No se detectaron factores individuales con contribución
                    dominante.
                  </p>
                )}
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* Bloque 2: Métricas del modelo */}
      <section className="ec-pred-metrics" aria-labelledby="ec-metrics-title">
        <div className="ec-pred-metrics-head">
          <div>
            <span className="ec-pred-overline">EVALUACIÓN DEL MODELO</span>
            <h2 id="ec-metrics-title">Métricas de rendimiento (Test 20%)</h2>
            <p>
              {metrics
                ? `${metrics.algoritmo} · ${integer(metrics.muestrasEntrenamiento)} entrenamiento / ${integer(metrics.muestrasPrueba)} prueba · ${metrics.variablesUtilizadas} variables`
                : "Consultando métricas desde /api/modelo/metricas..."}
            </p>
          </div>
          <button
            type="button"
            className="button button-quiet"
            onClick={() => setRevision((v) => v + 1)}
            disabled={metricsApi.loading}
          >
            <Icon name="refresh" size={16} />
            Recargar
          </button>
        </div>

        {metricsApi.error ? (
          <div className="error-panel" role="alert">
            <span className="error-icon">
              <Icon name="info" size={24} />
            </span>
            <div>
              <h3>No pudimos obtener las métricas del modelo</h3>
              <p>{metricsApi.error}</p>
            </div>
            <button
              type="button"
              className="button button-primary"
              onClick={() => setRevision((v) => v + 1)}
            >
              Reintentar
            </button>
          </div>
        ) : metricsApi.loading || !metrics ? (
          <div className="ec-pred-kpi-row">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="ec-pred-metric-card">
                <span className="skeleton skeleton-note" />
                <span className="skeleton skeleton-value" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="ec-pred-kpi-row">
              <article className="ec-pred-metric-card">
                <span>Accuracy (Exactitud)</span>
                <strong>{decimal(metrics.accuracy)}%</strong>
                <p>Proporción total de aciertos en prueba.</p>
              </article>
              <article className="ec-pred-metric-card">
                <span>Precision (Precisión)</span>
                <strong>{decimal(metrics.precision)}%</strong>
                <p>De los predichos como devueltos, cuántos lo fueron.</p>
              </article>
              <article className="ec-pred-metric-card">
                <span>Recall (Sensibilidad)</span>
                <strong>{decimal(metrics.recall)}%</strong>
                <p>De las devoluciones reales, cuántas detectó el modelo.</p>
              </article>
              <article className="ec-pred-metric-card">
                <span>F1-Score</span>
                <strong>{decimal(metrics.f1Score)}%</strong>
                <p>Balance armónico entre precisión y sensibilidad.</p>
              </article>
            </div>

            <div className="ec-pred-bottom-grid">
              <article className="ec-pred-card">
                <h3>Matriz de confusión</h3>
                <p className="ec-pred-muted">
                  Resultados sobre los {integer(metrics.muestrasPrueba)} pedidos
                  del conjunto de prueba.
                </p>
                <div className="ec-confusion-grid">
                  <div className="ec-cm-cell cm-good">
                    <span>Verdaderos Negativos (TN)</span>
                    <strong>{integer(metrics.matrizConfusion.tn)}</strong>
                    <small>No devueltos acertados</small>
                  </div>
                  <div className="ec-cm-cell cm-warn">
                    <span>Falsos Positivos (FP)</span>
                    <strong>{integer(metrics.matrizConfusion.fp)}</strong>
                    <small>Alertas preventivas extra</small>
                  </div>
                  <div className="ec-cm-cell cm-warn">
                    <span>Falsos Negativos (FN)</span>
                    <strong>{integer(metrics.matrizConfusion.fn)}</strong>
                    <small>Devoluciones no detectadas</small>
                  </div>
                  <div className="ec-cm-cell cm-good">
                    <span>Verdaderos Positivos (TP)</span>
                    <strong>{integer(metrics.matrizConfusion.tp)}</strong>
                    <small>Devoluciones detectadas</small>
                  </div>
                </div>
              </article>

              <article className="ec-pred-card">
                <h3>Variables con mayor peso</h3>
                <p className="ec-pred-muted">
                  Principales coeficientes aprendidos por la Regresión
                  Logística.
                </p>
                <ul className="ec-top-factors-list">
                  {metrics.topFactores.map((factor) => (
                    <li key={factor.variable}>
                      <div>
                        <strong>{formatFeature(factor.variable)}</strong>
                        <span>{factor.impacto}</span>
                      </div>
                      <span
                        className={`ec-weight-pill ${factor.peso >= 0 ? "factor-up" : "factor-down"}`}
                      >
                        {factor.peso >= 0 ? "+" : ""}
                        {factor.peso}
                      </span>
                    </li>
                  ))}
                </ul>
              </article>
            </div>
          </>
        )}
      </section>
    </section>
  );
}