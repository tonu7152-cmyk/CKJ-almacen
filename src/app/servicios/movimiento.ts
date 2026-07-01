import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Movimiento, DashboardData, HistorialResumen } from '../modelos/movimiento';

@Injectable({ providedIn: 'root' })
export class MovimientoService {
  private apiUrl = 'http://localhost:3000/movimientos';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Movimiento[]> {
    return this.http.get<Movimiento[]>(this.apiUrl);
  }

  getByMaterialId(materialId: number): Observable<Movimiento[]> {
    return this.http.get<Movimiento[]>(`${this.apiUrl}?materialId=${materialId}`);
  }

  create(movimiento: Movimiento, comprobanteFile?: File): Observable<Movimiento> {
    if (comprobanteFile) {
      const formData = new FormData();
      formData.append('comprobante', comprobanteFile);
      formData.append('materialId', String(movimiento.materialId));
      formData.append('tipo', movimiento.tipo);
      formData.append('cantidad', String(movimiento.cantidad));
      if (movimiento.proveedor) formData.append('proveedor', movimiento.proveedor);
      if (movimiento.destino) formData.append('destino', movimiento.destino);
      if (movimiento.usuario) formData.append('usuario', movimiento.usuario);
      return this.http.post<Movimiento>(this.apiUrl, formData);
    }
    return this.http.post<Movimiento>(this.apiUrl, movimiento);
  }

  getDashboard(): Observable<DashboardData> {
    return this.http.get<DashboardData>('http://localhost:3000/dashboard');
  }

  getHistorial(periodo: 'semana' | 'mes' | 'all' = 'all'): Observable<HistorialResumen> {
    return this.http.get<HistorialResumen>(`${this.apiUrl}/resumen/historial?periodo=${periodo}`);
  }
}
