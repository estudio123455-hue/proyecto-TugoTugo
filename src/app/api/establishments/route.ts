import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    console.log('🔍 API: Fetching establishments...')

    const establishments = await prisma.establishment.findMany({
      where: {
        isActive: true,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        packs: {
          where: {
            isActive: true,
            quantity: {
              gt: 0,
            },
            availableUntil: {
              gte: new Date(),
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            posts: true,
            packs: true,
          },
        },
      },
    })

    console.log(`📊 API: Found ${establishments.length} establishments`)
    establishments.forEach(est => {
      console.log(`🏪 API: ${est.name} has ${est.packs.length} active packs`)
      est.packs.forEach(pack => {
        console.log(
          `📦 API: Pack "${pack.title}" - quantity: ${pack.quantity}, isActive: ${pack.isActive}`
        )
      })
    })

    return NextResponse.json(establishments)
  } catch (error) {
    console.error('Error fetching establishments:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

    const establishment = await prisma.establishment.create({
      data: {
        name: data.name,
        description: data.description,
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
        phone: data.phone,
        email: data.email,
        category: data.category,
        userId: data.userId,
      },
    })

    return NextResponse.json(establishment, { status: 201 })
  } catch (error) {
    console.error('Error creating establishment:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
