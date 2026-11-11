'use strict';

const { OrdenCompra, Proveedor, Material } = require('../models');

// Matriz de aprobación según el monto de la compra (Ejercicio A1 del documento)
function evaluarMatrizAprobacion(montoTotal) {
  if (montoTotal <= 250000) {
    return {
      aprobador_requerido: 'Jefatura del área solicitante',
      cotizaciones_requeridas: '1',
      umbral: 'Hasta ₡250 000',
    };
  }
  if (montoTotal <= 2000000) {
    return {
      aprobador_requerido: 'Jefatura de Compras',
      cotizaciones_requeridas: '2',
      umbral: '₡250 001 a ₡2 000 000',
    };
  }
  if (montoTotal <= 10000000) {
    return {
      aprobador_requerido: 'Gerencia Financiera',
      cotizaciones_requeridas: '3',
      umbral: '₡2 000 001 a ₡10 000 000',
    };
  }
  return {
    aprobador_requerido: 'Gerencia General',
    cotizaciones_requeridas: '3 + comité de compras',
    umbral: 'Más de ₡10 000 000',
  };
}

async function listarOrdenes() {
  const ordenes = await OrdenCompra.findAll({
    include: [
      { model: Proveedor, as: 'proveedor' },
      { model: Material, as: 'material' },
    ],
    order: [['fecha_emision', 'DESC'], ['id', 'DESC']],
  });

  return ordenes.map((oc) => {
    const plain = oc.get({ plain: true });
    const montoTotal = Number(plain.cantidad_solicitada) * Number(plain.precio_unitario);
    return {
      ...plain,
      cantidad_solicitada: Number(plain.cantidad_solicitada),
      precio_unitario: Number(plain.precio_unitario),
      monto_total: montoTotal,
      matriz_aprobacion: evaluarMatrizAprobacion(montoTotal),
    };
  });
}

async function obtenerOrdenPorId(id) {
  const oc = await OrdenCompra.findByPk(id, {
    include: [
      { model: Proveedor, as: 'proveedor' },
      { model: Material, as: 'material' },
    ],
  });
  if (!oc) {
    const err = new Error(`Orden de compra con ID ${id} no encontrada.`);
    err.statusCode = 404;
    throw err;
  }
  const plain = oc.get({ plain: true });
  const montoTotal = Number(plain.cantidad_solicitada) * Number(plain.precio_unitario);
  return {
    ...plain,
    cantidad_solicitada: Number(plain.cantidad_solicitada),
    precio_unitario: Number(plain.precio_unitario),
    monto_total: montoTotal,
    matriz_aprobacion: evaluarMatrizAprobacion(montoTotal),
  };
}

async function crearOrdenCompra(payload) {
  const numero_oc = String(payload.numero_oc || '').trim().toUpperCase();
  const proveedor_id = Number(payload.proveedor_id);
  const material_id = Number(payload.material_id);
  const cantidad_solicitada = Number(payload.cantidad_solicitada);
  const precio_unitario = Number(payload.precio_unitario);
  const usuario_creador = String(payload.usuario_creador || '').trim();
  const observaciones = payload.observaciones
    ? String(payload.observaciones).trim()
    : 'Orden de compra emitida desde plataforma';

  if (!numero_oc || !proveedor_id || !material_id || !cantidad_solicitada || !precio_unitario || !usuario_creador) {
    const err = new Error(
      'Los campos numero_oc, proveedor_id, material_id, cantidad_solicitada, precio_unitario y usuario_creador son obligatorios.'
    );
    err.statusCode = 400;
    throw err;
  }

  const existente = await OrdenCompra.findOne({ where: { numero_oc } });
  if (existente) {
    const err = new Error(`Ya existe una orden de compra con el número "${numero_oc}".`);
    err.statusCode = 409;
    throw err;
  }

  const ordenesPrevias = await OrdenCompra.findAll({
    where: { proveedor_id, material_id },
    order: [['fecha_emision', 'DESC']],
  });

  const fechaEmision = payload.fecha_emision ? new Date(payload.fecha_emision) : new Date();

  let alertaDuplicado = null;
  for (const prev of ordenesPrevias) {
    if (prev.estado === 'ANULADA') continue;
    const prevCant = Number(prev.cantidad_solicitada);
    const pctDif =
      (Math.abs(prevCant - cantidad_solicitada) / Math.max(prevCant, cantidad_solicitada)) * 100;
    const horasDif = Math.abs(fechaEmision - new Date(prev.fecha_emision)) / (1000 * 60 * 60);
    const diasDif = Math.floor(horasDif / 24);

    if (diasDif <= 3 && pctDif <= 10) {
      alertaDuplicado = {
        orden_similar: prev.numero_oc,
        dias_diferencia: diasDif,
        porcentaje_diferencia: Number(pctDif.toFixed(2)),
      };
      break;
    }
  }

  const nueva = await OrdenCompra.create({
    numero_oc,
    proveedor_id,
    material_id,
    cantidad_solicitada,
    precio_unitario,
    fecha_emision: fechaEmision,
    estado: payload.estado || 'EMITIDA',
    usuario_creador,
    observaciones,
  });

  const ordenCompleta = await obtenerOrdenPorId(nueva.id);
  return {
    orden: ordenCompleta,
    alerta_duplicado: alertaDuplicado,
  };
}

