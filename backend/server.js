const express = require('express');
const cors = require('cors');
const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DB_PATH = path.join(__dirname, 'database.sqlite');

app.use(cors());
app.use(express.json());

let db;

function saveDb() {
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

function queryAll(sql, params = []) {
  const stmt = db.prepare(sql);
  if (params.length > 0) stmt.bind(params);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

function queryOne(sql, params = []) {
  const rows = queryAll(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

function runSql(sql, params = []) {
  db.run(sql, params);
  saveDb();
}

function getLastId() {
  const r = queryOne('SELECT last_insert_rowid() as id');
  return r ? r.id : null;
}

async function initDatabase() {
  const SQL = await initSqlJs();
  db = fs.existsSync(DB_PATH)
    ? new SQL.Database(fs.readFileSync(DB_PATH))
    : new SQL.Database();

  db.run(`CREATE TABLE IF NOT EXISTS materiales (
    id INTEGER PRIMARY KEY AUTOINCREMENT, nombre TEXT NOT NULL,
    descripcion TEXT DEFAULT '', categoria TEXT DEFAULT '',
    cantidad REAL NOT NULL DEFAULT 0, unidad TEXT DEFAULT 'unidades',
    ubicacion TEXT DEFAULT '', fechaIngreso TEXT DEFAULT (date('now')),
    proveedor TEXT DEFAULT '', precioUnitario REAL DEFAULT 0
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS movimientos (
    id INTEGER PRIMARY KEY AUTOINCREMENT, materialId INTEGER NOT NULL,
    tipo TEXT NOT NULL CHECK(tipo IN ('ingreso','salida')), cantidad REAL NOT NULL,
    fecha TEXT DEFAULT (datetime('now','localtime')),
    proveedor TEXT DEFAULT '', destino TEXT DEFAULT '', usuario TEXT DEFAULT 'Admin',
    FOREIGN KEY (materialId) REFERENCES materiales(id)
  )`);
  saveDb();

  if (queryOne('SELECT COUNT(*) as total FROM materiales').total === 0) seedDatabase();
}

function seedDatabase() {
  console.log('🌱 Sembrando datos iniciales...');
  const mats = [
    ['Cemento Portland','Cemento gris para construcción','Materiales de Construcción',150,'bolsas','A1-Estante 1','2026-06-01','Constructora ABC',25.50],
    ['Varilla de Acero 3/8','Varilla corrugada para refuerzo','Acero',80,'unidades','B2-Estante 3','2026-06-05','Aceros del Norte',45.00],
    ['Ladrillo Rojo','Ladrillo de arcilla para muros','Materiales de Construcción',500,'unidades','A3-Patio','2026-06-10','Ladrillera Central',1.20],
    ['Tornillo Hexagonal 1/2','Tornillo de acero galvanizado','Ferretería',25,'cajas','C1-Estante 5','2026-06-12','Ferretería El Tornillo',8.75],
    ['Pintura Blanca Latex','Pintura vinílica para interiores','Pinturas',10,'galones','D1-Estante 2','2026-06-15','Pinturas del Valle',55.00]
  ];
  for (const m of mats) db.run(`INSERT INTO materiales VALUES (NULL,?,?,?,?,?,?,?,?,?)`, m);

  const movs = [
    [1,'ingreso',50,'2026-06-28T10:00:00','Constructora ABC','','Admin'],
    [2,'salida',10,'2026-06-29T09:00:00','','Obra Edificio Central','Admin'],
    [4,'salida',5,'2026-06-29T14:00:00','','Mantenimiento Planta 2','Admin'],
    [5,'ingreso',10,'2026-06-30T08:00:00','Pinturas del Valle','','Admin']
  ];
  for (const m of movs) db.run(`INSERT INTO movimientos VALUES (NULL,?,?,?,?,?,?,?)`, m);

  saveDb();
  console.log('✅ Datos iniciales sembrados correctamente');
}

// ==================== MATERIALES ====================

app.get('/materiales', (_req, res) => res.json(queryAll('SELECT * FROM materiales ORDER BY id DESC')));

app.get('/materiales/:id', (req, res) => {
  const m = queryOne('SELECT * FROM materiales WHERE id = ?', [req.params.id]);
  if (!m) return res.status(404).json({ error: 'Material no encontrado' });
  res.json(m);
});

app.post('/materiales', (req, res) => {
  const { nombre, descripcion, categoria, cantidad, unidad, ubicacion, fechaIngreso, proveedor, precioUnitario } = req.body;
  if (!nombre) return res.status(400).json({ error: 'El nombre es obligatorio' });
  runSql(`INSERT INTO materiales VALUES (NULL,?,?,?,?,?,?,?,?,?)`, [
    nombre, descripcion||'', categoria||'', cantidad||0, unidad||'unidades',
    ubicacion||'', fechaIngreso||new Date().toISOString().split('T')[0], proveedor||'', precioUnitario||0
  ]);
  res.status(201).json(queryOne('SELECT * FROM materiales WHERE id = ?', [getLastId()]));
});

app.put('/materiales/:id', (req, res) => {
  const existing = queryOne('SELECT * FROM materiales WHERE id = ?', [req.params.id]);
  if (!existing) return res.status(404).json({ error: 'Material no encontrado' });
  const { nombre, descripcion, categoria, cantidad, unidad, ubicacion, fechaIngreso, proveedor, precioUnitario } = req.body;
  runSql(`UPDATE materiales SET nombre=?,descripcion=?,categoria=?,cantidad=?,unidad=?,ubicacion=?,fechaIngreso=?,proveedor=?,precioUnitario=? WHERE id=?`, [
    nombre??existing.nombre, descripcion??existing.descripcion, categoria??existing.categoria,
    cantidad??existing.cantidad, unidad??existing.unidad, ubicacion??existing.ubicacion,
    fechaIngreso??existing.fechaIngreso, proveedor??existing.proveedor,
    precioUnitario??existing.precioUnitario, req.params.id
  ]);
  res.json(queryOne('SELECT * FROM materiales WHERE id = ?', [req.params.id]));
});

app.patch('/materiales/:id', (req, res) => {
  if (!queryOne('SELECT * FROM materiales WHERE id = ?', [req.params.id]))
    return res.status(404).json({ error: 'Material no encontrado' });
  if (req.body.cantidad !== undefined) runSql('UPDATE materiales SET cantidad=? WHERE id=?', [req.body.cantidad, req.params.id]);
  res.json(queryOne('SELECT * FROM materiales WHERE id = ?', [req.params.id]));
});

app.delete('/materiales/:id', (req, res) => {
  if (!queryOne('SELECT * FROM materiales WHERE id = ?', [req.params.id]))
    return res.status(404).json({ error: 'Material no encontrado' });
  runSql('DELETE FROM movimientos WHERE materialId=?', [req.params.id]);
  runSql('DELETE FROM materiales WHERE id=?', [req.params.id]);
  res.status(204).send();
});

// ==================== MOVIMIENTOS ====================

app.get('/movimientos', (req, res) => {
  const { materialId } = req.query;
  let sql = `SELECT m.*, mt.nombre as materialNombre FROM movimientos m LEFT JOIN materiales mt ON mt.id=m.materialId`;
  const params = [];
  if (materialId) { sql += ` WHERE m.materialId=?`; params.push(materialId); }
  res.json(queryAll(sql + ` ORDER BY m.fecha DESC`, params));
});

app.get('/movimientos/:id', (req, res) => {
  const m = queryOne(`SELECT m.*, mt.nombre as materialNombre FROM movimientos m LEFT JOIN materiales mt ON mt.id=m.materialId WHERE m.id=?`, [req.params.id]);
  if (!m) return res.status(404).json({ error: 'Movimiento no encontrado' });
  res.json(m);
});

app.post('/movimientos', (req, res) => {
  const { materialId, tipo, cantidad, proveedor, destino, usuario } = req.body;
  if (!materialId || !tipo || !cantidad) return res.status(400).json({ error: 'materialId, tipo y cantidad son obligatorios' });
  if (!['ingreso','salida'].includes(tipo)) return res.status(400).json({ error: 'tipo debe ser ingreso o salida' });

  const material = queryOne('SELECT * FROM materiales WHERE id=?', [materialId]);
  if (!material) return res.status(404).json({ error: 'Material no encontrado' });
  if (tipo === 'salida' && material.cantidad < cantidad) return res.status(400).json({ error: 'Stock insuficiente' });

  const nuevaCantidad = tipo === 'ingreso' ? material.cantidad + cantidad : material.cantidad - cantidad;
  runSql('UPDATE materiales SET cantidad=? WHERE id=?', [nuevaCantidad, materialId]);
  runSql(`INSERT INTO movimientos VALUES (NULL,?,?,?,?,?,?,?)`, [
    materialId, tipo, cantidad, new Date().toISOString(),
    tipo === 'ingreso' ? (proveedor||'') : '', tipo === 'salida' ? (destino||'') : '', usuario||'Admin'
  ]);
  res.status(201).json(queryOne(`SELECT m.*, mt.nombre as materialNombre FROM movimientos m LEFT JOIN materiales mt ON mt.id=m.materialId WHERE m.id=?`, [getLastId()]));
});

// ==================== DASHBOARD ====================

app.get('/dashboard', (_req, res) => {
  res.json({
    totalMateriales: queryOne('SELECT COUNT(*) as t FROM materiales').t,
    totalStock: queryOne('SELECT SUM(cantidad) as t FROM materiales').t || 0,
    totalValor: queryOne('SELECT SUM(cantidad*precioUnitario) as t FROM materiales').t || 0,
    bajosStock: queryOne("SELECT COUNT(*) as t FROM materiales WHERE cantidad<10").t,
    ingresosHoy: queryOne("SELECT COUNT(*) as t FROM movimientos WHERE tipo='ingreso' AND date(fecha)=date('now')").t,
    salidasHoy: queryOne("SELECT COUNT(*) as t FROM movimientos WHERE tipo='salida' AND date(fecha)=date('now')").t,
    movimientosRecientes: queryAll(`SELECT m.*, mt.nombre as materialNombre FROM movimientos m LEFT JOIN materiales mt ON mt.id=m.materialId ORDER BY m.fecha DESC LIMIT 5`),
    materialesBajosStock: queryAll('SELECT * FROM materiales WHERE cantidad<10 ORDER BY cantidad ASC LIMIT 5')
  });
});

// Iniciar
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📦 API: /materiales`);
    console.log(`📦 API: /movimientos`);
    console.log(`📊 API: /dashboard`);
  });
});
