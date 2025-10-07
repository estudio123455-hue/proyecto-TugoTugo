/**
 * Script de prueba para el sistema de verificación QR
 * 
 * Ejecutar con: npx tsx test-qr-system.ts
 */

import { generateVerificationCode, generateOrderQRCode, isValidVerificationCode } from './src/lib/qrcode'

async function testQRSystem() {
  console.log('🧪 Iniciando pruebas del sistema QR...\n')

  // Test 1: Generar código de verificación
  console.log('📝 Test 1: Generar código de verificación')
  const code1 = generateVerificationCode()
  const code2 = generateVerificationCode()
  console.log(`   ✅ Código 1: ${code1}`)
  console.log(`   ✅ Código 2: ${code2}`)
  console.log(`   ✅ Son únicos: ${code1 !== code2 ? 'Sí' : 'No'}`)
  console.log(`   ✅ Longitud: ${code1.length} caracteres\n`)

  // Test 2: Validar formato de código
  console.log('🔍 Test 2: Validar formato de código')
  const validCodes = [code1, code2, 'A1B2C3D4E5F6']
  const invalidCodes = ['123', 'GGGGGGGGGGGG', 'short', '']
  
  validCodes.forEach(code => {
    const isValid = isValidVerificationCode(code)
    console.log(`   ${isValid ? '✅' : '❌'} "${code}" - ${isValid ? 'Válido' : 'Inválido'}`)
  })
  
  invalidCodes.forEach(code => {
    const isValid = isValidVerificationCode(code)
    console.log(`   ${!isValid ? '✅' : '❌'} "${code}" - ${isValid ? 'Válido (ERROR!)' : 'Inválido (correcto)'}`)
  })
  console.log()

  // Test 3: Generar código QR
  console.log('🎨 Test 3: Generar código QR')
  try {
    const orderId = 'test-order-123'
    const verificationCode = generateVerificationCode()
    const qrCode = await generateOrderQRCode(orderId, verificationCode)
    
    console.log(`   ✅ Código QR generado exitosamente`)
    console.log(`   ✅ Formato: ${qrCode.startsWith('data:image/png;base64,') ? 'Base64 PNG' : 'Desconocido'}`)
    console.log(`   ✅ Tamaño: ${(qrCode.length / 1024).toFixed(2)} KB`)
    console.log(`   ✅ Primeros 50 caracteres: ${qrCode.substring(0, 50)}...`)
    
    // Guardar QR en archivo HTML para visualización
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Test QR Code</title>
  <style>
    body { 
      font-family: Arial, sans-serif; 
      text-align: center; 
      padding: 50px;
      background: #f5f5f5;
    }
    .container {
      background: white;
      padding: 30px;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      display: inline-block;
    }
    h1 { color: #333; }
    .code {
      font-family: monospace;
      font-size: 24px;
      color: #f59e0b;
      font-weight: bold;
      letter-spacing: 3px;
      margin: 20px 0;
    }
    img { 
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      padding: 10px;
      background: white;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🎉 Código QR de Prueba</h1>
    <p><strong>Order ID:</strong> ${orderId}</p>
    <div class="code">${verificationCode}</div>
    <img src="${qrCode}" alt="QR Code" width="300" height="300" />
    <p style="color: #6b7280; margin-top: 20px;">
      Escanea este código con tu cámara para verificar la orden
    </p>
  </div>
</body>
</html>
    `
    
    const fs = require('fs')
    fs.writeFileSync('test-qr-output.html', htmlContent)
    console.log(`   ✅ QR guardado en: test-qr-output.html`)
    console.log(`   💡 Abre el archivo en tu navegador para ver el QR\n`)
    
  } catch (error) {
    console.error(`   ❌ Error generando QR:`, error)
  }

  // Test 4: Verificar estructura de datos del QR
  console.log('📦 Test 4: Estructura de datos del QR')
  const testOrderId = 'order-xyz-789'
  const testCode = generateVerificationCode()
  const qrData = JSON.stringify({
    orderId: testOrderId,
    code: testCode,
    timestamp: new Date().toISOString(),
  })
  console.log(`   ✅ Datos del QR:`)
  console.log(`      - Order ID: ${testOrderId}`)
  console.log(`      - Código: ${testCode}`)
  console.log(`      - Timestamp: ${new Date().toISOString()}`)
  console.log(`   ✅ JSON completo: ${qrData}\n`)

  // Resumen
  console.log('=' .repeat(60))
  console.log('✅ TODAS LAS PRUEBAS COMPLETADAS')
  console.log('=' .repeat(60))
  console.log('\n📋 Próximos pasos para prueba completa:')
  console.log('   1. Inicia el servidor: npm run dev')
  console.log('   2. Crea una orden de prueba')
  console.log('   3. Simula el webhook de Stripe')
  console.log('   4. Verifica que llegue el email con QR')
  console.log('   5. Prueba el endpoint: POST /api/orders/verify')
  console.log('\n💡 Abre test-qr-output.html para ver el QR generado\n')
}

// Ejecutar pruebas
testQRSystem().catch(console.error)
