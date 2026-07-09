# ============================================
# Generar Manual de Usuario en Word (.docx)
# CKJ - Sistema de Almacén
# ============================================

$word = New-Object -ComObject Word.Application
$word.Visible = $false
$doc = $word.Documents.Add()
$sel = $word.Selection

# Configurar página
$doc.PageSetup.Orientation = 0  # Vertical
$doc.PageSetup.LeftMargin = 40
$doc.PageSetup.RightMargin = 40
$doc.PageSetup.TopMargin = 40
$doc.PageSetup.BottomMargin = 40

# ── ESTILOS ──────────────────────────
function Add-Heading {
    param($Text, $Level)
    $styleName = "Heading $Level"
    $sel.set_Style($styleName)
    $sel.TypeText($Text)
    $sel.TypeParagraph()
}

function Add-Paragraph {
    param($Text, $Bold = $false, $Size = 11, $Color = 0, $Italic = $false)
    $sel.Font.Size = $Size
    $sel.Font.Bold = $Bold
    $sel.Font.Italic = $Italic
    $sel.Font.ColorIndex = $Color
    $sel.TypeText($Text)
    $sel.TypeParagraph()
}

function Add-Bullet {
    param($Text)
    $sel.Style = "List Bullet"
    $sel.TypeText($Text)
    $sel.TypeParagraph()
    $sel.Style = "Normal"
}

function Add-Table {
    param($Headers, $Rows)
    $table = $doc.Tables.Add($sel.Range(), $Rows.Count + 1, $Headers.Count)
    $table.Borders.InsideLineStyle = 1
    $table.Borders.OutsideLineStyle = 1
    # Headers
    for ($i = 0; $i -lt $Headers.Count; $i++) {
        $cell = $table.Cell(1, $i+1)
        $cell.Range.Font.Bold = $true
        $cell.Range.Font.Size = 10
        $cell.Range.Text = $Headers[$i]
    }
    # Rows
    for ($r = 0; $r -lt $Rows.Count; $r++) {
        for ($c = 0; $c -lt $Rows[$r].Count; $c++) {
            $cell = $table.Cell($r+2, $c+1)
            $cell.Range.Font.Size = 10
            $cell.Range.Text = $Rows[$r][$c]
        }
    }
    $sel.TypeParagraph()
}

function Add-Image {
    param($Path, $Width = 450)
    if (Test-Path $Path) {
        $sel.InlineShapes.AddPicture($Path, $false, $true)
        $shape = $sel.InlineShapes.Item($sel.InlineShapes.Count)
        $shape.Width = $Width
        $sel.TypeParagraph()
    }
}

function Add-Step {
    param($Num, $Text)
    $sel.Font.Size = 11
    $sel.TypeText("$Num.  $Text")
    $sel.TypeParagraph()
}

# ============================================
# PORTADA
# ============================================
$sel.TypeParagraph()
$sel.TypeParagraph()
$sel.TypeParagraph()
$sel.Font.Size = 36
$sel.Font.Bold = $true
$sel.TypeText("CKJ - Sistema de Almacen")
$sel.TypeParagraph()

$sel.Font.Size = 20
$sel.Font.Bold = $false
$sel.TypeText("Manual de Usuario")
$sel.TypeParagraph()
$sel.TypeParagraph()

$sel.Font.Size = 14
$sel.Font.Italic = $true
$sel.TypeText("v1.0.0 - Julio 2026")
$sel.TypeParagraph()
$sel.TypeParagraph()
$sel.TypeParagraph()
$sel.TypeParagraph()
$sel.Font.Italic = $false
$sel.Font.Size = 11

# Salto de página
$sel.InsertBreak(7)  # wdPageBreak

# ============================================
# ÍNDICE
# ============================================
Add-Heading -Text "Índice" -Level 1
$sel.TypeParagraph()
$indice = @(
    "1.  Introducción",
    "2.  Acceso al Sistema",
    "3.  Dashboard",
    "4.  Gestión de Inventario",
    "5.  Registrar Ingreso",
    "6.  Registrar Salida",
    "7.  Punto de Venta",
    "8.  Historial y Reportes",
    "9.  Gestión de Usuarios",
    "10. Roles y Permisos",
    "11. Solución de Problemas"
)
foreach ($item in $indice) {
    $sel.TypeText($item)
    $sel.TypeParagraph()
}

$sel.InsertBreak(7)

