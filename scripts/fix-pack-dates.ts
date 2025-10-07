/**
 * Script para corregir fechas de packs
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixPackDates() {
  try {
    const packs = await prisma.pack.findMany()

    console.log(`\n📦 Encontrados ${packs.length} packs\n`)

    for (const pack of packs) {
      const now = new Date()
      const availableFrom = new Date(pack.availableFrom)

      // Si el pack está en el futuro, actualizarlo a hoy
      if (availableFrom > now) {
        console.log(`🔧 Actualizando pack: ${pack.title}`)
        console.log(`   Fecha anterior: ${availableFrom}`)
        
        // Configurar para hoy
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        
        // Disponible hasta mañana a las 23:59
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)
        tomorrow.setHours(23, 59, 59, 999)

        await prisma.pack.update({
          where: { id: pack.id },
          data: {
            availableFrom: today,
            availableUntil: tomorrow,
          },
        })

        console.log(`   Nueva fecha desde: ${today}`)
        console.log(`   Nueva fecha hasta: ${tomorrow}`)
        console.log(`   ✅ Actualizado\n`)
      } else {
        console.log(`✅ Pack "${pack.title}" ya tiene fechas correctas\n`)
      }
    }

    console.log('✅ Proceso completado')

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixPackDates()
