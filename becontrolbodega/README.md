# Constructora Del Valle S.A. — Backend API de Control de Inventarios (`becontrolbodega`)

API REST construida con **Node.js, Express, Sequelize y MySQL** para la **Parte B (Opción 2: Control de inventario para una empresa de construcción)**.

## 1. Requisitos previos y configuración (`.env`)

1. Clonar el repositorio e instalar dependencias:
   ```bash
   cd becontrolbodega
   npm install
   ```
2. Copiar el archivo `.env.example` a `.env` y configurar las credenciales de MySQL:
   ```bash
   cp .env.example .env
   ```
3. Ejecutar las migraciones y los datos semilla (*seeders*):
   ```bash
   npm run db:migrate
   npm run db:seed
   ```
   *(También se incluye el script SQL directo en `schema.sql`).*

4. Iniciar el servidor en modo desarrollo:
   ```bash
   npm run dev
   ```
   Disponible en `http://localhost:3000`.

## 2. Endpoints principales

| Método | Ruta | Descripción |
| :--- | :--- | :--- |
| `GET` | `/` o `/general` | Vista consolidada de toda la base de datos (`becontrolbodega`). |
| `GET` | `/materiales` | Catálogo de materiales con stock dinámico, PR autocalculado y estado. |
| `POST` | `/materiales` | Registra un material y calcula automáticamente $\text{PR} = d \times L + SS$. |
| `GET` | `/materiales/:id/stock` | Stock global y desglosado por bodega/obra, PR y estado. |
| `GET` | `/materiales/:id/trazabilidad` | Historial Kardex con saldo acumulado y Orden de Compra de origen. |
| `POST` | `/movimientos` | Registra `ENTRADA`, `SALIDA` o `TRASLADO` en transacción ACID. |
| `GET` | `/alertas/reorden` | Materiales cuyo $\text{stock\_actual} \le \text{PR}$, ordenados por criticidad. |
| `GET` | `/ordenes/posibles-duplicados` | Detecta órdenes de compra sospechosas (mismo proveedor, material, cantidad similar $\le 10\%$ y fecha cercana $\le 3$ días). |
| `GET` / `POST` | `/ordenes` | Lista y emite órdenes de compra aplicando la matriz de aprobación (Ejercicio A1). |
| `GET` / `POST` | `/ubicaciones` | Catálogo de bodegas y obras. |
| `GET` / `POST` | `/proveedores` | Catálogo de proveedores. |

