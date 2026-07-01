import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../servicios/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, RouterLink
  ],
  template: `
    <div class="login-container">
      <mat-card class="login-card">
        <mat-card-header>
          <div class="login-header">
            <img src="logo.svg" alt="CKJ" class="login-logo" />
            <h1>CKJ - Sistema de Almacén</h1>
            <p class="subtitle">Inicia sesión para continuar</p>
          </div>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Usuario</mat-label>
              <input matInput formControlName="username" placeholder="admin, almacen o ventas" autocomplete="username" />
              <mat-icon matPrefix>person</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Contraseña</mat-label>
              <input matInput [type]="showPassword ? 'text' : 'password'" formControlName="password" autocomplete="current-password" />
              <mat-icon matPrefix>lock</mat-icon>
              <button type="button" mat-icon-button matSuffix (click)="showPassword = !showPassword">
                <mat-icon>{{ showPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
            </mat-form-field>

            @if (errorMsg) {
              <div class="error-msg">
                <mat-icon color="warn">error</mat-icon>
                <span>{{ errorMsg }}</span>
              </div>
            }

            <button mat-raised-button color="primary" class="full-width" type="submit" [disabled]="form.invalid || loading">
              @if (loading) {
                <mat-spinner diameter="20"></mat-spinner>
              } @else {
                <span>Ingresar</span>
              }
            </button>
          </form>
        </mat-card-content>

        <mat-card-footer class="login-footer">
          <p>Usuarios de prueba:</p>
          <div class="users-info">
            <span><strong>admin</strong> / admin123</span>
            <span><strong>almacen</strong> / almacen123</span>
            <span><strong>ventas</strong> / ventas123</span>
          </div>
        </mat-card-footer>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 20px;
      background: radial-gradient(circle at 20% 50%, rgba(255,152,0,0.05) 0%, transparent 50%),
                  radial-gradient(circle at 80% 20%, rgba(33,150,243,0.05) 0%, transparent 50%),
                  linear-gradient(180deg, #f5f5f5 0%, #e8e8e8 100%);
    }
    .login-card { max-width: 420px; width: 100%; padding: 24px; border-radius: 16px; }
    .login-header { text-align: center; width: 100%; padding: 16px 0; }
    .login-logo { width: 64px; height: 64px; border-radius: 12px; margin-bottom: 8px; }
    .login-header h1 { margin: 0; font-size: 22px; font-weight: 500; color: #1565c0; }
    .subtitle { margin: 4px 0 0; color: rgba(0,0,0,0.5); font-size: 14px; }
    .full-width { width: 100%; margin-bottom: 16px; }
    .error-msg { display: flex; align-items: center; gap: 8px; color: #d32f2f; font-size: 14px; margin-bottom: 16px; padding: 8px 12px; background: #ffebee; border-radius: 8px; }
    .login-footer { padding: 16px 24px; background: #f5f5f5; border-radius: 0 0 16px 16px; }
    .login-footer p { margin: 0 0 8px; font-size: 12px; color: rgba(0,0,0,0.4); }
    .users-info { display: flex; gap: 12px; flex-wrap: wrap; font-size: 12px; color: rgba(0,0,0,0.6); }
    .users-info span { background: #fff; padding: 4px 10px; border-radius: 6px; border: 1px solid #e0e0e0; }
  `]
})
export class LoginComponent {
  form: FormGroup;
  loading = false;
  errorMsg = '';
  showPassword = false;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    if (this.auth.isLoggedIn()) this.router.navigate(['/dashboard']);
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.errorMsg = '';
    this.auth.login(this.form.value.username, this.form.value.password).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err.error?.error || 'Error al iniciar sesión';
      },
    });
  }
}
