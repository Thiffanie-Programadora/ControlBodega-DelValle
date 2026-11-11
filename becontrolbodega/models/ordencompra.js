'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class OrdenCompra extends Model {
    static associate(models) {
      OrdenCompra.belongsTo(models.Proveedor, {
        foreignKey: 'proveedor_id',
        as: 'proveedor',
      });
      OrdenCompra.belongsTo(models.Material, {
        foreignKey: 'material_id',
        as: 'material',
      });
      OrdenCompra.hasMany(models.MovimientoInventario, {
        foreignKey: 'orden_compra_id',
        as: 'movimientos',
      });
    }
  }

  OrdenCompra.init(
    {
      numero_oc: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      proveedor_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      material_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      cantidad_solicitada: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      precio_unitario: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      fecha_emision: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      estado: {
        type: DataTypes.ENUM('EMITIDA', 'RECIBIDA_PARCIAL', 'RECIBIDA_TOTAL', 'ANULADA'),
        allowNull: false,
        defaultValue: 'EMITIDA',
      },
      usuario_creador: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      observaciones: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'OrdenCompra',
      tableName: 'ordenes_compra',
    }
  );

  return OrdenCompra;
};

