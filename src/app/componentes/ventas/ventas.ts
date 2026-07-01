import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ChangeDetectorRef } from '@angular/core';
import { MaterialService } from '../../servicios/material';
import { MovimientoService } from '../../servicios/movimiento';
import { Material } from '../../modelos/material';

interface CarritoItem {
  material: Material;
  cantidad: number;
  subtotal: number;
}

@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatButtonModule, MatCardModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatIconModule,
    MatSnackBarModule, MatTableModule, MatProgressSpinnerModule,
  ],
  templateUrl: './ventas.html',
  styleUrl: './ventas.css',
})
export class VentasComponent implements OnInit {
  materiales: Material[] = [];
  carrito: CarritoItem[] = [];
  boletaData: any = null;

  clienteCtrl = new FormControl('', Validators.required);
  productoCtrl = new FormControl<Material | null>(null);
  cantidadCtrl = new FormControl(1, [Validators.required, Validators.min(1)]);

  get productoSeleccionado(): Material | null {
    return this.productoCtrl.value;
  }

  constructor(
    private materialService: MaterialService,
    private movimientoService: MovimientoService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarMateriales();
  }

  cargarMateriales(): void {
    this.materialService.getAll().subscribe({
      next: (data) => {
        this.materiales = data.filter(m => m.cantidad > 0);
        this.cdr.detectChanges();
      },
      error: () => this.snackBar.open('Error al cargar productos', 'Cerrar', {duration:3000}),
    });
  }

  agregarAlCarrito(): void {
    const mat = this.productoSeleccionado;
    const cant = this.cantidadCtrl.value;
    if (!mat || !cant || cant < 1) return;

    const existente = this.carrito.find(i => i.material.id === mat.id);
    if (existente) {
      if (existente.cantidad + cant > mat.cantidad) {
        this.snackBar.open('Stock insuficiente. Disponible: ' + mat.cantidad, 'OK', {duration:3000});
        return;
      }
      existente.cantidad += cant;
      existente.subtotal = existente.cantidad * (mat.precioUnitario || 0);
    } else {
      this.carrito.push({
        material: mat,
        cantidad: cant,
        subtotal: cant * (mat.precioUnitario || 0),
      });
    }

    this.productoCtrl.reset();
    this.cantidadCtrl.reset(1);
    this.snackBar.open('Agregado: ' + mat.nombre, 'OK', {duration:1500});
    this.cdr.detectChanges();
  }

  quitarDelCarrito(index: number): void {
    this.carrito.splice(index, 1);
    this.cdr.detectChanges();
  }

  get totalVenta(): number {
    return this.carrito.reduce((sum, item) => sum + item.subtotal, 0);
  }

  get totalEnLetras(): string {
    return this.numeroALetras(this.totalVenta);
  }

  private numeroALetras(num: number): string {
    if (num === 0) return 'CERO DOLARES';
    const entero = Math.floor(num);
    const decimal = Math.round((num - entero) * 100);
    const unidades = ['','UN','DOS','TRES','CUATRO','CINCO','SEIS','SIETE','OCHO','NUEVE','DIEZ',
      'ONCE','DOCE','TRECE','CATORCE','QUINCE','DIECISEIS','DIECISIETE','DIECIOCHO','DIECINUEVE','VEINTE'];
    const decenas = ['','','VEINTI','TREINTA','CUARENTA','CINCUENTA','SESENTA','SETENTA','OCHENTA','NOVENTA'];
    const centenas = ['','CIENTO','DOSCIENTOS','TRESCIENTOS','CUATROCIENTOS','QUINIENTOS','SEISCIENTOS','SETECIENTOS','OCHOCIENTOS','NOVECIENTOS'];
    let letras = '';
    if (entero <= 20) letras = unidades[entero];
    else if (entero < 30) letras = 'VEINTI' + unidades[entero - 20].toLowerCase();
    else if (entero < 100) { const d = Math.floor(entero/10); const u = entero%10; letras = decenas[d] + (u>0?' Y '+unidades[u]:''); }
    else if (entero < 1000) { const c = Math.floor(entero/100); const r = entero%100; letras = centenas[c] + (r>0?' '+(r<=20?unidades[r]:''):''); }
    else letras = String(entero);
    letras += entero === 1 ? ' DOLAR' : ' DOLARES';
    if (decimal > 0) letras += ' CON ' + decimal + '/100';
    return letras;
  }

