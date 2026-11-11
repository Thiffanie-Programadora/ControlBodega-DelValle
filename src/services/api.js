const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const payload = await response.json();
  if (!response.ok || payload.ok === false) {
    throw new Error(payload.error || `Error HTTP ${response.status}`);
  }
  return payload;
}

export async function obtenerDatosIniciales() {
  const [matRes, movRes, ordRes, ubiRes, provRes] = await Promise.all([
    request('/materiales'),
    request('/movimientos'),
    request('/ordenes'),
    request('/ubicaciones'),
    request('/proveedores'),
  ]);
  return {
    materiales: matRes.data,
    movimientos: movRes.data,
    ordenes: ordRes.data,
    ubicaciones: ubiRes.data,
    proveedores: provRes.data,
  };
}

// Materiales
export async function listarMaterialesApi() {
  return request('/materiales');
}

export async function crearMaterialApi(data) {
  return request('/materiales', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function actualizarMaterialApi(id, data) {
  return request(`/materiales/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function eliminarMaterialApi(id) {
  return request(`/materiales/${id}`, {
    method: 'DELETE',
  });
}

export async function obtenerStockMaterialApi(id) {
  return request(`/materiales/${id}/stock`);
}

export async function obtenerTrazabilidadMaterialApi(id) {
  return request(`/materiales/${id}/trazabilidad`);
}

// Movimientos
export async function listarMovimientosApi() {
  return request('/movimientos');
}

export async function registrarMovimientoApi(data) {
  return request('/movimientos', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function eliminarMovimientoApi(id) {
  return request(`/movimientos/${id}`, {
    method: 'DELETE',
  });
}

// Alertas
export async function obtenerAlertasReordenApi() {
  return request('/alertas/reorden');
}

// Órdenes de Compra
export async function listarOrdenesApi() {
  return request('/ordenes');
}

export async function crearOrdenCompraApi(data) {
  return request('/ordenes', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function actualizarOrdenCompraApi(id, data) {
  return request(`/ordenes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function eliminarOrdenCompraApi(id) {
  return request(`/ordenes/${id}`, {
    method: 'DELETE',
  });
}

export async function obtenerPosiblesDuplicadosApi(dias = 3, variacion = 10) {
  return request(`/ordenes/posibles-duplicados?dias=${dias}&variacion=${variacion}`);
}

// Catálogos (Ubicaciones y Proveedores)
export async function listarUbicacionesApi() {
  return request('/ubicaciones');
}

export async function crearUbicacionApi(data) {
  return request('/ubicaciones', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function listarProveedoresApi() {
  return request('/proveedores');
}

export async function crearProveedorApi(data) {
  return request('/proveedores', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
