import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MovimientoService } from '../../servicios/movimiento';
import { MaterialService } from '../../servicios/material';
import { Movimiento, HistorialResumen } from '../../modelos/movimiento';
import { Material } from '../../modelos/material';

@Component({
  selector: 'app-reportes',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatPaginatorModule,
    MatSortModule,
    MatTableModule,
    MatChipsModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatButtonToggleModule,
  ],
  templateUrl: './reportes.html',
  styleUrl: './reportes.css',
})
export class Reportes implements OnInit {
  filterForm: FormGroup;
  materiales: Material[] = [];
  allMovimientos: Movimiento[] = [];
  dataSource = new MatTableDataSource<Movimiento>([]);
  loading = false;
  periodoToggle: 'semana' | 'mes' | 'all' = 'all';

  historialData: HistorialResumen | null = null;

  displayedColumns: string[] = ['id', 'materialNombre', 'tipo', 'cantidad', 'fecha', 'origenDestino', 'comprobante', 'usuario'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private fb: FormBuilder,
    private movimientoService: MovimientoService,
    private materialService: MaterialService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {
    this.filterForm = this.fb.group({
      tipo: [''],
      materialId: [''],
      fechaDesde: [''],
      fechaHasta: [''],
    });
  }

  ngOnInit(): void {
    this.loadMateriales();
    this.loadHistorial();
  }

  loadMateriales(): void {
    this.materialService.getAll().subscribe({
      next: (materiales) => {
        this.materiales = materiales;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cdr.detectChanges();
      },
    });
  }

  loadHistorial(): void {
    this.loading = true;
    this.movimientoService.getHistorial(this.periodoToggle).subscribe({
      next: (data) => {
        this.historialData = data;
        this.allMovimientos = data.movimientos || [];
        this.applyFilters();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
        this.snackBar.open('Error al cargar historial', 'Cerrar', { duration: 3000 });
      },
    });
  }

  cambiarPeriodo(periodo: 'semana' | 'mes' | 'all'): void {
    this.periodoToggle = periodo;
    this.loadHistorial();
  }

  applyFilters(): void {
    const { tipo, materialId, fechaDesde, fechaHasta } = this.filterForm.value;

    let filtered = [...this.allMovimientos];

    if (tipo) {
      filtered = filtered.filter((m) => m.tipo === tipo);
    }

    if (materialId) {
      filtered = filtered.filter((m) => m.materialId === Number(materialId));
    }

    if (fechaDesde) {
      const desde = new Date(fechaDesde).getTime();
      filtered = filtered.filter((m) => new Date(m.fecha).getTime() >= desde);
    }

    if (fechaHasta) {
      const hasta = new Date(fechaHasta).getTime() + 86400000; // end of day
      filtered = filtered.filter((m) => new Date(m.fecha).getTime() <= hasta);
    }

    this.dataSource.data = filtered;
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.dataSource.data = this.allMovimientos;
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  get totalIngresos(): number {
    return this.dataSource.data.filter((m) => m.tipo === 'ingreso').reduce((s, m) => s + m.cantidad, 0);
  }

  get totalSalidas(): number {
    return this.dataSource.data.filter((m) => m.tipo === 'salida').reduce((s, m) => s + m.cantidad, 0);
  }

  get totalIngresosCount(): number {
    return this.dataSource.data.filter((m) => m.tipo === 'ingreso').length;
  }

  get totalSalidasCount(): number {
    return this.dataSource.data.filter((m) => m.tipo === 'salida').length;
  }

  get valorVentas(): number {
    return this.dataSource.data
      .filter((m) => m.tipo === 'salida')
      .reduce((s, m) => s + (m.cantidad * (m.precioUnitario || 0)), 0);
  }

  verComprobante(comprobante: string): void {
    if (!comprobante) return;
    window.open(`http://localhost:3000${comprobante}`, '_blank');
  }

  getPeriodoLabel(): string {
    switch (this.periodoToggle) {
      case 'semana': return 'Últimos 7 días';
      case 'mes': return 'Últimos 30 días';
      default: return 'Todo el historial';
    }
  }
}
