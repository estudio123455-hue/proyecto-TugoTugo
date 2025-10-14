/**
 * Script para generar claves VAPID en el formato correcto
 * Ejecutar con: node scripts/generate-vapid-keys.js
 */

const webpush = require('web-push')
const crypto = require('crypto')

console.log('🔑 Generando claves VAPID...\n')

// Generar claves VAPID
const vapidKeys = webpush.generateVAPIDKeys()

console.log('✅ Claves VAPID generadas:\n')
console.log('📋 COPIA ESTAS VARIABLES A TU .env.local:\n')
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY="${vapidKeys.publicKey}"`)
console.log(`VAPID_PRIVATE_KEY="${vapidKeys.privateKey}"`)
console.log(`VAPID_SUBJECT="mailto:tu-email@dominio.com"\n`)

// Verificar formato de la clave pública
console.log('🔍 Verificación de formato:\n')

// Convertir de base64url a buffer
const publicKeyBuffer = Buffer.from(vapidKeys.publicKey, 'base64url')
console.log(`📏 Longitud de clave pública: ${publicKeyBuffer.length} bytes`)

if (publicKeyBuffer.length === 65 && publicKeyBuffer[0] === 0x04) {
  console.log('✅ Formato: Sin comprimir (65 bytes, empieza con 04)')
  console.log('ℹ️  Este es el formato correcto para VAPID')
} else if (publicKeyBuffer.length === 64) {
  console.log('✅ Formato: Raw (64 bytes)')
  console.log('ℹ️  Este es el formato raw que mencionas')
} else if (publicKeyBuffer.length === 33) {
  console.log('⚠️  Formato: Comprimido (33 bytes)')
  console.log('❌ Este formato NO es compatible con VAPID')
} else {
  console.log(`❌ Formato desconocido: ${publicKeyBuffer.length} bytes`)
}

console.log('\n🎯 Para usar en tu aplicación:')
console.log('1. Copia las variables al archivo .env.local')
console.log('2. Reinicia tu servidor de desarrollo')
console.log('3. Las notificaciones push deberían funcionar')

// Mostrar cómo convertir a raw si es necesario
if (publicKeyBuffer.length === 65 && publicKeyBuffer[0] === 0x04) {
  const rawKey = publicKeyBuffer.slice(1) // Remover el primer byte (04)
  const rawKeyBase64 = rawKey.toString('base64url')
  console.log('\n🔧 Si necesitas formato RAW (64 bytes):')
  console.log(`RAW_PUBLIC_KEY="${rawKeyBase64}"`)
  console.log(`📏 Longitud RAW: ${rawKey.length} bytes`)
}
