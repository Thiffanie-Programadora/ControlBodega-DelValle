# Constructora Del Valle S.A. — Sistema de Control de Inventarios, Kardex y Auditoría de Compras

Solución integral para la **Parte B: Desarrollo de una solución (Opción 2: Control de inventario para una empresa de construcción)** desarrollada con **Node.js (ES6+), Express, MySQL y React**.

---

## 1. Arquitectura del Proyecto

El repositorio cumple estrictamente con la estructura modular de referencia en [`inventario-api/`](file:///c:/Users/Thifanie/Downloads/controlBodega/inventario-api) e incluye adicionalmente una consola ERP interactiva en la raíz para visualización y pruebas en tiempo real:

```text
controlBodega/
├── inventario-api/                  # Backend API REST (Node.js + Express + MySQL)
│   ├── src/
│   │   ├── db/                      # Conexión, esquema DDL, migraciones y seed
│   │   │   ├── connection.js        # Pool MySQL2 (async/await) + transacciones ACID
│   │   │   ├── schema.sql           # Tablas normalizadas (3FN) con PR autocalculado
│   │   │   ├── migrate.js           # Creación automática de base de datos y tablas
│   │   │   └── seed.js              # Datos semilla: Cemento 50kg, Varilla #3, OCs y Kardex
│   │   ├── middlewares/
│   │   │   ├── errorHandler.js      # Manejo centralizado de errores (AppError)
│   │   │   └── validate.js          # Validación estricta de payloads y parámetros
│   │   ├── routes/                  # Endpoints para materiales, movimientos, órdenes y alertas
│   │   │   ├── materialesRoutes.js
│   │   │   ├── movimientosRoutes.js
│   │   │   ├── alertasRoutes.js
│   │   │   └── ordenesRoutes.js
│   │   ├── services/                # Lógica de negocio desacoplada
│   │   │   ├── materialesService.js # Punto de reorden, stock dinámico y trazabilidad
│   │   │   ├── movimientosService.js# Registro transaccional y verificación de stock
│   │   │   └── ordenesService.js    # Detección de órdenes de compra duplicadas
│   │   └── index.js                 # Servidor principal Express
│   ├── .env.example                 # Variables de entorno (DATABASE_URL)
│   └── README.md                    # Documentación de la API
└── src/                             # Consola Web ERP Interactiva (React + Vite)
```

---

## 2. Modelo de Base de Datos Relacional (MySQL - 3FN)

El esquema ([`inventario-api/src/db/schema.sql`](file:///c:/Users/Thifanie/Downloads/controlBodega/inventario-api/src/db/schema.sql)) está diseñado en **Tercera Forma Normal (3FN)** con 5 tablas:

1. **`ubicaciones`**: Bodegas centrales y proyectos/obras activas (`BODEGA` | `OBRA`).
2. **`proveedores`**: Datos fiscales y de contacto de los proveedores de insumos.
3. **`materiales`**: Catálogo de insumos con `stock_minimo`, `stock_maximo`, `stock_seguridad`, `demanda_diaria` y `tiempo_entrega_dias`. Incluye la columna generada:
   $$\text{PR} = (\text{demanda\_diaria} \times \text{tiempo\_entrega\_dias}) + \text{stock\_seguridad}$$
4. **`ordenes_compra`**: Órdenes emitidas por proveedor y material con índice compuesto `(proveedor_id, material_id, fecha_emision)` para detección de duplicados.
5. **`movimientos_inventario`**: Libro Mayor (*Kardex*) inmutable (`ENTRADA`, `SALIDA`, `TRASLADO`) con referencia al usuario responsable, ubicación origen/destino, documento de respaldo y vínculo a `orden_compra_id`.

---

## 3. Endpoints Requeridos e Implementados

| Método | Endpoint | Función de Negocio |
| :--- | :--- | :--- |
| `GET` | `/materiales` | Lista todos los insumos con su stock dinámico, PR y estado. |
| `POST` | `/materiales` | Registra un insumo nuevo y calcula automáticamente su Punto de Reorden (PR). |
| `GET` | `/materiales/:id/stock` | Consulta el stock actual global y desglosado por bodega/obra, el PR y el estado (`CRITICO`, `BAJO_PUNTO_REORDEN`, `NORMAL`, `SOBRESTOCK`). |
| `GET` | `/materiales/:id/trazabilidad` | Devuelve el historial completo de movimientos del material, el saldo acumulado y de qué Orden de Compra y proveedor proviene cada entrada. |
| `POST` | `/movimientos` | Registra una `ENTRADA`, `SALIDA` o `TRASLADO` en una transacción ACID (`SELECT ... FOR UPDATE`), validando stock disponible y recalculando existencias. |
| `GET` | `/alertas/reorden` | Lista todos los materiales cuyo stock actual es menor o igual al Punto de Reorden ($\text{stock\_actual} \le \text{PR}$), priorizando los críticos y sugiriendo cantidad de compra. |
| `GET` | `/ordenes/posibles-duplicados` | Detecta órdenes de compra sospechosas (mismo proveedor, mismo material, cantidad similar $\le 10\%$ y fechas cercanas $\le 3$ días). |

---

## 4. Instrucciones de Ejecución

### A. Consola Visual ERP (Frontend)
```bash
npm install
npm run dev
```
Disponible en: `http://localhost:5173/`

### B. Servidor API REST con MySQL (`inventario-api/`)
```bash
cd inventario-api
npm install
cp .env.example .env
# Edita .env con tu DATABASE_URL de MySQL y ejecuta migración + seed:
npm run db:setup
npm run dev
```
Disponible en: `http://localhost:3000/`
