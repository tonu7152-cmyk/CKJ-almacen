import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { Material } from '../../modelos/material';

@Component({
  selector: 'app-material-dialog',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDatepickerModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data ? 'Editar Material' : 'Nuevo Material' }}</h2>

    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <div mat-dialog-content>
        <div class="dialog-grid">
          <mat-form-field appearance="outline">
            <mat-label>Nombre</mat-label>
            <input matInput formControlName="nombre" placeholder="Nombre del material" />
            @if (form.get('nombre')?.hasError('required')) {
              <mat-error>El nombre es obligatorio</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Categoría</mat-label>
            <mat-select formControlName="categoria">
              <mat-option value="Materiales de Construcción">Materiales de Construcción</mat-option>
              <mat-option value="Acero">Acero</mat-option>
              <mat-option value="Ferretería">Ferretería</mat-option>
              <mat-option value="Pinturas">Pinturas</mat-option>
              <mat-option value="Electricidad">Electricidad</mat-option>
              <mat-option value="Plomería">Plomería</mat-option>
              <mat-option value="Otros">Otros</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Descripción</mat-label>
            <textarea matInput formControlName="descripcion" rows="2" placeholder="Descripción del material"></textarea>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Cantidad</mat-label>
            <input matInput type="number" formControlName="cantidad" placeholder="0" />
            @if (form.get('cantidad')?.hasError('min')) {
              <mat-error>La cantidad no puede ser negativa</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Unidad</mat-label>
            <mat-select formControlName="unidad">
              <mat-option value="unidades">Unidades</mat-option>
              <mat-option value="bolsas">Bolsas</mat-option>
              <mat-option value="cajas">Cajas</mat-option>
              <mat-option value="galones">Galones</mat-option>
              <mat-option value="litros">Litros</mat-option>
              <mat-option value="kilos">Kilos</mat-option>
              <mat-option value="metros">Metros</mat-option>
              <mat-option value="metros2">Metros²</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Ubicación</mat-label>
            <input matInput formControlName="ubicacion" placeholder="Ej: A1-Estante 1" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Proveedor</mat-label>
            <input matInput formControlName="proveedor" placeholder="Nombre del proveedor" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Precio Unitario</mat-label>
            <input matInput type="number" formControlName="precioUnitario" placeholder="0.00" />
            <span matTextPrefix>$&nbsp;</span>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Fecha de Ingreso</mat-label>
            <input matInput [matDatepicker]="picker" formControlName="fechaIngreso" />
            <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
            <mat-datepicker #picker></mat-datepicker>
          </mat-form-field>
        </div>
      </div>

      <div mat-dialog-actions align="end">
        <button mat-button type="button" (click)="onCancel()">Cancelar</button>
        <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">
          {{ data ? 'Actualizar' : 'Crear' }}
        </button>
      </div>
    </form>
  `,
  styles: [`
    .dialog-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      min-width: 500px;
      padding-top: 8px;
    }
    .full-width {
      grid-column: 1 / -1;
    }
    @media (max-width: 600px) {
      .dialog-grid {
        grid-template-columns: 1fr;
        min-width: unset;
      }
    }
  `]
})
export class MaterialDialogComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<MaterialDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Material | null
  ) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: [''],
      categoria: [''],
      cantidad: [0, [Validators.min(0)]],
      unidad: ['unidades'],
      ubicacion: [''],
      proveedor: [''],
      precioUnitario: [0, [Validators.min(0)]],
      fechaIngreso: [new Date().toISOString().split('T')[0]],
    });

    if (data) {
      this.form.patchValue({
        ...data,
        fechaIngreso: data.fechaIngreso ? new Date(data.fechaIngreso) : new Date(),
      });
    }
  }

  onSubmit(): void {
    if (this.form.valid) {
      const value = { ...this.form.value };
      if (value.fechaIngreso instanceof Date) {
        value.fechaIngreso = value.fechaIngreso.toISOString().split('T')[0];
      }
      this.dialogRef.close(value);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
