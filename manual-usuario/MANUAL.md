# Manual de Usuario
## CKJ - Sistema de Almacén

---

## 📑 Índice

1. [Introducción](#introducción)
2. [Requisitos del Sistema](#requisitos-del-sistema)
3. [Acceso al Sistema](#acceso-al-sistema)
4. [Dashboard](#dashboard)
5. [Gestión de Inventario](#gestión-de-inventario)
6. [Registrar Ingreso](#registrar-ingreso)
7. [Registrar Salida](#registrar-salida)
8. [Punto de Venta](#punto-de-venta)
9. [Historial y Reportes](#historial-y-reportes)
10. [Gestión de Usuarios](#gestión-de-usuarios)
11. [Roles y Permisos](#roles-y-permisos)
12. [Solución de Problemas](#solución-de-problemas)

---

## Introducción

**CKJ - Sistema de Almacén** es una aplicación web para la gestión completa de inventarios, diseñada para pequeñas y medianas empresas. Permite controlar entradas y salidas de materiales, generar reportes, administrar usuarios y realizar ventas.

### Tecnología
- **Frontend:** Angular (SPA moderna)
- **Backend:** Node.js + Express
- **Base de Datos:** SQLite

---

## Requisitos del Sistema

### Para el usuario (navegador web)
- Google Chrome 90+, Firefox 90+, Edge 90+ o Safari 14+
- Resolución mínima: 1024 × 768 px
- Conexión a internet o red local

### Para el administrador del sistema
- Node.js 22.x instalado
- npm (incluido con Node.js)
- Acceso al servidor donde corre la aplicación

---

## Acceso al Sistema

### Pantalla de Login

Al ingresar a la aplicación, verás la pantalla de inicio de sesión.

**Datos de acceso predefinidos:**

| Usuario | Contraseña | Rol |
|---|---|---|
| `admin` | `admin123` | Administrador |
| `almacen` | `almacen123` | Encargado de Almacén |
| `ventas` | `ventas123` | Vendedor |

**Pasos para iniciar sesión:**

1. Escribe tu **nombre de usuario** en el campo "Usuario"
2. Escribe tu **contraseña** en el campo "Contraseña"
3. Haz clic en el botón **"Ingresar"**

> ⚠️ Si olvidas tu contraseña, contacta al administrador del sistema.

---

## Dashboard

El Dashboard es la pantalla principal después de iniciar sesión. Muestra un resumen del estado del almacén.

### Indicadores principales

| Indicador | Descripción |
|---|---|
| **Materiales** | Total de materiales registrados |
| **Total en Stock** | Suma de todas las cantidades en inventario |
| **Valor Total** | Suma del valor monetario del inventario |
| **Stock Bajo** | Materiales por debajo del stock mínimo |
| **Ingresos Hoy** | Ingresos registrados el día de hoy |
| **Salidas Hoy** | Salidas registradas el día de hoy |

### Secciones del Dashboard

#### Movimientos Recientes
Muestra una tabla con los últimos 5 movimientos realizados, incluyendo:
- Material
- Tipo (Ingreso/Salida)
- Cantidad
- Fecha y hora
- Origen o destino

#### Materiales con Stock Bajo
Lista los materiales cuya cantidad actual está por debajo del stock mínimo configurado. Desde aquí puedes hacer clic en **"Ir al Inventario"** para gestionarlos.

### Navegación
El menú lateral izquierdo te permite acceder a todas las secciones del sistema:
- **Dashboard** - Resumen general
- **Inventario** - Lista de materiales
- **Ingreso** - Registrar entrada de materiales
- **Salida** - Registrar salida de materiales
- **💰 Venta** - Punto de venta
- **📈 Historial** - Reportes y movimientos
- **👤 Usuarios** - Gestión de usuarios (solo admin)

---

## Gestión de Inventario

### Lista de Materiales

La sección **Inventario** muestra todos los materiales registrados en una tabla con las siguientes columnas:

| Columna | Descripción |
|---|---|
| Nombre | Nombre del material |
| Categoría | Clasificación del material |
| Cantidad | Stock actual |
| Unidad | Unidad de medida (bolsas, unidades, galones, etc.) |
| Ubicación | Ubicación física en el almacén |
| Precio Unitario | Precio por unidad |
| Stock Mínimo | Cantidad mínima antes de alertar |
| Acciones | Botones para editar o eliminar |

### Acciones disponibles

#### 🔍 Buscar material
Usa el campo de búsqueda para filtrar materiales por nombre o categoría.

#### ➕ Agregar nuevo material
1. Haz clic en el botón **"Nuevo Material"**
2. Completa los campos del formulario:
   - **Nombre** (requerido)
   - **Descripción**
   - **Categoría**
   - **Cantidad inicial**
   - **Unidad de medida**
   - **Ubicación**
   - **Fecha de Ingreso**
   - **Proveedor**
   - **Precio Unitario**
   - **Stock Mínimo**
3. Haz clic en **"Guardar"**

#### ✏️ Editar material
1. Haz clic en el ícono de **lápiz** en la fila del material
2. Modifica los campos necesarios
3. Haz clic en **"Guardar"**

#### 🗑️ Eliminar material
1. Haz clic en el ícono de **basurero** en la fila del material
2. Confirma la eliminación (esto también eliminará los movimientos asociados)

---

## Registrar Ingreso

Esta sección permite registrar la entrada de materiales al almacén.

### Pasos para registrar un ingreso

1. Selecciona el **Material** del menú desplegable
2. Ingresa la **Cantidad** a ingresar (usa los botones +/− o escribe directamente)
3. Opcional: Ingresa el **Proveedor** que entrega el material
4. Opcional: Adjunta un **comprobante** (PDF, imagen)
5. Haz clic en **"Registrar Ingreso"**

> ✅ El sistema actualizará automáticamente el stock del material.

### Botón "Ver Inventario"
Abre una ventana emergente con la lista completa de materiales y sus stocks actuales para consulta rápida mientras registras.

---

## Registrar Salida

Esta sección permite registrar la salida de materiales del almacén.

### Pasos para registrar una salida

1. Selecciona el **Material** del menú desplegable
2. Ingresa la **Cantidad** a retirar
3. Opcional: Ingresa el **Destino** del material (ej: "Obra Edificio Central")
4. Opcional: Adjunta un **comprobante**
5. Haz clic en **"Registrar Salida"**

> ⚠️ El sistema **no permitirá** registrar una salida si la cantidad solicitada supera el stock disponible.

### Validaciones
- La cantidad debe ser mayor a 0
- No puede exceder el stock actual
- El material debe existir en el inventario

---

## Punto de Venta

El módulo de ventas permite registrar ventas a clientes y generar boletas.

### Pasos para realizar una venta

1. Ingresa el nombre del **Cliente** (obligatorio)
2. Selecciona un **Producto** del menú desplegable
3. Los productos seleccionados se agregan al **carrito**
4. Revisa el carrito con los productos, cantidades y precios
5. Haz clic en **"Finalizar Venta"**

### Características
- Cálculo automático del total
- Descuento del stock automático al finalizar
- Generación de boleta/resumen de venta

---

## Historial y Reportes

La sección de **Historial** permite consultar todos los movimientos registrados y generar reportes.

### Filtros disponibles

| Filtro | Descripción |
|---|---|
| **Período** | Esta semana, Este mes, Todo |
| **Tipo** | Ingreso, Salida, Todos |
| **Material** | Filtrar por un material específico |

### Resumen del período
La sección superior muestra un resumen estadístico:
- Total de movimientos
- Total de ingresos
- Total de salidas
- Cantidad ingresada
- Cantidad salida
- Valor total de ventas

### Exportar a PDF
1. Aplica los filtros deseados
2. Haz clic en **"Exportar PDF"**
3. El sistema generará un archivo PDF con el reporte

### Tabla de movimientos
Lista detallada de cada movimiento con:
- Material
- Tipo (con color: verde = ingreso, rojo = salida)
- Cantidad
- Fecha y hora
- Proveedor/Destino
- Usuario que registró
- Comprobante adjunto (si aplica)

---

## Gestión de Usuarios

> 🔒 Esta sección solo está disponible para usuarios con rol **Admin**.

### Lista de usuarios
Muestra todos los usuarios registrados con:
- ID
- Usuario (username)
- Nombre completo
- Rol (Admin, Almacén, Ventas)
- Estado (Activo/Inactivo)
- Acciones (Editar/Eliminar)

### Crear nuevo usuario
1. Haz clic en **"Nuevo Usuario"**
2. Completa los campos:
   - **Usuario** (nombre de inicio de sesión)
   - **Contraseña**
   - **Nombre** completo
   - **Rol** (Admin / Almacén / Ventas)
3. Haz clic en **"Guardar"**

### Editar usuario
1. Haz clic en el ícono de **lápiz**
2. Modifica los campos necesarios
3. Si no quieres cambiar la contraseña, déjala en blanco
4. Haz clic en **"Guardar"**

### Eliminar usuario
1. Haz clic en el ícono de **basurero**
2. Confirma la eliminación

> ⚠️ No puedes eliminarte a ti mismo mientras estás logueado.

---

## Roles y Permisos

| Función | Admin | Almacén | Ventas |
|---|---|---|---|
| Ver Dashboard | ✅ | ✅ | ✅ |
| Ver Inventario | ✅ | ✅ | ✅ |
| Crear/Editar Materiales | ✅ | ✅ | ❌ |
| Eliminar Materiales | ✅ | ❌ | ❌ |
| Registrar Ingreso | ✅ | ✅ | ❌ |
| Registrar Salida | ✅ | ✅ | ✅ (solo salidas) |
| Realizar Ventas | ✅ | ❌ | ✅ |
| Ver Reportes | ✅ | ✅ | ✅ |
| Gestionar Usuarios | ✅ | ❌ | ❌ |
| Ajustar Stock | ✅ | ❌ | ❌ |

---

## Solución de Problemas

### No puedo iniciar sesión
- Verifica que el usuario y contraseña sean correctos
- Confirma que tu cuenta esté activa (contacta al admin)
- Revisa que el servidor esté funcionando

### Error "Stock insuficiente"
- El material no tiene suficiente cantidad para la salida solicitada
- Revisa el stock actual en el inventario
- Registra un ingreso si es necesario

### La página no carga
- Verifica que el servidor esté corriendo
- Revisa la conexión de red
- Limpia la caché del navegador (Ctrl + Shift + Del)

### Error al adjuntar comprobante
- Formatos permitidos: PDF, JPG, PNG, GIF, WEBP
- Tamaño máximo: 5MB
- Verifica que el archivo no esté dañado

---

## Soporte Técnico

Para reportar errores o solicitar ayuda:
- Crea un issue en el repositorio de GitHub
- Contacta al administrador del sistema

---

> **CKJ - Sistema de Almacén** v1.0.0
> Documentación generada el Julio 2026
