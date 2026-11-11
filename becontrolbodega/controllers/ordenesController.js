'use strict';

const ordenesService = require('../services/ordenesService');

async function getOrdenes(req, res, next) {
  try {
    const ordenes = await ordenesService.listarOrdenes();
    res.json({ ok: true, total: ordenes.length, data: ordenes });
  } catch (error) {
    next(error);
  }
}

async function getOrdenById(req, res, next) {
  try {
    const orden = await ordenesService.obtenerOrdenPorId(Number(req.params.id));
    res.json({ ok: true, data: orden });
  } catch (error) {
    next(error);
  }
}

async function postOrdenCompra(req, res, next) {
  try {
    const resultado = await ordenesService.crearOrdenCompra(req.body);
    res.status(201).json({
      ok: true,
      mensaje: resultado.alerta_duplicado
        ? `Orden ${resultado.orden.numero_oc} registrada con alerta de posible duplicidad (${resultado.alerta_duplicado.orden_similar}).`
        : `Orden de Compra ${resultado.orden.numero_oc} emitida correctamente.`,
      data: resultado.orden,
      alerta_duplicado: resultado.alerta_duplicado,
    });
  } catch (error) {
    next(error);
  }
}

async function putOrdenCompra(req, res, next) {
  try {
    const actualizada = await ordenesService.actualizarOrdenCompra(Number(req.params.id), req.body);
    res.json({
      ok: true,
      mensaje: 'Orden de compra actualizada correctamente.',
      data: actualizada,
    });
  } catch (error) {
    next(error);
  }
}

async function deleteOrdenCompra(req, res, next) {
  try {
    const eliminada = await ordenesService.eliminarOrdenCompra(Number(req.params.id));
    res.json({
      ok: true,
      mensaje: 'Orden de compra eliminada correctamente.',
      data: eliminada,
    });
  } catch (error) {
    next(error);
  }
}

async function getPosiblesDuplicados(req, res, next) {
  try {
    const maxDias = req.query.dias !== undefined ? Number(req.query.dias) : 3;
    const maxPct = req.query.variacion !== undefined ? Number(req.query.variacion) : 10;
    const duplicados = await ordenesService.detectarPosiblesDuplicados(maxDias, maxPct);
    res.json({
      ok: true,
      parametros: { max_dias: maxDias, max_variacion_porcentaje: maxPct },
      total: duplicados.length,
      data: duplicados,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getOrdenes,
  getOrdenById,
  postOrdenCompra,
  putOrdenCompra,
  deleteOrdenCompra,
  getPosiblesDuplicados,
};