# ============================================
# 1. INTRODUCCIÓN
# ============================================
Add-Heading -Text "1. Introducción" -Level 1
Add-Paragraph -Text "CKJ - Sistema de Almacén es una aplicación web para la gestión completa de inventarios, diseñada para pequeñas y medianas empresas. Permite controlar entradas y salidas de materiales, generar reportes, administrar usuarios y realizar ventas."

Add-Heading -Text "Tecnología" -Level 2
Add-Table -Headers @("Componente", "Tecnología") -Rows @(
    @("Frontend", "Angular (SPA moderna)"),
    @("Backend", "Node.js + Express"),
    @("Base de Datos", "SQLite")
)

Add-Heading -Text "Requisitos del Sistema" -Level 2
Add-Heading -Text "Para el usuario (navegador web)" -Level 3
Add-Bullet -Text "Google Chrome 90+, Firefox 90+, Edge 90+ o Safari 14+"
Add-Bullet -Text "Resolución mínima: 1024 × 768 px"
Add-Bullet -Text "Conexión a internet o red local"

Add-Heading -Text "Para el administrador del sistema" -Level 3
Add-Bullet -Text "Node.js 22.x instalado"
Add-Bullet -Text "npm (incluido con Node.js)"
Add-Bullet -Text "Acceso al servidor donde corre la aplicación"

$sel.InsertBreak(7)

# ============================================
# 2. ACCESO AL SISTEMA
# ============================================
Add-Heading -Text "2. Acceso al Sistema" -Level 1
Add-Image -Path "C:\Users\foca\devops\manual-usuario\imagenes\01-login.png" -Width 400

Add-Paragraph -Text "Al ingresar a la aplicación, verás la pantalla de inicio de sesión con el logo y los campos para ingresar tus credenciales." -Size 11

Add-Heading -Text "Datos de acceso predefinidos" -Level 2
Add-Table -Headers @("Usuario", "Contraseña", "Rol") -Rows @(
    @("admin", "admin123", "Administrador"),
    @("almacen", "almacen123", "Encargado Almacén"),
    @("ventas", "ventas123", "Vendedor")
)

Add-Heading -Text "Pasos para iniciar sesión" -Level 2
Add-Step -Num 1 -Text "Escribe tu nombre de usuario en el campo 'Usuario'"
Add-Step -Num 2 -Text "Escribe tu contraseña en el campo 'Contraseña'"
Add-Step -Num 3 -Text "Haz clic en el botón 'Ingresar'"

$sel.Font.Bold = $true
$sel.Font.ColorIndex = 6  # Red
Add-Paragraph -Text "NOTA: Si olvidas tu contraseña, contacta al administrador del sistema." -Size 11
$sel.Font.Bold = $false
$sel.Font.ColorIndex = 0

$sel.InsertBreak(7)

# ============================================
# 3. DASHBOARD
# ============================================
Add-Heading -Text "3. Dashboard" -Level 1
Add-Image -Path "C:\Users\foca\devops\manual-usuario\imagenes\02-dashboard.png" -Width 450

Add-Paragraph -Text "El Dashboard es la pantalla principal después de iniciar sesión. Muestra un resumen del estado actual del almacén." -Size 11

Add-Heading -Text "Indicadores principales" -Level 2
Add-Table -Headers @("Indicador", "Descripción") -Rows @(
    @("Materiales", "Total de materiales registrados"),
    @("Total en Stock", "Suma de todas las cantidades en inventario"),
    @("Valor Total", "Suma del valor monetario del inventario"),
    @("Stock Bajo", "Materiales por debajo del stock mínimo"),
    @("Ingresos Hoy", "Ingresos registrados el día de hoy"),
    @("Salidas Hoy", "Salidas registradas el día de hoy")
)

Add-Heading -Text "Secciones del Dashboard" -Level 2

$sel.Font.Bold = $true
Add-Paragraph -Text "Movimientos Recientes:" -Size 11
$sel.Font.Bold = $false
Add-Paragraph -Text "Muestra una tabla con los últimos 5 movimientos realizados, incluyendo material, tipo (Ingreso/Salida), cantidad, fecha y origen/destino." -Size 11

$sel.Font.Bold = $true
Add-Paragraph -Text "Materiales con Stock Bajo:" -Size 11
$sel.Font.Bold = $false
Add-Paragraph -Text "Lista los materiales cuya cantidad actual está por debajo del stock mínimo configurado. Desde aquí puedes hacer clic en 'Ir al Inventario' para gestionarlos." -Size 11

$sel.Font.Italic = $true
Add-Paragraph -Text "Consejo: Los valores en el Dashboard se actualizan automáticamente al registrar nuevos movimientos." -Size 10
$sel.Font.Italic = $false

