# Script de configuración para las nuevas funcionalidades del panel de administración
# Ejecutar desde la raíz del proyecto: .\scripts\setup-admin-features.ps1

Write-Host "🚀 Configurando nuevas funcionalidades del panel de administración..." -ForegroundColor Green
Write-Host ""

# 1. Verificar que estamos en el directorio correcto
if (-Not (Test-Path "package.json")) {
    Write-Host "❌ Error: Ejecuta este script desde la raíz del proyecto" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Directorio correcto verificado" -ForegroundColor Green

# 2. Generar cliente Prisma
Write-Host ""
Write-Host "📦 Generando cliente Prisma..." -ForegroundColor Cyan
npx prisma generate

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Cliente Prisma generado correctamente" -ForegroundColor Green
} else {
    Write-Host "❌ Error al generar cliente Prisma" -ForegroundColor Red
    exit 1
}

# 3. Ejecutar migración
Write-Host ""
Write-Host "🗄️  Ejecutando migración de base de datos..." -ForegroundColor Cyan
Write-Host "   Esto creará la tabla AuditLog" -ForegroundColor Yellow

npx prisma migrate dev --name add_audit_log

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Migración ejecutada correctamente" -ForegroundColor Green
} else {
    Write-Host "⚠️  Advertencia: La migración puede haber fallado" -ForegroundColor Yellow
    Write-Host "   Si la tabla ya existe, esto es normal" -ForegroundColor Yellow
}

# 4. Verificar variables de entorno
Write-Host ""
Write-Host "🔍 Verificando variables de entorno..." -ForegroundColor Cyan

if (Test-Path ".env") {
    $envContent = Get-Content ".env" -Raw
    
    $requiredVars = @(
        "DATABASE_URL",
        "NEXTAUTH_SECRET",
        "EMAIL_SERVER_HOST",
        "EMAIL_SERVER_USER",
        "EMAIL_SERVER_PASSWORD"
    )
    
    $missingVars = @()
    foreach ($var in $requiredVars) {
        if ($envContent -notmatch $var) {
            $missingVars += $var
        }
    }
    
    if ($missingVars.Count -eq 0) {
        Write-Host "✅ Todas las variables de entorno están configuradas" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Variables de entorno faltantes:" -ForegroundColor Yellow
        foreach ($var in $missingVars) {
            Write-Host "   - $var" -ForegroundColor Yellow
        }
        Write-Host ""
        Write-Host "   Consulta el archivo env.example para más detalles" -ForegroundColor Cyan
    }
} else {
    Write-Host "⚠️  Archivo .env no encontrado" -ForegroundColor Yellow
    Write-Host "   Copia env.example a .env y configura las variables" -ForegroundColor Cyan
}

# 5. Resumen
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✨ Configuración completada!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Funcionalidades disponibles:" -ForegroundColor White
Write-Host "   ✅ Creación de restaurantes, posts y packs" -ForegroundColor Green
Write-Host "   ✅ Exportación de datos a CSV" -ForegroundColor Green
Write-Host "   ✅ Reportes y gráficas avanzadas" -ForegroundColor Green
Write-Host "   ✅ Notificaciones por email" -ForegroundColor Green
Write-Host "   ✅ Logs de auditoría" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Próximos pasos:" -ForegroundColor White
Write-Host "   1. Configura las variables de email en .env" -ForegroundColor Cyan
Write-Host "   2. Ejecuta: npm run dev" -ForegroundColor Cyan
Write-Host "   3. Accede a: http://localhost:3000/admin" -ForegroundColor Cyan
Write-Host ""
Write-Host "📚 Documentación:" -ForegroundColor White
Write-Host "   - ADMIN_FEATURES_GUIDE.md" -ForegroundColor Cyan
Write-Host "   - IMPLEMENTATION_SUMMARY.md" -ForegroundColor Cyan
Write-Host ""
