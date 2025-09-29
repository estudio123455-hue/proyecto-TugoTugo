import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'ESTABLISHMENT') {
      return NextResponse.json({ message: 'Access denied' }, { status: 403 })
    }

    const data = await request.json()
    const { startTime, endTime, packCount, price, date } = data

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

    // Verify pack belongs to this establishment
    const existingPack = await prisma.pack.findFirst({
      where: {
        id: params.id,
        establishmentId: establishment.id,
      },
    })

    if (!existingPack) {
      return NextResponse.json(
        { message: 'Time slot not found' },
        { status: 404 }
      )
    }

    // Create date objects
    const availableFrom = new Date(`${date}T${startTime}:00`)
    const availableUntil = new Date(`${date}T${endTime}:00`)

    // Update pack
    const updatedPack = await prisma.pack.update({
      where: { id: params.id },
      data: {
        title: `Pack Sorpresa - ${startTime} a ${endTime}`,
        description: `Pack sorpresa disponible para recoger entre las ${startTime} y ${endTime}`,
        originalPrice: price * 2,
        discountedPrice: price,
        quantity: packCount,
        availableFrom,
        availableUntil,
        pickupTimeStart: startTime,
        pickupTimeEnd: endTime,
      },
    })

    return NextResponse.json({
      message: 'Time slot updated successfully',
      id: updatedPack.id,
    })
  } catch (error) {
    console.error('Error updating time slot:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Verify pack belongs to this establishment and check for existing orders
    const pack = await prisma.pack.findFirst({
      where: {
        id: params.id,
        establishmentId: establishment.id,
      },
      include: {
        orders: true,
      },
    })

    if (!pack) {
      return NextResponse.json(
        { message: 'Time slot not found' },
        { status: 404 }
      )
    }

    // Always deactivate instead of deleting to maintain data integrity
    await prisma.pack.update({
      where: { id: params.id },
      data: {
        isActive: false,
        quantity: 0,
        // Also update the title to show it's cancelled
        title: `[CANCELADO] ${pack.title}`,
      },
    })

    console.log(`Pack ${params.id} marked as inactive and cancelled`)

    return NextResponse.json({ message: 'Time slot cancelled successfully' })
  } catch (error) {
    console.error('Error deleting time slot:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
