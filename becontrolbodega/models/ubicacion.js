'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Ubicacion extends Model {
    static associate(models) {
      Ubicacion.hasMany(models.MovimientoInventario, {
        foreignKey: 'ubicacion_id',
        as: 'movimientosOrigen',
      });
      Ubicacion.hasMany(models.MovimientoInventario, {
        foreignKey: 'ubicacion_destino_id',
        as: 'movimientosDestino',
      });
    }
  }

  Ubicacion.init(
    {
      codigo: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      nombre: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      tipo: {
        type: DataTypes.ENUM('BODEGA', 'OBRA'),
        allowNull: false,
        defaultValue: 'BODEGA',
      },
    },
    {
      sequelize,
      modelName: 'Ubicacion',
      tableName: 'ubicaciones',
    }
  );

  return Ubicacion;
};

