import { Component, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MaterialService } from '../../servicios/material';
import { MovimientoService } from '../../servicios/movimiento';
import { AuthService } from '../../servicios/auth';
import { Material } from '../../modelos/material';
import { MaterialDialogComponent } from './material-dialog';
import { MovimientoRapidoDialog, MovimientoRapidoData } from './movimiento-rapido-dialog';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-lista-materiales',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatPaginatorModule,
    MatSortModule,
    MatTableModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatChipsModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './lista-materiales.html',
  styleUrl: './lista-materiales.css',
})
export class ListaMateriales implements AfterViewInit {
  displayedColumns: string[];
  dataSource = new MatTableDataSource<Material>([]);
  loading = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private materialService: MaterialService,
    private movimientoService: MovimientoService,
    public auth: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {
    const cols = ['id', 'nombre', 'categoria', 'cantidad', 'unidad', 'ubicacion', 'precioUnitario'];
    if (this.auth.hasRole(['admin', 'almacen'])) cols.push('movimientos');
    cols.push('acciones');
    this.displayedColumns = cols;
  }

  ngAfterViewInit(): void {
    this.loadMateriales();
  }

  loadMateriales(): void {
    this.loading = true;
    this.materialService.getAll().subscribe({
      next: (materiales) => {
        this.dataSource.data = materiales;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
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

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  openDialog(material?: Material): void {
    const dialogRef = this.dialog.open(MaterialDialogComponent, {
      data: material || null,
      disableClose: true,
      width: '600px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;

      if (material) {
        this.materialService.update({ ...material, ...result }).subscribe({
          next: () => {
            this.snackBar.open('Material actualizado correctamente', 'OK', { duration: 2000 });
            this.loadMateriales();
          },
          error: () => this.snackBar.open('Error al actualizar material', 'Cerrar', { duration: 3000 }),
        });
      } else {
        this.materialService.create(result).subscribe({
          next: () => {
            this.snackBar.open('Material creado correctamente', 'OK', { duration: 2000 });
            this.loadMateriales();
          },
          error: () => this.snackBar.open('Error al crear material', 'Cerrar', { duration: 3000 }),
        });
      }
    });
  }

  openMovimientoRapido(material: Material, tipo: 'ingreso' | 'salida'): void {
    const data: MovimientoRapidoData = { material, tipo };
    const dialogRef = this.dialog.open(MovimientoRapidoDialog, {
      data,
      width: '450px',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;
      this.movimientoService.create(
        {
          materialId: result.materialId,
          tipo: result.tipo,
          cantidad: result.cantidad,
          fecha: new Date().toISOString(),
          proveedor: result.proveedor || '',
          destino: result.destino || '',
          usuario: result.usuario || 'Admin',
        },
        result.file || undefined
      ).subscribe({
        next: () => {
          const msg = tipo === 'ingreso' ? '✅ Ingreso registrado' : '✅ Salida registrada';
          this.snackBar.open(msg, 'OK', { duration: 2000 });
          this.loadMateriales();
        },
        error: (err) => {
          const msg = err.error?.error || 'Error al registrar movimiento';
          this.snackBar.open(`❌ ${msg}`, 'Cerrar', { duration: 4000 });
        },
      });
    });
  }

  deleteMaterial(id: number, nombre: string): void {
    if (confirm(`¿Estás seguro de eliminar "${nombre}"?`)) {
      this.materialService.delete(id).subscribe({
        next: () => {
          this.snackBar.open('Material eliminado correctamente', 'OK', { duration: 2000 });
          this.loadMateriales();
        },
        error: () => this.snackBar.open('Error al eliminar material', 'Cerrar', { duration: 3000 }),
      });
    }
  }

  getStockColor(cantidad: number): string {
    if (cantidad <= 0) return 'warn';
    if (cantidad < 10) return 'accent';
    return 'primary';
  }

  exportPDF(): void {
    const data = this.dataSource.filteredData.length > 0 ? this.dataSource.filteredData : this.dataSource.data;
    if (data.length === 0) {
      this.snackBar.open('No hay materiales para exportar', 'Cerrar', { duration: 2000 });
      return;
    }

    const doc = new jsPDF('landscape', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(18);
    doc.setTextColor(21, 101, 192);
    doc.text('CKJ - Sistema de Almacén', pageWidth / 2, 20, { align: 'center' });
    doc.setFontSize(14);
    doc.setTextColor(60);
    doc.text('Inventario de Materiales', pageWidth / 2, 28, { align: 'center' });

    const fechaExport = new Date().toLocaleString('es-PE', { timeZone: 'America/Lima' });
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Exportado: ${fechaExport}`, pageWidth - 14, 36, { align: 'right' });

    const rows = data.map((m, i) => [
      i + 1,
      m.nombre,
      m.categoria || '—',
      m.cantidad,
      m.unidad,
      m.ubicacion || '—',
      `$${(m.precioUnitario || 0).toFixed(2)}`,
    ]);

    autoTable(doc, {
      startY: 42,
      head: [['#', 'Nombre', 'Categoría', 'Cant.', 'Unidad', 'Ubicación', 'Precio']],
      body: rows,
      theme: 'grid',
      headStyles: { fillColor: [21, 101, 192], textColor: 255, fontStyle: 'bold', fontSize: 9 },
      bodyStyles: { fontSize: 8 },
      alternateRowStyles: { fillColor: [240, 245, 255] },
      styles: { cellPadding: 2 },
    });

    doc.save(`inventario_ckj_${new Date().toISOString().split('T')[0]}.pdf`);
    this.snackBar.open('✅ PDF exportado correctamente', 'OK', { duration: 2000 });
  }
}
