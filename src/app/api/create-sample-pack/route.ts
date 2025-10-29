import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    // Buscar el primer restaurante disponible
    const restaurant = await prisma.establishment.findFirst({
      where: {
        isActive: true
      }
    })

    if (!restaurant) {
      return NextResponse.json(
        { success: false, message: 'No se encontraron restaurantes activos' },
        { status: 404 }
      )
    }

    // Crear pack sorpresa
    const pack = await prisma.pack.create({
      data: {
        title: 'Pack Sorpresa del Chef',
        description: 'Una deliciosa sorpresa culinaria preparada especialmente por nuestro chef. Incluye entrada, plato principal y postre. ¡Perfecto para descubrir nuevos sabores!',
        originalPrice: 28.99,
        discountedPrice: 19.99,
        quantity: 10,
        availableFrom: new Date('2024-10-28T18:00:00Z'),
        availableUntil: new Date('2024-10-28T23:59:00Z'),
        pickupTimeStart: '18:30',
        pickupTimeEnd: '22:30',
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

    return NextResponse.json({
      success: true,
      message: 'Pack sorpresa creado exitosamente',
      data: {
        id: pack.id,
        title: pack.title,
        restaurant: pack.establishment.name,
        originalPrice: pack.originalPrice,
        discountedPrice: pack.discountedPrice,
        quantity: pack.quantity
      }
    })

  } catch (error) {
    console.error('Error creando pack sorpresa:', error)
    return NextResponse.json(
      { success: false, message: 'Error al crear pack sorpresa', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
