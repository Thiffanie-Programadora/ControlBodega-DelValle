'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Proveedor extends Model {
    static associate(models) {
      Proveedor.hasMany(models.OrdenCompra, {
        foreignKey: 'proveedor_id',
        as: 'ordenesCompra',
      });
    }
  }

  Proveedor.init(
    {
      ruc: {
        type: DataTypes.STRING(30),
        allowNull: false,
        unique: true,
      },
      nombre: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      contacto: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      telefono: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Proveedor',
      tableName: 'proveedores',
    }
  );

  return Proveedor;
};

