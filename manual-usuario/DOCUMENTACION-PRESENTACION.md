# CKJ - Sistema de Almacén

## Documentación para Presentación

---

## 1. Descripción del Software

**CKJ** es una aplicación web moderna para la **gestión completa de inventarios y almacenes**, diseñada para pequeñas y medianas empresas. Permite controlar entradas y salidas de materiales, administrar usuarios, generar reportes y realizar ventas desde un punto de venta integrado.

### ¿Qué problema resuelve?
- Automatiza el control manual de inventarios
- Evita pérdidas por falta de stock o sobrestock
- Centraliza la información de materiales, movimientos y usuarios
- Proporciona reportes históricos para la toma de decisiones

### Tecnologías utilizadas

| Componente | Tecnología | Versión |
|---|---|---|
| **Frontend** | Angular (Standalone Components) | 22.0 |
| **Backend** | Node.js + Express | 22.x |
| **Base de Datos** | SQLite (sql.js) | — |
| **Autenticación** | JWT (JSON Web Tokens) | — |
| **UI/UX** | Angular Material | 22.0 |
| **Contenedores** | Docker | — |
| **Infraestructura** | Ansible + DevSecOps | — |

---

## 2. Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                     NAVEGADOR WEB                            │
│              (Chrome, Firefox, Edge, Safari)                 │
└──────────────────────┬──────────────────────────────────────┘
                       │  HTTP (localhost:4200)
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                FRONTEND - Angular 22                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐  │
│  │Dashboard │  │Inventario│  │ Ingreso  │  │  Salida    │  │
│  └──────────┘  └──────────┘  └──────────┘  └────────────┘  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐  │
│  │  Ventas  │  │ Reportes │  │ Usuarios │  │   Login    │  │
│  └──────────┘  └──────────┘  └──────────┘  └────────────┘  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │       AuthService + HTTP Interceptor (JWT)           │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────┘
                       │  API REST (localhost:3000)
                       ▼
┌─────────────────────────────────────────────────────────────┐
│               BACKEND - Node.js + Express                    │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐  │
│  │ Materiales│  │Movimientos│  │ Usuarios │  │   Login    │  │
│  │ CRUD API │  │CRUD API  │  │CRUD API  │  │   + JWT    │  │
│  └──────────┘  └──────────┘  └──────────┘  └────────────┘  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Middleware: Helmet, CORS, Rate Limit, AuthMiddleware │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────┘
                       │  SQLite
                       ▼
┌─────────────────────────────────────────────────────────────┐
│          BASE DE DATOS - SQLite (database.sqlite)            │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  materiales  │  │  movimientos │  │   usuarios       │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Código Fuente

### Estructura del Proyecto

```
ckj/
├── src/                            ← CÓDIGO FUENTE FRONTEND (Angular)
│   ├── index.html                  ←   Página principal
│   ├── main.ts                     ←   Punto de entrada
│   ├── styles.css                  ←   Estilos globales
│   ├── material-theme.scss         ←   Tema de Angular Material
│   └── app/
│       ├── app.ts                  ←   Componente raíz
│       ├── app.html                ←   Template raíz (toolbar + navegación)
│       ├── app.css                 ←   Estilos del componente raíz
│       ├── app.config.ts           ←   Configuración de la app
│       ├── app.routes.ts           ←   Definición de rutas
│       ├── componentes/            ←   Pantallas de la aplicación
│       │   ├── login/              ←   Pantalla de inicio de sesión
│       │   ├── dashboard/          ←   Panel principal con resumen
│       │   ├── lista-materiales/   ←   Gestión de inventario
│       │   ├── registro-ingreso/   ←   Registrar entrada de materiales
│       │   ├── registro-salida/    ←   Registrar salida de materiales
│       │   ├── ventas/             ←   Punto de venta
│       │   ├── reportes/           ←   Historial y reportes
│       │   └── usuarios/           ←   Administración de usuarios
│       ├── servicios/              ←   Servicios y lógica compartida
│       │   ├── auth.ts             ←   Servicio de autenticación
│       │   ├── auth-guard.ts       ←   Guardia de rutas (protección)
│       │   ├── auth-interceptor.ts ←   Interceptor HTTP (JWT)
│       │   ├── material.ts         ←   Servicio de materiales (API)
│       │   └── movimiento.ts       ←   Servicio de movimientos (API)
│       └── modelos/                ←   Interfaces de datos
│           ├── material.ts         ←   Modelo Material
│           └── movimiento.ts       ←   Modelo Movimiento + Dashboard
│
├── backend/                        ← CÓDIGO FUENTE BACKEND (Node.js)
│   ├── server.js                   ←   Servidor Express (API completa)
│   ├── package.json                ←   Dependencias del backend
│   ├── database.sqlite             ←   Archivo de base de datos
│   └── uploads/                    ←   Comprobantes adjuntos
│
├── angular.json                    ← Configuración de Angular CLI
├── tsconfig.json                   ← Configuración de TypeScript
├── package.json                    ← Dependencias del frontend
├── Dockerfile                      ← Contenedor Docker multi-etapa
├── sonar-project.properties        ← Configuración SonarQube
│
├── ansible/                        ← INFRAESTRUCTURA (Ansible)
│   ├── deploy.yml                  ←   Playbook de despliegue
│   ├── inventory.yml               ←   Inventario de servidores
│   ├── roles/                      ←   Roles de configuración
│   │   ├── app/                    ←   Rol: aplicación
│   │   ├── common/                 ←   Rol: configuración común
│   │   ├── nginx/                  ←   Rol: servidor web
│   │   └── security/               ←   Rol: hardening (fail2ban, UFW, SSH)
│   └── devsecops/                  ←   Escaneos de seguridad
│
└── manual-usuario/                 ← DOCUMENTACIÓN
    ├── MANUAL.md                   ←   Manual de usuario
    ├── MANUAL-DESARROLLADOR.html   ←   Manual del desarrollador
    └── DOCUMENTACION-PRESENTACION.md ←  Este documento
```

