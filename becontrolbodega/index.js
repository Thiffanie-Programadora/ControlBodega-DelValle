'use strict';

require('dotenv').config();
const express = require('express');
const { sequelize } = require('./models');

const materialesService = require('./services/materialesService');
const movimientosService = require('./services/movimientosService');
const ordenesService = require('./services/ordenesService');
const catalogosService = require('./services/catalogosService');

const materialesRoutes = require('./routes/materialesRoutes');
const movimientosRoutes = require('./routes/movimientosRoutes');
const ordenesRoutes = require('./routes/ordenesRoutes');
const alertasRoutes = require('./routes/alertasRoutes');
const catalogosRoutes = require('./routes/catalogosRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Formatear JSON con sangría para lectura clara en el navegador
app.set('json spaces', 2);

// Middleware CORS para permitir peticiones desde el frontend en React (Vite)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

app.use(express.json());

// Controlador para obtener toda la base de datos general en un solo endpoint
async function getGeneralDatabase(req, res, next) {
  try {
    const [
      ubicaciones,
      proveedores,
      materiales,
      ordenes_compra,
      movimientos_inventario,
      alertas_reorden,
      posibles_duplicados,
    ] = await Promise.all([
      catalogosService.listarUbicaciones(),
      catalogosService.listarProveedores(),
      materialesService.listarMateriales(),
      ordenesService.listarOrdenes(),
      movimientosService.listarMovimientos(),
      materialesService.obtenerAlertasReorden(),
      ordenesService.detectarPosiblesDuplicados(3, 10),
    ]);

    res.json({
      ok: true,
      servicio: 'Constructora Del Valle S.A. - Vista General de la Base de Datos',
      base_datos: 'becontrolbodega',
      resumen: {
        total_ubicaciones: ubicaciones.length,
        total_proveedores: proveedores.length,
        total_materiales: materiales.length,
        total_ordenes_compra: ordenes_compra.length,
        total_movimientos: movimientos_inventario.length,
        total_alertas_reorden: alertas_reorden.length,
        total_posibles_duplicados: posibles_duplicados.length,
      },
      data: {
        ubicaciones,
        proveedores,
        materiales,
        ordenes_compra,
        movimientos_inventario,
        alertas_reorden,
        posibles_duplicados,
      },
    });
  } catch (error) {
    next(error);
  }
}

// Endpoint general en la raíz (/), en /general y en /api
app.get('/', getGeneralDatabase);
app.get('/general', getGeneralDatabase);
app.get('/api', getGeneralDatabase);

// Rutas principales por tabla (disponibles directamente y bajo /api)
app.use('/materiales', materialesRoutes);
app.use('/movimientos', movimientosRoutes);
app.use('/ordenes', ordenesRoutes);
app.use('/alertas', alertasRoutes);
app.use('/', catalogosRoutes);

app.use('/api/materiales', materialesRoutes);
app.use('/api/movimientos', movimientosRoutes);
app.use('/api/ordenes', ordenesRoutes);
app.use('/api/alertas', alertasRoutes);
app.use('/api', catalogosRoutes);

// Manejador centralizado de errores
app.use((err, req, res, next) => {
  const status = err.statusCode || 500;
  res.status(status).json({
    ok: false,
    error: err.message || 'Error interno del servidor',
  });
});

async function iniciarServidor() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión establecida con la base de datos MySQL (becontrolbodega).');
    const server = app.listen(PORT, (err) => {
      if (err) {
        if (err.code === 'EADDRINUSE') {
          console.log(`✅ El servidor ya se encuentra activo en http://localhost:${PORT}`);
          return;
        }
        console.error(`❌ Error al iniciar el servidor en el puerto ${PORT}:`, err.message);
        process.exit(1);
      }
      console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
    });
    server.ref();
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  iniciarServidor();
}

module.exports = app;
