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
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (session.user.role !== 'ESTABLISHMENT') {
      return NextResponse.json(
        { message: 'Access denied' },
        { status: 403 }
      )
    }

    const data = await request.json()

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
        { message: 'Pack not found' },
        { status: 404 }
      )
    }

    const updateData: any = {}
    
    if (data.title !== undefined) updateData.title = data.title
    if (data.description !== undefined) updateData.description = data.description
    if (data.originalPrice !== undefined) updateData.originalPrice = data.originalPrice
    if (data.discountedPrice !== undefined) updateData.discountedPrice = data.discountedPrice
    if (data.quantity !== undefined) updateData.quantity = data.quantity
    if (data.availableFrom !== undefined) updateData.availableFrom = new Date(data.availableFrom)
    if (data.availableUntil !== undefined) updateData.availableUntil = new Date(data.availableUntil)
    if (data.pickupTimeStart !== undefined) updateData.pickupTimeStart = data.pickupTimeStart
    if (data.pickupTimeEnd !== undefined) updateData.pickupTimeEnd = data.pickupTimeEnd
    if (data.isActive !== undefined) updateData.isActive = data.isActive

    const pack = await prisma.pack.update({
      where: { id: params.id },
      data: updateData,
    })

    return NextResponse.json(pack)
  } catch (error) {
    console.error('Error updating pack:', error)
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
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (session.user.role !== 'ESTABLISHMENT') {
      return NextResponse.json(
        { message: 'Access denied' },
        { status: 403 }
      )
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
        { message: 'Pack not found' },
        { status: 404 }
      )
    }

    if (pack.orders.length > 0) {
      return NextResponse.json(
        { message: 'Cannot delete pack with existing orders' },
        { status: 400 }
      )
    }

    await prisma.pack.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Pack deleted successfully' })
  } catch (error) {
    console.error('Error deleting pack:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
