/**
 * Script para probar los métodos de pago disponibles en MercadoPago
 * 
 * Uso: npx tsx scripts/test-payment-methods.ts
 */

import { MercadoPagoConfig, PaymentMethod } from 'mercadopago';

// Configuración
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
  options: {
    timeout: 5000,
  }
});

async function getPaymentMethods() {
  console.log('🔍 Obteniendo métodos de pago disponibles...\n');

  try {
    // Verificar credenciales
    if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
      throw new Error('MERCADOPAGO_ACCESS_TOKEN no configurado');
    }

    const paymentMethod = new PaymentMethod(client);
    const methods = await paymentMethod.get();

    console.log('✅ Métodos de pago obtenidos exitosamente\n');
    console.log(`📊 Total de métodos disponibles: ${methods.length}\n`);

    // Agrupar por tipo
    const methodsByType = methods.reduce((acc: any, method: any) => {
      const type = method.payment_type_id;
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(method);
      return acc;
    }, {});

    // Mostrar resumen por tipo
    console.log('📋 Resumen por tipo de pago:');
    Object.keys(methodsByType).forEach(type => {
      console.log(`   ${getPaymentTypeIcon(type)} ${getPaymentTypeName(type)}: ${methodsByType[type].length} métodos`);
    });

    console.log('\n💳 Detalle de métodos de pago:\n');

    // Mostrar detalles de cada tipo
    Object.keys(methodsByType).forEach(type => {
      console.log(`\n${getPaymentTypeIcon(type)} ${getPaymentTypeName(type).toUpperCase()}:`);
      console.log('─'.repeat(50));
      
      methodsByType[type].forEach((method: any) => {
        console.log(`  • ${method.name} (${method.id})`);
        console.log(`    Status: ${method.status}`);
        console.log(`    Procesamiento: ${method.processing_mode}`);
        if (method.min_amount) {
          console.log(`    Monto mínimo: $${method.min_amount}`);
        }
        if (method.max_amount) {
          console.log(`    Monto máximo: $${method.max_amount}`);
        }
        console.log('');
      });
    });

    // Generar configuración para la app
    console.log('\n⚙️ Configuración sugerida para tu app:\n');
    
    const config = {
      credit_card: methodsByType.credit_card?.map((m: any) => ({
        id: m.id,
        name: m.name,
        thumbnail: m.thumbnail,
        secure_thumbnail: m.secure_thumbnail
      })) || [],
      debit_card: methodsByType.debit_card?.map((m: any) => ({
        id: m.id,
        name: m.name,
        thumbnail: m.thumbnail,
        secure_thumbnail: m.secure_thumbnail
      })) || [],
      digital_wallet: methodsByType.digital_wallet?.map((m: any) => ({
        id: m.id,
        name: m.name,
        thumbnail: m.thumbnail,
        secure_thumbnail: m.secure_thumbnail
      })) || [],
      bank_transfer: methodsByType.bank_transfer?.map((m: any) => ({
        id: m.id,
        name: m.name,
        thumbnail: m.thumbnail,
        secure_thumbnail: m.secure_thumbnail
      })) || []
    };

    console.log(JSON.stringify(config, null, 2));

    // Mostrar métodos más populares
    console.log('\n🌟 Métodos más populares recomendados:\n');
    
    const popularMethods = methods.filter((m: any) => 
      ['visa', 'master', 'amex', 'mercadopago', 'rapipago', 'pagofacil'].includes(m.id)
    );

    popularMethods.forEach((method: any) => {
      console.log(`  ${getPaymentTypeIcon(method.payment_type_id)} ${method.name}`);
    });

  } catch (error: any) {
    console.error('\n❌ Error obteniendo métodos de pago:');
    console.error(`   ${error.message}`);
    
    if (error.status) {
      console.error(`   Status: ${error.status}`);
    }
    
    console.log('\n🔧 Posibles soluciones:');
    console.log('   1. Verifica que el ACCESS_TOKEN esté configurado');
    console.log('   2. Asegúrate de usar credenciales válidas');
    console.log('   3. Revisa la conexión a internet');
    
    process.exit(1);
  }
}

function getPaymentTypeIcon(type: string): string {
  const icons: { [key: string]: string } = {
    'credit_card': '💳',
    'debit_card': '💳',
    'digital_wallet': '📱',
    'bank_transfer': '🏦',
    'ticket': '🎫',
    'atm': '🏧',
    'prepaid_card': '💰'
  };
  return icons[type] || '💸';
}

function getPaymentTypeName(type: string): string {
  const names: { [key: string]: string } = {
    'credit_card': 'Tarjetas de Crédito',
    'debit_card': 'Tarjetas de Débito',
    'digital_wallet': 'Billeteras Digitales',
    'bank_transfer': 'Transferencias Bancarias',
    'ticket': 'Pagos en Efectivo',
    'atm': 'Cajeros Automáticos',
    'prepaid_card': 'Tarjetas Prepagas'
  };
  return names[type] || type;
}

// Ejecutar si es el archivo principal
if (require.main === module) {
  getPaymentMethods();
}

export { getPaymentMethods };
