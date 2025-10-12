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

    console.log('🔄 Creating live packs with current schedules...')

    // Eliminar packs existentes para evitar duplicados
    await prisma.pack.deleteMany({})
    console.log('✅ Cleared existing packs')

    // Obtener establecimientos aprobados
    const establishments = await prisma.establishment.findMany({
      where: {
        verificationStatus: 'APPROVED',
        isActive: true
      }
    })

    if (establishments.length === 0) {
      return NextResponse.json(
        { message: 'No approved establishments found' },
        { status: 400 }
      )
    }

    const now = new Date()
    const currentHour = now.getHours()
    
    // Crear packs con horarios que siempre estén disponibles
    const packsToCreate = []

    for (const establishment of establishments) {
      // Pack disponible ahora (próximas 4 horas)
      packsToCreate.push({
        title: `Pack Especial ${establishment.name.split(' ')[0]}`,
        description: `Comida deliciosa de ${establishment.name} - Disponible ahora`,
        originalPrice: 35000,
        discountedPrice: 18000,
        quantity: 10,
        availableFrom: new Date(now.getTime() - 30 * 60 * 1000), // Comenzó hace 30 min
        availableUntil: new Date(now.getTime() + 4 * 60 * 60 * 1000), // Termina en 4 horas
        pickupTimeStart: String(currentHour).padStart(2, '0') + ':00',
        pickupTimeEnd: String(currentHour + 4).padStart(2, '0') + ':00',
        establishmentId: establishment.id,
      })

      // Pack para más tarde (en 2 horas, dura 3 horas)
      packsToCreate.push({
        title: `Pack Tarde ${establishment.name.split(' ')[0]}`,
        description: `Comida fresca de ${establishment.name} - Para más tarde`,
        originalPrice: 40000,
        discountedPrice: 22000,
        quantity: 8,
        availableFrom: new Date(now.getTime() + 2 * 60 * 60 * 1000), // Empieza en 2 horas
        availableUntil: new Date(now.getTime() + 5 * 60 * 60 * 1000), // Termina en 5 horas
        pickupTimeStart: String(currentHour + 2).padStart(2, '0') + ':00',
        pickupTimeEnd: String(currentHour + 5).padStart(2, '0') + ':00',
        establishmentId: establishment.id,
      })

      // Pack para mañana (24 horas después)
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
      packsToCreate.push({
        title: `Pack Mañana ${establishment.name.split(' ')[0]}`,
        description: `Reserva para mañana en ${establishment.name}`,
        originalPrice: 32000,
        discountedPrice: 16000,
        quantity: 15,
        availableFrom: tomorrow,
        availableUntil: new Date(tomorrow.getTime() + 3 * 60 * 60 * 1000),
        pickupTimeStart: '12:00',
        pickupTimeEnd: '15:00',
        establishmentId: establishment.id,
      })
    }

    // Crear todos los packs
    console.log(`Creating ${packsToCreate.length} packs...`)
    for (const packData of packsToCreate) {
      await prisma.pack.create({
        data: packData
      })
    }

    // Verificar resultados
    const createdPacks = await prisma.pack.findMany({
      include: {
        establishment: {
          select: {
            name: true,
            verificationStatus: true,
          }
        }
      },
      orderBy: {
        availableFrom: 'asc'
      }
    })

    const availableNow = createdPacks.filter(pack => 
      now >= pack.availableFrom && 
      now <= pack.availableUntil
    )

    return NextResponse.json({
      message: 'Live packs created successfully! 🎉',
      currentTime: now.toISOString(),
      totalPacks: createdPacks.length,
      availableNow: availableNow.length,
      establishments: establishments.length,
      packs: createdPacks.map(pack => ({
        title: pack.title,
        establishment: pack.establishment.name,
        price: `$${pack.discountedPrice.toLocaleString()} (antes $${pack.originalPrice.toLocaleString()})`,
        availableFrom: pack.availableFrom,
        availableUntil: pack.availableUntil,
        pickupTime: `${pack.pickupTimeStart} - ${pack.pickupTimeEnd}`,
        isAvailableNow: now >= pack.availableFrom && now <= pack.availableUntil,
        quantity: pack.quantity
      }))
    })
  } catch (error) {
    console.error('❌ Error creating live packs:', error)
    
    return NextResponse.json(
      {
        message: 'Error creating live packs',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
