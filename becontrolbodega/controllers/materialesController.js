'use strict';

const materialesService = require('../services/materialesService');

async function getMateriales(req, res, next) {
  try {
    const materiales = await materialesService.listarMateriales();
    res.json({ ok: true, total: materiales.length, data: materiales });
  } catch (error) {
    next(error);
  }
}

async function getMaterialById(req, res, next) {
  try {
    const material = await materialesService.obtenerStockMaterial(Number(req.params.id));
    res.json({ ok: true, data: material });
  } catch (error) {
    next(error);
  }
}

async function postMaterial(req, res, next) {
  try {
    const nuevo = await materialesService.crearMaterial(req.body);
    res.status(201).json({
      ok: true,
      mensaje: 'Material registrado exitosamente con cálculo automático de Punto de Reorden.',
      data: nuevo,
    });
  } catch (error) {
    next(error);
  }
}

async function putMaterial(req, res, next) {
  try {
    const actualizado = await materialesService.actualizarMaterial(Number(req.params.id), req.body);
    res.json({
      ok: true,
      mensaje: 'Material actualizado correctamente.',
      data: actualizado,
    });
  } catch (error) {
    next(error);
  }
}

async function deleteMaterial(req, res, next) {
  try {
    const eliminado = await materialesService.eliminarMaterial(Number(req.params.id));
    res.json({
      ok: true,
      mensaje: 'Material eliminado correctamente.',
      data: eliminado,
    });
  } catch (error) {
    next(error);
  }
}

async function getStockMaterial(req, res, next) {
  try {
    const stock = await materialesService.obtenerStockMaterial(Number(req.params.id));
    res.json({ ok: true, data: stock });
  } catch (error) {
    next(error);
  }
}

async function getTrazabilidadMaterial(req, res, next) {
  try {
    const trazabilidad = await materialesService.obtenerTrazabilidadMaterial(Number(req.params.id));
    res.json({ ok: true, data: trazabilidad });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getMateriales,
  getMaterialById,
  postMaterial,
  putMaterial,
  deleteMaterial,
  getStockMaterial,
  getTrazabilidadMaterial,
};
