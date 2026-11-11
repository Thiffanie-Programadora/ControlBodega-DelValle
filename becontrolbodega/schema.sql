-- Script de creación de Base de Datos y Datos Semilla (3FN)
-- Constructora Del Valle S.A. - Gestión de Inventarios (Opción 2)

CREATE DATABASE IF NOT EXISTS becontrolbodega
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE becontrolbodega;

-- 1. Tabla de Ubicaciones (Bodegas y Obras)
CREATE TABLE IF NOT EXISTS ubicaciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(50) NOT NULL UNIQUE,
  nombre VARCHAR(150) NOT NULL,
  tipo ENUM('BODEGA', 'OBRA') NOT NULL DEFAULT 'BODEGA',
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Tabla de Proveedores
CREATE TABLE IF NOT EXISTS proveedores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ruc VARCHAR(30) NOT NULL UNIQUE,
  nombre VARCHAR(150) NOT NULL,
  contacto VARCHAR(100) NULL,
  telefono VARCHAR(30) NULL,
  email VARCHAR(100) NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. Tabla de Materiales (Punto de Reorden = demanda_diaria * tiempo_entrega_dias + stock_seguridad)
CREATE TABLE IF NOT EXISTS materiales (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sku VARCHAR(50) NOT NULL UNIQUE,
  nombre VARCHAR(150) NOT NULL,
  unidad_medida VARCHAR(30) NOT NULL,
  stock_minimo DECIMAL(12, 2) NOT NULL DEFAULT 0,
  stock_maximo DECIMAL(12, 2) NOT NULL DEFAULT 0,
  stock_seguridad DECIMAL(12, 2) NOT NULL DEFAULT 0,
  demanda_diaria DECIMAL(12, 2) NOT NULL DEFAULT 0,
  tiempo_entrega_dias INT NOT NULL DEFAULT 1,
  punto_reorden DECIMAL(12, 2) NOT NULL DEFAULT 0,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 4. Tabla de Órdenes de Compra
CREATE TABLE IF NOT EXISTS ordenes_compra (
  id INT AUTO_INCREMENT PRIMARY KEY,
  numero_oc VARCHAR(50) NOT NULL UNIQUE,
  proveedor_id INT NOT NULL,
  material_id INT NOT NULL,
  cantidad_solicitada DECIMAL(12, 2) NOT NULL,
  precio_unitario DECIMAL(12, 2) NOT NULL,
  fecha_emision DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  estado ENUM('EMITIDA', 'RECIBIDA_PARCIAL', 'RECIBIDA_TOTAL', 'ANULADA') NOT NULL DEFAULT 'EMITIDA',
  usuario_creador VARCHAR(100) NOT NULL,
  observaciones TEXT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_oc_duplicados (proveedor_id, material_id, fecha_emision),
  CONSTRAINT fk_oc_proveedor FOREIGN KEY (proveedor_id) REFERENCES proveedores(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_oc_material FOREIGN KEY (material_id) REFERENCES materiales(id) ON UPDATE CASCADE ON DELETE RESTRICT
);

-- 5. Tabla de Movimientos de Inventario (Kardex)
CREATE TABLE IF NOT EXISTS movimientos_inventario (
  id INT AUTO_INCREMENT PRIMARY KEY,
  material_id INT NOT NULL,
  tipo_movimiento ENUM('ENTRADA', 'SALIDA', 'TRASLADO') NOT NULL,
  cantidad DECIMAL(12, 2) NOT NULL,
  ubicacion_id INT NOT NULL,
  ubicacion_destino_id INT NULL,
  orden_compra_id INT NULL,
  documento_referencia VARCHAR(100) NOT NULL,
  usuario_responsable VARCHAR(100) NOT NULL,
  fecha_movimiento DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  observaciones TEXT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_mov_material_fecha (material_id, fecha_movimiento),
  CONSTRAINT fk_mov_material FOREIGN KEY (material_id) REFERENCES materiales(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_mov_ubicacion_origen FOREIGN KEY (ubicacion_id) REFERENCES ubicaciones(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_mov_ubicacion_destino FOREIGN KEY (ubicacion_destino_id) REFERENCES ubicaciones(id) ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_mov_orden_compra FOREIGN KEY (orden_compra_id) REFERENCES ordenes_compra(id) ON UPDATE CASCADE ON DELETE SET NULL
);

