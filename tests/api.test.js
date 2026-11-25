import test from 'node:test';
import assert from 'node:assert/strict';

process.env.NODE_ENV = 'test';
const { default: app } = await import('../backend/index.js');

let server;
let baseUrl;

test.before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

test.after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('GET / responde con el estado y lista de endpoints', async () => {
  const res = await fetch(`${baseUrl}/`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.ok, true);
  assert.ok(Array.isArray(data.endpoints));
});

test('GET /api/health carga los 1980 registros únicos', async () => {
  const res = await fetch(`${baseUrl}/api/health`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.ok, true);
  assert.equal(data.recordsLoaded, 1980);
});

test('GET /api/kpis devuelve métricas válidas y soporta filtros', async () => {
  const res = await fetch(`${baseUrl}/api/kpis`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.totalPedidos, 1980);
  assert.ok(data.ventasTotales > 0);
  assert.ok(data.tasaDevolucion >= 0 && data.tasaDevolucion <= 100);

  const filtered = await fetch(`${baseUrl}/api/kpis?season=Verano`);
  assert.equal(filtered.status, 200);
  const filteredData = await filtered.json();
  assert.ok(filteredData.totalPedidos > 0 && filteredData.totalPedidos < 1980);
});

test('GET /api/resumen y GET /api/analisis devuelven agrupaciones completas', async () => {
  const resResumen = await fetch(`${baseUrl}/api/resumen`);
  assert.equal(resResumen.status, 200);
  const resumen = await resResumen.json();
  assert.ok(resumen.ventasPorMes.length > 0);
  assert.ok(resumen.categorias.length > 0);
  assert.equal(resumen.estaciones.length, 4);

  const resAnalisis = await fetch(`${baseUrl}/api/analisis`);
  assert.equal(resAnalisis.status, 200);
  const analisis = await resAnalisis.json();
  assert.ok(analisis.porMembresia.length > 0);
  assert.ok(analisis.porDispositivo.length > 0);
  assert.equal(analisis.topSubcategorias.length, 5);
});

test('GET /api/pedidos pagina y filtra correctamente', async () => {
  const res = await fetch(`${baseUrl}/api/pedidos?limit=5&page=1&returned=true`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.items.length, 5);
  assert.ok(data.items.every((item) => item.returned === true));
});

test('GET /api/modelo/metricas y POST /api/predecir-devolucion funcionan', async () => {
  const resMetrics = await fetch(`${baseUrl}/api/modelo/metricas`);
  assert.equal(resMetrics.status, 200);
  const metrics = await resMetrics.json();
  assert.equal(metrics.totalMuestras, 1980);
  assert.ok(metrics.accuracy >= 0 && metrics.accuracy <= 100);
  assert.ok(metrics.topFactores.length > 0);

  const resPred = await fetch(`${baseUrl}/api/predecir-devolucion`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      category: 'Clothing',
      unitPrice: 120,
      quantity: 1,
      discountPercent: 15,
      shippingDays: 6,
      paymentMethod: 'Tarjeta de crédito',
      deviceType: 'Mobile',
      membershipTier: 'Silver',
    }),
  });
  assert.equal(resPred.status, 200);
  const pred = await resPred.json();
  assert.ok(pred.probabilidadDevolucion >= 0 && pred.probabilidadDevolucion <= 100);
  assert.ok(['Bajo', 'Medio', 'Alto'].includes(pred.nivelRiesgo));
  assert.ok(['Devuelto', 'No Devuelto'].includes(pred.prediccion));
});

