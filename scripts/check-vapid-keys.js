/**
 * Script para diagnosticar claves VAPID existentes
 * Ejecutar con: node scripts/check-vapid-keys.js
 */

require('dotenv').config({ path: '.env.local' })

const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
const privateKey = process.env.VAPID_PRIVATE_KEY

console.log('🔍 Diagnóstico de Claves VAPID\n')

if (!publicKey) {
  console.log('❌ NEXT_PUBLIC_VAPID_PUBLIC_KEY no encontrada')
  console.log('💡 Ejecuta: node scripts/generate-vapid-keys.js\n')
  return
}

if (!privateKey) {
  console.log('❌ VAPID_PRIVATE_KEY no encontrada')
  console.log('💡 Ejecuta: node scripts/generate-vapid-keys.js\n')
  return
}

console.log('✅ Ambas claves encontradas\n')

// Analizar clave pública
try {
  const buffer = Buffer.from(publicKey, 'base64url')
  
  console.log('📊 Análisis de Clave Pública:')
  console.log(`📏 Longitud: ${buffer.length} bytes`)
  
  if (buffer.length === 65 && buffer[0] === 0x04) {
    console.log('📋 Formato: Sin comprimir (65 bytes, prefijo 04)')
    console.log('✅ Compatible con VAPID')
    console.log('ℹ️  Se convertirá automáticamente a raw cuando sea necesario')
    
    // Mostrar versión raw
    const rawBuffer = buffer.slice(1)
    const rawKey = rawBuffer.toString('base64url')
    console.log('\n🔧 Versión RAW (64 bytes):')
    console.log(`RAW_KEY="${rawKey}"`)
    
  } else if (buffer.length === 64) {
    console.log('📋 Formato: Raw (64 bytes)')
    console.log('✅ Formato perfecto para sistemas que requieren raw')
    
  } else if (buffer.length === 33) {
    console.log('📋 Formato: Comprimido (33 bytes)')
    console.log('❌ NO compatible con VAPID')
    console.log('💡 Genera nuevas claves con: node scripts/generate-vapid-keys.js')
    
  } else {
    console.log(`📋 Formato: Desconocido (${buffer.length} bytes)`)
    console.log('❌ Longitud no estándar')
    console.log('💡 Genera nuevas claves con: node scripts/generate-vapid-keys.js')
  }
  
  // Mostrar coordenadas si es posible
  if (buffer.length === 65 && buffer[0] === 0x04) {
    const coords = buffer.slice(1)
    const x = coords.slice(0, 32)
    const y = coords.slice(32, 64)
    
    console.log('\n📐 Coordenadas ECDSA P-256:')
    console.log(`X (32 bytes): ${x.toString('hex').substring(0, 16)}...`)
    console.log(`Y (32 bytes): ${y.toString('hex').substring(0, 16)}...`)
  } else if (buffer.length === 64) {
    const x = buffer.slice(0, 32)
    const y = buffer.slice(32, 64)
    
    console.log('\n📐 Coordenadas ECDSA P-256:')
    console.log(`X (32 bytes): ${x.toString('hex').substring(0, 16)}...`)
    console.log(`Y (32 bytes): ${y.toString('hex').substring(0, 16)}...`)
  }
  
} catch (error) {
  console.log('❌ Error al decodificar clave pública:', error.message)
  console.log('💡 La clave puede estar corrupta o en formato incorrecto')
}

console.log('\n🎯 Recomendaciones:')
console.log('1. Si ves errores de "raw format", tu clave se convertirá automáticamente')
console.log('2. Si necesitas generar nuevas claves: node scripts/generate-vapid-keys.js')
console.log('3. Reinicia el servidor después de cambiar las claves')
