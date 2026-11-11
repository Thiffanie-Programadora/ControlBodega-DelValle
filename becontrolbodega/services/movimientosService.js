'use strict';

const {
  sequelize,
  Material,
  MovimientoInventario,
  Ubicacion,
  OrdenCompra,
  Proveedor,
} = require('../models');
const materialesService = require('./materialesService');

async function listarMovimientos() {
  const movimientos = await MovimientoInventario.findAll({
    include: [
      { model: Material, as: 'material' },
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

  return movimientos.map((m) => {
    const plain = m.get({ plain: true });
    return {
      ...plain,
      cantidad: Number(plain.cantidad),
    };
  });
}

async function obtenerMovimientoPorId(id) {
  const mov = await MovimientoInventario.findByPk(id, {
    include: [
      { model: Material, as: 'material' },
      { model: Ubicacion, as: 'ubicacionOrigen' },
      { model: Ubicacion, as: 'ubicacionDestino' },
      {
        model: OrdenCompra,
        as: 'ordenCompra',
        include: [{ model: Proveedor, as: 'proveedor' }],
      },
    ],
  });
  if (!mov) {
    const err = new Error(`Movimiento con ID ${id} no encontrado.`);
    err.statusCode = 404;
    throw err;
  }
  const plain = mov.get({ plain: true });
  return {
    ...plain,
    cantidad: Number(plain.cantidad),
  };
}

async function eliminarMovimiento(id) {
  const mov = await MovimientoInventario.findByPk(id);
  if (!mov) {
    const err = new Error(`Movimiento con ID ${id} no encontrado.`);
    err.statusCode = 404;
    throw err;
  }
  await mov.destroy();
  return { id };
}

async function registrarMovimiento(payload) {
  const material_id = Number(payload.material_id);
  const tipo_movimiento = String(payload.tipo_movimiento || '').toUpperCase();
  const cantidad = Number(payload.cantidad);
  const ubicacion_id = Number(payload.ubicacion_id);
  const ubicacion_destino_id =
    tipo_movimiento === 'TRASLADO' && payload.ubicacion_destino_id
      ? Number(payload.ubicacion_destino_id)
      : null;
  const orden_compra_id = payload.orden_compra_id ? Number(payload.orden_compra_id) : null;
  const documento_referencia = String(payload.documento_referencia || '').trim();
  const usuario_responsable = String(payload.usuario_responsable || '').trim();
  const observaciones = payload.observaciones
    ? String(payload.observaciones).trim()
    : 'Movimiento registrado en bodega';

  if (!['ENTRADA', 'SALIDA', 'TRASLADO'].includes(tipo_movimiento)) {
    const err = new Error('El tipo_movimiento debe ser ENTRADA, SALIDA o TRASLADO.');
    err.statusCode = 400;
    throw err;
  }

  if (!cantidad || cantidad <= 0) {
    const err = new Error('La cantidad debe ser mayor a 0.');
    err.statusCode = 400;
    throw err;
  }

  if (!documento_referencia || !usuario_responsable) {
    const err = new Error('documento_referencia y usuario_responsable son obligatorios.');
    err.statusCode = 400;
    throw err;
  }

  if (tipo_movimiento === 'TRASLADO' && (!ubicacion_destino_id || ubicacion_destino_id === ubicacion_id)) {
    const err = new Error('Para un TRASLADO debe especificar una ubicación destino válida y distinta al origen.');
    err.statusCode = 400;
    throw err;
  }

  const resultado = await sequelize.transaction(async (t) => {
    const material = await Material.findByPk(material_id, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!material) {
      const err = new Error(`Material con ID ${material_id} no existe.`);
      err.statusCode = 404;
      throw err;
    }

    const ubicacionOrigen = await Ubicacion.findByPk(ubicacion_id, { transaction: t });
    if (!ubicacionOrigen) {
      const err = new Error(`Ubicación origen con ID ${ubicacion_id} no existe.`);
      err.statusCode = 404;
      throw err;
    }

    if (ubicacion_destino_id) {
      const ubicacionDestino = await Ubicacion.findByPk(ubicacion_destino_id, { transaction: t });
      if (!ubicacionDestino) {
        const err = new Error(`Ubicación destino con ID ${ubicacion_destino_id} no existe.`);
        err.statusCode = 404;
        throw err;
      }
    }

    if (tipo_movimiento === 'SALIDA' || tipo_movimiento === 'TRASLADO') {
      const movimientosPrevios = await MovimientoInventario.findAll({
        where: { material_id },
        transaction: t,
      });

      const stockEnUbicacion = movimientosPrevios.reduce((acc, mov) => {
        const cant = Number(mov.cantidad);
        if (mov.tipo_movimiento === 'ENTRADA' && mov.ubicacion_id === ubicacion_id) return acc + cant;
        if (mov.tipo_movimiento === 'SALIDA' && mov.ubicacion_id === ubicacion_id) return acc - cant;
        if (mov.tipo_movimiento === 'TRASLADO' && mov.ubicacion_id === ubicacion_id) return acc - cant;
        if (mov.tipo_movimiento === 'TRASLADO' && mov.ubicacion_destino_id === ubicacion_id) return acc + cant;
        return acc;
      }, 0);

      if (stockEnUbicacion < cantidad) {
        const err = new Error(
          `Stock insuficiente en "${ubicacionOrigen.nombre}". Disponible: ${stockEnUbicacion} ${material.unidad_medida}, Solicitado: ${cantidad}.`
        );
        err.statusCode = 400;
        throw err;
      }
    }

    const nuevoMovimiento = await MovimientoInventario.create(
      {
        material_id,
        tipo_movimiento,
        cantidad,
        ubicacion_id,
        ubicacion_destino_id,
        orden_compra_id,
        documento_referencia,
        usuario_responsable,
        fecha_movimiento: payload.fecha_movimiento ? new Date(payload.fecha_movimiento) : new Date(),
        observaciones,
      },
      { transaction: t }
    );

    if (tipo_movimiento === 'ENTRADA' && orden_compra_id) {
      const oc = await OrdenCompra.findByPk(orden_compra_id, { transaction: t });
      if (oc && oc.estado === 'EMITIDA') {
        await oc.update({ estado: 'RECIBIDA_TOTAL' }, { transaction: t });
      }
    }

    return nuevoMovimiento;
  });

  const estadoActualizado = await materialesService.obtenerStockMaterial(material_id);

  return {
    movimiento: {
      ...resultado.get({ plain: true }),
      cantidad: Number(resultado.cantidad),
    },
    material_actualizado: estadoActualizado,
  };
}

module.exports = {
  listarMovimientos,
  obtenerMovimientoPorId,
  registrarMovimiento,
  eliminarMovimiento,
};

