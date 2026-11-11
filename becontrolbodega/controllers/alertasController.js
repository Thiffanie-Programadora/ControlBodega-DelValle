'use strict';

const materialesService = require('../services/materialesService');

async function getAlertasReorden(req, res, next) {
  try {
    const alertas = await materialesService.obtenerAlertasReorden();
    res.json({
      ok: true,
      total: alertas.length,
      data: alertas,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAlertasReorden,
};

