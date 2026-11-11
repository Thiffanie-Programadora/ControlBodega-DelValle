'use strict';

const express = require('express');
const router = express.Router();
const movimientosController = require('../controllers/movimientosController');

router.get('/', movimientosController.getMovimientos);
router.get('/:id', movimientosController.getMovimientoById);
router.post('/', movimientosController.postMovimiento);
router.delete('/:id', movimientosController.deleteMovimiento);

module.exports = router;
