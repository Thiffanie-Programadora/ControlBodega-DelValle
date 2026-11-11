'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('movimientos_inventario', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
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
      tipo_movimiento: {
        type: Sequelize.ENUM('ENTRADA', 'SALIDA', 'TRASLADO'),
        allowNull: false,
      },
      cantidad: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },
      ubicacion_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'ubicaciones',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      ubicacion_destino_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'ubicaciones',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      orden_compra_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'ordenes_compra',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      documento_referencia: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      usuario_responsable: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      fecha_movimiento: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
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

    await queryInterface.addIndex('movimientos_inventario', ['material_id', 'fecha_movimiento'], {
      name: 'idx_mov_material_fecha',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('movimientos_inventario');
  },
};

