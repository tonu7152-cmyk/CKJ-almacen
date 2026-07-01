import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { Material } from '../../modelos/material';

export interface MovimientoRapidoData {
  material: Material;
  tipo: 'ingreso' | 'salida';
}

@Component({
  selector: 'app-movimiento-rapido-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSnackBarModule,
  ],
  template: `
    <h2 mat-dialog-title>
      {{ data.tipo === 'ingreso' ? '📥 Ingreso' : '📤 Salida' }} Rápido
    </h2>

    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <div mat-dialog-content>
        <p>
          <strong>{{ data.material.nombre }}</strong>
          <br />
          <span class="stock-actual">
            Stock actual: {{ data.material.cantidad }} {{ data.material.unidad }}
          </span>
        </p>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Cantidad</mat-label>
          <input
            matInput
            type="number"
            formControlName="cantidad"
            placeholder="0"
            [min]="data.tipo === 'salida' ? 1 : 0.01"
            [max]="getMaxCantidad()"
          />
          @if (form.get('cantidad')?.hasError('required')) {
            <mat-error>La cantidad es obligatoria</mat-error>
          }
          @if (form.get('cantidad')?.hasError('max')) {
            <mat-error>Stock insuficiente ({{ data.material.cantidad }} {{ data.material.unidad }})</mat-error>
          }
          @if (form.get('cantidad')?.hasError('min')) {
            <mat-error>Debe ser mayor a 0</mat-error>
          }
        </mat-form-field>

        @if (data.tipo === 'ingreso') {
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Proveedor</mat-label>
            <input matInput formControlName="proveedor" placeholder="Nombre del proveedor (opcional)" />
          </mat-form-field>
        }

        @if (data.tipo === 'salida') {
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Destino</mat-label>
            <input matInput formControlName="destino" placeholder="Ej: Obra Edificio Central (opcional)" />
          </mat-form-field>
        }

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Comprobante (opcional)</mat-label>
          <input
            matInput
            [value]="selectedFileName"
            placeholder="Seleccionar archivo..."
            readonly
          />
          <button
            type="button"
            mat-icon-button
            matIconSuffix
            (click)="fileInput.click()"
          >
            <mat-icon>attach_file</mat-icon>
          </button>
          @if (selectedFile) {
            <button
              type="button"
              mat-icon-button
              matIconSuffix
              (click)="removeFile()"
            >
              <mat-icon>close</mat-icon>
            </button>
          }
          <input
            #fileInput
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
            style="display:none"
            (change)="onFileSelected($event)"
          />
          <mat-hint>PDF, JPG, PNG, GIF, WEBP (máx 5MB)</mat-hint>
        </mat-form-field>
      </div>

      <div mat-dialog-actions align="end">
        <button mat-button type="button" (click)="dialogRef.close()">Cancelar</button>
        <button
          mat-raised-button
          [color]="data.tipo === 'ingreso' ? 'primary' : 'warn'"
          type="submit"
          [disabled]="form.invalid || submitting"
        >
          @if (submitting) {
            <span>Registrando...</span>
          } @else {
            <span>{{ data.tipo === 'ingreso' ? 'Registrar Ingreso' : 'Registrar Salida' }}</span>
          }
        </button>
      </div>
    </form>
  `,
  styles: [
    `
    .full-width { width: 100%; margin-bottom: 12px; }
    .stock-actual { color: #666; font-size: 14px; }
    p { margin-bottom: 16px; }
  `,
  ],
})
export class MovimientoRapidoDialog {
  form: FormGroup;
  selectedFile: File | null = null;
  selectedFileName = '';
  submitting = false;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<MovimientoRapidoDialog>,
    @Inject(MAT_DIALOG_DATA) public data: MovimientoRapidoData
  ) {
    const validators: any[] = [Validators.required, Validators.min(0.01)];
    if (data.tipo === 'salida') {
      validators.push(Validators.max(data.material.cantidad));
    }
    this.form = this.fb.group({
      cantidad: ['', validators],
      proveedor: [''],
      destino: [''],
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.selectedFileName = input.files[0].name;
    }
  }

  removeFile(): void {
    this.selectedFile = null;
    this.selectedFileName = '';
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.submitting = true;

    const result = {
      materialId: this.data.material.id,
      tipo: this.data.tipo,
      cantidad: Number(this.form.value.cantidad),
      proveedor: this.form.value.proveedor || '',
      destino: this.form.value.destino || '',
      usuario: 'Admin',
      file: this.selectedFile,
    };

    this.dialogRef.close(result);
  }

  getMaxCantidad(): number | null {
    if (this.data.tipo === 'salida') {
      return this.data.material.cantidad ?? 0;
    }
    return null;
  }
}
