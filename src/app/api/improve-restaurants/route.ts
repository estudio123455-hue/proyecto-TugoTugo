import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    // Verificar token de seguridad
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    
    const SEED_TOKEN = process.env.SEED_TOKEN || 'dev-seed-token-123'
    
    if (token !== SEED_TOKEN) {
      return NextResponse.json(
        { message: 'Unauthorized. Invalid token.' },
        { status: 401 }
      )
    }

    console.log('🎨 Improving restaurant data...')

    // Mejorar Restaurante El Buen Sabor
    const restaurant1 = await prisma.establishment.updateMany({
      where: {
        name: 'Restaurante El Buen Sabor'
      },
      data: {
        description: 'Auténtica comida casera colombiana con sazón tradicional. Especialistas en bandeja paisa, sancocho y ajiaco bogotano.',
        image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop&crop=center',
        images: [
          'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
          'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800',
          'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800'
        ],
        cuisineType: 'Colombiana',
        openingHours: JSON.stringify({
          monday: '11:00-22:00',
          tuesday: '11:00-22:00', 
          wednesday: '11:00-22:00',
          thursday: '11:00-22:00',
          friday: '11:00-23:00',
          saturday: '10:00-23:00',
          sunday: '10:00-21:00'
        }),
        paymentMethods: ['efectivo', 'tarjeta', 'transferencia'],
        website: 'https://restauranteelbuensabor.com',
        instagram: '@elbuensaborbogota',
        businessType: 'Restaurante familiar'
      }
    })

    console.log(`✅ Updated restaurant 1: ${restaurant1.count} records`)

    // Mejorar Pizzería Italiana
    const restaurant2 = await prisma.establishment.updateMany({
      where: {
        name: 'Pizzería Italiana'
      },
      data: {
        description: 'Auténtica pizza napolitana con ingredientes frescos importados de Italia. Masa artesanal fermentada 48 horas.',
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&h=600&fit=crop&crop=center',
        images: [
          'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800',
          'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800',
          'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800'
        ],
        cuisineType: 'Italiana',
        openingHours: JSON.stringify({
          monday: 'Cerrado',
          tuesday: '17:00-23:00',
          wednesday: '17:00-23:00', 
          thursday: '17:00-23:00',
          friday: '17:00-24:00',
          saturday: '12:00-24:00',
          sunday: '12:00-22:00'
        }),
        paymentMethods: ['efectivo', 'tarjeta', 'transferencia'],
        website: 'https://pizzeriaitaliana.co',
        instagram: '@pizzeriaitalianabogota',
        businessType: 'Pizzería artesanal'
      }
    })

    console.log(`✅ Updated restaurant 2: ${restaurant2.count} records`)

    // Verificar resultados
    const updatedRestaurants = await prisma.establishment.findMany({
      where: {
        verificationStatus: 'APPROVED'
      },
      select: {
        id: true,
        name: true,
        description: true,
        image: true,
        cuisineType: true,
        paymentMethods: true,
        images: true
      }
    })

    return NextResponse.json({
      message: 'Restaurants improved successfully! 🎨',
      updatedCount: restaurant1.count + restaurant2.count,
      restaurants: updatedRestaurants.map(r => ({
        name: r.name,
        description: r.description,
        cuisineType: r.cuisineType,
        hasImage: !!r.image,
        imageCount: r.images.length,
        paymentMethods: r.paymentMethods.length
      }))
    })
  } catch (error) {
    console.error('❌ Error improving restaurants:', error)
    
    return NextResponse.json(
      {
        message: 'Error improving restaurants',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
