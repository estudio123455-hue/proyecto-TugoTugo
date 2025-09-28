import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendPickupReminderEmail } from '@/lib/email'

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

    const { status } = await request.json()

    if (!status) {
      return NextResponse.json(
        { message: 'Status is required' },
        { status: 400 }
      )
    }

    // Get the order and verify permissions
    const order = await prisma.order.findFirst({
      where: {
        id: params.id,
        pack: {
          establishment: {
            userId: session.user.id,
          },
        },
      },
      include: {
        user: true,
        pack: {
          include: {
            establishment: true,
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json(
        { message: 'Order not found or access denied' },
        { status: 404 }
      )
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: { status },
    })

    // Send pickup reminder email when status changes to READY_FOR_PICKUP
    if (status === 'READY_FOR_PICKUP' && order.user.email) {
      try {
        await sendPickupReminderEmail({
          to: order.user.email,
          userName: order.user.name || 'Customer',
          packTitle: order.pack.title,
          establishmentName: order.pack.establishment.name,
          establishmentAddress: order.pack.establishment.address,
          establishmentPhone: order.pack.establishment.phone,
          pickupDate: order.pickupDate.toISOString(),
          pickupTimeStart: order.pack.pickupTimeStart,
          pickupTimeEnd: order.pack.pickupTimeEnd,
        })
      } catch (emailError) {
        console.error('Failed to send pickup reminder email:', emailError)
        // Don't fail the status update if email fails
      }
    }

    return NextResponse.json(updatedOrder)
  } catch (error) {
    console.error('Error updating order status:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
