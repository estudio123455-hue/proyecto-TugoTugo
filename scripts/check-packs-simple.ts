/**
 * Script simple para verificar packs
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkPacks() {
  try {
    // Ver todos los packs
    const packs = await prisma.pack.findMany({
      include: {
        establishment: true,
      },
    })

    console.log(`\n📦 Total packs en DB: ${packs.length}\n`)

    if (packs.length === 0) {
      console.log('❌ NO HAY PACKS EN LA BASE DE DATOS\n')
      return
    }

    const now = new Date()

    packs.forEach((pack, i) => {
      console.log(`${i + 1}. ${pack.title}`)
      console.log(`   Restaurante: ${pack.establishment.name}`)
      console.log(`   Activo: ${pack.isActive}`)
      console.log(`   Cantidad: ${pack.quantity}`)
      console.log(`   Desde: ${pack.availableFrom}`)
      console.log(`   Hasta: ${pack.availableUntil}`)
      console.log(`   Restaurante activo: ${pack.establishment.isActive}`)
      console.log(`   Restaurante estado: ${pack.establishment.verificationStatus}`)
      
      // Verificar por qué no aparece
      const reasons = []
      if (!pack.isActive) reasons.push('Pack inactivo')
      if (pack.quantity <= 0) reasons.push('Sin stock')
      if (new Date(pack.availableFrom) > now) reasons.push('Aún no disponible')
      if (new Date(pack.availableUntil) < now) reasons.push('Expirado')
      if (!pack.establishment.isActive) reasons.push('Restaurante inactivo')
      if (pack.establishment.verificationStatus !== 'APPROVED') reasons.push(`Restaurante ${pack.establishment.verificationStatus}`)
      
      if (reasons.length > 0) {
        console.log(`   ⚠️  NO VISIBLE: ${reasons.join(', ')}`)
      } else {
        console.log(`   ✅ DEBERÍA SER VISIBLE`)
      }
      console.log()
    })

    // Verificar cuántos deberían estar visibles
    const visiblePacks = await prisma.pack.findMany({
      where: {
        isActive: true,
        quantity: { gt: 0 },
        availableFrom: { lte: now },
        availableUntil: { gte: now },
        establishment: {
          isActive: true,
          verificationStatus: 'APPROVED',
        },
      },
    })

    console.log(`✅ Packs que DEBERÍAN aparecer: ${visiblePacks.length}`)

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkPacks()
