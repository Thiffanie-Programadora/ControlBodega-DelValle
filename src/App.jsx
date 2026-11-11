import { useState, useMemo, useEffect } from 'react';
import './App.css';
import {
  obtenerDatosIniciales,
  crearMaterialApi,
  registrarMovimientoApi,
  crearOrdenCompraApi,
} from './services/api';

const INITIAL_UBICACIONES = [
  { id: 1, codigo: 'BOD-CENTRAL', nombre: 'Bodega Central San José', tipo: 'BODEGA' },
  { id: 2, codigo: 'OBRA-VALLE-I', nombre: 'Residencial Condominio Del Valle Etapa I', tipo: 'OBRA' },
  { id: 3, codigo: 'OBRA-TORRE-A', nombre: 'Edificio Corporativo Torre Del Valle', tipo: 'OBRA' },
];

const INITIAL_PROVEEDORES = [
  { id: 1, ruc: '3-101-445566', nombre: 'Cementos y Agregados Nacionales S.A.' },
  { id: 2, ruc: '3-101-778899', nombre: 'Aceros Centroamericanos Laminados S.A.' },
  { id: 3, ruc: '3-101-112233', nombre: 'Ferretería Industrial El Constructor S.A.' },
];

const INITIAL_MATERIALES = [
  {
    id: 1,
    sku: 'MAT-CEM-050',
    nombre: 'Cemento Gris Uso General 50 kg',
    unidad_medida: 'SACO',
    stock_minimo: 150,
    stock_maximo: 1200,
    stock_seguridad: 100,
    demanda_diaria: 45,
    tiempo_entrega_dias: 4,
  },
  {
    id: 2,
    sku: 'MAT-VAR-003',
    nombre: 'Varilla Corrugada #3 (3/8" x 6m) Grado 40',
    unidad_medida: 'VARILLA',
    stock_minimo: 200,
    stock_maximo: 2000,
    stock_seguridad: 120,
    demanda_diaria: 60,
    tiempo_entrega_dias: 5,
  },
  {
    id: 3,
    sku: 'MAT-ARE-LAV',
    nombre: 'Arena de Río Lavada para Concreto',
    unidad_medida: 'M3',
    stock_minimo: 25,
    stock_maximo: 150,
    stock_seguridad: 15,
    demanda_diaria: 8,
    tiempo_entrega_dias: 3,
  },
  {
    id: 4,
    sku: 'MAT-BLK-015',
    nombre: 'Bloque de Concreto Estructural 15x20x40 cm',
    unidad_medida: 'UNIDAD',
    stock_minimo: 500,
    stock_maximo: 5000,
    stock_seguridad: 300,
    demanda_diaria: 200,
    tiempo_entrega_dias: 4,
  },
];

const INITIAL_ORDENES = [
  {
    id: 1,
    numero_oc: 'OC-2026-001',
    proveedor_id: 1,
    material_id: 1,
    cantidad_solicitada: 400,
    precio_unitario: 6850,
    fecha_emision: '2026-10-25 08:30:00',
    estado: 'RECIBIDA_TOTAL',
    usuario_creador: 'carlos.mendez',
    observaciones: 'Compra mensual lote inicial cemento',
  },
  {
    id: 2,
    numero_oc: 'OC-2026-004',
    proveedor_id: 1,
    material_id: 1,
    cantidad_solicitada: 250,
    precio_unitario: 6850,
    fecha_emision: '2026-11-05 09:15:00',
    estado: 'EMITIDA',
    usuario_creador: 'ana.rojas',
    observaciones: 'Reposición urgente cemento Etapa I',
  },
  {
    id: 3,
    numero_oc: 'OC-2026-005',
    proveedor_id: 1,
    material_id: 1,
    cantidad_solicitada: 250,
    precio_unitario: 6850,
    fecha_emision: '2026-11-05 16:40:00',
    estado: 'EMITIDA',
    usuario_creador: 'luis.vargas',
    observaciones: 'Reposición urgente cemento bodega central (posible doble digitación)',
  },
  {
    id: 4,
    numero_oc: 'OC-2026-002',
    proveedor_id: 2,
    material_id: 2,
    cantidad_solicitada: 850,
    precio_unitario: 3420,
    fecha_emision: '2026-10-28 10:00:00',
    estado: 'RECIBIDA_TOTAL',
    usuario_creador: 'carlos.mendez',
    observaciones: 'Abastecimiento acero estructural Torre A',
  },
  {
    id: 5,
    numero_oc: 'OC-2026-006',
    proveedor_id: 2,
    material_id: 2,
    cantidad_solicitada: 500,
    precio_unitario: 3420,
    fecha_emision: '2026-11-06 11:00:00',
    estado: 'EMITIDA',
    usuario_creador: 'ana.rojas',
    observaciones: 'Pedido acero refuerzo losa',
  },
  {
    id: 6,
    numero_oc: 'OC-2026-007',
    proveedor_id: 2,
    material_id: 2,
    cantidad_solicitada: 510,
    precio_unitario: 3420,
    fecha_emision: '2026-11-08 08:20:00',
    estado: 'EMITIDA',
    usuario_creador: 'carlos.mendez',
    observaciones: 'Pedido varilla #3 losa nivel 2',
  },
  {
    id: 7,
    numero_oc: 'OC-2026-003',
    proveedor_id: 1,
    material_id: 3,
    cantidad_solicitada: 40,
    precio_unitario: 18500,
    fecha_emision: '2026-10-30 07:45:00',
    estado: 'RECIBIDA_TOTAL',
    usuario_creador: 'carlos.mendez',
    observaciones: 'Arena lavada para cimentación',
  },
  {
    id: 8,
    numero_oc: 'OC-2026-008',
    proveedor_id: 3,
    material_id: 4,
    cantidad_solicitada: 1800,
    precio_unitario: 620,
    fecha_emision: '2026-11-01 14:00:00',
    estado: 'RECIBIDA_TOTAL',
    usuario_creador: 'ana.rojas',
    observaciones: 'Bloques estructurales mampostería',
  },
];