$sel.InsertBreak(7)

# ============================================
# 4. INVENTARIO
# ============================================
Add-Heading -Text "4. Gestión de Inventario" -Level 1
Add-Image -Path "C:\Users\foca\devops\manual-usuario\imagenes\03-materiales.png" -Width 450

Add-Heading -Text "Lista de Materiales" -Level 2
Add-Paragraph -Text "La sección Inventario muestra todos los materiales registrados en una tabla con las siguientes columnas:" -Size 11

Add-Table -Headers @("Columna", "Descripción") -Rows @(
    @("Nombre", "Nombre del material"),
    @("Categoría", "Clasificación del material"),
    @("Cantidad", "Stock actual"),
    @("Unidad", "Unidad de medida (bolsas, unidades, galones, etc.)"),
    @("Ubicación", "Ubicación física en el almacén"),
    @("Precio Unitario", "Precio por unidad"),
    @("Stock Mínimo", "Cantidad mínima antes de alertar"),
    @("Acciones", "Botones para editar o eliminar")
)

Add-Heading -Text "Acciones disponibles" -Level 2

$sel.Font.Bold = $true
Add-Paragraph -Text "Agregar nuevo material:" -Size 11
$sel.Font.Bold = $false
Add-Step -Num 1 -Text "Haz clic en el botón 'Nuevo Material'"
Add-Step -Num 2 -Text "Completa los campos: Nombre, Descripción, Categoría, Cantidad, Unidad, Ubicación, Proveedor, Precio Unitario y Stock Mínimo"
Add-Step -Num 3 -Text "Haz clic en 'Guardar'"

$sel.Font.Bold = $true
Add-Paragraph -Text "Editar material:" -Size 11
$sel.Font.Bold = $false
Add-Step -Num 1 -Text "Haz clic en el ícono de lápiz en la fila del material"
Add-Step -Num 2 -Text "Modifica los campos necesarios"
Add-Step -Num 3 -Text "Haz clic en 'Guardar'"

$sel.Font.Bold = $true
Add-Paragraph -Text "Eliminar material:" -Size 11
$sel.Font.Bold = $false
Add-Step -Num 1 -Text "Haz clic en el ícono de basurero en la fila del material"
Add-Step -Num 2 -Text "Confirma la eliminación"

$sel.Font.Bold = $true
$sel.Font.ColorIndex = 6
Add-Paragraph -Text "ADVERTENCIA: Eliminar un material también eliminará todos los movimientos asociados." -Size 10
$sel.Font.Bold = $false
$sel.Font.ColorIndex = 0

$sel.InsertBreak(7)

# ============================================
# 5. INGRESO
# ============================================
Add-Heading -Text "5. Registrar Ingreso" -Level 1
Add-Image -Path "C:\Users\foca\devops\manual-usuario\imagenes\04-ingreso.png" -Width 400

Add-Paragraph -Text "Esta sección permite registrar la entrada de materiales al almacén, aumentando automáticamente el stock." -Size 11

Add-Heading -Text "Pasos para registrar un ingreso" -Level 2
Add-Step -Num 1 -Text "Selecciona el Material del menú desplegable"
Add-Step -Num 2 -Text "Ingresa la Cantidad a ingresar (usa los botones +/- o escribe directamente)"
Add-Step -Num 3 -Text "Opcional: Ingresa el Proveedor que entrega el material"
Add-Step -Num 4 -Text "Opcional: Adjunta un comprobante (PDF o imagen)"
Add-Step -Num 5 -Text "Haz clic en 'Registrar Ingreso'"

$sel.Font.Bold = $true
$sel.Font.ColorIndex = 4  # Green
Add-Paragraph -Text "El sistema actualizará automáticamente el stock del material." -Size 11
$sel.Font.Bold = $false
$sel.Font.ColorIndex = 0

Add-Heading -Text "Botón 'Ver Inventario'" -Level 2
Add-Paragraph -Text "Abre una ventana emergente con la lista completa de materiales y sus stocks actuales para consulta rápida mientras registras." -Size 11

$sel.InsertBreak(7)

# ============================================
# 6. SALIDA
# ============================================
Add-Heading -Text "6. Registrar Salida" -Level 1
Add-Image -Path "C:\Users\foca\devops\manual-usuario\imagenes\05-salida.png" -Width 400

Add-Paragraph -Text "Esta sección permite registrar la salida de materiales del almacén, descontando automáticamente del stock." -Size 11

