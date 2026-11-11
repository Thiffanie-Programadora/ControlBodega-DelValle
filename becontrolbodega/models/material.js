'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Material extends Model {
    static associate(models) {
      Material.hasMany(models.OrdenCompra, {
        foreignKey: 'material_id',
        as: 'ordenesCompra',
      });
      Material.hasMany(models.MovimientoInventario, {
        foreignKey: 'material_id',
        as: 'movimientos',
      });
    }
  }

  Material.init(
    {
      sku: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      nombre: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      unidad_medida: {
        type: DataTypes.STRING(30),
        allowNull: false,
      },
      stock_minimo: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      },
      stock_maximo: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      },
      stock_seguridad: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      },
      demanda_diaria: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      },
      tiempo_entrega_dias: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      punto_reorden: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: 'Material',
      tableName: 'materiales',
      hooks: {
        beforeValidate: (material) => {
          const demanda = Number(material.demanda_diaria) || 0;
          const dias = Number(material.tiempo_entrega_dias) || 0;
          const seguridad = Number(material.stock_seguridad) || 0;
          material.punto_reorden = demanda * dias + seguridad;
        },
      },
    }
  );

  return Material;
};