const INITIAL_MOVIMIENTOS = [
  {
    id: 1,
    material_id: 1,
    tipo_movimiento: 'ENTRADA',
    cantidad: 400,
    ubicacion_id: 1,
    ubicacion_destino_id: null,
    orden_compra_id: 1,
    documento_referencia: 'OC-2026-001',
    usuario_responsable: 'bodeguero.juan',
    fecha_movimiento: '2026-10-26 09:00:00',
    observaciones: 'Recepción conforme en Bodega Central según factura #8841',
  },
  {
    id: 2,
    material_id: 1,
    tipo_movimiento: 'TRASLADO',
    cantidad: 100,
    ubicacion_id: 1,
    ubicacion_destino_id: 2,
    orden_compra_id: null,
    documento_referencia: 'GT-2026-010',
    usuario_responsable: 'bodeguero.juan',
    fecha_movimiento: '2026-10-29 13:30:00',
    observaciones: 'Traslado de cemento a Residencial Condominio Del Valle',
  },
  {
    id: 3,
    material_id: 1,
    tipo_movimiento: 'SALIDA',
    cantidad: 120,
    ubicacion_id: 1,
    ubicacion_destino_id: null,
    orden_compra_id: null,
    documento_referencia: 'VS-2026-101',
    usuario_responsable: 'ing.castro',
    fecha_movimiento: '2026-11-02 08:00:00',
    observaciones: 'Despacho directo para fundición de aceras y cordones',
  },
  {
    id: 4,
    material_id: 1,
    tipo_movimiento: 'SALIDA',
    cantidad: 60,
    ubicacion_id: 2,
    ubicacion_destino_id: null,
    orden_compra_id: null,
    documento_referencia: 'VS-2026-109',
    usuario_responsable: 'maestro.ramirez',
    fecha_movimiento: '2026-11-04 10:15:00',
    observaciones: 'Consumo en cimentación casas #12 a #15',
  },
  {
    id: 5,
    material_id: 2,
    tipo_movimiento: 'ENTRADA',
    cantidad: 850,
    ubicacion_id: 1,
    ubicacion_destino_id: null,
    orden_compra_id: 4,
    documento_referencia: 'OC-2026-002',
    usuario_responsable: 'bodeguero.juan',
    fecha_movimiento: '2026-10-29 08:15:00',
    observaciones: 'Ingreso de varilla #3 certificada Grado 40',
  },
  {
    id: 6,
    material_id: 2,
    tipo_movimiento: 'TRASLADO',
    cantidad: 300,
    ubicacion_id: 1,
    ubicacion_destino_id: 3,
    orden_compra_id: null,
    documento_referencia: 'GT-2026-014',
    usuario_responsable: 'bodeguero.juan',
    fecha_movimiento: '2026-11-01 09:40:00',
    observaciones: 'Envío de acero a Edificio Corporativo Torre Del Valle',
  },
  {
    id: 7,
    material_id: 2,
    tipo_movimiento: 'SALIDA',
    cantidad: 200,
    ubicacion_id: 3,
    ubicacion_destino_id: null,
    orden_compra_id: null,
    documento_referencia: 'VS-2026-115',
    usuario_responsable: 'ing.morales',
    fecha_movimiento: '2026-11-03 15:20:00',
    observaciones: 'Armado de columnas y vigas sísmicas piso 1',
  },
  {
    id: 8,
    material_id: 3,
    tipo_movimiento: 'ENTRADA',
    cantidad: 40,
    ubicacion_id: 2,
    ubicacion_destino_id: null,
    orden_compra_id: 7,
    documento_referencia: 'OC-2026-003',
    usuario_responsable: 'maestro.ramirez',
    fecha_movimiento: '2026-10-30 11:00:00',
    observaciones: 'Descarga directa de vagoneta en Obra Valle I',
  },
  {
    id: 9,
    material_id: 3,
    tipo_movimiento: 'SALIDA',
    cantidad: 22,
    ubicacion_id: 2,
    ubicacion_destino_id: null,
    orden_compra_id: null,
    documento_referencia: 'VS-2026-118',
    usuario_responsable: 'maestro.ramirez',
    fecha_movimiento: '2026-11-05 07:30:00',
    observaciones: 'Mezcla de mortero y contrapisos',
  },
  {
    id: 10,
    material_id: 4,
    tipo_movimiento: 'ENTRADA',
    cantidad: 1800,
    ubicacion_id: 1,
    ubicacion_destino_id: null,
    orden_compra_id: 8,
    documento_referencia: 'OC-2026-008',
    usuario_responsable: 'bodeguero.juan',
    fecha_movimiento: '2026-11-02 10:00:00',
    observaciones: 'Recepción en tarimas completas',
  },
  {
    id: 11,
    material_id: 4,
    tipo_movimiento: 'SALIDA',
    cantidad: 300,
    ubicacion_id: 1,
    ubicacion_destino_id: null,
    orden_compra_id: null,
    documento_referencia: 'VS-2026-122',
    usuario_responsable: 'ing.castro',
    fecha_movimiento: '2026-11-06 14:10:00',
    observaciones: 'Levantamiento de muros perimetrales',
  },
];

function evaluarEstado(stockActual, stockMinimo, puntoReorden) {
  if (stockActual <= stockMinimo) {
    return {
      codigo: 'CRÍTICO',
      etiqueta: 'Crítico (Bajo Mínimo)',
      tono: 'danger',
      requiere_reorden: true,
    };
  }
  if (stockActual <= puntoReorden) {
    return {
      codigo: 'REORDEN',
      etiqueta: 'Reorden Requerido',
      tono: 'warning',
      requiere_reorden: true,
    };
  }
  return {
    codigo: 'ÓPTIMO',
    etiqueta: 'Stock Óptimo',
    tono: 'success',
    requiere_reorden: false,
  };
}

