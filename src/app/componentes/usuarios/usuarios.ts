import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [
    CommonModule, MatButtonModule, MatCardModule, MatIconModule, MatTableModule,
    MatSnackBarModule, MatDialogModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, ReactiveFormsModule, MatProgressSpinnerModule,
  ],
  template: `
    <div class="usuarios-container">
      <div class="header">
        <div>
          <h1>Gestión de Usuarios</h1>
          <p class="subtitle">Administra los usuarios del sistema</p>
        </div>
        <button mat-raised-button color="primary" (click)="openDialog()">
          <mat-icon>person_add</mat-icon>
          Nuevo Usuario
        </button>
      </div>

      @if (loading) {
        <div class="loading-container">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else {
        <mat-card>
          <mat-card-content>
            <table mat-table [dataSource]="usuarios" class="full-width">
              <ng-container matColumnDef="id">
                <th mat-header-cell *matHeaderCellDef>#</th>
                <td mat-cell *matCellDef="let u">{{ u.id }}</td>
              </ng-container>
              <ng-container matColumnDef="username">
                <th mat-header-cell *matHeaderCellDef>Usuario</th>
                <td mat-cell *matCellDef="let u">{{ u.username }}</td>
              </ng-container>
              <ng-container matColumnDef="nombre">
                <th mat-header-cell *matHeaderCellDef>Nombre</th>
                <td mat-cell *matCellDef="let u">{{ u.nombre }}</td>
              </ng-container>
              <ng-container matColumnDef="rol">
                <th mat-header-cell *matHeaderCellDef>Rol</th>
                <td mat-cell *matCellDef="let u">
                  <span class="rol-badge" [class.admin]="u.rol==='admin'" [class.almacen]="u.rol==='almacen'" [class.ventas]="u.rol==='ventas'">
                    {{ u.rol === 'admin' ? '👑 Admin' : u.rol === 'almacen' ? '📦 Almacén' : '💰 Ventas' }}
                  </span>
                </td>
              </ng-container>
              <ng-container matColumnDef="activo">
                <th mat-header-cell *matHeaderCellDef>Estado</th>
                <td mat-cell *matCellDef="let u">
                  <span [class.activo]="u.activo" [class.inactivo]="!u.activo">
                    {{ u.activo ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
              </ng-container>
              <ng-container matColumnDef="acciones">
                <th mat-header-cell *matHeaderCellDef>Acciones</th>
                <td mat-cell *matCellDef="let u">
                  <button mat-icon-button color="primary" (click)="editarUsuario(u)" matTooltip="Editar">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" (click)="eliminarUsuario(u)" matTooltip="Eliminar">
                    <mat-icon>delete</mat-icon>
                  </button>
                </td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="columnas"></tr>
              <tr mat-row *matRowDef="let row; columns: columnas;"></tr>
            </table>
          </mat-card-content>
        </mat-card>
      }
    </div>

    <!-- Dialog -->
    @if (showDialog) {
      <div class="dialog-overlay" (click)="cerrarDialog()">
        <div class="dialog-content" (click)="$event.stopPropagation()">
          <h2>{{ editando ? 'Editar Usuario' : 'Nuevo Usuario' }}</h2>
          <form [formGroup]="form" (ngSubmit)="guardar()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Usuario</mat-label>
              <input matInput formControlName="username" placeholder="Nombre de usuario" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>{{ editando ? 'Nueva Contraseña (dejar vacío para mantener)' : 'Contraseña' }}</mat-label>
              <input matInput type="password" formControlName="password" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Nombre Completo</mat-label>
              <input matInput formControlName="nombre" placeholder="Nombre del usuario" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Rol</mat-label>
              <mat-select formControlName="rol">
                <mat-option value="admin">👑 Administrador</mat-option>
                <mat-option value="almacen">📦 Almacén</mat-option>
                <mat-option value="ventas">💰 Ventas</mat-option>
              </mat-select>
            </mat-form-field>
            @if (editando) {
              <mat-checkbox formControlName="activo">Usuario activo</mat-checkbox>
            }
            <div class="dialog-actions">
              <button mat-button type="button" (click)="cerrarDialog()">Cancelar</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">
                {{ editando ? 'Guardar Cambios' : 'Crear Usuario' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
  styles: [`
    .usuarios-container { padding: 24px; max-width: 1000px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
    .header h1 { margin: 0; font-size: 28px; font-weight: 500; }
    .subtitle { margin: 4px 0 0; color: rgba(0,0,0,0.5); font-size: 14px; }
    .loading-container { display: flex; justify-content: center; padding: 60px; }
    .full-width { width: 100%; margin-bottom: 12px; }
    .rol-badge { padding: 4px 12px; border-radius: 12px; font-size: 13px; font-weight: 500; }
    .rol-badge.admin { background: #e3f2fd; color: #1565c0; }
    .rol-badge.almacen { background: #fff3e0; color: #e65100; }
    .rol-badge.ventas { background: #e8f5e9; color: #2e7d32; }
    .activo { color: #2e7d32; font-weight: 500; }
    .inactivo { color: #c62828; font-weight: 500; }
    /* Dialog */
    .dialog-overlay { position: fixed; top:0; left:0; right:0; bottom:0; background: rgba(0,0,0,0.4); z-index:1000; display:flex; align-items:center; justify-content:center; }
    .dialog-content { background: #fff; border-radius: 16px; padding: 24px; width: 450px; max-width: 90vw; box-shadow: 0 8px 32px rgba(0,0,0,0.2); }
    .dialog-content h2 { margin: 0 0 16px; font-size: 20px; }
    .dialog-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }
  `]
})
export class UsuariosComponent implements OnInit {
  usuarios: any[] = [];
  loading = true;
  columnas = ['id', 'username', 'nombre', 'rol', 'activo', 'acciones'];
  showDialog = false;
  editando: any = null;
  form: FormGroup;

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      nombre: ['', Validators.required],
      rol: ['almacen', Validators.required],
      activo: [true],
    });
  }

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.loading = true;
    this.http.get<any[]>('http://localhost:3000/api/usuarios').subscribe({
      next: (data) => { this.usuarios = data; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.loading = false; this.snackBar.open('Error al cargar usuarios', 'OK', {duration:3000}); this.cdr.detectChanges(); },
    });
  }

  openDialog(): void {
    this.editando = null;
    this.form.reset({ username:'', password:'', nombre:'', rol:'almacen', activo:true });
    this.form.get('password')?.setValidators(Validators.required);
    this.showDialog = true;
  }

  editarUsuario(u: any): void {
    this.editando = u;
    this.form.patchValue({ username: u.username, password: '', nombre: u.nombre, rol: u.rol, activo: !!u.activo });
    this.form.get('password')?.clearValidators();
    this.form.get('password')?.updateValueAndValidity();
    this.showDialog = true;
  }

  cerrarDialog(): void { this.showDialog = false; }

  guardar(): void {
    if (this.form.invalid) return;
    const data = this.form.value;

    if (this.editando) {
      this.http.put(`http://localhost:3000/api/usuarios/${this.editando.id}`, data).subscribe({
        next: () => { this.snackBar.open('✅ Usuario actualizado', 'OK', {duration:2000}); this.cerrarDialog(); this.cargar(); },
        error: (e) => this.snackBar.open(`❌ ${e.error?.error||'Error'}`, 'Cerrar', {duration:3000}),
      });
    } else {
      this.http.post('http://localhost:3000/api/usuarios', data).subscribe({
        next: () => { this.snackBar.open('✅ Usuario creado', 'OK', {duration:2000}); this.cerrarDialog(); this.cargar(); },
        error: (e) => this.snackBar.open(`❌ ${e.error?.error||'Error'}`, 'Cerrar', {duration:3000}),
      });
    }
  }

  eliminarUsuario(u: any): void {
    if (!confirm(`¿Eliminar usuario "${u.nombre}"?`)) return;
    this.http.delete(`http://localhost:3000/api/usuarios/${u.id}`).subscribe({
      next: () => { this.snackBar.open('✅ Usuario eliminado', 'OK', {duration:2000}); this.cargar(); },
      error: (e) => this.snackBar.open(`❌ ${e.error?.error||'Error'}`, 'Cerrar', {duration:3000}),
    });
  }
}
