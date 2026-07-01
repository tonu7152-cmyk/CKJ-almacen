import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', loadComponent: () => import('./componentes/dashboard/dashboard').then(m => m.DashboardComponent) },
  { path: 'materiales', loadComponent: () => import('./componentes/lista-materiales/lista-materiales').then(m => m.ListaMateriales) },
  { path: 'ingreso', loadComponent: () => import('./componentes/registro-ingreso/registro-ingreso').then(m => m.RegistroIngreso) },
  { path: 'salida', loadComponent: () => import('./componentes/registro-salida/registro-salida').then(m => m.RegistroSalida) },
  { path: 'reportes', loadComponent: () => import('./componentes/reportes/reportes').then(m => m.Reportes) }
];