  generarBoleta(): void {
    if (this.carrito.length === 0 || !this.clienteCtrl.value) return;

    let completados = 0;
    for (const item of this.carrito) {
      this.movimientoService.create({
        materialId: item.material.id!,
        tipo: 'salida',
        cantidad: item.cantidad,
        destino: this.clienteCtrl.value,
        usuario: 'Ventas',
        fecha: new Date().toISOString(),
        proveedor: '',
      }).subscribe({
        next: () => {
          completados++;
          if (completados === this.carrito.length) {
            this.mostrarBoleta();
          }
        },
        error: (err) => {
          this.snackBar.open('Error: ' + (err.error?.error || 'Error'), 'Cerrar', {duration:4000});
        },
      });
    }
  }

  mostrarBoleta(): void {
    const now = new Date();
    const fecha = now.toLocaleDateString('es-PE') + ' ' + now.toLocaleTimeString('es-PE');
    const items = [...this.carrito];
    const total = this.totalVenta;
    const num = 'B001-' + now.getFullYear()
      + String(now.getMonth() + 1).padStart(2, '0')
      + String(now.getDate()).padStart(2, '0')
      + '-' + String(now.getHours()).padStart(2, '0') + String(now.getMinutes()).padStart(2, '0');

    this.boletaData = {
      numero: num,
      fecha: fecha,
      cliente: this.clienteCtrl.value,
      items: items,
      total: total,
      totalEnLetras: this.numeroALetras(total),
    };
    this.carrito = [];
    this.clienteCtrl.reset();
    this.cdr.detectChanges();
    this.snackBar.open('Venta registrada correctamente', 'OK', {duration:3000});
  }

  cerrarBoleta(): void {
    this.boletaData = null;
    this.cdr.detectChanges();
  }

  imprimirBoleta(): void {
    window.print();
  }

  descargarPDF(): void {
    import('jspdf').then(({ jsPDF }) => {
      import('jspdf-autotable').then((mod: any) => {
        const autoTable = mod.default || mod;
        const doc = new jsPDF();
        const data = this.boletaData;
        if (!data) return;

        doc.setFontSize(16);
        doc.setTextColor(21, 101, 192);
        doc.text('CKJ - Sistema de Almacén', 105, 20, { align: 'center' as any });

        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text('RUC: 20600000001 | Av. Industrial 123 - Lima | Tel: (01) 555-0001', 105, 26, { align: 'center' as any });

        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text('BOLETA DE VENTA', 105, 34, { align: 'center' as any });

        doc.setFontSize(9);
        doc.text('Nro: ' + data.numero, 14, 42);
        doc.text('Fecha: ' + data.fecha, 14, 48);
        doc.text('Cliente: ' + data.cliente, 14, 54);

        const rows = data.items.map((item: any, i: number) => [
          String(i + 1),
          item.material.nombre,
          String(item.cantidad),
          '$' + (item.material.precioUnitario || 0).toFixed(2),
          '$' + item.subtotal.toFixed(2),
        ]);

        autoTable(doc, {
          startY: 60,
          head: [['#', 'Producto', 'Cant', 'P.Unit', 'Total']],
          body: rows,
          theme: 'grid' as any,
          headStyles: { fillColor: [21, 101, 192], textColor: 255, fontStyle: 'bold', fontSize: 8 },
          bodyStyles: { fontSize: 8 },
          styles: { cellPadding: 2 },
        });

        const finalY = (doc as any).lastAutoTable?.finalY || 80;

        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Total: $' + data.total.toFixed(2), 195, finalY + 10, { align: 'right' as any });

        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text('Son: ' + data.totalEnLetras, 14, finalY + 10);

        doc.setFontSize(7);
        doc.setTextColor(150);
        doc.text('Gracias por su compra! - Generado por CKJ', 105, finalY + 25, { align: 'center' as any });

        doc.save('boleta_' + data.numero.replace(/[^a-zA-Z0-9]/g, '_') + '.pdf');
      });
    });
  }

  formatearPrecio(precio: number | undefined): number {
    return precio || 0;
  }
}
