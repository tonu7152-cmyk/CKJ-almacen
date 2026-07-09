# ============================================
# Generar Manuales de Usuario por Rol - Version Mejorada
# CKJ - Sistema de Almacen
# Estilo profesional como HTML, sin bordes de celdas
# ============================================

$baseDir = "C:\Users\foca\devops\manual-usuario"
$imgs = "$baseDir\imagenes"

# ── FUNCIONES BASE ────────────────────
function New-WordDoc {
    $word = New-Object -ComObject Word.Application
    $word.Visible = $false
    $doc = $word.Documents.Add()
    $sel = $word.Selection
    $doc.PageSetup.Orientation = 0
    $doc.PageSetup.LeftMargin = 28
    $doc.PageSetup.RightMargin = 28
    $doc.PageSetup.TopMargin = 20
    $doc.PageSetup.BottomMargin = 20
    return @{ Word = $word; Doc = $doc; Sel = $sel }
}

function Add-Heading { param($Text, $Level, $Sel)
    try { $Sel.Style = "Heading $Level" } catch { $Sel.Font.Bold = $true; $Sel.Font.Size = 16 - ($Level * 2) }
    $Sel.TypeText($Text)
    $Sel.TypeParagraph()
}

function Add-Text { param($Text, $Bold = $false, $Size = 10, $Italic = $false, $Sel)
    $Sel.Font.Size = $Size
    $Sel.Font.Bold = $Bold
    $Sel.Font.Italic = $Italic
    $Sel.TypeText($Text)
    $Sel.TypeParagraph()
}

function Add-Bullet { param($Text, $Sel)
    $Sel.TypeText("  - $Text")
    $Sel.TypeParagraph()
}

function Add-Step { param($Num, $Text, $Sel)
    $Sel.Font.Size = 10
    $Sel.Font.Bold = $true
    $Sel.TypeText("$Num. ")
    $Sel.Font.Bold = $false
    $Sel.TypeText($Text)
    $Sel.TypeParagraph()
}

function Add-Table { param($Headers, $Rows, $Sel, $Doc)
    $table = $Doc.Tables.Add($Sel.Range(), $Rows.Count + 1, $Headers.Count)
    $table.Borders.InsideLineStyle = 0
    $table.Borders.OutsideLineStyle = 0
    $table.Rows.HeightRule = 0

    for ($i = 0; $i -lt $Headers.Count; $i++) {
        $cell = $table.Cell(1, $i+1)
        $cell.Range.Font.Bold = $true
        $cell.Range.Font.Size = 9.5
        $cell.Range.Font.ColorIndex = 1
        $cell.Range.Text = " " + $Headers[$i]
        $cell.Shading.BackgroundPatternColorIndex = 15
    }
    for ($r = 0; $r -lt $Rows.Count; $r++) {
        for ($c = 0; $c -lt $Rows[$r].Count; $c++) {
            $cell = $table.Cell($r+2, $c+1)
            $cell.Range.Font.Size = 9
            $cell.Range.Text = " " + $Rows[$r][$c]
            if ($r % 2 -eq 0) { $cell.Shading.BackgroundPatternColorIndex = 2 }
        }
    }
    $Sel.TypeParagraph()
}

function Add-PermisoTable { param($Rows, $Sel, $Doc)
    $table = $Doc.Tables.Add($Sel.Range(), $Rows.Count + 1, 2)
    $table.Borders.InsideLineStyle = 0
    $table.Borders.OutsideLineStyle = 0

    $c1 = $table.Cell(1,1); $c1.Range.Text = " Funcion"; $c1.Range.Font.Bold = $true
    $c1.Range.Font.Size = 9; $c1.Range.Font.ColorIndex = 1
    $c1.Shading.BackgroundPatternColorIndex = 15
    $c2 = $table.Cell(1,2); $c2.Range.Text = " Acceso"; $c2.Range.Font.Bold = $true
    $c2.Range.Font.Size = 9; $c2.Range.Font.ColorIndex = 1
    $c2.Shading.BackgroundPatternColorIndex = 15

    for ($r = 0; $r -lt $Rows.Count; $r++) {
        $rc1 = $table.Cell($r+2,1); $rc1.Range.Font.Size = 9; $rc1.Range.Text = " " + $Rows[$r][0]
        $rc2 = $table.Cell($r+2,2); $rc2.Range.Font.Size = 9
        if ($Rows[$r][1] -eq "SI" -or $Rows[$r][1] -eq "SI (solo lectura)") {
            $rc2.Range.Font.Bold = $true; $rc2.Range.Font.ColorIndex = 11
        } else {
            $rc2.Range.Font.ColorIndex = 6
        }
        $rc2.Range.Text = " " + $Rows[$r][1]
        if ($r % 2 -eq 0) { $rc1.Shading.BackgroundPatternColorIndex = 2; $rc2.Shading.BackgroundPatternColorIndex = 2 }
    }
    $Sel.TypeParagraph()
}

