export interface Movimiento {
  id?: number;
  materialId: number;
  tipo: 'ingreso' | 'salida';
  cantidad: number;
  fecha: string;
  proveedor?: string;
  destino?: string;
  usuario: string;
  materialNombre?: string;
  comprobante?: string;
  precioUnitario?: number;
}

export interface DashboardData {
  totalMateriales: number;
  totalStock: number;
  totalValor: number;
  bajosStock: number;
  ingresosHoy: number;
  salidasHoy: number;
  movimientosRecientes: Movimiento[];
  materialesBajosStock: {
    id: number;
    nombre: string;
    cantidad: number;
    unidad: string;
  }[];
}

export interface HistorialResumen {
  periodo: string;
  movimientos: Movimiento[];
  resumen: {
    totalMovimientos: number;
    totalIngresos: number;
    totalSalidas: number;
    cantIngresada: number;
    cantSalida: number;
    valorVentas: number;
  };
}
