-- ============================================================
-- CKJ - Sistema de Almacén
-- Esquema de Base de Datos SQLite
-- ============================================================
-- Para usar este script:
--   1. Abre SQLite Browser (https://sqlitebrowser.org)
--      o cualquier cliente SQLite
--   2. Archivo > Nueva base de datos
--   3. Pestaña "Ejecutar SQL"
--   4. Copia y pega todo este script
--   5. Ejecutar
-- ============================================================

-- ============================================================
-- TABLA: usuarios
-- ============================================================
-- Almacena los usuarios del sistema con sus roles.
-- La contraseña se guarda como hash de bcrypt.
-- ============================================================

CREATE TABLE IF NOT EXISTS usuarios (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    username        TEXT UNIQUE NOT NULL,
    password        TEXT NOT NULL,
    nombre          TEXT NOT NULL,
    rol             TEXT NOT NULL DEFAULT 'almacen'
                    CHECK(rol IN ('admin', 'almacen', 'ventas')),
    activo          INTEGER DEFAULT 1
);

-- ============================================================
-- TABLA: materiales
-- ============================================================
-- Almacena el inventario de materiales del almacén.
-- ============================================================

CREATE TABLE IF NOT EXISTS materiales (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre          TEXT NOT NULL,
    descripcion     TEXT DEFAULT '',
    categoria       TEXT DEFAULT '',
    cantidad        REAL NOT NULL DEFAULT 0,
    unidad          TEXT DEFAULT 'unidades',
    ubicacion       TEXT DEFAULT '',
    fechaIngreso    TEXT DEFAULT (date('now')),
    proveedor       TEXT DEFAULT '',
    precioUnitario  REAL DEFAULT 0,
    stockMinimo     REAL DEFAULT 10
);

-- ============================================================
-- TABLA: movimientos
-- ============================================================
-- Registra cada ingreso o salida de materiales.
-- materialId referencia a la tabla materiales.
-- ============================================================

CREATE TABLE IF NOT EXISTS movimientos (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    materialId      INTEGER NOT NULL,
    tipo            TEXT NOT NULL CHECK(tipo IN ('ingreso', 'salida')),
    cantidad        REAL NOT NULL,
    fecha           TEXT DEFAULT (datetime('now', 'localtime')),
    proveedor       TEXT DEFAULT '',
    destino         TEXT DEFAULT '',
    usuario         TEXT DEFAULT 'Admin',
    comprobante     TEXT DEFAULT '',
    FOREIGN KEY (materialId) REFERENCES materiales(id)
);

-- ============================================================
-- DATOS INICIALES (Seed)
-- ============================================================

-- --- Usuarios por defecto ---
-- Contraseñas: admin123, almacen123, ventas123
-- (Los hashes son de bcrypt con 10 rondas)

INSERT INTO usuarios VALUES (NULL, 'admin',   '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36PQm4sEPhMNPfFhpYN76uO', 'Administrador',     'admin',   1);
INSERT INTO usuarios VALUES (NULL, 'almacen', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36PQm4sEPhMNPfFhpYN76uO', 'Encargado Almacén', 'almacen', 1);
INSERT INTO usuarios VALUES (NULL, 'ventas',  '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36PQm4sEPhMNPfFhpYN76uO', 'Vendedor',          'ventas',  1);

-- --- Materiales de ejemplo ---

INSERT INTO materiales VALUES (NULL, 'Cemento Portland',      'Cemento gris para construcción',       'Materiales de Construcción', 150, 'bolsas',   'A1-Estante 1', '2026-06-01', 'Constructora ABC',   25.50, 20);
INSERT INTO materiales VALUES (NULL, 'Varilla de Acero 3/8',  'Varilla corrugada para refuerzo',      'Acero',                      80,  'unidades', 'B2-Estante 3', '2026-06-05', 'Aceros del Norte',   45.00, 15);
INSERT INTO materiales VALUES (NULL, 'Ladrillo Rojo',         'Ladrillo de arcilla para muros',       'Materiales de Construcción', 500, 'unidades', 'A3-Patio',     '2026-06-10', 'Ladrillera Central', 1.20,  50);
INSERT INTO materiales VALUES (NULL, 'Tornillo Hexagonal 1/2','Tornillo de acero galvanizado',        'Ferretería',                 25,  'cajas',     'C1-Estante 5', '2026-06-12', 'Ferretería El Tornillo', 8.75, 10);
INSERT INTO materiales VALUES (NULL, 'Pintura Blanca Latex',  'Pintura vinílica para interiores',     'Pinturas',                   10,  'galones',   'D1-Estante 2', '2026-06-15', 'Pinturas del Valle', 55.00,  5);
INSERT INTO materiales VALUES (NULL, 'Pinturas CPP',          'galon de 3,785',                       'Pinturas',                   49,  'galones',   'b1',           '2026-07-01', '',                 38.50, 10);
INSERT INTO materiales VALUES (NULL, 'llave cuchilla',        '',                                     'Electricidad',               5,   'cajas',     'A1',           '2026-07-01', '',                  5.00, 10);

-- --- Movimientos de ejemplo ---

INSERT INTO movimientos VALUES (NULL, 1, 'ingreso', 50,  '2026-06-28T10:00:00', 'Constructora ABC',   '',                   'Admin', '');
INSERT INTO movimientos VALUES (NULL, 2, 'salida',  10,  '2026-06-29T09:00:00', '',                   'Obra Edificio Central', 'Admin', '');
INSERT INTO movimientos VALUES (NULL, 4, 'salida',  5,   '2026-06-29T14:00:00', '',                   'Mantenimiento Planta 2', 'Admin', '');
INSERT INTO movimientos VALUES (NULL, 5, 'ingreso', 10,  '2026-06-30T08:00:00', 'Pinturas del Valle', '',                   'Admin', '');

-- ============================================================
-- CONSULTAS ÚTILES
-- ============================================================

-- 1. Ver todos los usuarios
-- SELECT id, username, nombre, rol, activo FROM usuarios;

-- 2. Ver todos los materiales con stock
-- SELECT id, nombre, cantidad, unidad, stockMinimo FROM materiales;

-- 3. Materiales con stock bajo (por debajo del mínimo)
-- SELECT * FROM materiales WHERE cantidad < stockMinimo;

-- 4. Últimos 10 movimientos
-- SELECT m.id, mt.nombre AS material, m.tipo, m.cantidad, m.fecha, m.destino
-- FROM movimientos m
-- LEFT JOIN materiales mt ON mt.id = m.materialId
-- ORDER BY m.fecha DESC LIMIT 10;

-- 5. Total de ingresos vs salidas
-- SELECT tipo, SUM(cantidad) as total FROM movimientos GROUP BY tipo;

-- 6. Historial de un material específico (reemplazar ? por ID)
-- SELECT * FROM movimientos WHERE materialId = ? ORDER BY fecha DESC;

-- 7. Dashboard: resumen general
-- SELECT
--   (SELECT COUNT(*) FROM materiales) AS totalMateriales,
--   (SELECT SUM(cantidad) FROM materiales) AS totalStock,
--   (SELECT SUM(cantidad * precioUnitario) FROM materiales) AS valorTotal,
--   (SELECT COUNT(*) FROM materiales WHERE cantidad < stockMinimo) AS stockBajo;

-- 8. Valor total de ventas
-- SELECT SUM(m.cantidad * mt.precioUnitario) AS valorVentas
-- FROM movimientos m
-- LEFT JOIN materiales mt ON mt.id = m.materialId
-- WHERE m.tipo = 'salida';