function Add-Image { param($Path, $Width = 280, $Sel)
    if (Test-Path $Path) {
        $pic = $Sel.InlineShapes.AddPicture($Path, $false, $true)
        $pic.Width = $Width
        $Sel.TypeParagraph()
    }
}

function Add-PageBreak { param($Sel)
    $Sel.InsertBreak(7)
}

function Add-WarningBox { param($Text, $Sel)
    $Sel.Font.Bold = $true
    $Sel.Font.Size = 10
    $Sel.Font.ColorIndex = 6
    $Sel.TypeText("! " + $Text)
    $Sel.TypeParagraph()
    $Sel.Font.Bold = $false
    $Sel.Font.ColorIndex = 0
}

function Add-TipBox { param($Text, $Sel)
    $Sel.Font.Italic = $true
    $Sel.Font.Size = 9
    $Sel.Font.ColorIndex = 11
    $Sel.TypeText(" > " + $Text)
    $Sel.TypeParagraph()
    $Sel.Font.Italic = $false
    $Sel.Font.ColorIndex = 0
}

function Add-InfoBox { param($Text, $Sel)
    $Sel.Font.Size = 9
    $Sel.Font.ColorIndex = 1
    $Sel.TypeText(">> " + $Text)
    $Sel.TypeParagraph()
    $Sel.Font.ColorIndex = 0
}

function Save-And-Close { param($W, $Path)
    $W.Doc.SaveAs([ref]$Path, [ref]16)
    $W.Doc.Close()
    $W.Word.Quit()
    Write-Host "  -> Generado: $Path"
}

function Add-Portada { param($Rol, $RolDesc, $RolIcon, $Sel)
    $Sel.TypeParagraph(); $Sel.TypeParagraph()
    $Sel.ParagraphFormat.Alignment = 1
    $Sel.Font.Size = 20; $Sel.Font.Bold = $true; $Sel.TypeText("CKJ - Sistema de Almacen"); $Sel.TypeParagraph()
    $Sel.Font.Size = 28; $Sel.Font.Bold = $true; $Sel.TypeText("Manual del Usuario"); $Sel.TypeParagraph()
    $Sel.Font.Size = 18; $Sel.Font.Bold = $true; $Sel.Font.ColorIndex = 1
    $Sel.TypeText("$RolIcon  $Rol"); $Sel.TypeParagraph()
    $Sel.Font.Size = 12; $Sel.Font.Bold = $false; $Sel.Font.ColorIndex = 0
    $Sel.TypeText($RolDesc); $Sel.TypeParagraph(); $Sel.TypeParagraph()
    $Sel.Font.Size = 11; $Sel.Font.Italic = $true; $Sel.TypeText("v1.0.0 - Julio 2026"); $Sel.TypeParagraph()
    $Sel.Font.Italic = $false; $Sel.TypeParagraph()
    $Sel.Font.Size = 9; $Sel.Font.Italic = $true; $Sel.TypeText("Documento confidencial de uso interno"); $Sel.TypeParagraph()
    $Sel.ParagraphFormat.Alignment = 0
}

function Add-Seccion-Acceso { param($Sel)
    Add-Heading -Text "Acceso al Sistema" -Level 1 -Sel $sel
    Add-Image -Path "$imgs\01-login.png" -Width 250 -Sel $sel
    Add-Text -Text "Para ingresar al sistema, abre tu navegador y ve a la direccion del servidor. Veras la pantalla de inicio de sesion." -Sel $sel
    Add-Heading -Text "Pasos para iniciar sesion" -Level 2 -Sel $sel
    Add-Step -Num 1 -Text "Escribe tu nombre de usuario en el campo 'Usuario'" -Sel $sel
    Add-Step -Num 2 -Text "Escribe tu contrasena en el campo 'Contrasena'" -Sel $sel
    Add-Step -Num 3 -Text "Haz clic en el boton 'Ingresar'" -Sel $sel
    Add-WarningBox -Text "Si olvidas tu contrasena, contacta al administrador del sistema." -Sel $sel
}

function Add-Seccion-Dashboard { param($Sel)
    Add-Heading -Text "Dashboard (Panel Principal)" -Level 1 -Sel $sel
    Add-Image -Path "$imgs\02-dashboard.png" -Width 300 -Sel $sel
    Add-Text -Text "El Dashboard es la pantalla que ves al iniciar sesion. Muestra un resumen del estado del almacen." -Sel $sel
    Add-Table -Headers @("Indicador", "Descripcion") -Rows @(
        @("Materiales", "Total de materiales registrados"),
        @("Total en Stock", "Suma de todas las cantidades"),
        @("Valor Total", "Valor monetario del inventario"),
        @("Stock Bajo", "Materiales por debajo del minimo"),
        @("Ingresos / Salidas Hoy", "Movimientos del dia")
    ) -Sel $sel -Doc $script:doc
    Add-TipBox -Text "Los valores se actualizan automaticamente al registrar movimientos." -Sel $sel
}