### Frontend (Angular) - Componentes Principales

| Componente | Ruta | Descripción | Accesible para |
|---|---|---|---|
| `LoginComponent` | `/login` | Inicio de sesión | Todos |
| `DashboardComponent` | `/dashboard` | Resumen del almacén | Autenticados |
| `ListaMateriales` | `/materiales` | CRUD de inventario | Autenticados |
| `RegistroIngreso` | `/ingreso` | Registrar entrada | Admin, Almacén |
| `RegistroSalida` | `/salida` | Registrar salida | Admin, Almacén, Ventas |
| `VentasComponent` | `/ventas` | Punto de venta | Admin, Ventas |
| `Reportes` | `/reportes` | Historial de movimientos | Admin |
| `UsuariosComponent` | `/usuarios` | CRUD de usuarios | Admin |

### Backend (Node.js) - API REST

| Método | Endpoint | Descripción | Auth |
|---|---|---|---|
| `POST` | `/api/login` | Iniciar sesión | No |
| `GET` | `/api/me` | Obtener usuario actual | Sí |
| `GET` | `/materiales` | Listar materiales | No |
| `GET` | `/materiales/:id` | Ver material | No |
| `POST` | `/materiales` | Crear material | Admin, Almacén |
| `PUT` | `/materiales/:id` | Actualizar material | Admin, Almacén |
| `PATCH` | `/materiales/:id` | Actualizar stock | Admin, Almacén |
| `DELETE` | `/materiales/:id` | Eliminar material | Admin |
| `GET` | `/movimientos` | Listar movimientos | No |
| `POST` | `/movimientos` | Crear movimiento | Admin, Almacén, Ventas |
| `GET` | `/movimientos/resumen/historial` | Reportes con filtros | No |
| `GET` | `/dashboard` | Datos del dashboard | No |
| `GET` | `/api/usuarios` | Listar usuarios | Admin |
| `POST` | `/api/usuarios` | Crear usuario | Admin |
| `PUT` | `/api/usuarios/:id` | Actualizar usuario | Admin |
| `DELETE` | `/api/usuarios/:id` | Eliminar usuario | Admin |
| `POST` | `/materiales/:id/ajustar` | Ajustar stock | Admin |

---

## 4. Base de Datos

**Motor:** SQLite (librería `sql.js`)
**Archivo:** `backend/database.sqlite`

### Tabla: `usuarios`

| Columna | Tipo | Descripción |
|---|---|---|
| `id` | INTEGER (PK) | Identificador único |
| `username` | TEXT (UNIQUE) | Nombre de usuario |
| `password` | TEXT | Contraseña (hash bcrypt) |
| `nombre` | TEXT | Nombre completo |
| `rol` | TEXT | `admin`, `almacen` o `ventas` |
| `activo` | INTEGER | 1 = activo, 0 = inactivo |

### Tabla: `materiales`

| Columna | Tipo | Descripción |
|---|---|---|
| `id` | INTEGER (PK) | Identificador único |
| `nombre` | TEXT | Nombre del material |
| `descripcion` | TEXT | Descripción detallada |
| `categoria` | TEXT | Categoría (Ej: Ferretería, Pinturas) |
| `cantidad` | REAL | Cantidad en stock |
| `unidad` | TEXT | Unidad de medida (bolsas, unidades, etc.) |
| `ubicacion` | TEXT | Ubicación física en almacén |
| `fechaIngreso` | TEXT | Fecha de ingreso al sistema |
| `proveedor` | TEXT | Proveedor del material |
| `precioUnitario` | REAL | Precio por unidad |
| `stockMinimo` | REAL | Stock mínimo para alertas |

### Tabla: `movimientos`

| Columna | Tipo | Descripción |
|---|---|---|
| `id` | INTEGER (PK) | Identificador único |
| `materialId` | INTEGER (FK) | ID del material |
| `tipo` | TEXT | `ingreso` o `salida` |
| `cantidad` | REAL | Cantidad del movimiento |
| `fecha` | TEXT | Fecha y hora del movimiento |
| `proveedor` | TEXT | Origen (para ingresos) |
| `destino` | TEXT | Destino (para salidas) |
| `usuario` | TEXT | Usuario que registró |
| `comprobante` | TEXT | Ruta del archivo adjunto |

