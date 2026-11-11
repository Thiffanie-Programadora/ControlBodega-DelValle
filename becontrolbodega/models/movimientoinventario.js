'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class MovimientoInventario extends Model {
    static associate(models) {
      MovimientoInventario.belongsTo(models.Material, {
        foreignKey: 'material_id',
        as: 'material',
      });
      MovimientoInventario.belongsTo(models.Ubicacion, {
        foreignKey: 'ubicacion_id',
        as: 'ubicacionOrigen',
      });
      MovimientoInventario.belongsTo(models.Ubicacion, {
        foreignKey: 'ubicacion_destino_id',
        as: 'ubicacionDestino',
      });
      MovimientoInventario.belongsTo(models.OrdenCompra, {
        foreignKey: 'orden_compra_id',
        as: 'ordenCompra',
      });
    }
  }

  MovimientoInventario.init(
    {
      material_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      tipo_movimiento: {
        type: DataTypes.ENUM('ENTRADA', 'SALIDA', 'TRASLADO'),
        allowNull: false,
      },
      cantidad: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      ubicacion_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      ubicacion_destino_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      orden_compra_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      documento_referencia: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      usuario_responsable: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      fecha_movimiento: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      observaciones: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'MovimientoInventario',
      tableName: 'movimientos_inventario',
    }
  );

  return MovimientoInventario;
};

