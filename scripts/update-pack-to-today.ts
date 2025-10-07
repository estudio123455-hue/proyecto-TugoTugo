import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updatePackToToday() {
  try {
    const pack = await prisma.pack.findFirst()
    
    if (!pack) {
      console.log('❌ No se encontró ningún pack')
      return
    }

    console.log(`\n📦 Actualizando pack: ${pack.title}\n`)

    // Configurar para hoy y mañana
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(23, 59, 59, 999)

    console.log(`   Fecha DESDE: ${today}`)
    console.log(`   Fecha HASTA: ${tomorrow}`)

    const updated = await prisma.pack.update({
      where: { id: pack.id },
      data: {
        availableFrom: today,
        availableUntil: tomorrow,
        isActive: true,
        quantity: pack.quantity > 0 ? pack.quantity : 5, // Asegurar stock
      },
    })

    console.log(`\n✅ Pack actualizado exitosamente`)
    console.log(`   ID: ${updated.id}`)
    console.log(`   Activo: ${updated.isActive}`)
    console.log(`   Cantidad: ${updated.quantity}`)
    console.log(`   Desde: ${updated.availableFrom}`)
    console.log(`   Hasta: ${updated.availableUntil}\n`)

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updatePackToToday()
