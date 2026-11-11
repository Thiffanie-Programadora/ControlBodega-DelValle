'use strict';

const { Ubicacion, Proveedor } = require('../models');

async function listarUbicaciones() {
  const ubicaciones = await Ubicacion.findAll({ order: [['id', 'ASC']] });
  return ubicaciones.map((u) => u.get({ plain: true }));
}

async function obtenerUbicacionPorId(id) {
  const ubicacion = await Ubicacion.findByPk(id);
  if (!ubicacion) {
    const err = new Error(`Ubicación con ID ${id} no encontrada.`);
    err.statusCode = 404;
    throw err;
  }
  return ubicacion.get({ plain: true });
}

async function crearUbicacion(payload) {
  const codigo = String(payload.codigo || '').trim().toUpperCase();
  const nombre = String(payload.nombre || '').trim();
  const tipo = String(payload.tipo || 'BODEGA').trim().toUpperCase();

  if (!codigo || !nombre) {
    const err = new Error('Los campos codigo y nombre son obligatorios.');
    err.statusCode = 400;
    throw err;
  }

  const nueva = await Ubicacion.create({ codigo, nombre, tipo });
  return nueva.get({ plain: true });
}

async function actualizarUbicacion(id, payload) {
  const ubicacion = await Ubicacion.findByPk(id);
  if (!ubicacion) {
    const err = new Error(`Ubicación con ID ${id} no encontrada.`);
    err.statusCode = 404;
    throw err;
  }
  await ubicacion.update({
    codigo: payload.codigo ? String(payload.codigo).trim().toUpperCase() : ubicacion.codigo,
    nombre: payload.nombre ? String(payload.nombre).trim() : ubicacion.nombre,
    tipo: payload.tipo ? String(payload.tipo).trim().toUpperCase() : ubicacion.tipo,
  });
  return ubicacion.get({ plain: true });
}

async function eliminarUbicacion(id) {
  const ubicacion = await Ubicacion.findByPk(id);
  if (!ubicacion) {
    const err = new Error(`Ubicación con ID ${id} no encontrada.`);
    err.statusCode = 404;
    throw err;
  }
  await ubicacion.destroy();
  return { id };
}

async function listarProveedores() {
  const proveedores = await Proveedor.findAll({ order: [['id', 'ASC']] });
  return proveedores.map((p) => p.get({ plain: true }));
}

async function obtenerProveedorPorId(id) {
  const proveedor = await Proveedor.findByPk(id);
  if (!proveedor) {
    const err = new Error(`Proveedor con ID ${id} no encontrado.`);
    err.statusCode = 404;
    throw err;
  }
  return proveedor.get({ plain: true });
}

async function crearProveedor(payload) {
  const ruc = String(payload.ruc || '').trim();
  const nombre = String(payload.nombre || '').trim();

  if (!ruc || !nombre) {
    const err = new Error('Los campos ruc y nombre son obligatorios.');
    err.statusCode = 400;
    throw err;
  }

  const nuevo = await Proveedor.create({
    ruc,
    nombre,
    contacto: payload.contacto || null,
    telefono: payload.telefono || null,
    email: payload.email || null,
  });
  return nuevo.get({ plain: true });
}

async function actualizarProveedor(id, payload) {
  const proveedor = await Proveedor.findByPk(id);
  if (!proveedor) {
    const err = new Error(`Proveedor con ID ${id} no encontrado.`);
    err.statusCode = 404;
    throw err;
  }
  await proveedor.update({
    ruc: payload.ruc ? String(payload.ruc).trim() : proveedor.ruc,
    nombre: payload.nombre ? String(payload.nombre).trim() : proveedor.nombre,
    contacto: payload.contacto !== undefined ? payload.contacto : proveedor.contacto,
    telefono: payload.telefono !== undefined ? payload.telefono : proveedor.telefono,
    email: payload.email !== undefined ? payload.email : proveedor.email,
  });
  return proveedor.get({ plain: true });
}

async function eliminarProveedor(id) {
  const proveedor = await Proveedor.findByPk(id);
  if (!proveedor) {
    const err = new Error(`Proveedor con ID ${id} no encontrado.`);
    err.statusCode = 404;
    throw err;
  }
  await proveedor.destroy();
  return { id };
}

module.exports = {
  listarUbicaciones,
  obtenerUbicacionPorId,
  crearUbicacion,
  actualizarUbicacion,
  eliminarUbicacion,
  listarProveedores,
  obtenerProveedorPorId,
  crearProveedor,
  actualizarProveedor,
  eliminarProveedor,
};
