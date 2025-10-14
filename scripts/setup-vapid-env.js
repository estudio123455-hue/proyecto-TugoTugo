/**
 * Script para configurar automáticamente las claves VAPID en .env.local
 * Ejecutar con: node scripts/setup-vapid-env.js
 */

const fs = require('fs')
const path = require('path')
const webpush = require('web-push')

const envLocalPath = path.join(__dirname, '..', '.env.local')

console.log('🔧 Configurando claves VAPID automáticamente...\n')

// Generar nuevas claves VAPID
const vapidKeys = webpush.generateVAPIDKeys()

console.log('✅ Claves VAPID generadas:\n')
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY="${vapidKeys.publicKey}"`)
console.log(`VAPID_PRIVATE_KEY="${vapidKeys.privateKey}"`)
console.log(`VAPID_SUBJECT="mailto:admin@tugotug.com"\n`)

// Leer archivo .env.local existente
let envContent = ''
if (fs.existsSync(envLocalPath)) {
  envContent = fs.readFileSync(envLocalPath, 'utf8')
  console.log('📄 Archivo .env.local existente encontrado')
} else {
  console.log('📄 Creando nuevo archivo .env.local')
}

// Remover claves VAPID existentes si las hay
envContent = envContent
  .split('\n')
  .filter(line => !line.startsWith('NEXT_PUBLIC_VAPID_PUBLIC_KEY='))
  .filter(line => !line.startsWith('VAPID_PRIVATE_KEY='))
  .filter(line => !line.startsWith('VAPID_SUBJECT='))
  .join('\n')

// Añadir nuevas claves VAPID
const vapidConfig = `
# VAPID Keys para notificaciones push
NEXT_PUBLIC_VAPID_PUBLIC_KEY="${vapidKeys.publicKey}"
VAPID_PRIVATE_KEY="${vapidKeys.privateKey}"
VAPID_SUBJECT="mailto:admin@tugotug.com"
`

envContent = envContent.trim() + vapidConfig

// Escribir archivo actualizado
try {
  fs.writeFileSync(envLocalPath, envContent)
  console.log('✅ Archivo .env.local actualizado exitosamente')
  
  // Verificar formato de la clave
  const publicKeyBuffer = Buffer.from(vapidKeys.publicKey, 'base64url')
  console.log(`\n🔍 Verificación de formato:`)
  console.log(`📏 Longitud de clave pública: ${publicKeyBuffer.length} bytes`)
  
  if (publicKeyBuffer.length === 65 && publicKeyBuffer[0] === 0x04) {
    console.log('✅ Formato: Sin comprimir (65 bytes, empieza con 04)')
    console.log('ℹ️  Se convertirá automáticamente a raw cuando sea necesario')
    
    // Mostrar versión raw
    const rawBuffer = publicKeyBuffer.slice(1)
    const rawKey = rawBuffer.toString('base64url')
    console.log(`\n🔧 Versión RAW (64 bytes): ${rawKey.substring(0, 20)}...`)
  }
  
  console.log('\n🎯 Próximos pasos:')
  console.log('1. ✅ Claves VAPID configuradas automáticamente')
  console.log('2. 🔄 Reinicia tu servidor de desarrollo')
  console.log('3. 🔔 Las notificaciones push ya funcionan')
  console.log('4. 🧪 Prueba con: node scripts/check-vapid-keys.js')
  
} catch (error) {
  console.error('❌ Error al escribir .env.local:', error.message)
  console.log('\n💡 Copia manualmente estas líneas a tu .env.local:')
  console.log(vapidConfig)
}
