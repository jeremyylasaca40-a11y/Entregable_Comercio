/**
 * Modelo de Machine Learning (Regresión Logística Binaria) entrenado en memoria
 * sobre Ecommerce_2000.csv para predecir el riesgo de devolución de un pedido.
 */

function sigmoid(z) {
  if (z > 35) return 1;
  if (z < -35) return 0;
  return 1 / (1 + Math.exp(-z));
}

function round(value, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

const NUMERIC_FEATURES = [
  'unitPrice',
  'quantity',
  'discountPercent',
  'finalAmount',
  'shippingDays',
];

/**
 * Construye el codificador de features numéricas (Z-score) + categóricas (One-Hot).
 */
function buildFeatureEncoder(rows) {
  const categories = [...new Set(rows.map((r) => r.category))].sort();
  const payments = [...new Set(rows.map((r) => r.paymentMethod))].sort();
  const devices = [...new Set(rows.map((r) => r.deviceType))].sort();
  const tiers = [...new Set(rows.map((r) => r.membershipTier))].sort();

  const stats = {};
  for (const col of NUMERIC_FEATURES) {
    const vals = rows.map((r) => Number(r[col]) || 0);
    const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
    const variance = vals.reduce((a, b) => a + (b - mean) ** 2, 0) / vals.length;
    const std = Math.sqrt(variance) || 1;
    stats[col] = { mean, std };
  }

  const featureNames = [
    ...NUMERIC_FEATURES,
    ...categories.map((c) => `cat:${c}`),
    ...payments.map((p) => `pay:${p}`),
    ...devices.map((d) => `dev:${d}`),
    ...tiers.map((t) => `tier:${t}`),
  ];

  function encode(item) {
    const vec = [];
    for (const col of NUMERIC_FEATURES) {
      const val = Number(item[col]) || 0;
      vec.push((val - stats[col].mean) / stats[col].std);
    }
    for (const c of categories) vec.push(item.category === c ? 1 : 0);
    for (const p of payments) vec.push(item.paymentMethod === p ? 1 : 0);
    for (const d of devices) vec.push(item.deviceType === d ? 1 : 0);
    for (const t of tiers) vec.push(item.membershipTier === t ? 1 : 0);
    return vec;
  }

  return { featureNames, encode, categories, payments, devices, tiers, stats };
}

/**
 * Entrena una Regresión Logística con regularización L2 y balanceo de clases.
 */
export function trainReturnModel(rows) {
  const splitIdx = Math.floor(rows.length * 0.8);
  const trainRows = rows.slice(0, splitIdx);
  const testRows = rows.slice(splitIdx);

  const encoder = buildFeatureEncoder(trainRows);
  const numFeatures = encoder.featureNames.length;

  const XTrain = trainRows.map((r) => encoder.encode(r));
  const yTrain = trainRows.map((r) => (r.returned ? 1 : 0));

  const positives = yTrain.filter((y) => y === 1).length;
  const negatives = yTrain.length - positives;
  // Balanceo de clases para compensar el desbalance (~6.4% devoluciones)
  const posWeight = positives > 0 ? negatives / positives : 1;

  const weights = new Array(numFeatures).fill(0);
  let bias = 0;

  const learningRate = 0.05;
  const l2Lambda = 0.01;
  const epochs = 250;

  for (let epoch = 0; epoch < epochs; epoch++) {
    const gradW = new Array(numFeatures).fill(0);
    let gradB = 0;

    for (let i = 0; i < XTrain.length; i++) {
      const x = XTrain[i];
      const y = yTrain[i];
      let z = bias;
      for (let j = 0; j < numFeatures; j++) z += weights[j] * x[j];

      const pred = sigmoid(z);
      const sampleWeight = y === 1 ? posWeight : 1;
      const err = (pred - y) * sampleWeight;

      gradB += err;
      for (let j = 0; j < numFeatures; j++) {
        gradW[j] += err * x[j];
      }
    }

    const n = XTrain.length;
    bias -= (learningRate * gradB) / n;
    for (let j = 0; j < numFeatures; j++) {
      const reg = l2Lambda * weights[j];
      weights[j] -= learningRate * (gradW[j] / n + reg);
    }
  }

  // Evaluación en el conjunto de prueba (20%)
  let tp = 0;
  let tn = 0;
  let fp = 0;
  let fn = 0;

  for (const row of testRows) {
    const x = encoder.encode(row);
    let z = bias;
    for (let j = 0; j < numFeatures; j++) z += weights[j] * x[j];
    const prob = sigmoid(z);
    const pred = prob >= 0.5 ? 1 : 0;
    const actual = row.returned ? 1 : 0;

    if (pred === 1 && actual === 1) tp++;
    else if (pred === 0 && actual === 0) tn++;
    else if (pred === 1 && actual === 0) fp++;
    else fn++;
  }

  const totalTest = testRows.length || 1;
  const accuracy = round(((tp + tn) / totalTest) * 100);
  const precision = round((tp + fp > 0 ? tp / (tp + fp) : 0) * 100);
  const recall = round((tp + fn > 0 ? tp / (tp + fn) : 0) * 100);
  const f1Score = round(
    precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0
  );

  const topFactores = encoder.featureNames
    .map((name, idx) => ({
      variable: name,
      peso: round(weights[idx], 4),
      impacto: weights[idx] >= 0 ? 'Aumenta riesgo' : 'Reduce riesgo',
    }))
    .sort((a, b) => Math.abs(b.peso) - Math.abs(a.peso))
    .slice(0, 8);

  const metrics = {
    algoritmo: 'Regresión Logística Binaria (L2 + Balanceo de Clases)',
    totalMuestras: rows.length,
    muestrasEntrenamiento: trainRows.length,
    muestrasPrueba: testRows.length,
    variablesUtilizadas: encoder.featureNames.length,
    accuracy,
    precision,
    recall,
    f1Score,
    matrizConfusion: { tp, tn, fp, fn },
    topFactores,
  };

  function predict(input) {
    const unitPrice = Number(input.unitPrice ?? 120);
    const quantity = Number(input.quantity ?? 1);
    const discountPercent = Number(input.discountPercent ?? 0);
    const shippingDays = Number(input.shippingDays ?? 3);
    const finalAmount =
      input.finalAmount !== undefined
        ? Number(input.finalAmount)
        : unitPrice * quantity * (1 - discountPercent / 100);

    const sample = {
      unitPrice,
      quantity,
      discountPercent,
      finalAmount,
      shippingDays,
      category: input.category || encoder.categories[0],
      paymentMethod: input.paymentMethod || encoder.payments[0],
      deviceType: input.deviceType || encoder.devices[0],
      membershipTier: input.membershipTier || encoder.tiers[0],
    };

    const x = encoder.encode(sample);
    let z = bias;
    const contribuciones = [];

    for (let j = 0; j < numFeatures; j++) {
      const contrib = weights[j] * x[j];
      z += contrib;
      if (Math.abs(contrib) > 0.05) {
        contribuciones.push({
          variable: encoder.featureNames[j],
          contribucion: round(contrib, 3),
        });
      }
    }

    const prob = sigmoid(z);
    const probabilidadDevolucion = round(prob * 100);
    let nivelRiesgo = 'Bajo';
    if (probabilidadDevolucion >= 60) nivelRiesgo = 'Alto';
    else if (probabilidadDevolucion >= 40) nivelRiesgo = 'Medio';

    contribuciones.sort((a, b) => Math.abs(b.contribucion) - Math.abs(a.contribucion));

    return {
      entrada: sample,
      probabilidadDevolucion,
      prediccion: prob >= 0.5 ? 'Devuelto' : 'No Devuelto',
      nivelRiesgo,
      factoresPrincipales: contribuciones.slice(0, 4),
    };
  }

  return { metrics, predict };
}

