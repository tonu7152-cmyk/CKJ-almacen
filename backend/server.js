const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || (() => {
  console.warn('⚠️  ADVERTENCIA: Usando JWT_SECRET por defecto. Configura JWT_SECRET como variable de entorno en producción.');
  return 'ckj-almacen-secret-2026';
})();
const DB_PATH = path.join(__dirname, 'database.sqlite');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

// Crear carpeta uploads si no existe
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// Configurar multer para comprobantes
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `comprobante_${Date.now()}_${Math.random().toString(36).slice(2,8)}${ext}`;
    cb(null, name);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Solo PDF, JPG, PNG, GIF, WEBP'));
  }
});

app.use(helmet());
app.use(cors());

// ── Rate limiting global ──
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite por IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas solicitudes. Intenta de nuevo en 15 minutos.' }
});
app.use('/api/', limiter);

app.use(express.json({ limit: '1mb' })); // Límite de tamaño para evitar DoS
app.use('/uploads', express.static(UPLOADS_DIR));

// Servir frontend compilado (Angular dist)
const DIST_DIR = path.join(__dirname, '..', 'dist', 'ckj', 'browser');
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });
}

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
    proveedor TEXT DEFAULT '', precioUnitario REAL DEFAULT 0,
    stockMinimo REAL DEFAULT 10
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS movimientos (
    id INTEGER PRIMARY KEY AUTOINCREMENT, materialId INTEGER NOT NULL,
    tipo TEXT NOT NULL CHECK(tipo IN ('ingreso','salida')), cantidad REAL NOT NULL,
    fecha TEXT DEFAULT (datetime('now','localtime')),
    proveedor TEXT DEFAULT '', destino TEXT DEFAULT '', usuario TEXT DEFAULT 'Admin',
    comprobante TEXT DEFAULT '',
    FOREIGN KEY (materialId) REFERENCES materiales(id)
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL, nombre TEXT NOT NULL, rol TEXT NOT NULL DEFAULT 'almacen',
    activo INTEGER DEFAULT 1
  )`);
  saveDb();

  // Agregar columnas si no existen (para BD ya creadas)
  try { db.run(`ALTER TABLE movimientos ADD COLUMN comprobante TEXT DEFAULT ''`); saveDb(); } catch(e) {}
  try { db.run(`ALTER TABLE materiales ADD COLUMN stockMinimo REAL DEFAULT 10`); saveDb(); } catch(e) {}

  if (queryOne('SELECT COUNT(*) as total FROM usuarios').total === 0) seedUsuarios();
  if (queryOne('SELECT COUNT(*) as total FROM materiales').total === 0) seedDatabase();
}

function seedUsuarios() {
  console.log('👤 Creando usuarios por defecto...');
  const users = [
    ['admin', bcrypt.hashSync('admin123', 10), 'Administrador', 'admin'],
    ['almacen', bcrypt.hashSync('almacen123', 10), 'Encargado Almacén', 'almacen'],
    ['ventas', bcrypt.hashSync('ventas123', 10), 'Vendedor', 'ventas'],
  ];
  for (const u of users) db.run('INSERT INTO usuarios VALUES (NULL,?,?,?,?,1)', u);
  saveDb();
  console.log('✅ Usuarios creados: admin/almacen/ventas');
}

function seedDatabase() {
  console.log('🌱 Sembrando datos iniciales...');
  const mats = [
    ['Cemento Portland','Cemento gris para construcción','Materiales de Construcción',150,'bolsas','A1-Estante 1','2026-06-01','Constructora ABC',25.50,20],
    ['Varilla de Acero 3/8','Varilla corrugada para refuerzo','Acero',80,'unidades','B2-Estante 3','2026-06-05','Aceros del Norte',45.00,15],
    ['Ladrillo Rojo','Ladrillo de arcilla para muros','Materiales de Construcción',500,'unidades','A3-Patio','2026-06-10','Ladrillera Central',1.20,50],
    ['Tornillo Hexagonal 1/2','Tornillo de acero galvanizado','Ferretería',25,'cajas','C1-Estante 5','2026-06-12','Ferretería El Tornillo',8.75,10],
    ['Pintura Blanca Latex','Pintura vinílica para interiores','Pinturas',10,'galones','D1-Estante 2','2026-06-15','Pinturas del Valle',55.00,5],
    ['Pinturas CPP','galon de 3,785','Pinturas',49,'galones','b1','2026-07-01','',38.50,10],
    ['llave cuchilla','','Electricidad',5,'cajas','A1','2026-07-01','',5.00,10]
  ];
  for (const m of mats) db.run(`INSERT INTO materiales VALUES (NULL,?,?,?,?,?,?,?,?,?,?)`, m);

  const movs = [
    [1,'ingreso',50,'2026-06-28T10:00:00','Constructora ABC','','Admin',''],
    [2,'salida',10,'2026-06-29T09:00:00','','Obra Edificio Central','Admin',''],
    [4,'salida',5,'2026-06-29T14:00:00','','Mantenimiento Planta 2','Admin',''],
    [5,'ingreso',10,'2026-06-30T08:00:00','Pinturas del Valle','','Admin','']
  ];
  for (const m of movs) db.run(`INSERT INTO movimientos VALUES (NULL,?,?,?,?,?,?,?,?)`, m);

  saveDb();
  console.log('✅ Datos iniciales sembrados correctamente');
}

// ==================== AUTENTICACIÓN ====================

function authMiddleware(rolesPermitidos = []) {
  return (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token requerido' });

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = queryOne('SELECT id, username, nombre, rol FROM usuarios WHERE id=? AND activo=1', [decoded.id]);
      if (!user) return res.status(401).json({ error: 'Usuario no válido' });
      if (rolesPermitidos.length > 0 && !rolesPermitidos.includes(user.rol))
        return res.status(403).json({ error: 'No tienes permisos para esta acción' });
      req.user = user;
      next();
    } catch {
      return res.status(401).json({ error: 'Token inválido' });
    }
  };
}

// ── Rate limit más estricto para login ──
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // solo 5 intentos por IP cada 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos. Intenta de nuevo en 15 minutos.' }
});

app.post('/api/login', loginLimiter, (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
  if (typeof username !== 'string' || typeof password !== 'string')
    return res.status(400).json({ error: 'Datos inválidos' });

  const user = queryOne('SELECT * FROM usuarios WHERE username=? AND activo=1', [username]);
  if (!user || !bcrypt.compareSync(password, user.password))
    return res.status(401).json({ error: 'Credenciales inválidas' });

  const token = jwt.sign({ id: user.id, username: user.username, rol: user.rol }, JWT_SECRET, { expiresIn: '12h' });
  res.json({ token, user: { id: user.id, username: user.username, nombre: user.nombre, rol: user.rol } });
});

app.get('/api/me', authMiddleware(), (req, res) => res.json(req.user));

// ==================== MATERIALES ====================

app.get('/materiales', (_req, res) => res.json(queryAll('SELECT * FROM materiales ORDER BY id DESC')));

app.get('/materiales/:id', (req, res) => {
  const m = queryOne('SELECT * FROM materiales WHERE id = ?', [req.params.id]);
  if (!m) return res.status(404).json({ error: 'Material no encontrado' });
  res.json(m);
});

app.post('/materiales', authMiddleware(['admin','almacen']), (req, res) => {
  const { nombre, descripcion, categoria, cantidad, unidad, ubicacion, fechaIngreso, proveedor, precioUnitario, stockMinimo } = req.body;
  if (!nombre) return res.status(400).json({ error: 'El nombre es obligatorio' });
  runSql(`INSERT INTO materiales VALUES (NULL,?,?,?,?,?,?,?,?,?,?)`, [
    nombre, descripcion||'', categoria||'', cantidad||0, unidad||'unidades',
    ubicacion||'', fechaIngreso||new Date().toISOString().split('T')[0], proveedor||'', precioUnitario||0,
    stockMinimo ?? 10
  ]);
  res.status(201).json(queryOne('SELECT * FROM materiales WHERE id = ?', [getLastId()]));
});

app.put('/materiales/:id', authMiddleware(['admin','almacen']), (req, res) => {
  const existing = queryOne('SELECT * FROM materiales WHERE id = ?', [req.params.id]);
  if (!existing) return res.status(404).json({ error: 'Material no encontrado' });
  const { nombre, descripcion, categoria, cantidad, unidad, ubicacion, fechaIngreso, proveedor, precioUnitario, stockMinimo } = req.body;
  runSql(`UPDATE materiales SET nombre=?,descripcion=?,categoria=?,cantidad=?,unidad=?,ubicacion=?,fechaIngreso=?,proveedor=?,precioUnitario=?,stockMinimo=? WHERE id=?`, [
    nombre??existing.nombre, descripcion??existing.descripcion, categoria??existing.categoria,
    cantidad??existing.cantidad, unidad??existing.unidad, ubicacion??existing.ubicacion,
    fechaIngreso??existing.fechaIngreso, proveedor??existing.proveedor,
    precioUnitario??existing.precioUnitario, stockMinimo??existing.stockMinimo??10, req.params.id
  ]);
  res.json(queryOne('SELECT * FROM materiales WHERE id = ?', [req.params.id]));
});

app.patch('/materiales/:id', authMiddleware(['admin','almacen']), (req, res) => {
  if (!queryOne('SELECT * FROM materiales WHERE id = ?', [req.params.id]))
    return res.status(404).json({ error: 'Material no encontrado' });
  if (req.body.cantidad !== undefined) runSql('UPDATE materiales SET cantidad=? WHERE id=?', [req.body.cantidad, req.params.id]);
  res.json(queryOne('SELECT * FROM materiales WHERE id = ?', [req.params.id]));
});

// Ajustar stock directamente (solo admin)
app.post('/materiales/:id/ajustar', authMiddleware(['admin']), (req, res) => {
  const { cantidad, motivo } = req.body;
  if (cantidad === undefined || cantidad < 0) return res.status(400).json({ error: 'Cantidad válida requerida' });
  const material = queryOne('SELECT * FROM materiales WHERE id = ?', [req.params.id]);
  if (!material) return res.status(404).json({ error: 'Material no encontrado' });

  const diferencia = cantidad - material.cantidad;
  runSql('UPDATE materiales SET cantidad=? WHERE id=?', [cantidad, req.params.id]);
  runSql(`INSERT INTO movimientos VALUES (NULL,?,?,?,?,?,?,?,?)`, [
    req.params.id, diferencia > 0 ? 'ingreso' : 'salida', Math.abs(diferencia),
    new Date().toISOString(), `Ajuste: ${motivo||'Corrección de inventario'}`, '', req.user.nombre, ''
  ]);
  res.json(queryOne('SELECT * FROM materiales WHERE id = ?', [req.params.id]));
});

app.delete('/materiales/:id', authMiddleware(['admin']), (req, res) => {
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

app.post('/movimientos', authMiddleware(['admin','almacen','ventas']), upload.single('comprobante'), (req, res) => {
  const { materialId, tipo, cantidad, proveedor, destino, usuario } = req.body;
  if (!materialId || !tipo || !cantidad) return res.status(400).json({ error: 'materialId, tipo y cantidad son obligatorios' });
  if (!['ingreso','salida'].includes(tipo)) return res.status(400).json({ error: 'tipo debe ser ingreso o salida' });

  // Ventas solo puede registrar salidas
  if (req.user.rol === 'ventas' && tipo !== 'salida')
    return res.status(403).json({ error: 'Ventas solo puede registrar salidas' });

  const material = queryOne('SELECT * FROM materiales WHERE id=?', [materialId]);
  if (!material) return res.status(404).json({ error: 'Material no encontrado' });
  if (tipo === 'salida' && material.cantidad < cantidad) return res.status(400).json({ error: 'Stock insuficiente' });

  const comprobante = req.file ? `/uploads/${req.file.filename}` : '';

  const nuevaCantidad = tipo === 'ingreso' ? material.cantidad + Number(cantidad) : material.cantidad - Number(cantidad);
  runSql('UPDATE materiales SET cantidad=? WHERE id=?', [nuevaCantidad, materialId]);
  runSql(`INSERT INTO movimientos VALUES (NULL,?,?,?,?,?,?,?,?)`, [
    materialId, tipo, Number(cantidad), new Date().toISOString(),
    tipo === 'ingreso' ? (proveedor||'') : '', tipo === 'salida' ? (destino||'') : '', usuario||req.user.nombre,
    comprobante
  ]);
  res.status(201).json(queryOne(`SELECT m.*, mt.nombre as materialNombre FROM movimientos m LEFT JOIN materiales mt ON mt.id=m.materialId WHERE m.id=?`, [getLastId()]));
});

// ==================== HISTORIAL / RESUMEN ====================

app.get('/movimientos/resumen/historial', (req, res) => {
  const { periodo } = req.query; // 'semana' | 'mes' | 'all'

  let dateFilter = '';
  if (periodo === 'semana') {
    dateFilter = "WHERE fecha >= datetime('now', '-7 days')";
  } else if (periodo === 'mes') {
    dateFilter = "WHERE fecha >= datetime('now', '-30 days')";
  }

  const movimientos = queryAll(`
    SELECT m.*, mt.nombre as materialNombre, mt.precioUnitario
    FROM movimientos m
    LEFT JOIN materiales mt ON mt.id=m.materialId
    ${dateFilter}
    ORDER BY m.fecha DESC
  `);

  const totalIngresos = movimientos.filter(m => m.tipo === 'ingreso').length;
  const totalSalidas = movimientos.filter(m => m.tipo === 'salida').length;
  const cantIngresada = movimientos.filter(m => m.tipo === 'ingreso').reduce((s, m) => s + m.cantidad, 0);
  const cantSalida = movimientos.filter(m => m.tipo === 'salida').reduce((s, m) => s + m.cantidad, 0);
  const valorVentas = movimientos
    .filter(m => m.tipo === 'salida')
    .reduce((s, m) => s + (m.cantidad * (m.precioUnitario || 0)), 0);

  res.json({
    periodo: periodo || 'all',
    movimientos,
    resumen: {
      totalMovimientos: movimientos.length,
      totalIngresos,
      totalSalidas,
      cantIngresada,
      cantSalida,
      valorVentas
    }
  });
});

// ==================== USUARIOS (solo admin) ====================

app.get('/api/usuarios', authMiddleware(['admin']), (_req, res) => {
  res.json(queryAll('SELECT id, username, nombre, rol, activo FROM usuarios ORDER BY id'));
});

app.post('/api/usuarios', authMiddleware(['admin']), (req, res) => {
  const { username, password, nombre, rol } = req.body;
  if (!username || !password || !nombre || !rol) return res.status(400).json({ error: 'Todos los campos son requeridos' });
  if (!['admin','almacen','ventas'].includes(rol)) return res.status(400).json({ error: 'Rol inválido' });
  try {
    const hashed = bcrypt.hashSync(password, 10);
    runSql('INSERT INTO usuarios VALUES (NULL,?,?,?,?,1)', [username, hashed, nombre, rol]);
    res.status(201).json({ id: getLastId(), username, nombre, rol, activo: 1 });
  } catch { res.status(400).json({ error: 'El usuario ya existe' }); }
});

app.put('/api/usuarios/:id', authMiddleware(['admin']), (req, res) => {
  const user = queryOne('SELECT * FROM usuarios WHERE id=?', [req.params.id]);
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
  const { username, password, nombre, rol, activo } = req.body;
  let sql = 'UPDATE usuarios SET username=?, nombre=?, rol=?, activo=? WHERE id=?';
  let params = [username||user.username, nombre||user.nombre, rol||user.rol, activo??user.activo, req.params.id];
  if (password) { sql = 'UPDATE usuarios SET username=?, password=?, nombre=?, rol=?, activo=? WHERE id=?'; params = [username||user.username, bcrypt.hashSync(password,10), nombre||user.nombre, rol||user.rol, activo??user.activo, req.params.id]; }
  runSql(sql, params);
  res.json({ id: Number(req.params.id), username: params[0], nombre: params[2], rol: params[3], activo: params[4] });
});

app.delete('/api/usuarios/:id', authMiddleware(['admin']), (req, res) => {
  const user = queryOne('SELECT * FROM usuarios WHERE id=?', [req.params.id]);
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
  if (Number(req.params.id) === req.user.id) return res.status(400).json({ error: 'No puedes eliminarte a ti mismo' });
  runSql('DELETE FROM usuarios WHERE id=?', [req.params.id]);
  res.status(204).send();
});

// ==================== DASHBOARD ====================

app.get('/dashboard', (_req, res) => {
  res.json({
    totalMateriales: queryOne('SELECT COUNT(*) as t FROM materiales').t,
    totalStock: queryOne('SELECT SUM(cantidad) as t FROM materiales').t || 0,
    totalValor: queryOne('SELECT SUM(cantidad*precioUnitario) as t FROM materiales').t || 0,
    bajosStock: queryOne("SELECT COUNT(*) as t FROM materiales WHERE cantidad < stockMinimo").t,
    ingresosHoy: queryOne("SELECT COUNT(*) as t FROM movimientos WHERE tipo='ingreso' AND date(fecha)=date('now')").t,
    salidasHoy: queryOne("SELECT COUNT(*) as t FROM movimientos WHERE tipo='salida' AND date(fecha)=date('now')").t,
    movimientosRecientes: queryAll(`SELECT m.*, mt.nombre as materialNombre FROM movimientos m LEFT JOIN materiales mt ON mt.id=m.materialId ORDER BY m.fecha DESC LIMIT 5`),
    materialesBajosStock: queryAll('SELECT * FROM materiales WHERE cantidad < stockMinimo ORDER BY cantidad ASC LIMIT 5')
  });
});

// Iniciar
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📦 API: /materiales`);
    console.log(`📦 API: /movimientos`);
    console.log(`� API: /api/usuarios`);
    console.log(`�📊 API: /dashboard`);
    console.log(`📈 API: /movimientos/resumen/historial`);
    console.log(`📎 API: /uploads (comprobantes)`);
  });
});
