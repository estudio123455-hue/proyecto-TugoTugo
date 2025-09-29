import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

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

    const orders = await prisma.order.findMany({
      where: {
        pack: {
          establishmentId: establishment.id,
        },
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        pack: {
          select: {
            title: true,
            pickupTimeStart: true,
            pickupTimeEnd: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error fetching establishment orders:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
