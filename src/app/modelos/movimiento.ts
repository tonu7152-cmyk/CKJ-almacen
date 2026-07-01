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
}
