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

    console.log('🎨 Fixing UI issues...')

    // Actualizar Restaurante El Buen Sabor con datos limpios
    const restaurant1 = await prisma.establishment.updateMany({
      where: {
        name: 'Restaurante El Buen Sabor'
      },
      data: {
        description: 'Autentica comida casera colombiana con sazon tradicional. Especialistas en bandeja paisa, sancocho y ajiaco bogotano.',
        image: 'https://picsum.photos/800/600?random=1',
        images: [
          'https://picsum.photos/800/600?random=1',
          'https://picsum.photos/800/600?random=2',
          'https://picsum.photos/800/600?random=3'
        ],
        cuisineType: 'Colombiana',
        phone: '+57 321 459 6837',
        address: 'Carrera 15 #85-20, Zona Rosa, Bogota',
        paymentMethods: ['efectivo', 'tarjeta', 'transferencia'],
        businessType: 'Restaurante familiar'
      }
    })

    // Actualizar Pizzería Italiana con datos limpios
    const restaurant2 = await prisma.establishment.updateMany({
      where: {
        name: 'Pizzería Italiana'
      },
      data: {
        description: 'Autentica pizza napolitana con ingredientes frescos importados de Italia. Masa artesanal fermentada 48 horas.',
        image: 'https://picsum.photos/800/600?random=4',
        images: [
          'https://picsum.photos/800/600?random=4',
          'https://picsum.photos/800/600?random=5',
          'https://picsum.photos/800/600?random=6'
        ],
        cuisineType: 'Italiana',
        phone: '+57 310 555 1234',
        address: 'Calle 93 #13-24, Bogota',
        paymentMethods: ['efectivo', 'tarjeta', 'transferencia'],
        businessType: 'Pizzeria artesanal'
      }
    })

    console.log(`✅ Updated restaurants: ${restaurant1.count + restaurant2.count}`)

    // Actualizar los packs con descripciones más atractivas
    await prisma.pack.updateMany({
      where: {
        title: {
          contains: 'Especial Restaurante'
        }
      },
      data: {
        title: 'Pack Almuerzo Colombiano',
        description: 'Bandeja paisa completa con arepa, chicharron, frijoles, arroz, huevo y aguacate. Incluye jugo natural.',
      }
    })

    await prisma.pack.updateMany({
      where: {
        title: {
          contains: 'Especial Pizzería'
        }
      },
      data: {
        title: 'Pack Pizza Napolitana',
        description: 'Pizza grande artesanal con ingredientes frescos, masa fermentada 48h. Incluye bebida.',
      }
    })

    console.log('✅ Updated pack descriptions')

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
        address: true,
        phone: true,
        cuisineType: true,
        _count: {
          select: {
            packs: {
              where: {
                isActive: true,
                availableUntil: {
                  gte: new Date()
                }
              }
            }
          }
        }
      }
    })

    const activePacks = await prisma.pack.findMany({
      where: {
        isActive: true,
        availableFrom: {
          lte: new Date()
        },
        availableUntil: {
          gte: new Date()
        }
      },
      select: {
        id: true,
        title: true,
        description: true,
        originalPrice: true,
        discountedPrice: true,
        quantity: true,
        establishment: {
          select: {
            name: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'UI issues fixed successfully! 🎨',
      currentTime: new Date().toISOString(),
      restaurants: updatedRestaurants.map(r => ({
        name: r.name,
        description: r.description?.substring(0, 50) + '...',
        cuisineType: r.cuisineType,
        address: r.address,
        phone: r.phone,
        activePacks: r._count.packs
      })),
      activePacks: activePacks.map(p => ({
        title: p.title,
        description: p.description?.substring(0, 50) + '...',
        restaurant: p.establishment.name,
        price: `$${p.discountedPrice.toLocaleString()}`,
        originalPrice: `$${p.originalPrice.toLocaleString()}`,
        quantity: p.quantity
      }))
    })
  } catch (error) {
    console.error('❌ Error fixing UI issues:', error)
    
    return NextResponse.json(
      {
        message: 'Error fixing UI issues',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
