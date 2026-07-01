import { Routes } from '@angular/router';
import { AuthGuard } from './servicios/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./componentes/login/login').then(m => m.LoginComponent) },
  {
    path: 'dashboard',
    loadComponent: () => import('./componentes/dashboard/dashboard').then(m => m.DashboardComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'materiales',
    loadComponent: () => import('./componentes/lista-materiales/lista-materiales').then(m => m.ListaMateriales),
    canActivate: [AuthGuard]
  },
  {
    path: 'ingreso',
    loadComponent: () => import('./componentes/registro-ingreso/registro-ingreso').then(m => m.RegistroIngreso),
    canActivate: [AuthGuard],
    data: { roles: ['admin', 'almacen'] }
  },
  {
    path: 'salida',
    loadComponent: () => import('./componentes/registro-salida/registro-salida').then(m => m.RegistroSalida),
    canActivate: [AuthGuard],
    data: { roles: ['admin', 'almacen', 'ventas'] }
  },
  {
    path: 'reportes',
    loadComponent: () => import('./componentes/reportes/reportes').then(m => m.Reportes),
    canActivate: [AuthGuard],
    data: { roles: ['admin'] }
  }
];