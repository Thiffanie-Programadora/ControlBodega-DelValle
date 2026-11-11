'use strict';

const { Material, MovimientoInventario, Ubicacion, OrdenCompra, Proveedor } = require('../models');

function evaluarEstado(stockActual, stockMinimo, puntoReorden, stockMaximo) {
  if (stockActual <= stockMinimo) {
    return {
      codigo: 'CRITICO',
      etiqueta: 'Crítico (Bajo Mínimo)',
      tono: 'danger',
      requiere_reorden: true,
    };
  }
  if (stockActual <= puntoReorden) {
    return {
      codigo: 'BAJO_PUNTO_REORDEN',
      etiqueta: 'Reorden Requerido',
      tono: 'warning',
      requiere_reorden: true,
    };
  }
  if (stockMaximo > 0 && stockActual > stockMaximo) {
    return {
      codigo: 'SOBRESTOCK',
      etiqueta: 'Sobrestock',
      tono: 'info',
      requiere_reorden: false,
    };
  }
  return {
    codigo: 'NORMAL',
    etiqueta: 'Stock Óptimo',
    tono: 'success',
    requiere_reorden: false,
  };
}

function calcularMetricasMaterial(materialPlain, movimientos, ubicaciones) {
  const stockMinimo = Number(materialPlain.stock_minimo);
  const stockMaximo = Number(materialPlain.stock_maximo);
  const stockSeguridad = Number(materialPlain.stock_seguridad);
  const demandaDiaria = Number(materialPlain.demanda_diaria);
  const tiempoEntregaDias = Number(materialPlain.tiempo_entrega_dias);
  const puntoReorden =
    Number(materialPlain.punto_reorden) || demandaDiaria * tiempoEntregaDias + stockSeguridad;

  const movsMaterial = movimientos.filter((mov) => mov.material_id === materialPlain.id);

  const stockActual = movsMaterial.reduce((acc, mov) => {
    const cant = Number(mov.cantidad);
    if (mov.tipo_movimiento === 'ENTRADA') return acc + cant;
    if (mov.tipo_movimiento === 'SALIDA') return acc - cant;
    return acc;
  }, 0);

  const desglosePorUbicacion = ubicaciones.map((u) => {
    const stockUbicacion = movsMaterial.reduce((acc, mov) => {
      const cant = Number(mov.cantidad);
      if (mov.tipo_movimiento === 'ENTRADA' && mov.ubicacion_id === u.id) return acc + cant;
      if (mov.tipo_movimiento === 'SALIDA' && mov.ubicacion_id === u.id) return acc - cant;
      if (mov.tipo_movimiento === 'TRASLADO' && mov.ubicacion_id === u.id) return acc - cant;
      if (mov.tipo_movimiento === 'TRASLADO' && mov.ubicacion_destino_id === u.id) return acc + cant;
      return acc;
    }, 0);

    return {
      id: u.id,
      codigo: u.codigo,
      nombre: u.nombre,
      tipo: u.tipo,
      stock_ubicacion: stockUbicacion,
    };
  });

  const infoEstado = evaluarEstado(stockActual, stockMinimo, puntoReorden, stockMaximo);
  const porcentajeNivel = Math.min(
    100,
    Math.round((stockActual / Math.max(1, stockMaximo)) * 100)
  );

  return {
    ...materialPlain,
    stock_minimo: stockMinimo,
    stock_maximo: stockMaximo,
    stock_seguridad: stockSeguridad,
    demanda_diaria: demandaDiaria,
    tiempo_entrega_dias: tiempoEntregaDias,
    punto_reorden: puntoReorden,
    stock_actual: stockActual,
    porcentaje_nivel: porcentajeNivel,
    estado: infoEstado.codigo,
    etiqueta_estado: infoEstado.etiqueta,
    tono: infoEstado.tono,
    requiere_reorden: infoEstado.requiere_reorden,
    cantidad_sugerida_compra: infoEstado.requiere_reorden
      ? Math.max(0, stockMaximo - stockActual)
      : 0,
    desglose_por_ubicacion: desglosePorUbicacion,
  };
}

async function listarMateriales() {
  const [materiales, movimientos, ubicaciones] = await Promise.all([
    Material.findAll({ order: [['id', 'ASC']] }),
    MovimientoInventario.findAll({ order: [['fecha_movimiento', 'ASC'], ['id', 'ASC']] }),
    Ubicacion.findAll({ order: [['id', 'ASC']] }),
  ]);

  const movsPlain = movimientos.map((m) => m.get({ plain: true }));
  const ubisPlain = ubicaciones.map((u) => u.get({ plain: true }));

  return materiales.map((mat) =>
    calcularMetricasMaterial(mat.get({ plain: true }), movsPlain, ubisPlain)
  );
}

async function crearMaterial(payload) {
  const sku = String(payload.sku || '').trim().toUpperCase();
  const nombre = String(payload.nombre || '').trim();
  const unidad_medida = String(payload.unidad_medida || '').trim().toUpperCase();

  if (!sku || !nombre || !unidad_medida) {
    const error = new Error('Los campos sku, nombre y unidad_medida son obligatorios.');
    error.statusCode = 400;
    throw error;
  }

  const existente = await Material.findOne({ where: { sku } });
  if (existente) {
    const error = new Error(`Ya existe un material registrado con el SKU "${sku}".`);
    error.statusCode = 409;
    throw error;
  }

  const nuevo = await Material.create({
    sku,
    nombre,
    unidad_medida,
    stock_minimo: Number(payload.stock_minimo) || 0,
    stock_maximo: Number(payload.stock_maximo) || 0,
    stock_seguridad: Number(payload.stock_seguridad) || 0,
    demanda_diaria: Number(payload.demanda_diaria) || 0,
    tiempo_entrega_dias: Number(payload.tiempo_entrega_dias) || 1,
  });

  const ubicaciones = await Ubicacion.findAll({ order: [['id', 'ASC']] });
  const ubisPlain = ubicaciones.map((u) => u.get({ plain: true }));

  return calcularMetricasMaterial(nuevo.get({ plain: true }), [], ubisPlain);
}

