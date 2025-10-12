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

    console.log('🔧 Fixing packs issues...')

    // 1. Aprobar el restaurante "El Buen Sabor"
    console.log('Approving Restaurante El Buen Sabor...')
    const restaurant = await prisma.establishment.updateMany({
      where: {
        name: 'Restaurante El Buen Sabor',
        verificationStatus: 'PENDING'
      },
      data: {
        verificationStatus: 'APPROVED',
        approvedAt: new Date(),
      }
    })
    
    console.log(`✅ Approved ${restaurant.count} restaurants`)

    // 2. Actualizar horarios de los packs para que sean válidos
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    // Crear nuevos horarios para hoy y mañana
    const updates = [
      // Pack almuerzo para hoy (en 1 hora)
      {
        title: 'Pack Almuerzo Sorpresa',
        availableFrom: new Date(now.getTime() + 60 * 60 * 1000), // +1 hora
        availableUntil: new Date(now.getTime() + 3 * 60 * 60 * 1000), // +3 horas
        pickupTimeStart: String(now.getHours() + 1).padStart(2, '0') + ':00',
        pickupTimeEnd: String(now.getHours() + 3).padStart(2, '0') + ':00',
      },
      // Pack cena para hoy (en 2 horas)
      {
        title: 'Pack Cena Especial',
        availableFrom: new Date(now.getTime() + 2 * 60 * 60 * 1000), // +2 horas
        availableUntil: new Date(now.getTime() + 4 * 60 * 60 * 1000), // +4 horas
        pickupTimeStart: String(now.getHours() + 2).padStart(2, '0') + ':00',
        pickupTimeEnd: String(now.getHours() + 4).padStart(2, '0') + ':00',
      },
      // Pack pizza para hoy (en 30 minutos)
      {
        title: 'Pack Pizza Sorpresa',
        availableFrom: new Date(now.getTime() + 30 * 60 * 1000), // +30 minutos
        availableUntil: new Date(now.getTime() + 2.5 * 60 * 60 * 1000), // +2.5 horas
        pickupTimeStart: String(now.getHours()).padStart(2, '0') + ':30',
        pickupTimeEnd: String(now.getHours() + 2).padStart(2, '0') + ':30',
      }
    ]

    console.log('Updating pack schedules...')
    for (const update of updates) {
      await prisma.pack.updateMany({
        where: { title: update.title },
        data: {
          availableFrom: update.availableFrom,
          availableUntil: update.availableUntil,
          pickupTimeStart: update.pickupTimeStart,
          pickupTimeEnd: update.pickupTimeEnd,
        }
      })
      console.log(`✅ Updated ${update.title}`)
    }

    // 3. Verificar resultados
    const updatedPacks = await prisma.pack.findMany({
      include: {
        establishment: {
          select: {
            name: true,
            verificationStatus: true,
          }
        }
      }
    })

    const availableNow = updatedPacks.filter(pack => 
      now >= pack.availableFrom && 
      now <= pack.availableUntil &&
      pack.establishment.verificationStatus === 'APPROVED'
    )

    return NextResponse.json({
      message: 'Packs fixed successfully! 🎉',
      currentTime: now.toISOString(),
      totalPacks: updatedPacks.length,
      availableNow: availableNow.length,
      packs: updatedPacks.map(pack => ({
        title: pack.title,
        establishment: pack.establishment.name,
        status: pack.establishment.verificationStatus,
        availableFrom: pack.availableFrom,
        availableUntil: pack.availableUntil,
        pickupTime: `${pack.pickupTimeStart} - ${pack.pickupTimeEnd}`,
        isAvailable: now >= pack.availableFrom && now <= pack.availableUntil
      }))
    })
  } catch (error) {
    console.error('❌ Error fixing packs:', error)
    
    return NextResponse.json(
      {
        message: 'Error fixing packs',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
