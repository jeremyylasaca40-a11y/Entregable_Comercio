import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse/sync';
import { trainReturnModel } from './mlModel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const ESTACIONES_ES = {
  Spring: 'Primavera',
  Summer: 'Verano',
  Fall: 'Otoño',
  Winter: 'Invierno',
};

const PAGOS_ES = {
  'Buy Now Pay Later': 'Compra ahora, paga después',
  'Gift Card': 'Tarjeta de regalo',
  'Apple Pay': 'Apple Pay',
  'Debit Card': 'Tarjeta de débito',
  PayPal: 'PayPal',
  'Credit Card': 'Tarjeta de crédito',
  'Google Pay': 'Google Pay',
};

const SEASON_ORDER = ['Primavera', 'Verano', 'Otoño', 'Invierno'];

let cachedRows = null;

/**
 * Convierte fechas tipo M/D/YYYY a YYYY-MM para agrupar mensualmente.
 */
function toYearMonth(dateStr) {
  if (!dateStr) return 'Desconocido';
  const parts = dateStr.trim().split('/');
  if (parts.length !== 3) return 'Desconocido';
  const [month, , year] = parts;
  return `${year}-${month.padStart(2, '0')}`;
}

/**
 * Carga y limpia Ecommerce_2000.csv en memoria una sola vez.
 */
function loadDataset() {
  if (cachedRows) return cachedRows;

  const candidatePaths = [
    path.resolve(process.cwd(), 'Ecommerce_2000.csv'),
    path.resolve(__dirname, '..', 'Ecommerce_2000.csv'),
  ];
  const csvPath = candidatePaths.find((p) => fs.existsSync(p));

  if (!csvPath) {
    throw new Error('No se encontró Ecommerce_2000.csv en el proyecto.');
  }

  const raw = fs.readFileSync(csvPath, 'utf-8');
  const records = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  const seen = new Set();
  const cleaned = [];

  for (const row of records) {
    if (!row.OrderID || seen.has(row.OrderID)) continue;
    seen.add(row.OrderID);

    const finalAmount = Number.parseFloat(row.FinalAmount) || 0;
    const totalAmount = Number.parseFloat(row.TotalAmount) || 0;
    const unitPrice = Number.parseFloat(row.UnitPrice) || 0;
    const quantity = Number.parseInt(row.Quantity, 10) || 0;
    const discountPercent = Number.parseFloat(row.DiscountPercent) || 0;
    const discountAmount = Number.parseFloat(row.DiscountAmount) || 0;
    const shippingDays = Number.parseInt(row.ShippingDays, 10) || 0;
    const reviewScore = Number.parseFloat(row.ReviewScore) || 0;
    const isReturned = row.Returned === 'Yes';

    cleaned.push({
      orderId: row.OrderID,
      customerId: row.CustomerID,
      customerName: `${row.FirstName} ${row.LastName}`.trim(),
      state: row.State,
      city: row.City,
      orderDate: row.OrderDate,
      yearMonth: toYearMonth(row.OrderDate),
      season: ESTACIONES_ES[row.OrderSeason] || row.OrderSeason,
      dayOfWeek: row.OrderDayOfWeek,
      category: row.ProductCategory,
      subCategory: row.ProductSubCategory,
      unitPrice,
      quantity,
      totalAmount,
      discountPercent,
      discountAmount,
      finalAmount,
      paymentMethod: PAGOS_ES[row.PaymentMethod] || row.PaymentMethod,
      deviceType: row.DeviceType,
      membershipTier: row.MembershipTier,
      shippingDays,
      returned: isReturned,
      returnedLabel: isReturned ? 'Devuelto' : 'No Devuelto',
      reviewScore,
    });
  }

  cachedRows = cleaned;
  return cachedRows;
}

let cachedModel = null;

function getModel() {
  if (!cachedModel) {
    cachedModel = trainReturnModel(loadDataset());
  }
  return cachedModel;
}

function filterRows(rows, query = {}) {
  const { category, season } = query;
  let filtered = rows;
  if (category) {
    filtered = filtered.filter((r) => r.category.toLowerCase() === String(category).toLowerCase());
  }
  if (season) {
    filtered = filtered.filter((r) => r.season.toLowerCase() === String(season).toLowerCase());
  }
  return filtered;
}