async function obtenerStockMaterial(materialId) {
  const material = await Material.findByPk(materialId);
  if (!material) {
    const error = new Error(`Material con ID ${materialId} no encontrado.`);
    error.statusCode = 404;
    throw error;
  }

  const [movimientos, ubicaciones] = await Promise.all([
    MovimientoInventario.findAll({
      where: { material_id: material.id },
      order: [['fecha_movimiento', 'ASC'], ['id', 'ASC']],
    }),
    Ubicacion.findAll({ order: [['id', 'ASC']] }),
  ]);

  return calcularMetricasMaterial(
    material.get({ plain: true }),
    movimientos.map((m) => m.get({ plain: true })),
    ubicaciones.map((u) => u.get({ plain: true }))
  );
}

async function actualizarMaterial(materialId, payload) {
  const material = await Material.findByPk(materialId);
  if (!material) {
    const error = new Error(`Material con ID ${materialId} no encontrado.`);
    error.statusCode = 404;
    throw error;
  }

  await material.update({
    sku: payload.sku ? String(payload.sku).trim().toUpperCase() : material.sku,
    nombre: payload.nombre ? String(payload.nombre).trim() : material.nombre,
    unidad_medida: payload.unidad_medida
      ? String(payload.unidad_medida).trim().toUpperCase()
      : material.unidad_medida,
    stock_minimo:
      payload.stock_minimo !== undefined ? Number(payload.stock_minimo) : material.stock_minimo,
    stock_maximo:
      payload.stock_maximo !== undefined ? Number(payload.stock_maximo) : material.stock_maximo,
    stock_seguridad:
      payload.stock_seguridad !== undefined
        ? Number(payload.stock_seguridad)
        : material.stock_seguridad,
    demanda_diaria:
      payload.demanda_diaria !== undefined
        ? Number(payload.demanda_diaria)
        : material.demanda_diaria,
    tiempo_entrega_dias:
      payload.tiempo_entrega_dias !== undefined
        ? Number(payload.tiempo_entrega_dias)
        : material.tiempo_entrega_dias,
  });

  return obtenerStockMaterial(material.id);
}

async function eliminarMaterial(materialId) {
  const material = await Material.findByPk(materialId);
  if (!material) {
    const error = new Error(`Material con ID ${materialId} no encontrado.`);
    error.statusCode = 404;
    throw error;
  }
  await material.destroy();
  return { id: materialId };
}

async function obtenerTrazabilidadMaterial(materialId) {
  const materialStock = await obtenerStockMaterial(materialId);

  const movimientos = await MovimientoInventario.findAll({
    where: { material_id: materialId },
    include: [
      { model: Ubicacion, as: 'ubicacionOrigen' },
      { model: Ubicacion, as: 'ubicacionDestino' },
      {
        model: OrdenCompra,
        as: 'ordenCompra',
        include: [{ model: Proveedor, as: 'proveedor' }],
      },
    ],
    order: [['fecha_movimiento', 'ASC'], ['id', 'ASC']],
  });

  let saldoAcumulado = 0;
  const kardex = movimientos.map((mov) => {
    const plain = mov.get({ plain: true });
    const cant = Number(plain.cantidad);
    if (plain.tipo_movimiento === 'ENTRADA') saldoAcumulado += cant;
    if (plain.tipo_movimiento === 'SALIDA') saldoAcumulado -= cant;

    return {
      id: plain.id,
      material_id: plain.material_id,
      tipo_movimiento: plain.tipo_movimiento,
      cantidad: cant,
      saldo_acumulado: saldoAcumulado,
      ubicacion_id: plain.ubicacion_id,
      ubicacion_codigo: plain.ubicacionOrigen?.codigo || null,
      ubicacion_nombre: plain.ubicacionOrigen?.nombre || null,
      ubicacion_destino_id: plain.ubicacion_destino_id,
      ubicacion_destino_codigo: plain.ubicacionDestino?.codigo || null,
      ubicacion_destino_nombre: plain.ubicacionDestino?.nombre || null,
      orden_compra_id: plain.orden_compra_id,
      documento_referencia: plain.documento_referencia,
      usuario_responsable: plain.usuario_responsable,
      fecha_movimiento: plain.fecha_movimiento,
      observaciones: plain.observaciones,
      oc_detalle: plain.ordenCompra
        ? {
            id: plain.ordenCompra.id,
            numero_oc: plain.ordenCompra.numero_oc,
            proveedor: plain.ordenCompra.proveedor?.nombre || null,
            ruc_proveedor: plain.ordenCompra.proveedor?.ruc || null,
            precio_unitario: Number(plain.ordenCompra.precio_unitario),
          }
        : null,
    };
  });

  return {
    material: materialStock,
    total_movimientos: kardex.length,
    kardex,
  };
}

async function obtenerAlertasReorden() {
  const todos = await listarMateriales();
  return todos
    .filter((m) => m.stock_actual <= m.punto_reorden)
    .sort((a, b) => {
      if (a.estado === 'CRITICO' && b.estado !== 'CRITICO') return -1;
      if (a.estado !== 'CRITICO' && b.estado === 'CRITICO') return 1;
      return a.stock_actual - b.stock_actual;
    });
}

module.exports = {
  listarMateriales,
  crearMaterial,
  obtenerStockMaterial,
  actualizarMaterial,
  eliminarMaterial,
  obtenerTrazabilidadMaterial,
  obtenerAlertasReorden,
};
