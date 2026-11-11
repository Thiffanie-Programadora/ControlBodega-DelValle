'use strict';

const catalogosService = require('../services/catalogosService');

async function getUbicaciones(req, res, next) {
  try {
    const ubicaciones = await catalogosService.listarUbicaciones();
    res.json({ ok: true, total: ubicaciones.length, data: ubicaciones });
  } catch (error) {
    next(error);
  }
}

async function getUbicacionById(req, res, next) {
  try {
    const ubicacion = await catalogosService.obtenerUbicacionPorId(Number(req.params.id));
    res.json({ ok: true, data: ubicacion });
  } catch (error) {
    next(error);
  }
}

async function postUbicacion(req, res, next) {
  try {
    const nueva = await catalogosService.crearUbicacion(req.body);
    res.status(201).json({ ok: true, mensaje: 'Ubicación creada exitosamente.', data: nueva });
  } catch (error) {
    next(error);
  }
}

async function putUbicacion(req, res, next) {
  try {
    const actualizada = await catalogosService.actualizarUbicacion(Number(req.params.id), req.body);
    res.json({ ok: true, mensaje: 'Ubicación actualizada exitosamente.', data: actualizada });
  } catch (error) {
    next(error);
  }
}

async function deleteUbicacion(req, res, next) {
  try {
    const eliminada = await catalogosService.eliminarUbicacion(Number(req.params.id));
    res.json({ ok: true, mensaje: 'Ubicación eliminada exitosamente.', data: eliminada });
  } catch (error) {
    next(error);
  }
}

async function getProveedores(req, res, next) {
  try {
    const proveedores = await catalogosService.listarProveedores();
    res.json({ ok: true, total: proveedores.length, data: proveedores });
  } catch (error) {
    next(error);
  }
}

async function getProveedorById(req, res, next) {
  try {
    const proveedor = await catalogosService.obtenerProveedorPorId(Number(req.params.id));
    res.json({ ok: true, data: proveedor });
  } catch (error) {
    next(error);
  }
}

async function postProveedor(req, res, next) {
  try {
    const nuevo = await catalogosService.crearProveedor(req.body);
    res.status(201).json({ ok: true, mensaje: 'Proveedor creado exitosamente.', data: nuevo });
  } catch (error) {
    next(error);
  }
}

async function putProveedor(req, res, next) {
  try {
    const actualizado = await catalogosService.actualizarProveedor(Number(req.params.id), req.body);
    res.json({ ok: true, mensaje: 'Proveedor actualizado exitosamente.', data: actualizado });
  } catch (error) {
    next(error);
  }
}

async function deleteProveedor(req, res, next) {
  try {
    const eliminado = await catalogosService.eliminarProveedor(Number(req.params.id));
    res.json({ ok: true, mensaje: 'Proveedor eliminado exitosamente.', data: eliminado });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getUbicaciones,
  getUbicacionById,
  postUbicacion,
  putUbicacion,
  deleteUbicacion,
  getProveedores,
  getProveedorById,
  postProveedor,
  putProveedor,
  deleteProveedor,
};
