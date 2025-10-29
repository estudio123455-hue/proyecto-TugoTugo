import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createSamplePack() {
  try {
    // Buscar el primer restaurante disponible
    const restaurant = await prisma.establishment.findFirst({
      where: {
        isActive: true
      }
    })

    if (!restaurant) {
      console.log('❌ No se encontraron restaurantes activos')
      return
    }

    console.log(`✅ Restaurante encontrado: ${restaurant.name}`)

    // Crear pack sorpresa
    const pack = await prisma.pack.create({
      data: {
        title: "Pack Sorpresa del Chef",
        description: "Una deliciosa sorpresa culinaria preparada especialmente por nuestro chef. Incluye entrada, plato principal y postre. ¡Perfecto para descubrir nuevos sabores!",
        originalPrice: 28.99,
        discountedPrice: 19.99,
        quantity: 10,
        availableFrom: new Date('2024-10-28T18:00:00Z'),
        availableUntil: new Date('2024-10-28T23:59:00Z'),
        pickupTimeStart: "18:30",
        pickupTimeEnd: "22:30",
        establishmentId: restaurant.id,
        isActive: true,
      },
      include: {
        establishment: {
          select: {
            name: true
          }
        }
      }
    })

    console.log('🎉 Pack creado exitosamente:')
    console.log(`   ID: ${pack.id}`)
    console.log(`   Título: ${pack.title}`)
    console.log(`   Restaurante: ${pack.establishment.name}`)
    console.log(`   Precio: $${pack.originalPrice} → $${pack.discountedPrice}`)
    console.log(`   Cantidad: ${pack.quantity}`)

  } catch (error) {
    console.error('❌ Error creando pack:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createSamplePack()
