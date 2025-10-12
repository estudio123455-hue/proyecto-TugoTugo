import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    console.log('🔍 Debugging packs...')
    
    // Get all packs with their establishments
    const packs = await prisma.pack.findMany({
      include: {
        establishment: {
          select: {
            id: true,
            name: true,
            verificationStatus: true,
            isActive: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    console.log(`Found ${packs.length} packs`)
    
    // Get current time for comparison
    const now = new Date()
    
    // Analyze each pack
    const packAnalysis = packs.map(pack => ({
      id: pack.id,
      title: pack.title,
      establishmentName: pack.establishment.name,
      establishmentActive: pack.establishment.isActive,
      establishmentStatus: pack.establishment.verificationStatus,
      isActive: pack.isActive,
      quantity: pack.quantity,
      availableFrom: pack.availableFrom,
      availableUntil: pack.availableUntil,
      pickupTime: `${pack.pickupTimeStart} - ${pack.pickupTimeEnd}`,
      isCurrentlyAvailable: now >= pack.availableFrom && now <= pack.availableUntil,
      createdAt: pack.createdAt,
    }))
    
    return NextResponse.json({
      status: 'ok',
      currentTime: now.toISOString(),
      totalPacks: packs.length,
      packs: packAnalysis,
      summary: {
        active: packs.filter(p => p.isActive).length,
        inactive: packs.filter(p => !p.isActive).length,
        currentlyAvailable: packAnalysis.filter(p => p.isCurrentlyAvailable).length,
      }
    })
  } catch (error) {
    console.error('❌ Error debugging packs:', error)
    
    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