function Add-Seccion-Menu { param($Sel)
    Add-Heading -Text "Menu de Navegacion" -Level 1 -Sel $sel
    Add-Text -Text "El menu lateral izquierdo te permite acceder a todas las secciones del sistema:" -Sel $sel
    Add-Table -Headers @("Opcion", "Descripcion") -Rows @(
        @("Dashboard", "Resumen general del almacen"),
        @("Inventario", "Lista de todos los materiales"),
        @("Ingreso", "Registrar entrada de materiales"),
        @("Salida", "Registrar salida de materiales"),
        @("Venta", "Punto de venta para clientes"),
        @("Historial", "Reportes y movimientos"),
        @("Usuarios", "Gestion de usuarios (solo Admin)")
    ) -Sel $sel -Doc $script:doc
}

# ============================================
# 1. MANUAL ADMIN
# ============================================
function Generate-AdminManual {
    $w = New-WordDoc
    $sel = $w.Sel; $script:doc = $w.Doc

    Add-Portada -Rol "ADMINISTRADOR" -RolDesc "Acceso total al sistema - Control completo del almacen" -RolIcon "" -Sel $sel
    Add-PageBreak -Sel $sel

    Add-Heading -Text "Indice" -Level 1 -Sel $sel
    foreach ($item in @("1.  Introduccion", "2.  Acceso al Sistema", "3.  Dashboard", "4.  Menu de Navegacion", "5.  Gestion de Inventario", "6.  Registrar Ingreso", "7.  Registrar Salida", "8.  Punto de Venta", "9.  Historial y Reportes", "10. Gestion de Usuarios", "11. Ajustar Stock", "12. Resumen de Permisos", "13. Solucion de Problemas")) { $sel.TypeText($item); $sel.TypeParagraph() }
    Add-PageBreak -Sel $sel

    Add-Heading -Text "Introduccion" -Level 1 -Sel $sel
    Add-Text -Text "Bienvenido al manual del Administrador. Como ADMINISTRADOR tienes control TOTAL sobre todas las funciones del sistema de almacen CKJ." -Sel $sel
    Add-Heading -Text "Credenciales de acceso" -Level 2 -Sel $sel
    Add-Table -Headers @("Usuario", "Contrasena", "Rol") -Rows @(@("admin", "admin123", "Administrador")) -Sel $sel -Doc $w.Doc
    Add-Heading -Text "Funciones exclusivas" -Level 2 -Sel $sel
    Add-Text -Text "Crear, editar y eliminar usuarios; ajustar stock directamente; eliminar materiales; y acceso a TODAS las secciones del sistema sin restricciones." -Sel $sel

    Add-Seccion-Acceso -Sel $sel
    Add-Seccion-Dashboard -Sel $sel
    Add-Seccion-Menu -Sel $sel

    Add-Heading -Text "Gestion de Inventario" -Level 1 -Sel $sel
    Add-Image -Path "$imgs\03-materiales.png" -Width 300 -Sel $sel
    Add-Text -Text "Como ADMIN puedes realizar TODAS las acciones sobre los materiales:" -Bold $true -Sel $sel
    Add-Heading -Text "Agregar nuevo material" -Level 2 -Sel $sel
    Add-Step -Num 1 -Text "Haz clic en 'Nuevo Material'" -Sel $sel
    Add-Step -Num 2 -Text "Completa: Nombre, Descripcion, Categoria, Cantidad, Unidad, Ubicacion, Proveedor, Precio Unitario, Stock Minimo" -Sel $sel
    Add-Step -Num 3 -Text "Haz clic en 'Guardar'" -Sel $sel
    Add-Heading -Text "Editar material" -Level 2 -Sel $sel
    Add-Step -Num 1 -Text "Haz clic en el icono de lapiz en la fila del material" -Sel $sel
    Add-Step -Num 2 -Text "Modifica los campos necesarios" -Sel $sel
    Add-Step -Num 3 -Text "Haz clic en 'Guardar'" -Sel $sel
    Add-Heading -Text "Eliminar material" -Level 2 -Sel $sel
    Add-Step -Num 1 -Text "Haz clic en el icono de basurero" -Sel $sel
    Add-Step -Num 2 -Text "Confirma la eliminacion" -Sel $sel
    Add-WarningBox -Text "Eliminar un material borra TODOS sus movimientos asociados. Esta accion no se puede deshacer." -Sel $sel

    Add-Heading -Text "Registrar Ingreso" -Level 1 -Sel $sel
    Add-Image -Path "$imgs\04-ingreso.png" -Width 270 -Sel $sel
    Add-Text -Text "Registra la entrada de materiales al almacen. El stock aumenta automaticamente." -Sel $sel
    Add-Step -Num 1 -Text "Ve a 'Ingreso' en el menu" -Sel $sel; Add-Step -Num 2 -Text "Selecciona el Material del menu desplegable" -Sel $sel; Add-Step -Num 3 -Text "Ingresa la Cantidad" -Sel $sel; Add-Step -Num 4 -Text "Opcional: Proveedor y comprobante" -Sel $sel; Add-Step -Num 5 -Text "Haz clic en 'Registrar Ingreso'" -Sel $sel
    Add-InfoBox -Text "El sistema actualiza automaticamente el stock del material." -Sel $sel

    Add-Heading -Text "Registrar Salida" -Level 1 -Sel $sel
    Add-Image -Path "$imgs\05-salida.png" -Width 270 -Sel $sel
    Add-Text -Text "Registra la salida de materiales del almacen. El stock disminuye automaticamente." -Sel $sel
    Add-Step -Num 1 -Text "Ve a 'Salida' en el menu" -Sel $sel; Add-Step -Num 2 -Text "Selecciona el Material" -Sel $sel; Add-Step -Num 3 -Text "Ingresa la Cantidad" -Sel $sel; Add-Step -Num 4 -Text "Opcional: Destino y comprobante" -Sel $sel; Add-Step -Num 5 -Text "Haz clic en 'Registrar Salida'" -Sel $sel
    Add-WarningBox -Text "El sistema NO permite salidas que superen el stock disponible." -Sel $sel

    Add-Heading -Text "Punto de Venta" -Level 1 -Sel $sel
    Add-Image -Path "$imgs\06-ventas.png" -Width 300 -Sel $sel
    Add-Text -Text "Modulo para realizar ventas a clientes. Como ADMIN tienes acceso completo." -Sel $sel
    Add-Step -Num 1 -Text "Ve a 'Venta' en el menu" -Sel $sel; Add-Step -Num 2 -Text "Ingresa el nombre del Cliente" -Sel $sel; Add-Step -Num 3 -Text "Selecciona Productos y agrega al carrito" -Sel $sel; Add-Step -Num 4 -Text "Revisa el total" -Sel $sel; Add-Step -Num 5 -Text "Haz clic en 'Finalizar Venta'" -Sel $sel

    Add-Heading -Text "Historial y Reportes" -Level 1 -Sel $sel
    Add-Image -Path "$imgs\07-reportes.png" -Width 300 -Sel $sel
    Add-Text -Text "Consulta todos los movimientos y genera reportes en PDF." -Sel $sel
    Add-Heading -Text "Filtros" -Level 2 -Sel $sel
    Add-Bullet -Text "Periodo: Esta semana, Este mes, Todo" -Sel $sel; Add-Bullet -Text "Tipo: Ingreso, Salida, Todos" -Sel $sel; Add-Bullet -Text "Material: Filtrar por uno especifico" -Sel $sel
    Add-Heading -Text "Exportar a PDF" -Level 2 -Sel $sel
    Add-Step -Num 1 -Text "Aplica los filtros deseados" -Sel $sel; Add-Step -Num 2 -Text "Haz clic en 'Exportar PDF'" -Sel $sel

    Add-Heading -Text "Gestion de Usuarios" -Level 1 -Sel $sel
    Add-Image -Path "$imgs\08-usuarios.png" -Width 300 -Sel $sel
    Add-WarningBox -Text "Esta seccion solo esta disponible para usuarios con rol Admin." -Sel $sel
    Add-Heading -Text "Crear usuario" -Level 2 -Sel $sel
    Add-Step -Num 1 -Text "Haz clic en 'Nuevo Usuario'" -Sel $sel; Add-Step -Num 2 -Text "Completa: Usuario, Contrasena, Nombre, Rol" -Sel $sel; Add-Step -Num 3 -Text "Haz clic en 'Guardar'" -Sel $sel
    Add-Heading -Text "Editar usuario" -Level 2 -Sel $sel
    Add-Step -Num 1 -Text "Haz clic en lapiz" -Sel $sel; Add-Step -Num 2 -Text "Modifica campos (deja contrasena vacia si no cambia)" -Sel $sel; Add-Step -Num 3 -Text "Haz clic en 'Guardar'" -Sel $sel
    Add-Heading -Text "Eliminar usuario" -Level 2 -Sel $sel
    Add-Step -Num 1 -Text "Haz clic en basurero" -Sel $sel; Add-Step -Num 2 -Text "Confirma la eliminacion" -Sel $sel
    Add-WarningBox -Text "No puedes eliminarte a ti mismo mientras estes logueado." -Sel $sel

    Add-Heading -Text "Ajustar Stock (Solo Admin)" -Level 1 -Sel $sel
    Add-Text -Text "Funcion EXCLUSIVA del Administrador. Permite corregir el stock de cualquier material manualmente." -Sel $sel
    Add-Step -Num 1 -Text "Ve a 'Inventario'" -Sel $sel; Add-Step -Num 2 -Text "Busca el material a ajustar" -Sel $sel; Add-Step -Num 3 -Text "Usa la opcion de ajuste para establecer la cantidad exacta" -Sel $sel; Add-Step -Num 4 -Text "Indica el motivo del ajuste" -Sel $sel; Add-Step -Num 5 -Text "Confirma el ajuste" -Sel $sel
    Add-WarningBox -Text "Usa esta funcion con responsabilidad. Cada ajuste queda registrado como movimiento." -Sel $sel

    Add-Heading -Text "Resumen de Permisos del ADMIN" -Level 1 -Sel $sel
    Add-PermisoTable -Rows @(@("Ver Dashboard","SI"),@("Ver Inventario","SI"),@("Buscar materiales","SI"),@("Agregar materiales","SI"),@("Editar materiales","SI"),@("Eliminar materiales","SI"),@("Registrar Ingreso","SI"),@("Registrar Salida","SI"),@("Realizar Ventas","SI"),@("Ver Reportes","SI"),@("Exportar PDF","SI"),@("Gestionar Usuarios","SI"),@("Ajustar Stock","SI")) -Sel $sel -Doc $w.Doc
    Add-Heading -Text "Lo que NO puede hacer un ADMIN" -Level 2 -Sel $sel
    Add-Text -Text "Como ADMIN no tienes restricciones. Tienes control TOTAL del sistema." -Bold $true -Sel $sel

    Add-Heading -Text "Solucion de Problemas" -Level 1 -Sel $sel
    Add-Text -Text "No puedo iniciar sesion:" -Bold $true -Sel $sel
    Add-Bullet -Text "Verifica usuario y contrasena" -Sel $sel; Add-Bullet -Text "Maximo 5 intentos cada 15 minutos" -Sel $sel
    Add-Text -Text "Error al eliminar usuario:" -Bold $true -Sel $sel
    Add-Bullet -Text "No puedes eliminar tu propia cuenta" -Sel $sel; Add-Bullet -Text "Verifica que el usuario exista" -Sel $sel
    Add-Text -Text "Stock erroneo:" -Bold $true -Sel $sel
    Add-Bullet -Text "Usa la funcion 'Ajustar Stock' para corregir" -Sel $sel; Add-Bullet -Text "Revisa el historial de movimientos" -Sel $sel

    Save-And-Close -W $w -Path "$baseDir\MANUAL-ADMIN.docx"
}