### Diagrama de la Base de Datos

```
┌─────────────────┐       ┌────────────────────┐       ┌──────────────────┐
│   usuarios      │       │   movimientos      │       │   materiales     │
├─────────────────┤       ├────────────────────┤       ├──────────────────┤
│ id (PK)         │       │ id (PK)            │       │ id (PK)          │
│ username (UNQ)  │       │ materialId (FK) ───┼──────>│ nombre           │
│ password (hash) │       │ tipo (ingreso/sal) │       │ descripcion      │
│ nombre          │       │ cantidad           │       │ categoria        │
│ rol             │       │ fecha              │       │ cantidad         │
│ activo          │       │ proveedor          │       │ unidad           │
└─────────────────┘       │ destino            │       │ ubicacion        │
                          │ usuario            │       │ fechaIngreso     │
                          │ comprobante        │       │ proveedor        │
                          └────────────────────┘       │ precioUnitario   │
                                                        │ stockMinimo      │
                                                        └──────────────────┘
```

---

## 5. Interfaz Local

### Requisitos para ejecutar

| Requisito | Versión |
|---|---|
| Node.js | 22.x o superior |
| npm | 11.x (incluido con Node.js) |
| Navegador | Chrome, Firefox, Edge o Safari |

### Cómo iniciar la aplicación

```bash
# 1. Instalar dependencias (solo la primera vez)
npm install

# 2. Iniciar el BACKEND (puerto 3000)
npm run api

# 3. En OTRA terminal, iniciar el FRONTEND (puerto 4200)
npm start

# 4. Abrir en el navegador:
#    http://localhost:4200
```

### Usuarios de prueba

| Usuario | Contraseña | Rol | Permisos |
|---|---|---|---|
| `admin` | `admin123` | **Administrador** | Acceso total: CRUD materiales, movimientos, usuarios, reportes, ventas |
| `almacen` | `almacen123` | **Almacén** | Gestionar inventario, registrar ingresos y salidas |
| `ventas` | `ventas123` | **Ventas** | Registrar salidas y realizar ventas |

### Pantallas del sistema

| Pantalla | Descripción |
|---|---|
| **Login** | Inicio de sesión con validación JWT |
| **Dashboard** | Tarjetas con KPIs: total materiales, stock, valor, stock bajo, movimientos recientes |
| **Inventario** | Tabla con todos los materiales, búsqueda, filtros, botones para editar/eliminar |
| **Ingreso** | Formulario para registrar entrada de materiales con comprobante |
| **Salida** | Formulario para registrar salida de materiales |
| **Ventas** | Punto de venta con selección de productos y cálculo automático |
| **Historial** | Reportes de movimientos filtrados por período (semana/mes/todos) |
| **Usuarios** | CRUD completo de usuarios (solo admin) |

---

## 6. Seguridad DevSecOps

El proyecto incluye múltiples capas de seguridad:

| Medida | Implementación |
|---|---|
| **Autenticación JWT** | Tokens con expiración de 12 horas |
| **Helmet** | Cabeceras HTTP seguras (anti XSS, clickjacking, etc.) |
| **Rate Limiting** | 100 solicitudes/15min global, 5 intentos de login |
| **Contraseñas hasheadas** | bcrypt con 10 rondas de sal |
| **Validación de roles** | Middleware que verifica permisos por ruta |
| **Límite de subida** | Archivos máximos de 5MB, solo imágenes/PDF |
| **Fail2Ban** | Bloqueo por fuerza bruta SSH en servidor |
| **UFW** | Firewall (solo puertos 22, 80, 443) |
| **Hardening SSH** | Sin root, sin contraseñas, 3 intentos máx |

---

## 7. Manual del Desarrollador

El manual técnico completo del desarrollador está disponible en:
- **HTML:** `manual-usuario/MANUAL-DESARROLLADOR.html`
- **Contenido:** Arquitectura, setup del entorno, estructura del código, deployment, DevSecOps

El manual de usuario está disponible en:
- **Markdown:** `manual-usuario/MANUAL.md`

---

## 8. Despliegue con Docker

```bash
# Construir la imagen
docker build -t ckj:latest .

# Ejecutar el contenedor
docker run -d -p 3000:3000 --name ckj-app ckj:latest

# La API estará en: http://localhost:3000
# El frontend compilado se sirve desde el backend
```

---

## 9. Video / Demo

La aplicación se ejecuta localmente en:
- **Frontend:** `http://localhost:4200`
- **Backend API:** `http://localhost:3000`

### Flujo básico de uso:
1. Iniciar sesión como `admin` / `admin123`
2. Ver el Dashboard con indicadores generales
3. Ir a **Inventario** para ver/crear materiales
4. Registrar un **Ingreso** o **Salida** de material
5. Consultar el **Historial** de movimientos
6. (Admin) Ir a **Usuarios** para gestionar accesos

---

*Documentación generada para presentación académica - CKJ Sistema de Almacén © 2026*
