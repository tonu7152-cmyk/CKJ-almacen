import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, tap } from 'rxjs';

export interface User {
  id: number;
  username: string;
  nombre: string;
  rol: 'admin' | 'almacen' | 'ventas';
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:3000/api';
  private tokenKey = 'ckj_token';
  private userKey = 'ckj_user';
  private userSubject = new BehaviorSubject<User | null>(this.getUser());

  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  login(username: string, password: string): Observable<{ token: string; user: User }> {
    return this.http.post<{ token: string; user: User }>(`${this.apiUrl}/login`, { username, password })
      .pipe(tap(res => {
        localStorage.setItem(this.tokenKey, res.token);
        localStorage.setItem(this.userKey, JSON.stringify(res.user));
        this.userSubject.next(res.user);
      }));
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getUser(): User | null {
    const data = localStorage.getItem(this.userKey);
    return data ? JSON.parse(data) : null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken() && !!this.getUser();
  }

  hasRole(roles: string[]): boolean {
    const user = this.getUser();
    return !!user && roles.includes(user.rol);
  }

  get rolLabel(): string {
    const user = this.getUser();
    if (!user) return '';
    const labels: Record<string, string> = {
      admin: 'Administrador',
      almacen: 'Almacén',
      ventas: 'Ventas',
    };
    return labels[user.rol] || user.rol;
  }
}
