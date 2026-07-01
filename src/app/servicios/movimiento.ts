import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Movimiento } from '../modelos/movimiento';

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

  create(movimiento: Movimiento): Observable<Movimiento> {
    return this.http.post<Movimiento>(this.apiUrl, movimiento);
  }
}