Add-Heading -Text "Pasos para registrar una salida" -Level 2
Add-Step -Num 1 -Text "Selecciona el Material del menú desplegable"
Add-Step -Num 2 -Text "Ingresa la Cantidad a retirar"
Add-Step -Num 3 -Text "Opcional: Ingresa el Destino del material"
Add-Step -Num 4 -Text "Opcional: Adjunta un comprobante"
Add-Step -Num 5 -Text "Haz clic en 'Registrar Salida'"

$sel.Font.Bold = $true
$sel.Font.ColorIndex = 6
Add-Paragraph -Text "ADVERTENCIA: El sistema no permitirá registrar una salida si la cantidad solicitada supera el stock disponible." -Size 10
$sel.Font.Bold = $false
$sel.Font.ColorIndex = 0

Add-Heading -Text "Validaciones" -Level 2
Add-Bullet -Text "La cantidad debe ser mayor a 0"
Add-Bullet -Text "No puede exceder el stock actual del material"
Add-Bullet -Text "El material debe existir en el inventario"

$sel.InsertBreak(7)

# ============================================
# 7. VENTAS
# ============================================
Add-Heading -Text "7. Punto de Venta" -Level 1
Add-Image -Path "C:\Users\foca\devops\manual-usuario\imagenes\06-ventas.png" -Width 450

Add-Paragraph -Text "El módulo de ventas permite registrar ventas a clientes y generar boletas de venta." -Size 11

Add-Heading -Text "Pasos para realizar una venta" -Level 2
Add-Step -Num 1 -Text "Ingresa el nombre del Cliente (obligatorio)"
Add-Step -Num 2 -Text "Selecciona un Producto del menú desplegable"
Add-Step -Num 3 -Text "Los productos seleccionados se agregan al carrito"
Add-Step -Num 4 -Text "Revisa el carrito con los productos, cantidades y precios"
Add-Step -Num 5 -Text "Haz clic en 'Finalizar Venta'"

Add-Heading -Text "Características" -Level 2
Add-Bullet -Text "Cálculo automático del total de la venta"
Add-Bullet -Text "Descuento del stock automático al finalizar"
Add-Bullet -Text "Generación de boleta/resumen de venta"

$sel.InsertBreak(7)

# ============================================
# 8. REPORTES
# ============================================
Add-Heading -Text "8. Historial y Reportes" -Level 1
Add-Image -Path "C:\Users\foca\devops\manual-usuario\imagenes\07-reportes.png" -Width 450

Add-Paragraph -Text "La sección de Historial permite consultar todos los movimientos registrados y generar reportes." -Size 11

Add-Heading -Text "Filtros disponibles" -Level 2
Add-Table -Headers @("Filtro", "Descripción") -Rows @(
    @("Período", "Esta semana, Este mes, Todo"),
    @("Tipo", "Ingreso, Salida, Todos"),
    @("Material", "Filtrar por un material específico")
)

Add-Heading -Text "Exportar a PDF" -Level 2
Add-Step -Num 1 -Text "Aplica los filtros deseados"
Add-Step -Num 2 -Text "Haz clic en 'Exportar PDF'"
Add-Step -Num 3 -Text "El sistema generará un archivo PDF con el reporte"

Add-Heading -Text "Tabla de movimientos" -Level 2
Add-Paragraph -Text "Lista detallada de cada movimiento con: Material, Tipo (verde=ingreso, rojo=salida), Cantidad, Fecha y hora, Proveedor/Destino, Usuario que registró y Comprobante adjunto." -Size 11

$sel.InsertBreak(7)

# ============================================
# 9. USUARIOS
# ============================================
Add-Heading -Text "9. Gestión de Usuarios" -Level 1
Add-Image -Path "C:\Users\foca\devops\manual-usuario\imagenes\08-usuarios.png" -Width 450

$sel.Font.Bold = $true
$sel.Font.ColorIndex = 6
Add-Paragraph -Text "NOTA: Esta sección solo está disponible para usuarios con rol Admin." -Size 11
$sel.Font.Bold = $false
$sel.Font.ColorIndex = 0

Add-Heading -Text "Crear nuevo usuario" -Level 2
Add-Step -Num 1 -Text "Haz clic en 'Nuevo Usuario'"
Add-Step -Num 2 -Text "Completa: Usuario, Contraseña, Nombre, Rol"
Add-Step -Num 3 -Text "Haz clic en 'Guardar'"

Add-Heading -Text "Editar usuario" -Level 2
Add-Step -Num 1 -Text "Haz clic en el ícono de lápiz"
Add-Step -Num 2 -Text "Modifica los campos (deja contraseña en blanco para no cambiarla)"
Add-Step -Num 3 -Text "Haz clic en 'Guardar'"

