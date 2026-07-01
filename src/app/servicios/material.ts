import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Material } from '../modelos/material';

@Injectable({ providedIn: 'root' })
export class MaterialService {
  private apiUrl = 'http://localhost:3000/materiales';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Material[]> {
    return this.http.get<Material[]>(this.apiUrl);
  }

  getById(id: number): Observable<Material> {
    return this.http.get<Material>(`${this.apiUrl}/${id}`);
  }

  create(material: Material): Observable<Material> {
    return this.http.post<Material>(this.apiUrl, material);
  }

  update(material: Material): Observable<Material> {
    return this.http.put<Material>(`${this.apiUrl}/${material.id}`, material);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  ajustarStock(id: number, cantidad: number, motivo: string): Observable<Material> {
    return this.http.post<Material>(`${this.apiUrl}/${id}/ajustar`, { cantidad, motivo });
  }
}
