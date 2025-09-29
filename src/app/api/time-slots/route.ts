import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'ESTABLISHMENT') {
      return NextResponse.json({ message: 'Access denied' }, { status: 403 })
    }

    // Get establishment
    const establishment = await prisma.establishment.findUnique({
      where: {
        userId: session.user.id,
      },
    })

    if (!establishment) {
      return NextResponse.json(
        { message: 'Establishment not found' },
        { status: 404 }
      )
    }

    // Get time slots
    const timeSlots = await prisma.pack.findMany({
      where: {
        establishmentId: establishment.id,
      },
      orderBy: [{ availableFrom: 'asc' }, { pickupTimeStart: 'asc' }],
    })

    // Transform to time slot format
    const formattedSlots = timeSlots.map(pack => {
      const now = new Date()
      const availableFrom = new Date(pack.availableFrom)
      const availableUntil = new Date(pack.availableUntil)

      let status: 'active' | 'sold_out' | 'upcoming' | 'expired' = 'upcoming'

      if (availableUntil < now) {
        status = 'expired'
      } else if (availableFrom <= now && availableUntil >= now) {
        status = pack.quantity > 0 ? 'active' : 'sold_out'
      } else if (availableFrom > now) {
        status = 'upcoming'
      }

      return {
        id: pack.id,
        startTime: pack.pickupTimeStart,
        endTime: pack.pickupTimeEnd,
        packCount: pack.quantity + (pack.originalPrice - pack.discountedPrice), // Original quantity
        price: pack.discountedPrice,
        date: pack.availableFrom.toISOString().split('T')[0],
        status,
        remainingPacks: pack.quantity,
        createdAt: pack.createdAt.toISOString(),
      }
    })

    return NextResponse.json(formattedSlots)
  } catch (error) {
    console.error('Error fetching time slots:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'ESTABLISHMENT') {
      return NextResponse.json({ message: 'Access denied' }, { status: 403 })
    }

    const data = await request.json()
    const { startTime, endTime, packCount, price, date, establishmentId } = data

    // Get establishment
    const establishment = await prisma.establishment.findUnique({
      where: {
        userId: session.user.id,
      },
    })

    if (!establishment) {
      return NextResponse.json(
        { message: 'Establishment not found' },
        { status: 404 }
      )
    }

    // Create date objects
    const availableFrom = new Date(`${date}T${startTime}:00`)
    const availableUntil = new Date(`${date}T${endTime}:00`)

    // Create pack (which represents a time slot)
    const pack = await prisma.pack.create({
      data: {
        title: `Pack Sorpresa - ${startTime} a ${endTime}`,
        description: `Pack sorpresa disponible para recoger entre las ${startTime} y ${endTime}`,
        originalPrice: price * 2, // Simulate original higher price
        discountedPrice: price,
        quantity: packCount,
        availableFrom,
        availableUntil,
        pickupTimeStart: startTime,
        pickupTimeEnd: endTime,
        establishmentId: establishment.id,
      },
    })

    return NextResponse.json(
      {
        message: 'Time slot created successfully',
        id: pack.id,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating time slot:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
