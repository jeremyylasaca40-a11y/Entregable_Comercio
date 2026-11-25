# Entregable Comercio — Dashboard E-commerce & ML (Fase 2)

Aplicación web para analizar ventas, logística y riesgo de devoluciones sobre el dataset `Ecommerce_2000.csv`, integrando **Express**, **React**, **GitHub (ramas)** y **Vercel**.

---

## Arquitectura del proyecto

```text
Entregable_Comercio/
├── backend/
│   ├── index.js          # Servidor Express (local + Vercel Serverless)
│   └── mlModel.js        # Modelo de Regresión Logística Binaria en JS
├── api/
│   └── index.js          # Puente de entrada para Vercel Serverless Functions
├── tests/
│   └── api.test.js       # Pruebas automatizadas con node --test
├── client/               # Frontend React + Vite (Integrantes 2, 3 y 4)
├── Ecommerce_2000.csv    # Dataset original (2,000 filas / 1,980 únicas)
├── package.json
└── vercel.json           # Enrutamiento /api/* -> Express y /* -> React
```

---

## Cómo ejecutar el Backend (Integrante 1)

1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Levantar la API en modo local (puerto `3001`):
   ```bash
   npm run dev:api
   ```
3. Ejecutar pruebas automatizadas:
   ```bash
   npm test
   ```

---

## Endpoints disponibles

| Método | Ruta | Descripción |
| :--- | :--- | :--- |
| `GET` | `/` | Estado general y listado de endpoints. |
| `GET` | `/api/health` | Verifica carga del CSV (`1980` registros únicos). |
| `GET` | `/api/kpis` | KPIs globales (soporta `?category=...&season=...`). |
| `GET` | `/api/resumen` | Datos agrupados por mes, categoría, estación, pago y envío (soporta filtros). |
| `GET` | `/api/analisis` | Desglose por nivel de membresía, dispositivo y top 5 subcategorías. |
| `GET` | `/api/pedidos` | Tabla paginada y filtrable (`category`, `season`, `returned`, `payment`, `page`, `limit`). |
| `POST` | `/api/simular-riesgo` | Cálculo histórico por similitud de pedidos. |
| `GET` | `/api/modelo/metricas` | Métricas del modelo ML (accuracy, precision, recall, F1, matriz de confusión). |
| `POST` | `/api/predecir-devolucion` | Predicción ML de probabilidad de devolución y factores de riesgo. |

---

## Flujo de ramas en GitHub (4 integrantes)

* `feat/backend-express` — Integrante 1: Backend Express, modelo ML, tests y config Vercel.
* `feat/frontend-layout-ux` — Integrante 2: Base React + Vite, UX/UI, contexto del problema y KPIs.
* `feat/graficos-ventas` — Integrante 3: Gráficos de Colab (1, 3, 4, 5, 7) e interpretaciones.
* `feat/graficos-logistica` — Integrante 4: Gráficos de Colab (2, 6, 8, 9, 10) + simulador ML interactivo.

