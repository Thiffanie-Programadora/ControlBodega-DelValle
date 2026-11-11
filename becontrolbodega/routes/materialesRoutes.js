'use strict';

const express = require('express');
const router = express.Router();
const materialesController = require('../controllers/materialesController');

router.get('/', materialesController.getMateriales);
router.post('/', materialesController.postMaterial);
router.get('/:id', materialesController.getMaterialById);
router.put('/:id', materialesController.putMaterial);
router.delete('/:id', materialesController.deleteMaterial);
router.get('/:id/stock', materialesController.getStockMaterial);
router.get('/:id/trazabilidad', materialesController.getTrazabilidadMaterial);

module.exports = router;