# ============================================
# 2. MANUAL ALMACEN
# ============================================
function Generate-AlmacenManual {
    $w = New-WordDoc
    $sel = $w.Sel; $script:doc = $w.Doc

    Add-Portada -Rol "ENCARGADO DE ALMACEN" -RolDesc "Gestion de inventario y movimientos del almacen" -RolIcon "" -Sel $sel
    Add-PageBreak -Sel $sel

    Add-Heading -Text "Indice" -Level 1 -Sel $sel
    foreach ($item in @("1.  Introduccion", "2.  Acceso al Sistema", "3.  Dashboard", "4.  Menu de Navegacion", "5.  Gestion de Inventario", "6.  Registrar Ingreso", "7.  Registrar Salida", "8.  Historial y Reportes", "9.  Resumen de Permisos", "10. Solucion de Problemas")) { $sel.TypeText($item); $sel.TypeParagraph() }
    Add-PageBreak -Sel $sel

    Add-Heading -Text "Introduccion" -Level 1 -Sel $sel
    Add-Text -Text "Bienvenido al manual del Encargado de Almacen. Como usuario de ALMACEN puedes gestionar el inventario, registrar entradas y salidas de materiales, y consultar reportes." -Sel $sel
    Add-Heading -Text "Credenciales de acceso" -Level 2 -Sel $sel
    Add-Table -Headers @("Usuario", "Contrasena", "Rol") -Rows @(@("almacen", "almacen123", "Encargado Almacen")) -Sel $sel -Doc $w.Doc
    Add-Heading -Text "Funciones principales" -Level 2 -Sel $sel
    Add-Bullet -Text "Agregar y editar materiales en el inventario" -Sel $sel; Add-Bullet -Text "Registrar ingresos y salidas de materiales" -Sel $sel; Add-Bullet -Text "Consultar el dashboard y reportes" -Sel $sel
    Add-Heading -Text "Funciones NO disponibles" -Level 2 -Sel $sel
    Add-Bullet -Text "Eliminar materiales del inventario" -Sel $sel; Add-Bullet -Text "Gestionar usuarios del sistema" -Sel $sel; Add-Bullet -Text "Ajustar stock directamente" -Sel $sel; Add-Bullet -Text "Realizar ventas" -Sel $sel

    Add-Seccion-Acceso -Sel $sel
    Add-Seccion-Dashboard -Sel $sel
    Add-Seccion-Menu -Sel $sel

    Add-Heading -Text "Gestion de Inventario" -Level 1 -Sel $sel
    Add-Image -Path "$imgs\03-materiales.png" -Width 300 -Sel $sel
    Add-Text -Text "Como ALMACEN puedes:" -Bold $true -Sel $sel
    Add-Bullet -Text "Ver la lista completa de materiales" -Sel $sel; Add-Bullet -Text "Buscar materiales por nombre o categoria" -Sel $sel; Add-Bullet -Text "Agregar NUEVOS materiales al inventario" -Sel $sel; Add-Bullet -Text "Editar materiales existentes" -Sel $sel
    Add-Heading -Text "Agregar material" -Level 2 -Sel $sel
    Add-Step -Num 1 -Text "Haz clic en 'Nuevo Material'" -Sel $sel; Add-Step -Num 2 -Text "Completa todos los campos del formulario" -Sel $sel; Add-Step -Num 3 -Text "Haz clic en 'Guardar'" -Sel $sel
    Add-Heading -Text "Editar material" -Level 2 -Sel $sel
    Add-Step -Num 1 -Text "Haz clic en el icono de lapiz" -Sel $sel; Add-Step -Num 2 -Text "Modifica los campos necesarios" -Sel $sel; Add-Step -Num 3 -Text "Haz clic en 'Guardar'" -Sel $sel
    Add-WarningBox -Text "NO puedes eliminar materiales del inventario. Solo el Administrador puede hacerlo." -Sel $sel

    Add-Heading -Text "Registrar Ingreso" -Level 1 -Sel $sel
    Add-Image -Path "$imgs\04-ingreso.png" -Width 270 -Sel $sel
    Add-Text -Text "Registra la entrada de materiales. El stock aumenta automaticamente." -Sel $sel
    Add-Step -Num 1 -Text "Ve a 'Ingreso' en el menu" -Sel $sel; Add-Step -Num 2 -Text "Selecciona el Material" -Sel $sel; Add-Step -Num 3 -Text "Ingresa la Cantidad" -Sel $sel; Add-Step -Num 4 -Text "Opcional: Proveedor y comprobante" -Sel $sel; Add-Step -Num 5 -Text "Haz clic en 'Registrar Ingreso'" -Sel $sel
    Add-TipBox -Text "Usa el boton 'Ver Inventario' para consultar stocks sin salir de la pagina." -Sel $sel

    Add-Heading -Text "Registrar Salida" -Level 1 -Sel $sel
    Add-Image -Path "$imgs\05-salida.png" -Width 270 -Sel $sel
    Add-Text -Text "Registra la salida de materiales. El stock disminuye." -Sel $sel
    Add-Step -Num 1 -Text "Ve a 'Salida' en el menu" -Sel $sel; Add-Step -Num 2 -Text "Selecciona el Material" -Sel $sel; Add-Step -Num 3 -Text "Ingresa la Cantidad" -Sel $sel; Add-Step -Num 4 -Text "Opcional: Destino y comprobante" -Sel $sel; Add-Step -Num 5 -Text "Haz clic en 'Registrar Salida'" -Sel $sel
    Add-WarningBox -Text "NO puedes registrar una salida si el stock es insuficiente." -Sel $sel

    Add-Heading -Text "Historial y Reportes" -Level 1 -Sel $sel
    Add-Image -Path "$imgs\07-reportes.png" -Width 300 -Sel $sel
    Add-Text -Text "Puedes consultar todos los movimientos y exportar reportes en PDF." -Sel $sel
    Add-Bullet -Text "Periodo: Esta semana, Este mes, Todo" -Sel $sel; Add-Bullet -Text "Tipo: Ingreso, Salida, Todos" -Sel $sel; Add-Bullet -Text "Material especifico" -Sel $sel
    Add-Heading -Text "Exportar a PDF" -Level 2 -Sel $sel
    Add-Step -Num 1 -Text "Aplica los filtros" -Sel $sel; Add-Step -Num 2 -Text "Haz clic en 'Exportar PDF'" -Sel $sel

    Add-Heading -Text "Resumen de Permisos - ALMACEN" -Level 1 -Sel $sel
    Add-PermisoTable -Rows @(@("Ver Dashboard","SI"),@("Ver Inventario","SI"),@("Buscar materiales","SI"),@("Agregar materiales","SI"),@("Editar materiales","SI"),@("Eliminar materiales","NO"),@("Registrar Ingreso","SI"),@("Registrar Salida","SI"),@("Realizar Ventas","NO"),@("Ver Reportes","SI"),@("Exportar PDF","SI"),@("Gestionar Usuarios","NO"),@("Ajustar Stock","NO")) -Sel $sel -Doc $w.Doc
    Add-Heading -Text "Lo que NO puedes hacer como ALMACEN" -Level 2 -Sel $sel
    Add-Bullet -Text "Eliminar materiales del inventario" -Sel $sel; Add-Bullet -Text "Gestionar usuarios del sistema" -Sel $sel; Add-Bullet -Text "Ajustar stock directamente" -Sel $sel; Add-Bullet -Text "Realizar ventas" -Sel $sel

    Add-Heading -Text "Solucion de Problemas" -Level 1 -Sel $sel
    Add-Text -Text "No puedo iniciar sesion:" -Bold $true -Sel $sel
    Add-Bullet -Text "Verifica tu usuario 'almacen' y contrasena" -Sel $sel; Add-Bullet -Text "Si tu cuenta fue desactivada, contacta al Admin" -Sel $sel
    Add-Text -Text "Error 'Stock insuficiente':" -Bold $true -Sel $sel
    Add-Bullet -Text "Revisa el stock actual en Inventario" -Sel $sel; Add-Bullet -Text "Registra un ingreso antes de la salida" -Sel $sel
    Add-Text -Text "No encuentro Usuarios:" -Bold $true -Sel $sel
    Add-Bullet -Text "Es normal, esa seccion es solo para Administradores" -Sel $sel

    Save-And-Close -W $w -Path "$baseDir\MANUAL-ALMACEN.docx"
}