Add-Heading -Text "Eliminar usuario" -Level 2
Add-Step -Num 1 -Text "Haz clic en el ícono de basurero"
Add-Step -Num 2 -Text "Confirma la eliminación"

$sel.Font.Bold = $true
$sel.Font.ColorIndex = 6
Add-Paragraph -Text "ADVERTENCIA: No puedes eliminarte a ti mismo mientras estás logueado." -Size 10
$sel.Font.Bold = $false
$sel.Font.ColorIndex = 0

$sel.InsertBreak(7)

# ============================================
# 10. ROLES Y PERMISOS
# ============================================
Add-Heading -Text "10. Roles y Permisos" -Level 1

Add-Table -Headers @("Función", "Admin", "Almacén", "Ventas") -Rows @(
    @("Ver Dashboard", "✅ Sí", "✅ Sí", "✅ Sí"),
    @("Ver Inventario", "✅ Sí", "✅ Sí", "✅ Sí"),
    @("Crear/Editar Materiales", "✅ Sí", "✅ Sí", "❌ No"),
    @("Eliminar Materiales", "✅ Sí", "❌ No", "❌ No"),
    @("Registrar Ingreso", "✅ Sí", "✅ Sí", "❌ No"),
    @("Registrar Salida", "✅ Sí", "✅ Sí", "✅ Sí*"),
    @("Realizar Ventas", "✅ Sí", "❌ No", "✅ Sí"),
    @("Ver Reportes", "✅ Sí", "✅ Sí", "✅ Sí"),
    @("Gestionar Usuarios", "✅ Sí", "❌ No", "❌ No"),
    @("Ajustar Stock", "✅ Sí", "❌ No", "❌ No")
)

$sel.Font.Italic = $true
Add-Paragraph -Text "* Ventas solo puede registrar salidas, no ingresos." -Size 10
$sel.Font.Italic = $false

$sel.InsertBreak(7)

# ============================================
# 11. SOLUCIÓN DE PROBLEMAS
# ============================================
Add-Heading -Text "11. Solución de Problemas" -Level 1

$sel.Font.Bold = $true
Add-Paragraph -Text "No puedo iniciar sesión" -Size 12
$sel.Font.Bold = $false
Add-Bullet -Text "Verifica que el usuario y contraseña sean correctos"
Add-Bullet -Text "Confirma que tu cuenta esté activa (contacta al admin)"
Add-Bullet -Text "Revisa que el servidor esté funcionando"
Add-Bullet -Text "Límite de 5 intentos por 15 minutos por seguridad"
$sel.TypeParagraph()

$sel.Font.Bold = $true
Add-Paragraph -Text "Error 'Stock insuficiente'" -Size 12
$sel.Font.Bold = $false
Add-Bullet -Text "El material no tiene suficiente cantidad para la salida solicitada"
Add-Bullet -Text "Revisa el stock actual en el inventario"
Add-Bullet -Text "Registra un ingreso si es necesario"
$sel.TypeParagraph()

$sel.Font.Bold = $true
Add-Paragraph -Text "La página no carga" -Size 12
$sel.Font.Bold = $false
Add-Bullet -Text "Verifica que el servidor esté corriendo"
Add-Bullet -Text "Revisa la conexión de red"
Add-Bullet -Text "Limpia la caché del navegador (Ctrl + Shift + Del)"
Add-Bullet -Text "Prueba con otro navegador"
$sel.TypeParagraph()

$sel.Font.Bold = $true
Add-Paragraph -Text "Error al adjuntar comprobante" -Size 12
$sel.Font.Bold = $false
Add-Bullet -Text "Formatos permitidos: PDF, JPG, PNG, GIF, WEBP"
Add-Bullet -Text "Tamaño máximo: 5MB"
Add-Bullet -Text "Verifica que el archivo no esté dañado"

$sel.TypeParagraph()
$sel.TypeParagraph()

# ============================================
# PIE DE PÁGINA
# ============================================
$sel.Font.Size = 10
$sel.Font.Italic = $true
$sel.TypeText("CKJ - Sistema de Almacén  |  v1.0.0  |  Documentación generada el Julio 2026")
$sel.TypeParagraph()

# ── Guardar documento ──
$outputPath = "C:\Users\foca\devops\manual-usuario\MANUAL.docx"
$doc.SaveAs([ref]$outputPath, [ref]16)  # 16 = wdFormatDocumentDefault
$doc.Close()
$word.Quit()

Write-Host "✅ Documento Word generado exitosamente en: $outputPath"
