/**
 * Script para migrar la base de datos a Railway
 * Ejecutar después de configurar la nueva DATABASE_URL
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function migrateToRailway() {
  try {
    console.log('🚂 Iniciando migración a Railway...')
    
    // Test connection
    console.log('📡 Probando conexión a Railway...')
    await prisma.$connect()
    console.log('✅ Conexión exitosa a Railway')
    
    // Check if tables exist
    console.log('🔍 Verificando estructura de la base de datos...')
    
    try {
      const userCount = await prisma.user.count()
      console.log(`✅ Tabla 'user' existe con ${userCount} registros`)
    } catch (error) {
      console.log('❌ Las tablas no existen. Necesitas ejecutar migraciones.')
      console.log('\n📋 PASOS SIGUIENTES:')
      console.log('1. Asegúrate de que DATABASE_URL apunte a Railway')
      console.log('2. Ejecuta: npx prisma migrate deploy')
      console.log('3. Ejecuta: npx prisma generate')
      console.log('4. Vuelve a ejecutar este script')
      return
    }
    
    console.log('🎉 Base de datos Railway configurada correctamente!')
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
        console.log('\n🔧 SOLUCIÓN:')
        console.log('1. Verifica que DATABASE_URL sea correcta')
        console.log('2. Asegúrate de que Railway esté funcionando')
        console.log('3. Verifica que no haya restricciones de firewall')
      }
    }
  } finally {
    await prisma.$disconnect()
  }
}

migrateToRailway()
