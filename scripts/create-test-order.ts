/**
 * Script para crear una orden de prueba con código QR
 * Ejecutar: npx tsx scripts/create-test-order.ts
 */

import { PrismaClient } from '@prisma/client'
import { generateVerificationCode, generateOrderQRCode } from '../src/lib/qrcode'

const prisma = new PrismaClient()

async function createTestOrder() {
  try {
    console.log('🚀 Creando orden de prueba con código QR...\n')

    // 1. Buscar un usuario y pack existente
    const user = await prisma.user.findFirst({
      where: { role: 'CUSTOMER' }
    })

    if (!user) {
      console.error('❌ No se encontró ningún usuario CUSTOMER')
      console.log('💡 Crea un usuario primero desde la app')
      return
    }

    const pack = await prisma.pack.findFirst({
      where: { 
        isActive: true,
        quantity: { gt: 0 }
      },
      include: {
        establishment: true
      }
    })

    if (!pack) {
      console.error('❌ No se encontró ningún pack activo')
      console.log('💡 Crea un pack primero desde el dashboard del restaurante')
      return
    }

    console.log(`✅ Usuario encontrado: ${user.email}`)
    console.log(`✅ Pack encontrado: ${pack.title}`)
    console.log(`✅ Restaurante: ${pack.establishment.name}\n`)

    // 2. Generar código de verificación
    const verificationCode = generateVerificationCode()
    console.log(`🔐 Código de verificación: ${verificationCode}`)

    // 3. Crear la orden
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        packId: pack.id,
        quantity: 1,
        totalAmount: pack.discountedPrice,
        pickupDate: new Date(pack.availableFrom),
        status: 'CONFIRMED',
        verificationCode: verificationCode,
        stripePaymentId: 'test_payment_' + Date.now(),
      },
      include: {
        pack: {
          include: {
            establishment: true
          }
        },
        user: true
      }
    })

    console.log(`✅ Orden creada: ${order.id}\n`)

    // 4. Generar código QR
    const qrCodeDataURL = await generateOrderQRCode(order.id, verificationCode)
    console.log(`✅ Código QR generado (${(qrCodeDataURL.length / 1024).toFixed(2)} KB)\n`)

    // 5. Crear HTML con el QR
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Orden de Prueba - ${order.id}</title>
  <style>
    body { 
      font-family: Arial, sans-serif; 
      max-width: 600px;
      margin: 50px auto;
      padding: 20px;
      background: #f5f5f5;
    }
    .email-container {
      background: white;
      padding: 30px;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    h1 { color: #10b981; }
    .qr-section {
      text-align: center;
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      border: 2px solid #f59e0b;
      padding: 25px;
      border-radius: 12px;
      margin: 25px 0;
    }
    .code {
      font-family: monospace;
      font-size: 24px;
      color: #f59e0b;
      font-weight: bold;
      letter-spacing: 3px;
      margin: 15px 0;
    }
    .info { 
      background: #f8fafc;
      border: 2px solid #e2e8f0;
      padding: 20px;
      border-radius: 8px;
      margin: 15px 0;
    }
    .info p { margin: 8px 0; }
    .test-section {
      background: #dbeafe;
      border: 2px solid #3b82f6;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .test-section h3 { color: #1e40af; margin-top: 0; }
    code {
      background: #1f2937;
      color: #10b981;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <h1>🎉 ¡Orden de Prueba Creada!</h1>
    
    <div class="info">
      <h3>📦 Detalles de la Orden</h3>
      <p><strong>ID:</strong> ${order.id}</p>
      <p><strong>Cliente:</strong> ${order.user.name || order.user.email}</p>
      <p><strong>Pack:</strong> ${order.pack.title}</p>
      <p><strong>Restaurante:</strong> ${order.pack.establishment.name}</p>
      <p><strong>Cantidad:</strong> ${order.quantity}</p>
      <p><strong>Total:</strong> $${order.totalAmount.toLocaleString('es-CO')}</p>
      <p><strong>Estado:</strong> ${order.status}</p>
    </div>
    
    <div class="qr-section">
      <h2>📱 Código de Verificación</h2>
      <p>Presenta este código QR al restaurante:</p>
      <img src="${qrCodeDataURL}" alt="QR Code" style="width: 250px; height: 250px; margin: 15px 0;" />
      <div class="code">${verificationCode}</div>
      <p style="color: #6b7280; font-size: 13px;">El restaurante escaneará este código para confirmar tu pedido</p>
    </div>

    <div class="test-section">
      <h3>🧪 Prueba el API</h3>
      <p><strong>1. Consultar la orden (GET):</strong></p>
      <code>GET http://localhost:3000/api/orders/verify?code=${verificationCode}</code>
      
      <p style="margin-top: 15px;"><strong>2. Verificar la orden (POST):</strong></p>
      <code>POST http://localhost:3000/api/orders/verify</code>
      <pre style="background: #1f2937; color: #10b981; padding: 10px; border-radius: 4px; overflow-x: auto;">
{
  "verificationCode": "${verificationCode}"
}</pre>
      
      <p style="margin-top: 15px;"><strong>3. Con cURL:</strong></p>
      <pre style="background: #1f2937; color: #10b981; padding: 10px; border-radius: 4px; overflow-x: auto; font-size: 12px;">
curl -X POST http://localhost:3000/api/orders/verify \\
  -H "Content-Type: application/json" \\
  -d '{"verificationCode":"${verificationCode}"}'</pre>
    </div>

    <div class="info">
      <h3>ℹ️ Información Importante</h3>
      <p>• Esta es una orden de prueba en estado CONFIRMED</p>
      <p>• Necesitas estar autenticado como el dueño del restaurante para verificarla</p>
      <p>• El restaurante es: <strong>${order.pack.establishment.name}</strong></p>
      <p>• Usuario del restaurante: <strong>${order.pack.establishment.userId}</strong></p>
    </div>
  </div>
</body>
</html>
    `

    const fs = require('fs')
    fs.writeFileSync('test-order-qr.html', htmlContent)

    // 6. Resumen
    console.log('=' .repeat(60))
    console.log('✅ ORDEN DE PRUEBA CREADA EXITOSAMENTE')
    console.log('=' .repeat(60))
    console.log(`\n📋 Información de la orden:`)
    console.log(`   Order ID: ${order.id}`)
    console.log(`   Código QR: ${verificationCode}`)
    console.log(`   Cliente: ${order.user.email}`)
    console.log(`   Restaurante: ${order.pack.establishment.name}`)
    console.log(`   Estado: ${order.status}`)
    console.log(`\n💡 Archivo generado: test-order-qr.html`)
    console.log(`   Abre este archivo en tu navegador para ver el QR\n`)
    console.log(`🧪 Para probar la verificación:`)
    console.log(`   1. Inicia sesión como el dueño del restaurante`)
    console.log(`   2. Usa el código: ${verificationCode}`)
    console.log(`   3. POST /api/orders/verify con el código\n`)

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestOrder()