async function actualizarOrdenCompra(id, payload) {
  const oc = await OrdenCompra.findByPk(id);
  if (!oc) {
    const err = new Error(`Orden de compra con ID ${id} no encontrada.`);
    err.statusCode = 404;
    throw err;
  }

  await oc.update({
    estado: payload.estado || oc.estado,
    cantidad_solicitada:
      payload.cantidad_solicitada !== undefined
        ? Number(payload.cantidad_solicitada)
        : oc.cantidad_solicitada,
    precio_unitario:
      payload.precio_unitario !== undefined ? Number(payload.precio_unitario) : oc.precio_unitario,
    observaciones: payload.observaciones !== undefined ? payload.observaciones : oc.observaciones,
  });

  return obtenerOrdenPorId(id);
}

async function eliminarOrdenCompra(id) {
  const oc = await OrdenCompra.findByPk(id);
  if (!oc) {
    const err = new Error(`Orden de compra con ID ${id} no encontrada.`);
    err.statusCode = 404;
    throw err;
  }
  await oc.destroy();
  return { id };
}

async function detectarPosiblesDuplicados(maxDias = 3, maxPct = 10) {
  const ordenes = await OrdenCompra.findAll({
    include: [
      { model: Proveedor, as: 'proveedor' },
      { model: Material, as: 'material' },
    ],
    order: [['fecha_emision', 'ASC'], ['id', 'ASC']],
  });

  const plainOrdenes = ordenes.map((o) => {
    const p = o.get({ plain: true });
    return {
      ...p,
      cantidad_solicitada: Number(p.cantidad_solicitada),
      precio_unitario: Number(p.precio_unitario),
    };
  });

  const pares = [];
  for (let i = 0; i < plainOrdenes.length; i++) {
    for (let j = i + 1; j < plainOrdenes.length; j++) {
      const oc1 = plainOrdenes[i];
      const oc2 = plainOrdenes[j];

      if (
        oc1.proveedor_id === oc2.proveedor_id &&
        oc1.material_id === oc2.material_id &&
        oc1.estado !== 'ANULADA' &&
        oc2.estado !== 'ANULADA'
      ) {
        const d1 = new Date(oc1.fecha_emision);
        const d2 = new Date(oc2.fecha_emision);
        const horasDif = Math.abs(d2 - d1) / (1000 * 60 * 60);
        const diasDif = Math.floor(horasDif / 24);
        const pctDif = Number(
          (
            (Math.abs(oc1.cantidad_solicitada - oc2.cantidad_solicitada) /
              Math.max(oc1.cantidad_solicitada, oc2.cantidad_solicitada)) *
            100
          ).toFixed(2)
        );

        if (diasDif <= maxDias && pctDif <= maxPct) {
          const esAlto = pctDif === 0 && horasDif <= 24;
          pares.push({
            id: `${oc1.id}-${oc2.id}`,
            nivel_riesgo: esAlto
              ? 'RIESGO ALTO • Coincidencia Exacta en menos de 24h'
              : 'RIESGO MEDIO • Cantidad y Fecha Similares',
            es_alto: esAlto,
            proveedor: oc1.proveedor,
            material: oc1.material,
            horas_diferencia: Math.round(horasDif),
            dias_diferencia: diasDif,
            porcentaje_diferencia: pctDif,
            orden_original: oc1,
            orden_sospechosa: oc2,
          });
        }
      }
    }
  }

  return pares;
}

module.exports = {
  listarOrdenes,
  obtenerOrdenPorId,
  crearOrdenCompra,
  actualizarOrdenCompra,
  eliminarOrdenCompra,
  detectarPosiblesDuplicados,
};
