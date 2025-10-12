/**
 * Script para limpiar la base de datos
 * Uso: npx tsx scripts/cleanup-database.ts [opcion]
 * 
 * Opciones:
 * - all: Elimina todo
 * - packs: Solo elimina packs
 * - establishments: Elimina restaurantes y datos relacionados
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanupDatabase(option: string = 'all') {
  try {
    console.log(`🧹 Iniciando limpieza de base de datos (${option})...`)
    
    if (option === 'packs' || option === 'all') {
      console.log('🗑️ Eliminando packs...')
      const packCount = await prisma.pack.count()
      await prisma.pack.deleteMany({})
      console.log(`✅ ${packCount} packs eliminados`)
    }
    
    if (option === 'establishments' || option === 'all') {
      console.log('🗑️ Eliminando órdenes...')
      await prisma.order.deleteMany({})
      
      console.log('🗑️ Eliminando posts...')
      await prisma.post.deleteMany({})
      
      console.log('🗑️ Eliminando reviews...')
      await prisma.review.deleteMany({})
      
      console.log('🗑️ Eliminando favoritos...')
      await prisma.favorite.deleteMany({})
      
      console.log('🗑️ Eliminando menu items...')
      await prisma.menuItem.deleteMany({})
      
      console.log('🗑️ Eliminando establecimientos...')
      const estCount = await prisma.establishment.count()
      await prisma.establishment.deleteMany({})
      console.log(`✅ ${estCount} establecimientos eliminados`)
    }
    
    if (option === 'all') {
      console.log('🗑️ Eliminando cuentas y sesiones...')
      await prisma.account.deleteMany({})
      await prisma.session.deleteMany({})
      
      console.log('🗑️ Eliminando usuarios...')
      const userCount = await prisma.user.count()
      await prisma.user.deleteMany({})
      console.log(`✅ ${userCount} usuarios eliminados`)
      
      console.log('🗑️ Eliminando datos auxiliares...')
      await prisma.emailVerification.deleteMany({})
      await prisma.auditLog.deleteMany({})
      await prisma.pushSubscription.deleteMany({})
    }
    
    console.log('🎉 Limpieza completada exitosamente!')
    
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Obtener argumento de línea de comandos
const option = process.argv[2] || 'all'

if (!['all', 'packs', 'establishments'].includes(option)) {
  console.error('❌ Opción inválida. Usa: all, packs, o establishments')
  process.exit(1)
}

cleanupDatabase(option)
