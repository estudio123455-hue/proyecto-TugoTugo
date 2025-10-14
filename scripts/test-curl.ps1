# Script simple para probar la API de MercadoPago con curl
# Uso: .\scripts\test-curl.ps1 -AccessToken "TEST-tu-token-aqui"

param(
    [Parameter(Mandatory=$true)]
    [string]$AccessToken
)

Write-Host "Probando API de MercadoPago..." -ForegroundColor Cyan
Write-Host ""

# Verificar si curl está disponible
try {
    $curlVersion = curl --version 2>$null
    if (-not $curlVersion) {
        throw "curl no encontrado"
    }
} catch {
    Write-Host "Error: curl no está disponible en este sistema" -ForegroundColor Red
    Write-Host "Instalando curl..." -ForegroundColor Yellow
    
    # Intentar usar Invoke-WebRequest como alternativa
    Write-Host "Usando Invoke-WebRequest como alternativa..." -ForegroundColor Yellow
    
    try {
        $headers = @{
            'Authorization' = "Bearer $AccessToken"
            'Content-Type' = 'application/json'
        }
        
        $response = Invoke-WebRequest -Uri "https://api.mercadopago.com/v1/payment_methods" -Headers $headers -Method GET
        $data = $response.Content | ConvertFrom-Json
        
        Write-Host "Respuesta exitosa!" -ForegroundColor Green
        Write-Host "Total de métodos: $($data.Count)" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Primeros 5 métodos:" -ForegroundColor Cyan
        
        $data | Select-Object -First 5 | ForEach-Object {
            Write-Host "  - $($_.name) ($($_.id)) - Tipo: $($_.payment_type_id)" -ForegroundColor White
        }
        
        Write-Host ""
        Write-Host "Respuesta JSON completa guardada en: payment-methods-response.json" -ForegroundColor Green
        $response.Content | Out-File -FilePath "payment-methods-response.json" -Encoding UTF8
        
    } catch {
        Write-Host "Error con Invoke-WebRequest:" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
        exit 1
    }
    
    exit 0
}

# Usar curl si está disponible
Write-Host "Usando curl para hacer la petición..." -ForegroundColor Green

$curlCommand = @"
curl -X GET "https://api.mercadopago.com/v1/payment_methods" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AccessToken" \
  -o payment-methods-response.json \
  -w "Status: %{http_code}\nTime: %{time_total}s\n"
"@

Write-Host "Ejecutando comando:" -ForegroundColor Yellow
Write-Host $curlCommand -ForegroundColor Gray
Write-Host ""

# Ejecutar curl
$result = cmd /c "curl -X GET `"https://api.mercadopago.com/v1/payment_methods`" -H `"Content-Type: application/json`" -H `"Authorization: Bearer $AccessToken`" -o payment-methods-response.json -w `"Status: %{http_code}\nTime: %{time_total}s\n`""

Write-Host "Resultado:" -ForegroundColor Cyan
Write-Host $result -ForegroundColor White

# Verificar si el archivo se creó
if (Test-Path "payment-methods-response.json") {
    Write-Host ""
    Write-Host "Archivo creado exitosamente!" -ForegroundColor Green
    
    # Leer y mostrar el contenido
    try {
        $content = Get-Content "payment-methods-response.json" -Raw | ConvertFrom-Json
        Write-Host "Total de métodos obtenidos: $($content.Count)" -ForegroundColor Yellow
        
        Write-Host ""
        Write-Host "Métodos disponibles:" -ForegroundColor Cyan
        $content | Select-Object -First 10 | ForEach-Object {
            Write-Host "  - $($_.name) ($($_.id))" -ForegroundColor White
        }
        
        if ($content.Count -gt 10) {
            Write-Host "  ... y $($content.Count - 10) métodos más" -ForegroundColor Gray
        }
        
    } catch {
        Write-Host "Error leyendo el archivo JSON:" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
        
        # Mostrar contenido raw
        Write-Host ""
        Write-Host "Contenido raw del archivo:" -ForegroundColor Yellow
        Get-Content "payment-methods-response.json" | Write-Host -ForegroundColor Gray
    }
} else {
    Write-Host ""
    Write-Host "Error: No se pudo crear el archivo de respuesta" -ForegroundColor Red
}

Write-Host ""
Write-Host "Prueba completada!" -ForegroundColor Green