function round(value, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

app.get('/', (_req, res) => {
  res.json({
    ok: true,
    mensaje: 'API Express de E-commerce funcionando correctamente',
    endpoints: [
      '/api/health',
      '/api/kpis',
      '/api/resumen',
      '/api/analisis',
      '/api/pedidos',
      'POST /api/simular-riesgo',
      '/api/modelo/metricas',
      'POST /api/predecir-devolucion',
    ],
  });
});

app.get('/api/health', (_req, res) => {
  try {
    const rows = loadDataset();
    res.json({
      ok: true,
      service: 'ecommerce-api',
      recordsLoaded: rows.length,
    });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

app.get('/api/kpis', (req, res) => {
  try {
    const rows = filterRows(loadDataset(), req.query);
    const totalPedidos = rows.length;
    let ventasTotales = 0;
    let totalDevueltos = 0;
    let sumaCalificacion = 0;
    let sumaDiasEnvio = 0;
    let sumaDescuento = 0;

    for (const r of rows) {
      ventasTotales += r.finalAmount;
      if (r.returned) totalDevueltos += 1;
      sumaCalificacion += r.reviewScore;
      sumaDiasEnvio += r.shippingDays;
      sumaDescuento += r.discountPercent;
    }

    res.json({
      totalPedidos,
      ventasTotales: round(ventasTotales),
      ticketPromedio: round(totalPedidos ? ventasTotales / totalPedidos : 0),
      totalDevueltos,
      totalNoDevueltos: totalPedidos - totalDevueltos,
      tasaDevolucion: round(totalPedidos ? (totalDevueltos / totalPedidos) * 100 : 0),
      calificacionPromedio: round(totalPedidos ? sumaCalificacion / totalPedidos : 0),
      diasEnvioPromedio: round(totalPedidos ? sumaDiasEnvio / totalPedidos : 0),
      descuentoPromedio: round(totalPedidos ? sumaDescuento / totalPedidos : 0),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/resumen', (req, res) => {
  try {
    const rows = filterRows(loadDataset(), req.query);

    const byMonth = new Map();
    const byCategory = new Map();
    const bySeason = new Map();
    const byPayment = new Map();
    const byShippingDays = new Map();

    for (const r of rows) {
      // Ventas por mes
      const m = byMonth.get(r.yearMonth) || { anioMes: r.yearMonth, ventas: 0, pedidos: 0 };
      m.ventas += r.finalAmount;
      m.pedidos += 1;
      byMonth.set(r.yearMonth, m);

      // Por categoría
      const c = byCategory.get(r.category) || {
        categoria: r.category,
        ventas: 0,
        pedidos: 0,
        devueltos: 0,
      };
      c.ventas += r.finalAmount;
      c.pedidos += 1;
      if (r.returned) c.devueltos += 1;
      byCategory.set(r.category, c);

      // Por estación
      const s = bySeason.get(r.season) || { estacion: r.season, pedidos: 0, ventas: 0 };
      s.pedidos += 1;
      s.ventas += r.finalAmount;
      bySeason.set(r.season, s);

      // Por método de pago
      const p = byPayment.get(r.paymentMethod) || { metodoPago: r.paymentMethod, pedidos: 0, ventas: 0 };
      p.pedidos += 1;
      p.ventas += r.finalAmount;
      byPayment.set(r.paymentMethod, p);

      // Por días de envío
      const d = byShippingDays.get(r.shippingDays) || {
        diasEnvio: r.shippingDays,
        pedidos: 0,
        sumaReview: 0,
        devueltos: 0,
      };
      d.pedidos += 1;
      d.sumaReview += r.reviewScore;
      if (r.returned) d.devueltos += 1;
      byShippingDays.set(r.shippingDays, d);
    }

    const ventasPorMes = Array.from(byMonth.values())
      .sort((a, b) => a.anioMes.localeCompare(b.anioMes))
      .map((item) => ({ ...item, ventas: round(item.ventas) }));

    const categorias = Array.from(byCategory.values())
      .map((item) => ({
        categoria: item.categoria,
        ventas: round(item.ventas),
        pedidos: item.pedidos,
        devueltos: item.devueltos,
        tasaDevolucion: round((item.devueltos / item.pedidos) * 100),
      }))
      .sort((a, b) => b.ventas - a.ventas);

    const estaciones = SEASON_ORDER.filter((est) => bySeason.has(est)).map((est) => {
      const item = bySeason.get(est);
      return { ...item, ventas: round(item.ventas) };
    });

    const metodosPago = Array.from(byPayment.values())
      .map((item) => ({ ...item, ventas: round(item.ventas) }))
      .sort((a, b) => b.pedidos - a.pedidos);

    const envios = Array.from(byShippingDays.values())
      .sort((a, b) => a.diasEnvio - b.diasEnvio)
      .map((item) => ({
        diasEnvio: item.diasEnvio,
        pedidos: item.pedidos,
        calificacionPromedio: round(item.sumaReview / item.pedidos),
        tasaDevolucion: round((item.devueltos / item.pedidos) * 100),
      }));

    res.json({
      ventasPorMes,
      categorias,
      estaciones,
      metodosPago,
      envios,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/pedidos', (req, res) => {
  try {
    const rows = loadDataset();
    const { category, season, returned, payment } = req.query;
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 20));

    let filtered = rows;

    if (category) {
      filtered = filtered.filter((r) => r.category.toLowerCase() === String(category).toLowerCase());
    }
    if (season) {
      filtered = filtered.filter((r) => r.season.toLowerCase() === String(season).toLowerCase());
    }
    if (payment) {
      filtered = filtered.filter((r) => r.paymentMethod.toLowerCase() === String(payment).toLowerCase());
    }
    if (returned === 'true' || returned === 'Yes' || returned === 'Devuelto') {
      filtered = filtered.filter((r) => r.returned);
    } else if (returned === 'false' || returned === 'No' || returned === 'No Devuelto') {
      filtered = filtered.filter((r) => !r.returned);
    }

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * limit;

    res.json({
      page: safePage,
      limit,
      total,
      totalPages,
      items: filtered.slice(start, start + limit),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/simular-riesgo', (req, res) => {
  try {
    const rows = loadDataset();
    const { category, shippingDays, discountPercent } = req.body || {};

    let subset = rows;
    if (category) {
      const catSubset = subset.filter((r) => r.category.toLowerCase() === String(category).toLowerCase());
      if (catSubset.length > 0) subset = catSubset;
    }

    if (shippingDays !== undefined && shippingDays !== null && shippingDays !== '') {
      const targetDays = Number(shippingDays);
      if (!Number.isNaN(targetDays)) {
        const shipSubset = subset.filter((r) => Math.abs(r.shippingDays - targetDays) <= 1);
        if (shipSubset.length >= 10) subset = shipSubset;
      }
    }

    if (discountPercent !== undefined && discountPercent !== null && discountPercent !== '') {
      const targetDisc = Number(discountPercent);
      if (!Number.isNaN(targetDisc)) {
        const discSubset = subset.filter((r) => Math.abs(r.discountPercent - targetDisc) <= 5);
        if (discSubset.length >= 10) subset = discSubset;
      }
    }

    const sampleSize = subset.length;
    const returnedCount = subset.filter((r) => r.returned).length;
    const returnRate = round(sampleSize ? (returnedCount / sampleSize) * 100 : 0);
    const avgReview = round(
      sampleSize ? subset.reduce((acc, r) => acc + r.reviewScore, 0) / sampleSize : 0
    );

    let nivelRiesgo = 'Bajo';
    if (returnRate >= 20) nivelRiesgo = 'Alto';
    else if (returnRate >= 12) nivelRiesgo = 'Medio';

    res.json({
      criterios: {
        category: category || 'Todas',
        shippingDays: shippingDays ?? 'Todos',
        discountPercent: discountPercent ?? 'Todos',
      },
      muestraHistorica: sampleSize,
      tasaDevolucionEstimada: returnRate,
      calificacionEsperada: avgReview,
      nivelRiesgo,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/analisis', (req, res) => {
  try {
    const rows = filterRows(loadDataset(), req.query);
    const byTier = new Map();
    const byDevice = new Map();
    const bySubCategory = new Map();

    for (const r of rows) {
      const t = byTier.get(r.membershipTier) || { membresia: r.membershipTier, pedidos: 0, ventas: 0, devueltos: 0 };
      t.pedidos += 1;
      t.ventas += r.finalAmount;
      if (r.returned) t.devueltos += 1;
      byTier.set(r.membershipTier, t);

      const d = byDevice.get(r.deviceType) || { dispositivo: r.deviceType, pedidos: 0, ventas: 0, devueltos: 0 };
      d.pedidos += 1;
      d.ventas += r.finalAmount;
      if (r.returned) d.devueltos += 1;
      byDevice.set(r.deviceType, d);

      const sc = bySubCategory.get(r.subCategory) || { subcategoria: r.subCategory, pedidos: 0, ventas: 0, devueltos: 0 };
      sc.pedidos += 1;
      sc.ventas += r.finalAmount;
      if (r.returned) sc.devueltos += 1;
      bySubCategory.set(r.subCategory, sc);
    }

    const formatGroup = (map, key) =>
      Array.from(map.values())
        .map((item) => ({
          [key]: item[key],
          pedidos: item.pedidos,
          ventas: round(item.ventas),
          tasaDevolucion: round((item.devueltos / item.pedidos) * 100),
        }))
        .sort((a, b) => b.ventas - a.ventas);

    res.json({
      porMembresia: formatGroup(byTier, 'membresia'),
      porDispositivo: formatGroup(byDevice, 'dispositivo'),
      topSubcategorias: formatGroup(bySubCategory, 'subcategoria').slice(0, 5),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/modelo/metricas', (_req, res) => {
  try {
    const { metrics } = getModel();
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/predecir-devolucion', (req, res) => {
  try {
    const { predict } = getModel();
    const resultado = predict(req.body || {});
    res.json(resultado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

if (process.env.VERCEL !== '1' && process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`API Express escuchando en http://localhost:${PORT}`);
  });
}

export default app;

