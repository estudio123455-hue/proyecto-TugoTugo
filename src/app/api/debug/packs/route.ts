import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get all packs with their establishments
    const packs = await prisma.pack.findMany({
      include: {
        establishment: {
          select: {
            id: true,
            name: true,
            isActive: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Get establishments
    const establishments = await prisma.establishment.findMany({
      select: {
        id: true,
        name: true,
        isActive: true,
        _count: {
          select: {
            packs: true,
          },
        },
      },
    })

    return NextResponse.json({
      totalPacks: packs.length,
      activePacks: packs.filter(p => p.isActive).length,
      totalEstablishments: establishments.length,
      activeEstablishments: establishments.filter(e => e.isActive).length,
      packs: packs.map(pack => ({
        id: pack.id,
        title: pack.title,
        isActive: pack.isActive,
        quantity: pack.quantity,
        establishment: pack.establishment.name,
        establishmentActive: pack.establishment.isActive,
        availableFrom: pack.availableFrom,
        availableUntil: pack.availableUntil,
      })),
      establishments: establishments.map(est => ({
        id: est.id,
        name: est.name,
        isActive: est.isActive,
        packsCount: est._count.packs,
      })),
    })
  } catch (error) {
    console.error('Error debugging packs:', error)
    return NextResponse.json(
      { message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
