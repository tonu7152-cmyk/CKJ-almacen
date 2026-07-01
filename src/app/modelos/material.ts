export interface Material {
  id?: number;
  nombre: string;
  descripcion: string;
  categoria: string;
  cantidad: number;
  unidad: string;
  ubicacion: string;
  fechaIngreso: Date;
  proveedor: string;
  precioUnitario: number;
}