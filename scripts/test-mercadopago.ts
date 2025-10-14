/**
 * Script de prueba para verificar la integración de Mercado Pago
 * 
 * Uso: npx tsx scripts/test-mercadopago.ts
 */

import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';

// Configuración
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
  options: {
    timeout: 5000,
  }
});

async function testMercadoPagoIntegration() {
  console.log('🧪 Iniciando pruebas de Mercado Pago...\n');

  try {
    // Test 1: Verificar credenciales
    console.log('1️⃣ Verificando credenciales...');
    
    if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
      throw new Error('MERCADOPAGO_ACCESS_TOKEN no configurado');
    }
    
    if (!process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY) {
      throw new Error('NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY no configurado');
    }
    
    console.log('✅ Credenciales configuradas correctamente\n');

    // Test 2: Crear preferencia de prueba
    console.log('2️⃣ Creando preferencia de prueba...');
    
    const preference = new Preference(client);
    
    const preferenceData = {
      items: [
        {
          id: 'test_item_1',
          title: 'Pack de Prueba TugoTugo',
          description: 'Item de prueba para verificar integración',
          quantity: 1,
          unit_price: 100.00,
          currency_id: 'ARS'
        }
      ],
      payer: {
        email: 'test_user@example.com',
        name: 'Usuario de Prueba'
      },
      back_urls: {
        success: 'https://tugotug.com/payment/success',
        failure: 'https://tugotug.com/payment/failure',
        pending: 'https://tugotug.com/payment/pending'
      },
      auto_return: 'approved',
      external_reference: `test_order_${Date.now()}`,
      notification_url: 'https://tugotug.com/api/mercadopago/webhook'
    };

    const result = await preference.create({ body: preferenceData });
    
    console.log('✅ Preferencia creada exitosamente');
    console.log(`   ID: ${result.id}`);
    console.log(`   Sandbox URL: ${result.sandbox_init_point}`);
    console.log(`   Production URL: ${result.init_point}\n`);

    // Test 3: Verificar estructura de respuesta
    console.log('3️⃣ Verificando estructura de respuesta...');
    
    const requiredFields = ['id', 'init_point', 'sandbox_init_point'] as const;
    const missingFields = requiredFields.filter(field => !(result as any)[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Campos faltantes en respuesta: ${missingFields.join(', ')}`);
    }
    
    console.log('✅ Estructura de respuesta correcta\n');

    // Test 4: Simular consulta de pago (esto fallará porque no hay pago real)
    console.log('4️⃣ Probando consulta de pago...');
    
    try {
      const payment = new Payment(client);
      // Intentamos obtener un pago que no existe para probar la conexión
      await payment.get({ id: '999999999' });
    } catch (error: any) {
      if (error.message?.includes('not found') || error.status === 404) {
        console.log('✅ API de pagos responde correctamente (404 esperado)\n');
      } else {
        throw error;
      }
    }

    // Test 5: Verificar configuración de entorno
    console.log('5️⃣ Verificando configuración de entorno...');
    
    const isTestEnvironment = process.env.MERCADOPAGO_ACCESS_TOKEN?.startsWith('TEST-');
    
    if (isTestEnvironment) {
      console.log('✅ Configurado para entorno de PRUEBAS (correcto para desarrollo)');
    } else {
      console.log('⚠️  Configurado para entorno de PRODUCCIÓN');
      console.log('   Asegúrate de que esto sea intencional');
    }
    
    console.log('\n🎉 Todas las pruebas pasaron exitosamente!');
    console.log('\n📋 Resumen:');
    console.log(`   • Entorno: ${isTestEnvironment ? 'PRUEBAS' : 'PRODUCCIÓN'}`);
    console.log(`   • Preferencia ID: ${result.id}`);
    console.log(`   • External Reference: ${preferenceData.external_reference}`);
    console.log('\n🚀 La integración está lista para usar!');

  } catch (error: any) {
    console.error('\n❌ Error en las pruebas:');
    console.error(`   ${error.message}`);
    
    if (error.status) {
      console.error(`   Status: ${error.status}`);
    }
    
    if (error.cause) {
      console.error(`   Causa: ${error.cause}`);
    }
    
    console.log('\n🔧 Posibles soluciones:');
    console.log('   1. Verifica que las variables de entorno estén configuradas');
    console.log('   2. Asegúrate de usar credenciales de TEST en desarrollo');
    console.log('   3. Revisa la conexión a internet');
    console.log('   4. Consulta la documentación en MERCADOPAGO_INTEGRATION.md');
    
    process.exit(1);
  }
}

// Función para mostrar información de configuración
function showConfiguration() {
  console.log('⚙️ Configuración actual:');
  console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Access Token: ${process.env.MERCADOPAGO_ACCESS_TOKEN ? '✅ Configurado' : '❌ No configurado'}`);
  console.log(`   Public Key: ${process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY ? '✅ Configurado' : '❌ No configurado'}`);
  console.log(`   Webhook Secret: ${process.env.MERCADOPAGO_WEBHOOK_SECRET ? '✅ Configurado' : '❌ No configurado'}`);
  console.log('');
}

// Ejecutar pruebas
if (require.main === module) {
  showConfiguration();
  testMercadoPagoIntegration();
}

export { testMercadoPagoIntegration };
