'use strict';

const movimientosService = require('../services/movimientosService');

async function getMovimientos(req, res, next) {
  try {
    const movimientos = await movimientosService.listarMovimientos();
    res.json({ ok: true, total: movimientos.length, data: movimientos });
  } catch (error) {
    next(error);
  }
}

async function getMovimientoById(req, res, next) {
  try {
    const movimiento = await movimientosService.obtenerMovimientoPorId(Number(req.params.id));
    res.json({ ok: true, data: movimiento });
  } catch (error) {
    next(error);
  }
}

async function postMovimiento(req, res, next) {
  try {
    const resultado = await movimientosService.registrarMovimiento(req.body);
    res.status(201).json({
      ok: true,
      mensaje: `Movimiento (${resultado.movimiento.tipo_movimiento}) registrado exitosamente.`,
      data: resultado,
    });
  } catch (error) {
    next(error);
  }
}

async function deleteMovimiento(req, res, next) {
  try {
    const eliminado = await movimientosService.eliminarMovimiento(Number(req.params.id));
    res.json({
      ok: true,
      mensaje: 'Movimiento eliminado correctamente.',
      data: eliminado,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getMovimientos,
  getMovimientoById,
  postMovimiento,
  deleteMovimiento,
};
