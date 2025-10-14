# Script de PowerShell para probar métodos de pago de MercadoPago
# Uso: .\scripts\test-payment-methods.ps1

param(
    [Parameter(Mandatory=$true)]
    [string]$AccessToken
)

Write-Host "🔍 Obteniendo métodos de pago disponibles..." -ForegroundColor Cyan
Write-Host ""

try {
    # Configurar headers
    $headers = @{
        'Content-Type' = 'application/json'
        'Authorization' = "Bearer $AccessToken"
    }

    # Hacer la petición
    $response = Invoke-RestMethod -Uri "https://api.mercadopago.com/v1/payment_methods" -Method GET -Headers $headers

    Write-Host "✅ Métodos de pago obtenidos exitosamente" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Total de métodos disponibles: $($response.Count)" -ForegroundColor Yellow
    Write-Host ""

    # Agrupar por tipo
    $methodsByType = $response | Group-Object payment_type_id

    Write-Host "📋 Resumen por tipo de pago:" -ForegroundColor Cyan
    foreach ($group in $methodsByType) {
        $icon = switch ($group.Name) {
            'credit_card' { '💳' }
            'debit_card' { '💳' }
            'digital_wallet' { '📱' }
            'bank_transfer' { '🏦' }
            'ticket' { '🎫' }
            'atm' { '🏧' }
            default { '💸' }
        }
        
        $typeName = switch ($group.Name) {
            'credit_card' { 'Tarjetas de Crédito' }
            'debit_card' { 'Tarjetas de Débito' }
            'digital_wallet' { 'Billeteras Digitales' }
            'bank_transfer' { 'Transferencias Bancarias' }
            'ticket' { 'Pagos en Efectivo' }
            'atm' { 'Cajeros Automáticos' }
            default { $group.Name }
        }
        
        Write-Host "   $icon $typeName`: $($group.Count) métodos" -ForegroundColor White
    }

    Write-Host ""
    Write-Host "💳 Detalle de métodos de pago:" -ForegroundColor Cyan
    Write-Host ""

    foreach ($group in $methodsByType) {
        $icon = switch ($group.Name) {
            'credit_card' { '💳' }
            'debit_card' { '💳' }
            'digital_wallet' { '📱' }
            'bank_transfer' { '🏦' }
            'ticket' { '🎫' }
            'atm' { '🏧' }
            default { '💸' }
        }
        
        $typeName = switch ($group.Name) {
            'credit_card' { 'TARJETAS DE CRÉDITO' }
            'debit_card' { 'TARJETAS DE DÉBITO' }
            'digital_wallet' { 'BILLETERAS DIGITALES' }
            'bank_transfer' { 'TRANSFERENCIAS BANCARIAS' }
            'ticket' { 'PAGOS EN EFECTIVO' }
            'atm' { 'CAJEROS AUTOMÁTICOS' }
            default { $group.Name.ToUpper() }
        }

        Write-Host ""
        Write-Host "$icon $typeName" -ForegroundColor Yellow
        Write-Host ("-" * 50) -ForegroundColor Gray
        
        foreach ($method in $group.Group) {
            Write-Host "  • $($method.name) ($($method.id))" -ForegroundColor White
            Write-Host "    Status: $($method.status)" -ForegroundColor Gray
            if ($method.processing_modes) {
                Write-Host "    Procesamiento: $($method.processing_modes -join ', ')" -ForegroundColor Gray
            }
            if ($method.min_allowed_amount) {
                Write-Host "    Monto mínimo: `$$($method.min_allowed_amount)" -ForegroundColor Gray
            }
            if ($method.max_allowed_amount) {
                Write-Host "    Monto máximo: `$$($method.max_allowed_amount)" -ForegroundColor Gray
            }
            Write-Host ""
        }
    }

    # Métodos más populares
    Write-Host "🌟 Métodos más populares recomendados:" -ForegroundColor Cyan
    Write-Host ""
    
    $popularIds = @('visa', 'master', 'amex', 'mercadopago', 'rapipago', 'pagofacil')
    $popularMethods = $response | Where-Object { $_.id -in $popularIds }
    
    foreach ($method in $popularMethods) {
        $icon = switch ($method.payment_type_id) {
            'credit_card' { '💳' }
            'debit_card' { '💳' }
            'digital_wallet' { '📱' }
            'bank_transfer' { '🏦' }
            'ticket' { '🎫' }
            default { '💸' }
        }
        Write-Host "  $icon $($method.name)" -ForegroundColor White
    }

    # Generar configuración JSON
    Write-Host ""
    Write-Host "⚙️ Configuración JSON para tu app:" -ForegroundColor Cyan
    Write-Host ""
    
    $config = @{}
    foreach ($group in $methodsByType) {
        $config[$group.Name] = @($group.Group | ForEach-Object {
            @{
                id = $_.id
                name = $_.name
                thumbnail = $_.thumbnail
                secure_thumbnail = $_.secure_thumbnail
            }
        })
    }
    
    $jsonConfig = $config | ConvertTo-Json -Depth 3
    Write-Host $jsonConfig -ForegroundColor Gray

    Write-Host ""
    Write-Host "🎉 ¡Prueba completada exitosamente!" -ForegroundColor Green

} catch {
    Write-Host ""
    Write-Host "❌ Error obteniendo métodos de pago:" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        Write-Host "   Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "🔧 Posibles soluciones:" -ForegroundColor Yellow
    Write-Host "   1. Verifica que el ACCESS_TOKEN sea válido" -ForegroundColor White
    Write-Host "   2. Asegúrate de usar credenciales de TEST en desarrollo" -ForegroundColor White
    Write-Host "   3. Revisa la conexión a internet" -ForegroundColor White
    Write-Host "   4. Confirma que el token no haya expirado" -ForegroundColor White
    
    exit 1
}

Write-Host ""
Write-Host "📝 Uso del script:" -ForegroundColor Cyan
Write-Host "   .\scripts\test-payment-methods.ps1 -AccessToken 'TEST-tu-token-aqui'" -ForegroundColor White
