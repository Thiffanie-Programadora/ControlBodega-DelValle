'use strict';

const express = require('express');
const router = express.Router();
const ordenesController = require('../controllers/ordenesController');

router.get('/posibles-duplicados', ordenesController.getPosiblesDuplicados);
router.get('/', ordenesController.getOrdenes);
router.post('/', ordenesController.postOrdenCompra);
router.get('/:id', ordenesController.getOrdenById);
router.put('/:id', ordenesController.putOrdenCompra);
router.patch('/:id', ordenesController.putOrdenCompra);
router.delete('/:id', ordenesController.deleteOrdenCompra);

module.exports = router;
