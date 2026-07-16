-- ============================================================
-- CKJ - Sistema de Almacén
-- 50 Productos para la tabla materiales
-- ============================================================
-- Ejecutar en DB Browser for SQLite:
--   1. Archivo > Abrir base de datos > backend/database.sqlite
--   2. Pestaña "Ejecutar SQL"
--   3. Copiar y pegar
--   4. Ejecutar
-- ============================================================

-- Primero, eliminar los datos existentes para evitar duplicados
DELETE FROM movimientos;
DELETE FROM materiales;

-- Reiniciar el contador autoincrement
DELETE FROM sqlite_sequence WHERE name='materiales';

-- ============================================================
-- 50 MATERIALES
-- ============================================================

INSERT INTO materiales VALUES (NULL,'Cemento Portland Tipo I','Cemento gris para construcción uso general','Materiales de Construcción',200,'bolsas','A1-Estante 1','2026-01-15','Constructora ABC',25.50,30);
INSERT INTO materiales VALUES (NULL,'Cemento Portland Tipo V','Cemento resistente a sulfatos','Materiales de Construcción',80,'bolsas','A1-Estante 2','2026-02-10','Cementos del Perú',28.90,20);
INSERT INTO materiales VALUES (NULL,'Varilla de Acero 3/8','Varilla corrugada 3/8 para refuerzo estructural','Acero',200,'unidades','B2-Estante 1','2026-01-20','Aceros del Norte',18.50,40);
INSERT INTO materiales VALUES (NULL,'Varilla de Acero 1/2','Varilla corrugada 1/2 para columnas y vigas','Acero',150,'unidades','B2-Estante 2','2026-01-20','Aceros del Norte',32.00,30);
INSERT INTO materiales VALUES (NULL,'Varilla de Acero 5/8','Varilla corrugada 5/8 para losas','Acero',100,'unidades','B2-Estante 3','2026-02-05','Aceros del Norte',48.00,20);
INSERT INTO materiales VALUES (NULL,'Ladrillo KK 18 huecos','Ladrillo de arcilla 18 huecos para muros','Materiales de Construcción',1500,'unidades','A3-Patio','2026-01-10','Ladrillera Central',1.50,200);
INSERT INTO materiales VALUES (NULL,'Ladrillo Pandereta','Ladrillo hueco de arcilla para tabiques','Materiales de Construcción',2000,'unidades','A3-Patio','2026-01-10','Ladrillera Central',1.20,300);
INSERT INTO materiales VALUES (NULL,'Ladrillo King Kong','Ladrillo de arcilla macizo para estructuras','Materiales de Construcción',1000,'unidades','A3-Patio','2026-02-15','Ladrillera Central',2.00,150);
INSERT INTO materiales VALUES (NULL,'Arena Gruesa','Arena de río para concreto y mortero','Agregados',10,'m3','A4-Patio','2026-01-25','Canteras del Sur',85.00,3);
INSERT INTO materiales VALUES (NULL,'Arena Fina','Arena de río para tarrajeo','Agregados',8,'m3','A4-Patio','2026-01-25','Canteras del Sur',75.00,3);
INSERT INTO materiales VALUES (NULL,'Piedra Chancada 1/2','Piedra triturada para concreto','Agregados',12,'m3','A4-Patio','2026-02-01','Canteras del Sur',95.00,3);
INSERT INTO materiales VALUES (NULL,'Piedra Grande 3/4','Piedra triturada para cimentaciones','Agregados',6,'m3','A4-Patio','2026-02-01','Canteras del Sur',110.00,2);
INSERT INTO materiales VALUES (NULL,'Hormigón','Mezcla de arena y piedra para concreto','Agregados',15,'m3','A4-Patio','2026-01-20','Canteras del Sur',65.00,4);
INSERT INTO materiales VALUES (NULL,'Cal Hidratada','Cal para acabados de construcción','Materiales de Construcción',50,'bolsas','A1-Estante 3','2026-02-10','Caleras Nacionales',18.00,10);
INSERT INTO materiales VALUES (NULL,'Yeso de Construcción','Yeso para tarrajeo y acabados','Materiales de Construcción',40,'bolsas','A1-Estante 4','2026-02-15','Gypsum del Perú',22.00,10);
INSERT INTO materiales VALUES (NULL,'Clavos 2 pulgadas','Clavos de acero para madera 2"','Ferretería',30,'kg','C1-Estante 1','2026-01-15','Ferretería El Tornillo',8.50,5);
INSERT INTO materiales VALUES (NULL,'Clavos 3 pulgadas','Clavos de acero para madera 3"','Ferretería',25,'kg','C1-Estante 1','2026-01-15','Ferretería El Tornillo',9.00,5);
INSERT INTO materiales VALUES (NULL,'Clavos 4 pulgadas','Clavos de acero para madera 4"','Ferretería',20,'kg','C1-Estante 1','2026-01-20','Ferretería El Tornillo',9.50,5);
INSERT INTO materiales VALUES (NULL,'Alambre N°8','Alambre de acero dulce N°8','Ferretería',40,'kg','C1-Estante 2','2026-01-20','Ferretería El Tornillo',7.00,8);
INSERT INTO materiales VALUES (NULL,'Alambre N°16','Alambre de acero dulce N°16 para amarre','Ferretería',35,'kg','C1-Estante 2','2026-01-25','Ferretería El Tornillo',7.50,8);
INSERT INTO materiales VALUES (NULL,'Tornillo Autoperforante 1"','Tornillo para planchas de acero y drywall','Ferretería',500,'unidades','C1-Estante 3','2026-02-01','Ferretería El Tornillo',0.50,100);
INSERT INTO materiales VALUES (NULL,'Tornillo Madera 2"','Tornillo para madera con rosca fina','Ferretería',400,'unidades','C1-Estante 3','2026-02-01','Ferretería El Tornillo',0.35,80);
INSERT INTO materiales VALUES (NULL,'Disco Corte Metal 7"','Disco abrasivo para corte de metal','Ferretería',60,'unidades','C1-Estante 4','2026-01-30','Herramientas Unidas',12.00,15);
INSERT INTO materiales VALUES (NULL,'Disco Corte Piedra 7"','Disco abrasivo para corte de piedra','Ferretería',45,'unidades','C1-Estante 4','2026-01-30','Herramientas Unidas',14.00,10);
INSERT INTO materiales VALUES (NULL,'Lija para Agua N°100','Papel lija al agua grano 100','Ferretería',200,'unidades','C1-Estante 5','2026-02-05','Abrasivos del Perú',1.50,40);
INSERT INTO materiales VALUES (NULL,'Lija para Agua N°220','Papel lija al agua grano 220','Ferretería',180,'unidades','C1-Estante 5','2026-02-05','Abrasivos del Perú',1.50,40);
INSERT INTO materiales VALUES (NULL,'Pintura Látex Blanca','Pintura vinílica lavable para interiores','Pinturas',25,'galones','D1-Estante 1','2026-01-10','Pinturas del Valle',55.00,5);
INSERT INTO materiales VALUES (NULL,'Pintura Látex Crema','Pintura vinílica lavable color crema','Pinturas',20,'galones','D1-Estante 1','2026-01-10','Pinturas del Valle',55.00,5);
INSERT INTO materiales VALUES (NULL,'Pintura Esmalte Sintético','Esmalte sintético brillante para exteriores','Pinturas',15,'galones','D1-Estante 2','2026-01-15','Pinturas del Valle',68.00,4);
INSERT INTO materiales VALUES (NULL,'Barniz Marino','Barniz para madera de exteriores','Pinturas',12,'galones','D1-Estante 2','2026-01-20','Pinturas del Valle',85.00,3);
INSERT INTO materiales VALUES (NULL,'Thinner','Solvente para adelgazar pintura','Pinturas',30,'galones','D1-Estante 3','2026-02-01','Disolventes SAC',32.00,6);
INSERT INTO materiales VALUES (NULL,'Imprimante para Metal','Anticorrosivo para superficies metálicas','Pinturas',18,'galones','D1-Estante 3','2026-02-05','Pinturas del Valle',45.00,4);
INSERT INTO materiales VALUES (NULL,'Cable TW 2.5mm','Cable eléctrico TW 2.5mm para instalaciones','Electricidad',500,'metros','E1-Estante 1','2026-01-10','Electro Cable',2.50,100);
INSERT INTO materiales VALUES (NULL,'Cable TW 4mm','Cable eléctrico TW 4mm para alimentación','Electricidad',400,'metros','E1-Estante 1','2026-01-10','Electro Cable',3.80,80);
INSERT INTO materiales VALUES (NULL,'Cable TW 6mm','Cable eléctrico TW 6mm para circuitos','Electricidad',300,'metros','E1-Estante 1','2026-01-15','Electro Cable',5.50,60);
INSERT INTO materiales VALUES (NULL,'Interruptor Sencillo','Interruptor eléctrico empotrable blanco','Electricidad',100,'unidades','E1-Estante 2','2026-01-20','Iluminación Global',6.00,20);
INSERT INTO materiales VALUES (NULL,'Tomacorriente Doble','Tomacorriente doble empotrable blanco','Electricidad',80,'unidades','E1-Estante 2','2026-01-20','Iluminación Global',8.00,20);
INSERT INTO materiales VALUES (NULL,'Caja Cuadrada 4x4','Caja metálica cuadrada para conexiones','Electricidad',120,'unidades','E1-Estante 3','2026-02-01','Material Eléctrico SAC',3.50,25);
INSERT INTO materiales VALUES (NULL,'Tubo PVC 1/2"','Tubo de PVC para instalaciones eléctricas','Electricidad',200,'unidades','E1-Estante 4','2026-01-25','Tubos del Perú',4.00,50);
INSERT INTO materiales VALUES (NULL,'Cinta Aislante 3M','Cinta aislante negra para seguridad','Electricidad',50,'unidades','E1-Estante 5','2026-02-05','3M Perú',5.00,10);
INSERT INTO materiales VALUES (NULL,'Tubo PVC Agua 1/2"','Tubo PVC para agua fría','Fontanería',150,'unidades','F1-Estante 1','2026-01-10','Tuboplast',6.50,30);
INSERT INTO materiales VALUES (NULL,'Tubo PVC Agua 3/4"','Tubo PVC para agua fría','Fontanería',120,'unidades','F1-Estante 1','2026-01-10','Tuboplast',8.00,25);
INSERT INTO materiales VALUES (NULL,'Codo PVC 1/2"','Codo de PVC 90° para agua','Fontanería',300,'unidades','F1-Estante 2','2026-01-15','Tuboplast',1.20,60);
INSERT INTO materiales VALUES (NULL,'Válvula Esférica 1/2"','Válvula de paso para agua','Fontanería',60,'unidades','F1-Estante 3','2026-01-20','Válvulas del Perú',15.00,15);
INSERT INTO materiales VALUES (NULL,'Llave Grifo Cocina','Grifo cromado para cocina','Fontanería',25,'unidades','F1-Estante 4','2026-02-01','Grifería FV',45.00,5);
INSERT INTO materiales VALUES (NULL,'Pegamento PVC','Adhesivo para tuberías PVC','Fontanería',40,'unidades','F1-Estante 5','2026-02-05','Adhesivos Industriales',12.00,10);
INSERT INTO materiales VALUES (NULL,'Guantes de Seguridad','Guantes de cuero para construcción','EPP',100,'pares','G1-Estante 1','2026-01-10','Equipos de Seguridad',8.00,20);
INSERT INTO materiales VALUES (NULL,'Casco de Seguridad','Casco dieléctrico para construcción','EPP',50,'unidades','G1-Estante 2','2026-01-15','Equipos de Seguridad',25.00,10);
INSERT INTO materiales VALUES (NULL,'Mascarilla N95','Mascarilla para polvo y partículas','EPP',200,'unidades','G1-Estante 3','2026-01-20','Equipos de Seguridad',3.50,50);
INSERT INTO materiales VALUES (NULL,'Lente de Seguridad','Lente transparente para protección ocular','EPP',80,'unidades','G1-Estante 4','2026-02-01','Equipos de Seguridad',6.00,20);

-- ============================================================
-- VERIFICAR DATOS
-- ============================================================
-- Después de ejecutar, corre:
SELECT COUNT(*) AS total_materiales FROM materiales;
