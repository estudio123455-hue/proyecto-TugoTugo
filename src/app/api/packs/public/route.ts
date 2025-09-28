import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const establishmentId = searchParams.get('establishmentId')
    
    // Base query conditions
    const where: any = {
      isActive: true,
      // Only show packs that are currently available
      availableFrom: {
        lte: new Date(),
      },
      availableUntil: {
        gte: new Date(),
      },
    }
    
    // Filter by establishment if provided
    if (establishmentId) {
      where.establishmentId = establishmentId
    }

    const packs = await prisma.pack.findMany({
      where,
      include: {
        establishment: {
          select: {
            id: true,
            name: true,
            address: true,
            category: true,
            image: true,
            isActive: true,
          }
        }
      },
      orderBy: [
        {
          availableUntil: 'asc', // Show packs ending soon first
        },
        {
          createdAt: 'desc',
        }
      ],
    })

    // Filter out packs from inactive establishments
    const activePacks = packs.filter(pack => pack.establishment.isActive)

    return NextResponse.json(activePacks)
  } catch (error) {
    console.error('Error fetching public packs:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
