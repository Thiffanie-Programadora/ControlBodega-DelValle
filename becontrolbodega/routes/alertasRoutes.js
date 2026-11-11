'use strict';

const express = require('express');
const router = express.Router();
const alertasController = require('../controllers/alertasController');

router.get('/reorden', alertasController.getAlertasReorden);

module.exports = router;

