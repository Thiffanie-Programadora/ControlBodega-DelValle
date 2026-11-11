'use strict';

const express = require('express');
const router = express.Router();
const catalogosController = require('../controllers/catalogosController');

router.get('/ubicaciones', catalogosController.getUbicaciones);
router.get('/ubicaciones/:id', catalogosController.getUbicacionById);
router.post('/ubicaciones', catalogosController.postUbicacion);
router.put('/ubicaciones/:id', catalogosController.putUbicacion);
router.delete('/ubicaciones/:id', catalogosController.deleteUbicacion);

router.get('/proveedores', catalogosController.getProveedores);
router.get('/proveedores/:id', catalogosController.getProveedorById);
router.post('/proveedores', catalogosController.postProveedor);
router.put('/proveedores/:id', catalogosController.putProveedor);
router.delete('/proveedores/:id', catalogosController.deleteProveedor);

module.exports = router;
