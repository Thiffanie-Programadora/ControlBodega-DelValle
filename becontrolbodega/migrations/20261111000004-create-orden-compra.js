'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ordenes_compra', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      numero_oc: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },
      proveedor_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'proveedores',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      material_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'materiales',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      cantidad_solicitada: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },
      precio_unitario: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },
      fecha_emision: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      estado: {
        type: Sequelize.ENUM('EMITIDA', 'RECIBIDA_PARCIAL', 'RECIBIDA_TOTAL', 'ANULADA'),
        allowNull: false,
        defaultValue: 'EMITIDA',
      },
      usuario_creador: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      observaciones: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('ordenes_compra', ['proveedor_id', 'material_id', 'fecha_emision'], {
      name: 'idx_oc_duplicados',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('ordenes_compra');
  },
};

