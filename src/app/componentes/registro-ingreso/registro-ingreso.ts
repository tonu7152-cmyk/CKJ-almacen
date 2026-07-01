import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import { MaterialService } from '../../servicios/material';
import { MovimientoService } from '../../servicios/movimiento';
import { Material } from '../../modelos/material';

@Component({
  selector: 'app-registro-ingreso',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    RouterLink,
  ],
  templateUrl: './registro-ingreso.html',
  styleUrl: './registro-ingreso.css',
})
export class RegistroIngreso implements OnInit {
  form: FormGroup;
  materiales: Material[] = [];
  loading = false;
  submitting = false;

  constructor(
    private fb: FormBuilder,
    private materialService: MaterialService,
    private movimientoService: MovimientoService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      materialId: ['', Validators.required],
      cantidad: ['', [Validators.required, Validators.min(0.01)]],
      proveedor: [''],
      usuario: ['Admin'],
    });
  }

  ngOnInit(): void {
    this.loadMateriales();
  }

  loadMateriales(): void {
    this.loading = true;
    this.materialService.getAll().subscribe({
      next: (materiales) => {
        this.materiales = materiales;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
        this.snackBar.open('Error al cargar materiales', 'Cerrar', { duration: 3000 });
      },
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.submitting = true;
    this.movimientoService.create({
      ...this.form.value,
      tipo: 'ingreso',
      cantidad: Number(this.form.value.cantidad),
      materialId: Number(this.form.value.materialId),
    }).subscribe({
      next: () => {
        this.snackBar.open('✅ Ingreso registrado correctamente', 'OK', { duration: 3000 });
        this.form.reset({ usuario: 'Admin' });
        this.submitting = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.submitting = false;
        this.cdr.detectChanges();
        const msg = err.error?.error || 'Error al registrar ingreso';
        this.snackBar.open(`❌ ${msg}`, 'Cerrar', { duration: 5000 });
      },
    });
  }
}