export default function App() {
  const [activeTab, setActiveTab] = useState('inventario');
  const [ubicaciones, setUbicaciones] = useState(INITIAL_UBICACIONES);
  const [proveedores, setProveedores] = useState(INITIAL_PROVEEDORES);
  const [materiales, setMateriales] = useState(INITIAL_MATERIALES);
  const [movimientos, setMovimientos] = useState(INITIAL_MOVIMIENTOS);
  const [ordenes, setOrdenes] = useState(INITIAL_ORDENES);
  const [selectedMaterialId, setSelectedMaterialId] = useState(1);
  const [showNewMaterialForm, setShowNewMaterialForm] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState(null);
  const [ocFeedback, setOcFeedback] = useState(null);

  // Parámetros de auditoría para órdenes duplicadas
  const [maxDiasDup, setMaxDiasDup] = useState(3);
  const [maxPctDup, setMaxPctDup] = useState(10);

  // Formulario de Movimientos
  const [movForm, setMovForm] = useState({
    material_id: 1,
    tipo_movimiento: 'ENTRADA',
    cantidad: '',
    ubicacion_id: 1,
    ubicacion_destino_id: 2,
    orden_compra_id: '',
    documento_referencia: '',
    usuario_responsable: 'ing.castro',
    observaciones: '',
  });

  // Formulario de Nuevo Material
  const [matForm, setMatForm] = useState({
    sku: '',
    nombre: '',
    unidad_medida: 'SACO',
    stock_minimo: 50,
    stock_maximo: 500,
    stock_seguridad: 30,
    demanda_diaria: 15,
    tiempo_entrega_dias: 4,
  });

  // Formulario de Nueva Orden de Compra
  const [ocForm, setOcForm] = useState({
    numero_oc: 'OC-2026-009',
    proveedor_id: 1,
    material_id: 1,
    cantidad_solicitada: '',
    precio_unitario: 6850,
    usuario_creador: 'ana.rojas',
    observaciones: '',
  });

  // Sincronización con el backend MySQL (becontrolbodega)
  useEffect(() => {
    obtenerDatosIniciales()
      .then(({ materiales: matsDB, movimientos: movsDB, ordenes: ordsDB, ubicaciones: ubisDB, proveedores: provsDB }) => {
        if (Array.isArray(ubisDB) && ubisDB.length > 0) setUbicaciones(ubisDB);
        if (Array.isArray(provsDB) && provsDB.length > 0) setProveedores(provsDB);
        if (Array.isArray(matsDB) && matsDB.length > 0) setMateriales(matsDB);
        if (Array.isArray(movsDB)) {
          setMovimientos(
            movsDB.map((m) => ({
              ...m,
              fecha_movimiento: String(m.fecha_movimiento || '').slice(0, 19).replace('T', ' '),
            }))
          );
        }
        if (Array.isArray(ordsDB)) {
          setOrdenes(
            ordsDB.map((o) => ({
              ...o,
              fecha_emision: String(o.fecha_emision || '').slice(0, 19).replace('T', ' '),
            }))
          );
        }
      })
      .catch(() => {
        // Mantiene datos semilla locales si el servidor API aún no está encendido
      });
  }, []);

  // 1. Cálculo dinámico de materiales + stock actual + PR
  const materialesCalculados = useMemo(() => {
    return materiales.map((m) => {
      const punto_reorden =
        Number(m.demanda_diaria) * Number(m.tiempo_entrega_dias) + Number(m.stock_seguridad);

      const stock_actual = movimientos
        .filter((mov) => mov.material_id === m.id)
        .reduce((acc, mov) => {
          if (mov.tipo_movimiento === 'ENTRADA') return acc + Number(mov.cantidad);
          if (mov.tipo_movimiento === 'SALIDA') return acc - Number(mov.cantidad);
          return acc;
        }, 0);

      const desglose = ubicaciones.map((u) => {
        const stockUbi = movimientos
          .filter(
            (mov) =>
              mov.material_id === m.id &&
              (mov.ubicacion_id === u.id || mov.ubicacion_destino_id === u.id)
          )
          .reduce((acc, mov) => {
            if (mov.tipo_movimiento === 'ENTRADA' && mov.ubicacion_id === u.id)
              return acc + Number(mov.cantidad);
            if (mov.tipo_movimiento === 'SALIDA' && mov.ubicacion_id === u.id)
              return acc - Number(mov.cantidad);
            if (mov.tipo_movimiento === 'TRASLADO' && mov.ubicacion_id === u.id)
              return acc - Number(mov.cantidad);
            if (mov.tipo_movimiento === 'TRASLADO' && mov.ubicacion_destino_id === u.id)
              return acc + Number(mov.cantidad);
            return acc;
          }, 0);
        return { ...u, stock_ubicacion: stockUbi };
      });

      const info = evaluarEstado(stock_actual, m.stock_minimo, punto_reorden);
      const porcentajeNivel = Math.min(
        100,
        Math.round((stock_actual / Math.max(1, m.stock_maximo)) * 100)
      );

      return {
        ...m,
        punto_reorden,
        stock_actual,
        porcentaje_nivel: porcentajeNivel,
        estado: info.codigo,
        etiqueta_estado: info.etiqueta,
        tono: info.tono,
        requiere_reorden: info.requiere_reorden,
        cantidad_sugerida_compra: info.requiere_reorden
          ? Math.max(0, m.stock_maximo - stock_actual)
          : 0,
        desglose_por_ubicacion: desglose,
      };
    });
  }, [materiales, movimientos]);

  // 2. Alertas bajo Punto de Reorden
  const alertasReorden = useMemo(
    () => materialesCalculados.filter((m) => m.stock_actual <= m.punto_reorden),
    [materialesCalculados]
  );

  // 3. Detector de Órdenes Duplicadas
  const posiblesDuplicados = useMemo(() => {
    const pares = [];
    for (let i = 0; i < ordenes.length; i++) {
      for (let j = i + 1; j < ordenes.length; j++) {
        const oc1 = ordenes[i];
        const oc2 = ordenes[j];
        if (
          oc1.proveedor_id === oc2.proveedor_id &&
          oc1.material_id === oc2.material_id &&
          oc1.estado !== 'ANULADA' &&
          oc2.estado !== 'ANULADA'
        ) {
          const d1 = new Date(oc1.fecha_emision.replace(' ', 'T'));
          const d2 = new Date(oc2.fecha_emision.replace(' ', 'T'));
          const horasDif = Math.abs(d2 - d1) / (1000 * 60 * 60);
          const diasDif = Math.floor(horasDif / 24);
          const pctDif = Number(
            (
              (Math.abs(oc1.cantidad_solicitada - oc2.cantidad_solicitada) /
                Math.max(oc1.cantidad_solicitada, oc2.cantidad_solicitada)) *
              100
            ).toFixed(2)
          );

          if (diasDif <= maxDiasDup && pctDif <= maxPctDup) {
            const prov = proveedores.find((p) => p.id === oc1.proveedor_id);
            const mat = materiales.find((m) => m.id === oc1.material_id);
            pares.push({
              id: `${oc1.id}-${oc2.id}`,
              nivel_riesgo:
                pctDif === 0 && horasDif <= 24
                  ? 'RIESGO ALTO • Coincidencia Exacta en menos de 24h'
                  : 'RIESGO MEDIO • Cantidad y Fecha Similares',
              es_alto: pctDif === 0 && horasDif <= 24,
              proveedor: prov,
              material: mat,
              horas_diferencia: Math.round(horasDif),
              dias_diferencia: diasDif,
              porcentaje_diferencia: pctDif,
              orden_original: oc1,
              orden_sospechosa: oc2,
            });
          }
        }
      }
    }
    return pares;
  }, [ordenes, materiales, maxDiasDup, maxPctDup]);

  const materialSeleccionado = useMemo(
    () =>
      materialesCalculados.find((m) => m.id === Number(selectedMaterialId)) ||
      materialesCalculados[0],
    [materialesCalculados, selectedMaterialId]
  );

  // 4. Trazabilidad / Kardex
  const trazabilidadMaterial = useMemo(() => {
    if (!materialSeleccionado) return [];
    let saldo = 0;
    return movimientos
      .filter((mov) => mov.material_id === materialSeleccionado.id)
      .map((mov) => {
        if (mov.tipo_movimiento === 'ENTRADA') saldo += Number(mov.cantidad);
        if (mov.tipo_movimiento === 'SALIDA') saldo -= Number(mov.cantidad);

        const uOrig = ubicaciones.find((u) => u.id === mov.ubicacion_id);
        const uDest = mov.ubicacion_destino_id
          ? ubicaciones.find((u) => u.id === mov.ubicacion_destino_id)
          : null;
        const oc = mov.orden_compra_id
          ? ordenes.find((o) => o.id === Number(mov.orden_compra_id))
          : null;
        const prov = oc ? proveedores.find((p) => p.id === oc.proveedor_id) : null;

        return {
          ...mov,
          saldo_acumulado: saldo,
          ubicacion_codigo: uOrig?.codigo,
          ubicacion_nombre: uOrig?.nombre,
          ubicacion_destino_codigo: uDest?.codigo,
          oc_detalle: oc
            ? {
                numero_oc: oc.numero_oc,
                proveedor: prov?.nombre,
                precio_unitario: oc.precio_unitario,
              }
            : null,
        };
      });
  }, [movimientos, materialSeleccionado, ordenes]);

  async function handleRegistrarMovimiento(e) {
    e.preventDefault();
    setFeedbackMsg(null);

    const cant = Number(movForm.cantidad);
    if (!cant || cant <= 0) {
      setFeedbackMsg({ tipo: 'error', texto: 'La cantidad debe ser un número mayor a 0.' });
      return;
    }
    if (!movForm.documento_referencia.trim()) {
      setFeedbackMsg({
        tipo: 'error',
        texto: 'Indica el documento de respaldo (ej: OC-2026-004 o Vale VS-2026-130).',
      });
      return;
    }

    const mat = materialesCalculados.find((m) => m.id === Number(movForm.material_id));
    const ubiStock =
      mat?.desglose_por_ubicacion.find((u) => u.id === Number(movForm.ubicacion_id))
        ?.stock_ubicacion || 0;

    if (
      (movForm.tipo_movimiento === 'SALIDA' || movForm.tipo_movimiento === 'TRASLADO') &&
      ubiStock < cant
    ) {
      setFeedbackMsg({
        tipo: 'error',
        texto: `Stock insuficiente en la ubicación origen. Disponible: ${ubiStock} ${mat.unidad_medida}, Solicitado: ${cant}.`,
      });
      return;
    }

    const payload = {
      material_id: Number(movForm.material_id),
      tipo_movimiento: movForm.tipo_movimiento,
      cantidad: cant,
      ubicacion_id: Number(movForm.ubicacion_id),
      ubicacion_destino_id:
        movForm.tipo_movimiento === 'TRASLADO' ? Number(movForm.ubicacion_destino_id) : null,
      orden_compra_id: movForm.orden_compra_id ? Number(movForm.orden_compra_id) : null,
      documento_referencia: movForm.documento_referencia.trim(),
      usuario_responsable: movForm.usuario_responsable.trim(),
      observaciones: movForm.observaciones.trim() || 'Movimiento registrado en bodega',
    };

    try {
      const res = await registrarMovimientoApi(payload);
      const movGuardado = res.data.movimiento;
      setMovimientos((prev) => [
        ...prev,
        {
          ...movGuardado,
          fecha_movimiento: String(movGuardado.fecha_movimiento || '')
            .slice(0, 19)
            .replace('T', ' '),
        },
      ]);
    } catch {
      const nuevoMov = {
        id: movimientos.length + 1,
        ...payload,
        fecha_movimiento: new Date().toISOString().slice(0, 19).replace('T', ' '),
      };
      setMovimientos((prev) => [...prev, nuevoMov]);
    }

    setSelectedMaterialId(Number(movForm.material_id));
    setMovForm((prev) => ({ ...prev, cantidad: '', documento_referencia: '', observaciones: '' }));
    setFeedbackMsg({
      tipo: 'success',
      texto: `Movimiento (${payload.tipo_movimiento}) guardado exitosamente en la base de datos. El stock actual de "${mat.nombre}" fue actualizado.`,
    });
  }

  async function handleCrearMaterial(e) {
    e.preventDefault();
    if (!matForm.sku.trim() || !matForm.nombre.trim()) return;

    const payload = {
      sku: matForm.sku.trim().toUpperCase(),
      nombre: matForm.nombre.trim(),
      unidad_medida: matForm.unidad_medida.trim().toUpperCase(),
      stock_minimo: Number(matForm.stock_minimo),
      stock_maximo: Number(matForm.stock_maximo),
      stock_seguridad: Number(matForm.stock_seguridad),
      demanda_diaria: Number(matForm.demanda_diaria),
      tiempo_entrega_dias: Number(matForm.tiempo_entrega_dias),
    };

    try {
      const res = await crearMaterialApi(payload);
      setMateriales((prev) => [...prev, res.data]);
      setSelectedMaterialId(res.data.id);
    } catch {
      const nuevo = { id: materiales.length + 1, ...payload };
      setMateriales((prev) => [...prev, nuevo]);
      setSelectedMaterialId(nuevo.id);
    }

    setShowNewMaterialForm(false);
    setMatForm({
      sku: '',
      nombre: '',
      unidad_medida: 'SACO',
      stock_minimo: 50,
      stock_maximo: 500,
      stock_seguridad: 30,
      demanda_diaria: 15,
      tiempo_entrega_dias: 4,
    });
  }

  async function handleCrearOrdenCompra(e) {
    e.preventDefault();
    setOcFeedback(null);
    const cant = Number(ocForm.cantidad_solicitada);
    if (!cant || cant <= 0) return;

    const fechaActual = '2026-11-08 14:30:00';
    const nuevaOc = {
      id: ordenes.length + 1,
      numero_oc: ocForm.numero_oc.trim().toUpperCase(),
      proveedor_id: Number(ocForm.proveedor_id),
      material_id: Number(ocForm.material_id),
      cantidad_solicitada: cant,
      precio_unitario: Number(ocForm.precio_unitario),
      fecha_emision: fechaActual,
      estado: 'EMITIDA',
      usuario_creador: ocForm.usuario_creador.trim(),
      observaciones: ocForm.observaciones.trim() || 'Orden de compra emitida desde plataforma',
    };

    // Verificar si se parece a alguna orden reciente
    const posibleDup = ordenes.find(
      (o) =>
        o.proveedor_id === nuevaOc.proveedor_id &&
        o.material_id === nuevaOc.material_id &&
        Math.abs(o.cantidad_solicitada - nuevaOc.cantidad_solicitada) /
          Math.max(o.cantidad_solicitada, nuevaOc.cantidad_solicitada) <=
          0.1
    );

    try {
      const res = await crearOrdenCompraApi(nuevaOc);
      const ocGuardada = res.data;
      setOrdenes((prev) => [
        {
          ...ocGuardada,
          fecha_emision: String(ocGuardada.fecha_emision || '').slice(0, 19).replace('T', ' '),
        },
        ...prev,
      ]);
    } catch {
      setOrdenes((prev) => [nuevaOc, ...prev]);
    }

    setOcForm((prev) => ({
      ...prev,
      numero_oc: `OC-2026-0${ordenes.length + 10}`,
      cantidad_solicitada: '',
      observaciones: '',
    }));

    if (posibleDup) {
      setOcFeedback({
        tipo: 'error',
        texto: `⚠️ Atención: Se registró la orden ${nuevaOc.numero_oc}, pero el sistema detectó posible duplicidad con la orden ${posibleDup.numero_oc} (mismo proveedor, material y cantidad similar). Revísala en la pestaña Auditoría de Duplicados.`,
      });
    } else {
      setOcFeedback({
        tipo: 'success',
        texto: `Orden de Compra ${nuevaOc.numero_oc} emitida correctamente sin alertas de duplicidad.`,
      });
    }
  }

  const prPreview =
    Number(matForm.demanda_diaria) * Number(matForm.tiempo_entrega_dias) +
    Number(matForm.stock_seguridad);

  const titulosPorPestana = {
    inventario: 'Catálogo de Materiales y Control de Existencias',
    alertas: 'Alertas de Reabastecimiento (Punto de Reorden)',
    movimientos: 'Movimientos de Bodega y Trazabilidad (Kardex)',
    ordenes: 'Gestión de Órdenes de Compra a Proveedores',
    duplicados: 'Auditoría de Órdenes de Compra Posiblemente Duplicadas',
  };

  return (
    <div className="erp-layout notranslate" translate="no">
      {/* BARRA LATERAL DE NAVEGACIÓN */}
      <aside className="erp-sidebar">
        <div>
          <div className="brand-header">
            <div className="brand-logo">CV</div>
            <div>
              <div className="brand-title">Constructora Del Valle</div>
              <div className="brand-subtitle">Sistema de Control de Bodega</div>
            </div>
          </div>

          <div className="nav-section-label">Menú Principal</div>
          <nav className="sidebar-nav">
            <button
              type="button"
              className={`nav-item ${activeTab === 'inventario' ? 'active' : ''}`}
              onClick={() => setActiveTab('inventario')}
            >
              <span className="nav-item-left">
                <span className="nav-icon">📦</span>
                <span>Inventario y Stock</span>
              </span>
            </button>

            <button
              type="button"
              className={`nav-item ${activeTab === 'alertas' ? 'active' : ''}`}
              onClick={() => setActiveTab('alertas')}
            >
              <span className="nav-item-left">
                <span className="nav-icon">🚨</span>
                <span>Alertas de Reorden</span>
              </span>
              {alertasReorden.length > 0 ? (
                <span className="nav-badge">{alertasReorden.length}</span>
              ) : null}
            </button>

            <button
              type="button"
              className={`nav-item ${activeTab === 'movimientos' ? 'active' : ''}`}
              onClick={() => setActiveTab('movimientos')}
            >
              <span className="nav-item-left">
                <span className="nav-icon">🔄</span>
                <span>Movimientos y Kardex</span>
              </span>
            </button>

            <button
              type="button"
              className={`nav-item ${activeTab === 'ordenes' ? 'active' : ''}`}
              onClick={() => setActiveTab('ordenes')}
            >
              <span className="nav-item-left">
                <span className="nav-icon">🧾</span>
                <span>Órdenes de Compra</span>
              </span>
            </button>

            <button
              type="button"
              className={`nav-item ${activeTab === 'duplicados' ? 'active' : ''}`}
              onClick={() => setActiveTab('duplicados')}
            >
              <span className="nav-item-left">
                <span className="nav-icon">🔍</span>
                <span>Auditoría de Duplicados</span>
              </span>
              {posiblesDuplicados.length > 0 ? (
                <span className="nav-badge">{posiblesDuplicados.length}</span>
              ) : null}
            </button>
          </nav>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <div className="erp-main">
        <header className="erp-topbar">
          <div className="topbar-titles">
            <h1>{titulosPorPestana[activeTab]}</h1>
            <p>Constructora Del Valle S.A. &bull; Departamento de Logística y Aprovisionamiento</p>
          </div>

          <div className="topbar-actions">
            <button
              type="button"
              className="btn btn-amber"
              onClick={() => {
                setActiveTab('movimientos');
              }}
            >
              <span>+ Registrar Entrada / Salida</span>
            </button>
          </div>
        </header>

        <main className="erp-content">
          {/* FILA DE KPIs INTERACTIVOS */}
          <section className="kpi-row">
            <div className="kpi-box" onClick={() => setActiveTab('inventario')}>
              <div className="kpi-top">
                <span className="kpi-title">Insumos en Catálogo</span>
                <span className="kpi-icon blue">🧱</span>
              </div>
              <div className="kpi-number">{materialesCalculados.length}</div>
              <div className="kpi-caption">Materiales de construcción activos</div>
            </div>

            <div className="kpi-box" onClick={() => setActiveTab('alertas')}>
              <div className="kpi-top">
                <span className="kpi-title">Materiales por Pedir</span>
                <span className="kpi-icon red">⚠️</span>
              </div>
              <div className="kpi-number">{alertasReorden.length}</div>
              <div className="kpi-caption">Por debajo del Punto de Reorden</div>
            </div>

            <div className="kpi-box" onClick={() => setActiveTab('duplicados')}>
              <div className="kpi-top">
                <span className="kpi-title">Compras Sospechosas</span>
                <span className="kpi-icon amber">📑</span>
              </div>
              <div className="kpi-number">{posiblesDuplicados.length}</div>
              <div className="kpi-caption">Posibles órdenes de compra duplicadas</div>
            </div>

            <div className="kpi-box" onClick={() => setActiveTab('movimientos')}>
              <div className="kpi-top">
                <span className="kpi-title">Operaciones en Kardex</span>
                <span className="kpi-icon green">📋</span>
              </div>
              <div className="kpi-number">{movimientos.length}</div>
              <div className="kpi-caption">Entradas, vales de salida y traslados</div>
            </div>
          </section>

          {/* VISTA 1: CATÁLOGO Y STOCK */}
          {activeTab === 'inventario' && (
            <div className="grid-2col">
              <div className="card">
                <div className="card-header">
                  <div>
                    <h2>Existencias Actuales de Materiales</h2>
                    <p>Selecciona un material de la tabla para ver su disponibilidad por bodega y obra</p>
                  </div>
                  <button
                    type="button"
                    className="btn btn-dark btn-sm"
                    onClick={() => setShowNewMaterialForm(!showNewMaterialForm)}
                  >
                    <span>{showNewMaterialForm ? 'Cancelar' : '+ Nuevo Material'}</span>
                  </button>
                </div>

                {showNewMaterialForm && (
                  <div
                    className="card-body"
                    style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}
                  >
                    <form onSubmit={handleCrearMaterial}>
                      <div className="erp-form-grid">
                        <div className="field-group">
                          <label>Código SKU</label>
                          <input
                            type="text"
                            placeholder="MAT-CLV-002"
                            value={matForm.sku}
                            onChange={(e) => setMatForm({ ...matForm, sku: e.target.value })}
                            required
                          />
                        </div>
                        <div className="field-group">
                          <label>Nombre del Insumo</label>
                          <input
                            type="text"
                            placeholder="Clavo de Acero 2.5 pulgadas"
                            value={matForm.nombre}
                            onChange={(e) => setMatForm({ ...matForm, nombre: e.target.value })}
                            required
                          />
                        </div>
                        <div className="field-group">
                          <label>Unidad de Medida</label>
                          <input
                            type="text"
                            value={matForm.unidad_medida}
                            onChange={(e) =>
                              setMatForm({ ...matForm, unidad_medida: e.target.value })
                            }
                            required
                          />
                        </div>
                        <div className="field-group">
                          <label>Consumo Diario Promedio</label>
                          <input
                            type="number"
                            min="0"
                            value={matForm.demanda_diaria}
                            onChange={(e) =>
                              setMatForm({ ...matForm, demanda_diaria: e.target.value })
                            }
                            required
                          />
                        </div>
                        <div className="field-group">
                          <label>Tiempo de Entrega (días)</label>
                          <input
                            type="number"
                            min="1"
                            value={matForm.tiempo_entrega_dias}
                            onChange={(e) =>
                              setMatForm({ ...matForm, tiempo_entrega_dias: e.target.value })
                            }
                            required
                          />
                        </div>
                        <div className="field-group">
                          <label>Stock de Seguridad</label>
                          <input
                            type="number"
                            min="0"
                            value={matForm.stock_seguridad}
                            onChange={(e) =>
                              setMatForm({ ...matForm, stock_seguridad: e.target.value })
                            }
                            required
                          />
                        </div>
                      </div>
                      <div
                        style={{
                          marginTop: '14px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a' }}>
                          Punto de Reorden Calculado Automáticamente: {prPreview}{' '}
                          {matForm.unidad_medida}
                        </span>
                        <button type="submit" className="btn btn-amber">
                          Guardar en Catálogo
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="table-wrap">
                  <table className="erp-table">
                    <thead>
                      <tr>
                        <th>Insumo / Código</th>
                        <th>Existencia Actual</th>
                        <th>Punto de Reorden (PR)</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {materialesCalculados.map((m) => (
                        <tr
                          key={m.id}
                          className={m.id === materialSeleccionado?.id ? 'active-row' : ''}
                          onClick={() => setSelectedMaterialId(m.id)}
                        >
                          <td>
                            <div className="mat-name">{m.nombre}</div>
                            <span className="sku-pill">{m.sku}</span>
                          </td>
                          <td>
                            <div className="stock-meter-wrap">
                              <div className="stock-meter-labels">
                                <strong>
                                  {m.stock_actual} {m.unidad_medida}
                                </strong>
                                <span style={{ color: '#64748b' }}>Máx: {m.stock_maximo}</span>
                              </div>
                              <div className="stock-meter-bar">
                                <div
                                  className={`stock-meter-fill ${m.tono}`}
                                  style={{ width: `${m.porcentaje_nivel}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td>
                            <strong style={{ fontSize: '0.94rem' }}>
                              {m.punto_reorden} {m.unidad_medida}
                            </strong>
                          </td>
                          <td>
                            <span className={`status-badge ${m.tono}`}>{m.etiqueta_estado}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* FICHA TÉCNICA DE MATERIAL SELECCIONADO */}
              {materialSeleccionado && (
                <div className="card">
                  <div className="card-header">
                    <div>
                      <h2>Disponibilidad por Bodega y Obra</h2>
                      <p>Existencias calculadas dinámicamente según movimientos</p>
                    </div>
                    <span className={`status-badge ${materialSeleccionado.tono}`}>
                      {materialSeleccionado.etiqueta_estado}
                    </span>
                  </div>

                  <div className="card-body">
                    <div className="detail-hero">
                      <div className="detail-hero-top">
                        <div>
                          <span style={{ fontSize: '0.74rem', color: '#f59e0b', fontWeight: 700 }}>
                            CÓDIGO: {materialSeleccionado.sku}
                          </span>
                          <h3>{materialSeleccionado.nombre}</h3>
                        </div>
                      </div>

                      <div className="detail-stats-row">
                        <div className="detail-stat-item">
                          <span>Stock Total</span>
                          <strong>
                            {materialSeleccionado.stock_actual}{' '}
                            {materialSeleccionado.unidad_medida}
                          </strong>
                        </div>
                        <div className="detail-stat-item">
                          <span>Punto Reorden</span>
                          <strong>
                            {materialSeleccionado.punto_reorden}{' '}
                            {materialSeleccionado.unidad_medida}
                          </strong>
                        </div>
                        <div className="detail-stat-item">
                          <span>Stock Mínimo</span>
                          <strong>
                            {materialSeleccionado.stock_minimo}{' '}
                            {materialSeleccionado.unidad_medida}
                          </strong>
                        </div>
                      </div>
                    </div>

                    <h4
                      style={{
                        fontSize: '0.82rem',
                        textTransform: 'uppercase',
                        color: '#475569',
                        marginBottom: '10px',
                      }}
                    >
                      Inventario Ubicado en cada Frente
                    </h4>
                    <div className="warehouse-list">
                      {materialSeleccionado.desglose_por_ubicacion.map((u) => (
                        <div key={u.id} className="warehouse-item">
                          <div>
                            <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>
                              {u.nombre}
                            </strong>
                            <span className={`warehouse-tag ${u.tipo.toLowerCase()}`}>
                              {u.tipo}
                            </span>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                              Ubicación: {u.codigo}
                            </div>
                          </div>
                          <div className="warehouse-qty">
                            {u.stock_ubicacion} {materialSeleccionado.unidad_medida}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div style={{ marginTop: '18px', display: 'flex', gap: '10px' }}>
                      <button
                        type="button"
                        className="btn btn-outline"
                        style={{ width: '100%' }}
                        onClick={() => setActiveTab('movimientos')}
                      >
                        <span>Consultar Kardex y Trazabilidad de este Material &rarr;</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VISTA 2: ALERTAS DE REORDEN */}
          {activeTab === 'alertas' && (
            <div className="alerts-grid">
              {alertasReorden.map((a) => (
                <div
                  key={a.id}
                  className={`alert-card ${a.stock_actual <= a.stock_minimo ? 'high' : 'medium'}`}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '10px',
                    }}
                  >
                    <span className={`status-badge ${a.tono}`}>
                      {a.stock_actual <= a.stock_minimo
                        ? 'URGENCIA ALTA • RIESGO DE PARO DE OBRA'
                        : 'URGENCIA MEDIA • EMITIR PEDIDO DE REPOSICIÓN'}
                    </span>
                    <span className="sku-pill">{a.sku}</span>
                  </div>

                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                    {a.nombre}
                  </h3>
                  <p style={{ fontSize: '0.83rem', color: '#64748b', marginTop: '4px' }}>
                    Las existencias actuales ({a.stock_actual} {a.unidad_medida}) están por debajo
                    del Punto de Reorden establecido ({a.punto_reorden} {a.unidad_medida}).
                  </p>

                  <div className="alert-metrics-grid">
                    <div className="alert-metric">
                      <span>Stock Actual</span>
                      <strong style={{ color: '#dc2626' }}>
                        {a.stock_actual} {a.unidad_medida}
                      </strong>
                    </div>
                    <div className="alert-metric">
                      <span>Punto Reorden</span>
                      <strong>
                        {a.punto_reorden} {a.unidad_medida}
                      </strong>
                    </div>
                    <div className="alert-metric">
                      <span>Faltante vs PR</span>
                      <strong>
                        -{a.punto_reorden - a.stock_actual} {a.unidad_medida}
                      </strong>
                    </div>
                    <div className="alert-metric">
                      <span>Compra Sugerida</span>
                      <strong style={{ color: '#059669' }}>
                        +{a.cantidad_sugerida_compra} {a.unidad_medida}
                      </strong>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn btn-amber"
                    onClick={() => {
                      setMovForm((prev) => ({
                        ...prev,
                        material_id: a.id,
                        tipo_movimiento: 'ENTRADA',
                        cantidad: a.cantidad_sugerida_compra,
                        documento_referencia: 'OC-2026-010',
                      }));
                      setSelectedMaterialId(a.id);
                      setActiveTab('movimientos');
                    }}
                  >
                    <span>
                      Registrar Ingreso de Reposición (+{a.cantidad_sugerida_compra}{' '}
                      {a.unidad_medida})
                    </span>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* VISTA 3: MOVIMIENTOS Y TRAZABILIDAD */}
          {activeTab === 'movimientos' && (
            <div className="grid-2col">
              <div className="card">
                <div className="card-header">
                  <div>
                    <h2>Historial de Movimientos y Trazabilidad (Kardex)</h2>
                    <p>
                      Muestra cada entrada con su Orden de Compra de origen, vales de salida y
                      traslados
                    </p>
                  </div>
                  <select
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontWeight: 600,
                    }}
                    value={selectedMaterialId}
                    onChange={(e) => setSelectedMaterialId(Number(e.target.value))}
                  >
                    {materialesCalculados.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.sku} - {m.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="table-wrap">
                  <table className="erp-table">
                    <thead>
                      <tr>
                        <th>Fecha y Hora</th>
                        <th>Operación</th>
                        <th>Cantidad</th>
                        <th>Saldo en Bodega</th>
                        <th>Ubicación</th>
                        <th>Documento / Proveedor de Origen</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trazabilidadMaterial.map((item) => (
                        <tr key={item.id}>
                          <td style={{ fontSize: '0.78rem', color: '#64748b' }}>
                            {item.fecha_movimiento}
                          </td>
                          <td>
                            <span
                              className={`status-badge ${
                                item.tipo_movimiento === 'ENTRADA'
                                  ? 'success'
                                  : item.tipo_movimiento === 'SALIDA'
                                  ? 'danger'
                                  : 'warning'
                              }`}
                            >
                              {item.tipo_movimiento}
                            </span>
                          </td>
                          <td>
                            <strong>
                              {item.tipo_movimiento === 'ENTRADA'
                                ? `+${item.cantidad}`
                                : item.tipo_movimiento === 'SALIDA'
                                ? `-${item.cantidad}`
                                : item.cantidad}
                            </strong>
                          </td>
                          <td>
                            <strong>
                              {item.saldo_acumulado} {materialSeleccionado?.unidad_medida}
                            </strong>
                          </td>
                          <td>
                            <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>
                              {item.ubicacion_codigo}
                            </div>
                            {item.ubicacion_destino_codigo && (
                              <div style={{ fontSize: '0.75rem', color: '#d97706' }}>
                                &rarr; {item.ubicacion_destino_codigo}
                              </div>
                            )}
                          </td>
                          <td>
                            <span className="sku-pill">{item.documento_referencia}</span>
                            {item.oc_detalle ? (
                              <div
                                style={{
                                  fontSize: '0.76rem',
                                  color: '#047857',
                                  fontWeight: 600,
                                  marginTop: '3px',
                                }}
                              >
                                Proveedor: {item.oc_detalle.proveedor}
                              </div>
                            ) : (
                              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                {item.observaciones}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* FORMULARIO DE MOVIMIENTOS */}
              <div className="card">
                <div className="card-header">
                  <div>
                    <h2>Registrar Nuevo Movimiento de Bodega</h2>
                    <p>Ingresa una recepción de compra, un vale de salida a obra o un traslado</p>
                  </div>
                </div>
                <div className="card-body">
                  {feedbackMsg && (
                    <div className={`feedback-toast ${feedbackMsg.tipo}`}>
                      {feedbackMsg.texto}
                    </div>
                  )}

                  <form
                    onSubmit={handleRegistrarMovimiento}
                    style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
                  >
                    <div className="field-group">
                      <label>Material / Insumo</label>
                      <select
                        value={movForm.material_id}
                        onChange={(e) => {
                          setMovForm({ ...movForm, material_id: Number(e.target.value) });
                          setSelectedMaterialId(Number(e.target.value));
                        }}
                      >
                        {materialesCalculados.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.sku} - {m.nombre} (Disponible: {m.stock_actual} {m.unidad_medida})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="erp-form-grid">
                      <div className="field-group">
                        <label>Tipo de Operación</label>
                        <select
                          value={movForm.tipo_movimiento}
                          onChange={(e) =>
                            setMovForm({ ...movForm, tipo_movimiento: e.target.value })
                          }
                        >
                          <option value="ENTRADA">ENTRADA (Recepción de Compra)</option>
                          <option value="SALIDA">SALIDA (Consumo en Obra)</option>
                          <option value="TRASLADO">TRASLADO (Bodega a Obra)</option>
                        </select>
                      </div>

                      <div className="field-group">
                        <label>Cantidad</label>
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          placeholder="Ej: 80"
                          value={movForm.cantidad}
                          onChange={(e) => setMovForm({ ...movForm, cantidad: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="field-group">
                      <label>
                        {movForm.tipo_movimiento === 'TRASLADO'
                          ? 'Bodega / Obra de Origen'
                          : 'Bodega / Obra'}
                      </label>
                      <select
                        value={movForm.ubicacion_id}
                        onChange={(e) =>
                          setMovForm({ ...movForm, ubicacion_id: Number(e.target.value) })
                        }
                      >
                        {ubicaciones.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.codigo} - {u.nombre}
                          </option>
                        ))}
                      </select>
                    </div>

                    {movForm.tipo_movimiento === 'TRASLADO' && (
                      <div className="field-group">
                        <label>Bodega / Obra de Destino</label>
                        <select
                          value={movForm.ubicacion_destino_id}
                          onChange={(e) =>
                            setMovForm({
                              ...movForm,
                              ubicacion_destino_id: Number(e.target.value),
                            })
                          }
                        >
                          {INITIAL_UBICACIONES.map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.codigo} - {u.nombre}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {movForm.tipo_movimiento === 'ENTRADA' && (
                      <div className="field-group">
                        <label>Orden de Compra Asociada (Para Trazabilidad)</label>
                        <select
                          value={movForm.orden_compra_id}
                          onChange={(e) => {
                            const ocId = e.target.value;
                            const oc = ordenes.find((o) => o.id === Number(ocId));
                            setMovForm({
                              ...movForm,
                              orden_compra_id: ocId,
                              documento_referencia: oc
                                ? oc.numero_oc
                                : movForm.documento_referencia,
                            });
                          }}
                        >
                          <option value="">-- Seleccionar Orden de Compra --</option>
                          {ordenes
                            .filter((o) => o.material_id === Number(movForm.material_id))
                            .map((o) => (
                              <option key={o.id} value={o.id}>
                                {o.numero_oc} ({o.cantidad_solicitada} u. - {o.estado})
                              </option>
                            ))}
                        </select>
                      </div>
                    )}

                    <div className="erp-form-grid">
                      <div className="field-group">
                        <label>N° Documento (OC, Vale de Salida o Guía)</label>
                        <input
                          type="text"
                          placeholder="Ej: OC-2026-004 o VS-2026-140"
                          value={movForm.documento_referencia}
                          onChange={(e) =>
                            setMovForm({ ...movForm, documento_referencia: e.target.value })
                          }
                          required
                        />
                      </div>

                      <div className="field-group">
                        <label>Responsable de Bodega / Ingeniería</label>
                        <input
                          type="text"
                          value={movForm.usuario_responsable}
                          onChange={(e) =>
                            setMovForm({ ...movForm, usuario_responsable: e.target.value })
                          }
                          required
                        />
                      </div>
                    </div>

                    <button type="submit" className="btn btn-dark" style={{ marginTop: '6px' }}>
                      Registrar Movimiento y Actualizar Inventario
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* VISTA 4: GESTIÓN DE ÓRDENES DE COMPRA */}
          {activeTab === 'ordenes' && (
            <div className="grid-2col">
              <div className="card">
                <div className="card-header">
                  <div>
                    <h2>Registro de Órdenes de Compra Emitidas</h2>
                    <p>Control de pedidos a proveedores de materiales y estado de recepción</p>
                  </div>
                </div>
                <div className="table-wrap">
                  <table className="erp-table">
                    <thead>
                      <tr>
                        <th>N° Orden</th>
                        <th>Proveedor</th>
                        <th>Material Solicitado</th>
                        <th>Cantidad</th>
                        <th>Monto Total</th>
                        <th>Fecha Emisión</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ordenes.map((oc) => {
                        const prov = proveedores.find((p) => p.id === oc.proveedor_id);
                        const mat = materiales.find((m) => m.id === oc.material_id);
                        const montoTotal = oc.cantidad_solicitada * oc.precio_unitario;
                        return (
                          <tr key={oc.id}>
                            <td>
                              <span className="sku-pill">{oc.numero_oc}</span>
                            </td>
                            <td>
                              <div style={{ fontWeight: 600 }}>{prov?.nombre}</div>
                              <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                                RUC: {prov?.ruc} &bull; Creador: {oc.usuario_creador}
                              </div>
                            </td>
                            <td>
                              <strong>{mat?.nombre}</strong>
                            </td>
                            <td>
                              <strong>
                                {oc.cantidad_solicitada} {mat?.unidad_medida}
                              </strong>
                            </td>
                            <td>
                              <div>₡{montoTotal.toLocaleString('es-CR')}</div>
                              <div style={{ fontSize: '0.72rem', color: '#0369a1', fontWeight: 600 }}>
                                Aprueba:{' '}
                                {montoTotal <= 250000
                                  ? 'Jefatura Área (1 cot.)'
                                  : montoTotal <= 2000000
                                  ? 'Jefatura Compras (2 cot.)'
                                  : montoTotal <= 10000000
                                  ? 'Gerencia Financiera (3 cot.)'
                                  : 'Gerencia General (Comité)'}
                              </div>
                            </td>
                            <td style={{ fontSize: '0.78rem', color: '#64748b' }}>
                              {oc.fecha_emision}
                            </td>
                            <td>
                              <span
                                className={`status-badge ${
                                  oc.estado === 'RECIBIDA_TOTAL' ? 'success' : 'warning'
                                }`}
                              >
                                {oc.estado}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <div>
                    <h2>Emitir Nueva Orden de Compra</h2>
                    <p>Verifica automáticamente si existe una orden similar reciente</p>
                  </div>
                </div>
                <div className="card-body">
                  {ocFeedback && (
                    <div className={`feedback-toast ${ocFeedback.tipo}`}>{ocFeedback.texto}</div>
                  )}

                  <form
                    onSubmit={handleCrearOrdenCompra}
                    style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
                  >
                    <div className="field-group">
                      <label>Número de Orden de Compra</label>
                      <input
                        type="text"
                        value={ocForm.numero_oc}
                        onChange={(e) => setOcForm({ ...ocForm, numero_oc: e.target.value })}
                        required
                      />
                    </div>

                    <div className="field-group">
                      <label>Proveedor Autorizado</label>
                      <select
                        value={ocForm.proveedor_id}
                        onChange={(e) =>
                          setOcForm({ ...ocForm, proveedor_id: Number(e.target.value) })
                        }
                      >
                        {proveedores.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.nombre} ({p.ruc})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="field-group">
                      <label>Material a Solicitar</label>
                      <select
                        value={ocForm.material_id}
                        onChange={(e) =>
                          setOcForm({ ...ocForm, material_id: Number(e.target.value) })
                        }
                      >
                        {materialesCalculados.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.sku} - {m.nombre}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="erp-form-grid">
                      <div className="field-group">
                        <label>Cantidad Solicitada</label>
                        <input
                          type="number"
                          min="1"
                          placeholder="Ej: 250"
                          value={ocForm.cantidad_solicitada}
                          onChange={(e) =>
                            setOcForm({ ...ocForm, cantidad_solicitada: e.target.value })
                          }
                          required
                        />
                      </div>

                      <div className="field-group">
                        <label>Precio Unitario (₡)</label>
                        <input
                          type="number"
                          min="1"
                          value={ocForm.precio_unitario}
                          onChange={(e) =>
                            setOcForm({ ...ocForm, precio_unitario: e.target.value })
                          }
                          required
                        />
                      </div>
                    </div>

                    <div className="field-group">
                      <label>Solicitado por (Usuario)</label>
                      <input
                        type="text"
                        value={ocForm.usuario_creador}
                        onChange={(e) =>
                          setOcForm({ ...ocForm, usuario_creador: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="field-group">
                      <label>Observaciones / Destino de Obra</label>
                      <input
                        type="text"
                        placeholder="Ej: Abastecimiento urgente Etapa I"
                        value={ocForm.observaciones}
                        onChange={(e) => setOcForm({ ...ocForm, observaciones: e.target.value })}
                      />
                    </div>

                    <button type="submit" className="btn btn-amber">
                      Emitir Orden de Compra
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* VISTA 5: AUDITORÍA DE ÓRDENES DUPLICADAS */}
          {activeTab === 'duplicados' && (
            <div>
              <div className="card" style={{ marginBottom: '20px' }}>
                <div className="card-header">
                  <div>
                    <h2>Control Interno: Detección de Órdenes de Compra Sospechosas</h2>
                    <p>
                      Identifica posibles pedidos duplicados emitidos al mismo proveedor, por el
                      mismo insumo, con cantidades similares y en fechas cercanas
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div
                      className="field-group"
                      style={{ flexDirection: 'row', alignItems: 'center', gap: '8px' }}
                    >
                      <label>Rango máx. de días:</label>
                      <input
                        type="number"
                        min="0"
                        max="30"
                        style={{ width: '72px' }}
                        value={maxDiasDup}
                        onChange={(e) => setMaxDiasDup(Number(e.target.value))}
                      />
                    </div>
                    <div
                      className="field-group"
                      style={{ flexDirection: 'row', alignItems: 'center', gap: '8px' }}
                    >
                      <label>Variación máx. cantidad (%):</label>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        style={{ width: '72px' }}
                        value={maxPctDup}
                        onChange={(e) => setMaxPctDup(Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {posiblesDuplicados.map((dup) => (
                <div key={dup.id} className="dup-audit-card">
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '10px',
                    }}
                  >
                    <span className={`status-badge ${dup.es_alto ? 'danger' : 'warning'}`}>
                      {dup.nivel_riesgo}
                    </span>
                    <span style={{ fontSize: '0.83rem', color: '#475569', fontWeight: 600 }}>
                      Diferencia entre emisiones: <strong>{dup.horas_diferencia} horas</strong> (
                      {dup.dias_diferencia} días) &bull; Variación de cantidad:{' '}
                      <strong>{dup.porcentaje_diferencia}%</strong>
                    </span>
                  </div>

                  <div
                    style={{
                      marginTop: '12px',
                      fontSize: '0.9rem',
                      color: '#0f172a',
                      display: 'flex',
                      gap: '24px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div>
                      <span style={{ color: '#64748b' }}>Proveedor: </span>
                      <strong>{dup.proveedor?.nombre}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>Material: </span>
                      <strong>
                        {dup.material?.sku} — {dup.material?.nombre}
                      </strong>
                    </div>
                  </div>

                  <div className="dup-vs-grid">
                    <div className="oc-compare-card">
                      <span className="sku-pill">PRIMERA ORDEN REGISTRADA</span>
                      <h4 style={{ fontSize: '1.05rem', margin: '8px 0', color: '#0f172a' }}>
                        {dup.orden_original.numero_oc}
                      </h4>
                      <p style={{ fontSize: '0.85rem', marginBottom: '4px' }}>
                        <strong>Cantidad Solicitada:</strong>{' '}
                        {dup.orden_original.cantidad_solicitada} {dup.material?.unidad_medida}
                      </p>
                      <p style={{ fontSize: '0.85rem', marginBottom: '4px' }}>
                        <strong>Fecha Emisión:</strong> {dup.orden_original.fecha_emision}
                      </p>
                      <p style={{ fontSize: '0.85rem', marginBottom: '4px' }}>
                        <strong>Emitida por:</strong> {dup.orden_original.usuario_creador}
                      </p>
                      <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '6px' }}>
                        {dup.orden_original.observaciones}
                      </p>
                    </div>

                    <div className="vs-circle">VS</div>

                    <div className="oc-compare-card flagged">
                      <span className="status-badge danger">POSIBLE ORDEN DUPLICADA</span>
                      <h4 style={{ fontSize: '1.05rem', margin: '8px 0', color: '#991b1b' }}>
                        {dup.orden_sospechosa.numero_oc}
                      </h4>
                      <p style={{ fontSize: '0.85rem', marginBottom: '4px' }}>
                        <strong>Cantidad Solicitada:</strong>{' '}
                        {dup.orden_sospechosa.cantidad_solicitada} {dup.material?.unidad_medida}
                      </p>
                      <p style={{ fontSize: '0.85rem', marginBottom: '4px' }}>
                        <strong>Fecha Emisión:</strong> {dup.orden_sospechosa.fecha_emision}
                      </p>
                      <p style={{ fontSize: '0.85rem', marginBottom: '4px' }}>
                        <strong>Emitida por:</strong> {dup.orden_sospechosa.usuario_creador}
                      </p>
                      <p style={{ fontSize: '0.8rem', color: '#7f1d1d', marginTop: '6px' }}>
                        {dup.orden_sospechosa.observaciones}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