# ============================================
# 3. MANUAL VENTAS
# ============================================
function Generate-VentasManual {
    $w = New-WordDoc
    $sel = $w.Sel; $script:doc = $w.Doc

    Add-Portada -Rol "VENDEDOR" -RolDesc "Registro de ventas y salidas del almacen" -RolIcon "" -Sel $sel
    Add-PageBreak -Sel $sel

    Add-Heading -Text "Indice" -Level 1 -Sel $sel
    foreach ($item in @("1.  Introduccion", "2.  Acceso al Sistema", "3.  Dashboard", "4.  Menu de Navegacion", "5.  Punto de Venta", "6.  Registrar Salida", "7.  Inventario (Consulta)", "8.  Historial y Reportes", "9.  Resumen de Permisos", "10. Solucion de Problemas")) { $sel.TypeText($item); $sel.TypeParagraph() }
    Add-PageBreak -Sel $sel

    Add-Heading -Text "Introduccion" -Level 1 -Sel $sel
    Add-Text -Text "Bienvenido al manual del Vendedor. Como usuario de VENTAS puedes realizar ventas a clientes, registrar salidas de materiales y consultar el inventario." -Sel $sel
    Add-Heading -Text "Credenciales de acceso" -Level 2 -Sel $sel
    Add-Table -Headers @("Usuario", "Contrasena", "Rol") -Rows @(@("ventas", "ventas123", "Vendedor")) -Sel $sel -Doc $w.Doc
    Add-Heading -Text "Funciones principales" -Level 2 -Sel $sel
    Add-Bullet -Text "Realizar ventas a clientes" -Sel $sel; Add-Bullet -Text "Registrar salidas de materiales" -Sel $sel; Add-Bullet -Text "Consultar inventario (solo lectura)" -Sel $sel; Add-Bullet -Text "Ver reportes y exportar PDF" -Sel $sel
    Add-Heading -Text "Funciones NO disponibles" -Level 2 -Sel $sel
    Add-Bullet -Text "Agregar, editar o eliminar materiales" -Sel $sel; Add-Bullet -Text "Registrar ingresos de materiales" -Sel $sel; Add-Bullet -Text "Gestionar usuarios" -Sel $sel

    Add-Seccion-Acceso -Sel $sel
    Add-Seccion-Dashboard -Sel $sel
    Add-Seccion-Menu -Sel $sel

    Add-Heading -Text "Punto de Venta" -Level 1 -Sel $sel
    Add-Image -Path "$imgs\06-ventas.png" -Width 300 -Sel $sel
    Add-Text -Text "El modulo de VENTAS es tu herramienta principal. Aqui registras las ventas a clientes." -Bold $true -Sel $sel
    Add-Step -Num 1 -Text "Ve a 'Venta' en el menu" -Sel $sel; Add-Step -Num 2 -Text "Ingresa el nombre del Cliente" -Sel $sel; Add-Step -Num 3 -Text "Selecciona un Producto del menu" -Sel $sel; Add-Step -Num 4 -Text "Se agrega al carrito automaticamente" -Sel $sel; Add-Step -Num 5 -Text "Repite para agregar mas productos" -Sel $sel; Add-Step -Num 6 -Text "Revisa el total en el carrito" -Sel $sel; Add-Step -Num 7 -Text "Haz clic en 'Finalizar Venta'" -Sel $sel
    Add-InfoBox -Text "Calculo automatico del total. Descuento de stock al finalizar." -Sel $sel
    Add-TipBox -Text "Siempre confirma el carrito antes de finalizar la venta." -Sel $sel

    Add-Heading -Text "Registrar Salida" -Level 1 -Sel $sel
    Add-Image -Path "$imgs\05-salida.png" -Width 270 -Sel $sel
    Add-Text -Text "Como VENTAS puedes registrar salidas de materiales del almacen." -Sel $sel
    Add-Step -Num 1 -Text "Ve a 'Salida' en el menu" -Sel $sel; Add-Step -Num 2 -Text "Selecciona el Material" -Sel $sel; Add-Step -Num 3 -Text "Ingresa la Cantidad a retirar" -Sel $sel; Add-Step -Num 4 -Text "Opcional: Destino del material" -Sel $sel; Add-Step -Num 5 -Text "Haz clic en 'Registrar Salida'" -Sel $sel
    Add-WarningBox -Text "SOLO puedes registrar SALIDAS. Ingreso NO esta disponible para tu rol." -Sel $sel
    Add-WarningBox -Text "No puedes registrar una salida si el stock es insuficiente." -Sel $sel

    Add-Heading -Text "Inventario (Solo Consulta)" -Level 1 -Sel $sel
    Add-Image -Path "$imgs\03-materiales.png" -Width 300 -Sel $sel
    Add-Text -Text "Como VENTAS puedes VER el inventario, pero NO puedes agregar, editar ni eliminar materiales." -Sel $sel
    Add-Text -Text "Usa el inventario para:" -Sel $sel
    Add-Bullet -Text "Consultar el stock disponible antes de una venta" -Sel $sel; Add-Bullet -Text "Verificar precios de los productos" -Sel $sel; Add-Bullet -Text "Revisar la ubicacion de los materiales" -Sel $sel
    Add-WarningBox -Text "Los botones de editar, eliminar y nuevo material NO estan disponibles para tu rol." -Sel $sel

    Add-Heading -Text "Historial y Reportes" -Level 1 -Sel $sel
    Add-Image -Path "$imgs\07-reportes.png" -Width 300 -Sel $sel
    Add-Text -Text "Puedes consultar los movimientos y exportar reportes en PDF." -Sel $sel
    Add-Bullet -Text "Filtro por periodo: Esta semana, Este mes, Todo" -Sel $sel; Add-Bullet -Text "Filtro por tipo: Ingreso, Salida, Todos" -Sel $sel
    Add-Heading -Text "Exportar a PDF" -Level 2 -Sel $sel
    Add-Step -Num 1 -Text "Aplica los filtros" -Sel $sel; Add-Step -Num 2 -Text "Haz clic en 'Exportar PDF'" -Sel $sel

    Add-Heading -Text "Resumen de Permisos - VENTAS" -Level 1 -Sel $sel
    Add-PermisoTable -Rows @(@("Ver Dashboard","SI"),@("Ver Inventario","SI (solo lectura)"),@("Buscar materiales","SI"),@("Agregar materiales","NO"),@("Editar materiales","NO"),@("Eliminar materiales","NO"),@("Registrar Ingreso","NO"),@("Registrar Salida","SI"),@("Realizar Ventas","SI"),@("Ver Reportes","SI"),@("Exportar PDF","SI"),@("Gestionar Usuarios","NO"),@("Ajustar Stock","NO")) -Sel $sel -Doc $w.Doc
    Add-Heading -Text "Lo que NO puedes hacer como VENTAS" -Level 2 -Sel $sel
    Add-Bullet -Text "Agregar, editar o eliminar materiales" -Sel $sel; Add-Bullet -Text "Registrar ingresos de materiales" -Sel $sel; Add-Bullet -Text "Gestionar usuarios" -Sel $sel; Add-Bullet -Text "Ajustar stock" -Sel $sel

    Add-Heading -Text "Solucion de Problemas" -Level 1 -Sel $sel
    Add-Text -Text "No puedo iniciar sesion:" -Bold $true -Sel $sel
    Add-Bullet -Text "Verifica usuario 'ventas' y contrasena" -Sel $sel; Add-Bullet -Text "Si tu cuenta fue desactivada, contacta al Admin" -Sel $sel
    Add-Text -Text "No encuentro 'Ingreso':" -Bold $true -Sel $sel
    Add-Bullet -Text "Es correcto, los vendedores no pueden registrar ingresos" -Sel $sel
    Add-Text -Text "Error al vender:" -Bold $true -Sel $sel
    Add-Bullet -Text "Verifica que haya stock suficiente" -Sel $sel; Add-Bullet -Text "Asegurate de seleccionar un producto" -Sel $sel
    Add-Text -Text "No puedo agregar materiales:" -Bold $true -Sel $sel
    Add-Bullet -Text "Es normal, solo puedes ver el inventario, no modificarlo" -Sel $sel

    Save-And-Close -W $w -Path "$baseDir\MANUAL-VENTAS.docx"
}

# ============================================
# EJECUTAR
# ============================================
Write-Host "Generando manuales de usuario por rol..."
Write-Host ""

Write-Host "[1/3] Generando manual de ADMINISTRADOR..."
Generate-AdminManual

Write-Host "[2/3] Generando manual de ALMACEN..."
Generate-AlmacenManual

Write-Host "[3/3] Generando manual de VENTAS..."
Generate-VentasManual

Write-Host ""
Write-Host "========================================"
Write-Host " LOS 3 MANUALES FUERON GENERADOS!"
Write-Host "========================================"
Write-Host ""
Write-Host "Archivos generados:"
Write-Host "  - $baseDir\MANUAL-ADMIN.docx"
Write-Host "  - $baseDir\MANUAL-ALMACEN.docx"
Write-Host "  - $baseDir\MANUAL-VENTAS.docx"
