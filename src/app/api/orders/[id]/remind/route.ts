import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendPickupReminderEmail } from '@/lib/email'

export async function POST(
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

    // Get the order with all necessary details
    const order = await prisma.order.findFirst({
      where: {
        id: params.id,
        OR: [
          { userId: session.user.id }, // Customer can remind themselves
          { pack: { establishment: { userId: session.user.id } } }, // Establishment can remind customers
        ],
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
        { message: 'Order not found' },
        { status: 404 }
      )
    }

    if (order.status !== 'READY_FOR_PICKUP') {
      return NextResponse.json(
        { message: 'Order is not ready for pickup' },
        { status: 400 }
      )
    }

    // Send pickup reminder email
    if (order.user.email) {
      await sendPickupReminderEmail({
        to: order.user.email,
        userName: order.user.name || 'Customer',
        packTitle: order.pack.title,
        establishmentName: order.pack.establishment.name,
        establishmentAddress: order.pack.establishment.address,
        establishmentPhone: order.pack.establishment.phone || undefined,
        pickupDate: order.pickupDate.toISOString(),
        pickupTimeStart: order.pack.pickupTimeStart,
        pickupTimeEnd: order.pack.pickupTimeEnd,
      })
    }

    return NextResponse.json({ message: 'Reminder sent successfully' })
  } catch (error) {
    console.error('Error sending pickup reminder:', error)
    return NextResponse.json(
      { message: 'Failed to send reminder' },
      { status: 500 }
    )
  }
}
